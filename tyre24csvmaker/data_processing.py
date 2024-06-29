"""tyre24csvmaker.data_processing"""

import pandas as pd
import openpyxl  # noqa: F401


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


def process_files(
    tecdoc_file_path, articles_file_path, output_file_path, update_progress=None
):
    # Load the Excel file
    xls = pd.ExcelFile(articles_file_path)

    # Validate and load relevant sheets
    relevant_sheets = []
    first_sheet_validated = False

    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name, header=0)
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
        raise ValueError("No relevant sheets found in the Excel file")

    # Process the first sheet
    first_sheet_df = relevant_sheets[0][1].drop(columns=["mgs210"])

    # Align and merge other relevant sheets
    aligned_sheets = [first_sheet_df]
    for sheet_name, df in relevant_sheets[1:]:
        df.columns = first_sheet_df.columns
        aligned_sheets.append(df)

    # Concatenate all aligned sheets
    df_combined = pd.concat(aligned_sheets, ignore_index=True)

    # Drop column A and the first 13 rows
    df_combined = (
        df_combined.drop(columns=["STAMPA LISTINI"]).iloc[13:].reset_index(drop=True)
    )

    # Rename the columns
    df_combined.columns = [
        "TecDoc-ID",
        "TecDoc Brand",
        "Description",
        "Quantity",
        "PRZ. ULT. ACQ.",
    ]

    # Add two new columns and reorder them
    df_combined["Price_Italia"] = pd.NA
    df_combined["Price_Germany"] = pd.NA
    df_combined = df_combined[
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
    df_combined["Quantity"] = pd.to_numeric(
        df_combined["Quantity"].str.replace(",", "."), errors="coerce"
    )
    df_combined["PRZ. ULT. ACQ."] = pd.to_numeric(
        df_combined["PRZ. ULT. ACQ."].str.replace(",", "."), errors="coerce"
    )

    # Clean the data
    df_combined = df_combined[df_combined["Quantity"] > 0]
    df_combined = df_combined[df_combined["PRZ. ULT. ACQ."].notna()]

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
    df_combined = match_brands(
        df_combined, df_tecdoc, brands_to_ignore, manual_mapping, rename_dict
    )

    # Reorder columns and add 'Brand Type'
    df_combined["Brand Type"] = df_combined["TecDoc Brand"].apply(
        lambda x: "ORIGINAL" if x in original_brands else "AFTERMARKET"
    )
    df_combined.loc[
        (df_combined["Brand Type"] == "ORIGINAL")
        & (df_combined["TecDoc Brand ID"] == "MISSING TECDOC ID"),
        "TecDoc Brand ID",
    ] = "MISSING / OFFICIAL SUPPLIER"

    # Fill in the Price_Italia and Price_Germany columns by adding 25% to PRZ. ULT. ACQ.
    df_combined["Price_Italia"] = df_combined["PRZ. ULT. ACQ."] * 1.25
    df_combined["Price_Germany"] = df_combined["PRZ. ULT. ACQ."] * 1.25

    # Drop the column PRZ. ULT. ACQ.
    df_combined = df_combined.drop(columns=["PRZ. ULT. ACQ."])

    # Reorder columns
    df_combined = df_combined[
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
    df_combined.to_csv(output_file_path, index=False)
