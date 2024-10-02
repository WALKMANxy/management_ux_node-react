import os

import numpy as np
import pandas as pd
from tqdm import tqdm


def is_unnamed(header):
    return str(header).startswith("Unnamed")


def validate_first_sheet(df):
    return (
        is_unnamed(df.columns[1])
        and is_unnamed(df.columns[2])
        and is_unnamed(df.columns[3])
        and is_unnamed(df.columns[4])
        and is_unnamed(df.columns[5])
        and not pd.isna(df.columns[0])
        and not pd.isna(df.columns[6])
    )


def validate_other_sheet(df):
    return (
        df.shape[1] == 6
        and not is_unnamed(df.columns[1])
        and not is_unnamed(df.columns[2])
        and not is_unnamed(df.columns[3])
        and not is_unnamed(df.columns[4])
        and is_unnamed(df.columns[0])
    )


def load_and_clean_excel_file(file_path, file_type):
    print(f"Loading and cleaning the {file_type} file...")
    print(f"{file_type.capitalize()} file path:", file_path)
    xls = pd.ExcelFile(file_path)
    relevant_sheets = []
    first_sheet_validated = False

    for sheet_name in tqdm(xls.sheet_names, desc=f"Validating {file_type} sheets"):
        df = pd.read_excel(xls, sheet_name=sheet_name, header=0, dtype=str)
        if not first_sheet_validated:
            if validate_first_sheet(df):
                relevant_sheets.append((sheet_name, df))
                first_sheet_validated = True
            else:
                raise ValueError("First sheet is not valid")
        else:
            if validate_other_sheet(df):
                relevant_sheets.append((sheet_name, df))

    if not relevant_sheets:
        raise ValueError(f"No relevant sheets found in the {file_type} Excel file")

    # Identify and drop the column that starts with 'mgs'
    first_sheet_df = relevant_sheets[0][1]
    mgs_column = [col for col in first_sheet_df.columns if col.startswith("mgs")]
    if mgs_column:
        first_sheet_df = first_sheet_df.drop(columns=mgs_column)

    aligned_sheets = [first_sheet_df]
    for sheet_name, df in relevant_sheets[1:]:
        df.columns = first_sheet_df.columns
        aligned_sheets.append(df)

    df_combined = pd.concat(aligned_sheets, ignore_index=True)
    df_combined = df_combined[~df_combined.iloc[:, 2].isin(["", "."])]

    # Drop unnecessary columns
    if file_type == "warehouse":
        drop_column = "STAMPA ANAGRAFICA ARTICOLI"
    elif file_type == "articles":
        drop_column = "STAMPA LISTINI"
    else:
        raise ValueError("Invalid file type specified.")

    df_combined.drop(columns=[drop_column], inplace=True)

    # Assign column names based on the number of columns
    if len(df_combined.columns) == 5:
        if file_type == "warehouse":
            df_combined.columns = [
                "CODICE PRODOTTO",
                "BRAND",
                "DESCRIZIONE",
                "UBICAZIONE",
                "GIACENZA",
            ]
        else:
            df_combined.columns = [
                "CODICE PRODOTTO",
                "BRAND",
                "DESCRIZIONE",
                "GIACENZA",
                "PRZ. ULT. ACQ.",
            ]
    else:
        raise ValueError(f"Unexpected number of columns: {len(df_combined.columns)}")

    # Ensure specific columns are treated as strings
    string_columns = ["CODICE PRODOTTO", "DESCRIZIONE", "BRAND"]
    if file_type == "warehouse":
        string_columns.append("UBICAZIONE")
    for col in string_columns:
        df_combined[col] = df_combined[col].astype(str).str.strip()

    # For warehouse file, process UBICAZIONE and GIACENZA
    if file_type == "warehouse":
        df_combined["UBICAZIONE"] = (
            df_combined["UBICAZIONE"].fillna("").replace("", "Location Unknown")
        )
        df_combined["GIACENZA"] = pd.to_numeric(
            df_combined["GIACENZA"].str.replace(",", "."), errors="coerce"
        )

        # Strip leading/trailing whitespaces from UBICAZIONE
        df_combined["UBICAZIONE"] = df_combined["UBICAZIONE"].astype(str).str.strip()

        # Debugging: Print UBICAZIONE values before filtering
        print("UBICAZIONE values before filtering:")
        print(df_combined["UBICAZIONE"].unique())

        # Keep only small items (A, B, C)
        pattern = r"^[A-Ca-c](?:\.|[0-9])"
        valid_small_items = df_combined["UBICAZIONE"].str.match(pattern)
        df_filtered = df_combined[valid_small_items]

        # Debugging: Print the UBICAZIONE values that are being kept
        print("UBICAZIONE values after filtering:")
        print(df_filtered["UBICAZIONE"].unique())

        # Identify and log the rows being filtered out
        filtered_out = df_combined[~valid_small_items]
        if not filtered_out.empty:
            print("Rows being filtered out due to UBICAZIONE not matching the pattern:")
            print(filtered_out[["CODICE PRODOTTO", "BRAND", "UBICAZIONE"]])

        df_combined = df_filtered

    # For articles file, process GIACENZA and PRZ. ULT. ACQ.
    elif file_type == "articles":
        # Correct GIACENZA conversion for numbers with thousands separators
        df_combined["GIACENZA"] = (
            df_combined["GIACENZA"]
            .str.replace(".", "", regex=False)
            .str.replace(",", ".", regex=False)
        )
        df_combined["GIACENZA"] = pd.to_numeric(
            df_combined["GIACENZA"], errors="coerce"
        )

        df_combined["PRZ. ULT. ACQ."] = df_combined["PRZ. ULT. ACQ."].str.replace(
            ",", ".", regex=False
        )
        df_combined["PRZ. ULT. ACQ."] = pd.to_numeric(
            df_combined["PRZ. ULT. ACQ."], errors="coerce"
        )

        df_combined = df_combined[df_combined["GIACENZA"] > 0]
        df_combined = df_combined[df_combined["PRZ. ULT. ACQ."].notna()]

    # Print the cleaned DataFrame
    print(f"\nCleaned {file_type.capitalize()} DataFrame:")
    print(df_combined)

    return df_combined


def process_files(
    tecdoc_file_path,
    articles_file_path,
    warehouse_file_path,
    output_file_path,
    update_progress=None,
):
    # Load and clean the warehouse file
    warehouse_df = load_and_clean_excel_file(warehouse_file_path, "warehouse")

    # Load and clean the articles file
    articles_df = load_and_clean_excel_file(articles_file_path, "articles")

    # Merge the warehouse data with articles data on 'CODICE PRODOTTO' and 'BRAND'
    warehouse_df["BRAND"] = warehouse_df["BRAND"].str.strip()
    articles_df["BRAND"] = articles_df["BRAND"].str.strip()
    warehouse_df["CODICE PRODOTTO"] = warehouse_df["CODICE PRODOTTO"].str.strip()
    articles_df["CODICE PRODOTTO"] = articles_df["CODICE PRODOTTO"].str.strip()

    merged_df = pd.merge(
        articles_df,
        warehouse_df[["CODICE PRODOTTO", "BRAND"]],
        on=["CODICE PRODOTTO", "BRAND"],
        how="inner",  # Use 'inner' to get only successful matches
    )

    print("Columns in merged_df after merge:", merged_df.columns)
    print("Rows in merged_df after merge:", merged_df.shape[0])

    # Now proceed with the rest of the Tyre24 processing logic

    # Rename the columns
    merged_df.columns = [
        "TecDoc-ID",
        "TecDoc Brand",
        "Description",
        "Quantity",
        "PRZ. ULT. ACQ.",
    ]

    # Add two new columns and reorder them
    merged_df["Price_Italia"] = pd.NA
    merged_df["Price_Germany"] = pd.NA
    merged_df = merged_df[
        [
            "TecDoc-ID",
            "TecDoc Brand",
            "Description",
            "Quantity",
            "Price_Italia",
            "Price_Germany",
            "PRZ. ULT. ACQ.",
        ]
    ]

    # Convert 'Quantity' and 'PRZ. ULT. ACQ.' columns to numeric types
    merged_df["Quantity"] = pd.to_numeric(merged_df["Quantity"], errors="coerce")
    merged_df["PRZ. ULT. ACQ."] = pd.to_numeric(
        merged_df["PRZ. ULT. ACQ."], errors="coerce"
    )

    # Clean the data
    merged_df = merged_df[merged_df["Quantity"] > 0]
    merged_df = merged_df[merged_df["PRZ. ULT. ACQ."].notna()]

    # Load the Tecdoc Brand ID data
    df_tecdoc = pd.read_csv(tecdoc_file_path)
    df_tecdoc.columns = ["ID", "Name"]

    # Define brand-related mappings
    brands_to_ignore = [
        "CONTI",
        "FRA",
        "LEMA",
        "MAX",
        "MIRA",
        "NOVOC",
        "STAR",
        "TEKNO",
        "TURBO",
    ]
    manual_mapping = {"METAL": "METALCAUCHO", "MOTO": "MOTORCRAFT"}
    rename_dict = {
        "MERC": "MERCEDES",
        "NISSA": "NISSAN",
        "PEUGE": "PEUGEOUT",
        "PIAGG": "PIAGGIO",
        "RENAU": "RENAULT",
        "SCANI": "SCANIA",
        "TOYOT": "TOYOTA",
        "VW": "VOLKSWAGEN",
        "AREXO": "AREXONS",
        "COSIB": "COSIBO",
        "COSPE": "COSPEL",
        "EMMER": "EMMERRE",
        "ERREV": "ERREVI",
        "PARTE": "PARTEX",
        "URANI": "URANIA",
        "MITSUBOSHI": "MITSUBISHI",
    }
    original_brands = [
        "FIAT",
        "IVECO",
        "MAN",
        "RENAULT",
        "ASTRA",
        "AUDI",
        "BPW",
        "DAF",
        "FORD",
        "ISUZU",
        "JEEP",
        "MERCEDES",
        "MITSUBISHI",
        "NISSAN",
        "PEUGEOUT",
        "PIAGGIO",
        "PSA",
        "SAF",
        "SCANIA",
        "TOYOTA",
        "VOLVO",
        "VOLKSWAGEN",
    ]

    # Function to match brands and update dataframe
    def match_brands(
        df_articles, df_tecdoc, brands_to_ignore, manual_mapping, rename_dict
    ):
        tecdoc_brand_dict = pd.Series(
            df_tecdoc["ID"].values, index=df_tecdoc["Name"]
        ).to_dict()

        df_articles["TecDoc Brand"] = df_articles["TecDoc Brand"].apply(lambda x: x[:5])
        df_articles["TecDoc Brand ID"] = "MISSING TECDOC ID"

        for i, row in df_articles.iterrows():
            brand_partial = row["TecDoc Brand"]
            if brand_partial in brands_to_ignore:
                df_articles.at[i, "TecDoc Brand ID"] = "MISSING TECDOC ID"
            elif brand_partial in manual_mapping:
                tecdoc_brand = manual_mapping[brand_partial]
                df_articles.at[i, "TecDoc Brand"] = tecdoc_brand
                df_articles.at[i, "TecDoc Brand ID"] = tecdoc_brand_dict.get(
                    tecdoc_brand, "MISSING TECDOC ID"
                )
            else:
                match_found = False
                for brand_tecdoc, brand_id in tecdoc_brand_dict.items():
                    if brand_tecdoc.startswith(brand_partial):
                        df_articles.at[i, "TecDoc Brand"] = brand_tecdoc
                        df_articles.at[i, "TecDoc Brand ID"] = brand_id
                        match_found = True
                        break
                if not match_found:
                    df_articles.at[i, "TecDoc Brand ID"] = "MISSING TECDOC ID"

        df_articles = df_articles[~df_articles["TecDoc Brand"].isin(["BEX", "RESO"])]
        df_articles["TecDoc Brand"] = df_articles["TecDoc Brand"].replace(rename_dict)

        return df_articles

    # Apply the function to match brands
    merged_df = match_brands(
        merged_df, df_tecdoc, brands_to_ignore, manual_mapping, rename_dict
    )

    # Reorder columns and add 'Brand Type'
    merged_df["Brand Type"] = merged_df["TecDoc Brand"].apply(
        lambda x: "ORIGINAL" if x in original_brands else "AFTERMARKET"
    )
    merged_df.loc[
        (merged_df["Brand Type"] == "ORIGINAL")
        & (merged_df["TecDoc Brand ID"] == "MISSING TECDOC ID"),
        "TecDoc Brand ID",
    ] = ""

    # Multiply PRZ. ULT. ACQ. by 1.25 for both Price_Italia and Price_Germany
    merged_df["Price_Italia"] = merged_df["PRZ. ULT. ACQ."] * 1.25
    merged_df["Price_Germany"] = merged_df["PRZ. ULT. ACQ."] * 1.25

    # Apply the custom pricing logic from Tulero

    # First, filter out all rows where PRZ. ULT. ACQ. * 1.25 is less than 4.50
    merged_df = merged_df[merged_df["Price_Italia"] >= 4.50]

    # Add 7.50 to Price_Italia and 10.50 to Price_Germany
    merged_df["Price_Italia"] = merged_df["Price_Italia"] + 7.50
    merged_df["Price_Germany"] = merged_df["Price_Germany"] + 10.50

    # Define the custom rounding function
    def custom_round(price):
        if pd.isnull(price):
            return price
        decimal_part = price % 1
        if decimal_part <= 0.5:
            return np.floor(price - 1) + 0.9
        else:
            return np.floor(price) + 0.9

    # Apply the custom rounding to both prices
    merged_df["Price_Italia"] = merged_df["Price_Italia"].apply(custom_round)
    merged_df["Price_Germany"] = merged_df["Price_Germany"].apply(custom_round)

    # Drop the column PRZ. ULT. ACQ.
    merged_df = merged_df.drop(columns=["PRZ. ULT. ACQ."])

    # Reorder columns
    merged_df = merged_df[
        [
            "TecDoc-ID",
            "TecDoc Brand",
            "TecDoc Brand ID",
            "Description",
            "Quantity",
            "Price_Italia",
            "Price_Germany",
            "Brand Type",
        ]
    ]

    # Save the final dataframe to a new CSV file
    merged_df.to_csv(output_file_path, index=False)
    print(f"Final data saved to {output_file_path}")
