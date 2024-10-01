import os
import re

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
    )


def load_and_clean_excel_file(file_path, file_type):
    """print(f"Loading and cleaning the {file_type} file...")
    print(f"{file_type.capitalize()} file path:", file_path)"""
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
        """ print("UBICAZIONE values before filtering:")
        print(df_combined["UBICAZIONE"].unique()) """

        # Keep only small items (A, B, C)
        pattern = r"^[A-Ca-c](?:\.|[0-9])"
        valid_small_items = df_combined["UBICAZIONE"].str.match(pattern)
        df_filtered = df_combined[valid_small_items]

        # Debugging: Print the UBICAZIONE values that are being kept
        """ print("UBICAZIONE values after filtering:")
        print(df_filtered["UBICAZIONE"].unique()) """

        # Identify and log the rows being filtered out
        filtered_out = df_combined[~valid_small_items]
        if not filtered_out.empty:
            # print("Rows being filtered out due to UBICAZIONE not matching the pattern:")
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
    """ print(f"\nCleaned {file_type.capitalize()} DataFrame:")
    print(df_combined) """

    output_path = "Z:/My Drive/rcs/"
    # Save the cleaned DataFrame
    output_filename = f"{file_type}File.csv"
    output_file_path = os.path.join(output_path, output_filename)
    df_combined.to_csv(output_file_path, index=False)
    # print(f"\nSaved cleaned {file_type} file to: {output_file_path}")

    return df_combined


def merge_files(articles_file_path, warehouse_file_path):
    # Load and clean the warehouse file
    warehouse_df = load_and_clean_excel_file(warehouse_file_path, "warehouse")

    # Load and clean the articles file
    articles_df = load_and_clean_excel_file(articles_file_path, "articles")

    # Merge the warehouse data with articles data on 'CODICE PRODOTTO' and 'BRAND'
    warehouse_df["BRAND"] = warehouse_df["BRAND"].str.strip()
    articles_df["BRAND"] = articles_df["BRAND"].str.strip()
    warehouse_df["CODICE PRODOTTO"] = warehouse_df["CODICE PRODOTTO"].str.strip()
    articles_df["CODICE PRODOTTO"] = articles_df["CODICE PRODOTTO"].str.strip()

    # Debugging: Check if specific CODICE PRODOTTO and BRAND exist in both DataFrames
    # test_codes = ["1905983", "27.564.00"]
    # test_brands = ["IVECO", "UFI"]
    # print("Checking for specific CODICE PRODOTTO and BRAND in warehouse_df:")
    """ print(
        warehouse_df[
            (warehouse_df["CODICE PRODOTTO"].isin(test_codes))
            & (warehouse_df["BRAND"].isin(test_brands))
        ]
    ) """
    # print("Checking for specific CODICE PRODOTTO and BRAND in articles_df:")
    """ print(
        articles_df[
            (articles_df["CODICE PRODOTTO"].isin(test_codes))
            & (articles_df["BRAND"].isin(test_brands))
        ]
    ) """

    merged_df = pd.merge(
        articles_df,
        warehouse_df[["CODICE PRODOTTO", "BRAND", "UBICAZIONE"]],
        on=["CODICE PRODOTTO", "BRAND"],
        how="inner",  # Use 'inner' to get only successful matches
    )

    # Additional filtering step based on your requirements
    # Filter out all rows where UBICAZIONE starts with 'c.00' or 'C.00' and DESCRIZIONE does not contain 'FILTRO', 'FILTRI', 'filtro', 'filtri'
    pattern = r"^[cC]\.00"
    keywords = ["FILTRO", "FILTRI", "filtro", "filtri"]

    def filter_condition(row):
        ubicazione_match = re.match(pattern, row["UBICAZIONE"])
        descrizione_contains_keywords = any(kw in row["DESCRIZIONE"] for kw in keywords)
        return not (ubicazione_match and not descrizione_contains_keywords)

    tqdm.pandas(desc="Applying additional filtering")
    merged_df = merged_df[merged_df.progress_apply(filter_condition, axis=1)]

    # Debugging: Check if specific CODICE PRODOTTO and BRAND are in the final merged_df
    # print("Checking for specific CODICE PRODOTTO and BRAND in final merged_df:")
    """ print(
        merged_df[
            (merged_df["CODICE PRODOTTO"].isin(test_codes))
            & (merged_df["BRAND"].isin(test_brands))
        ]
    ) """

    # print("Columns in merged_df after merge:", merged_df.columns)
    # print("Rows in merged_df after merge:", merged_df.shape[0])

    # Drop 'UBICAZIONE' column if not needed in the final output
    merged_df.drop(columns=["UBICAZIONE"], inplace=True)

    return merged_df
