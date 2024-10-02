import os
import re

import numpy as np
import pandas as pd
from ignored_brands import IGNORED_BRANDS
from pandarallel import pandarallel
from tqdm import tqdm

pandarallel.initialize(progress_bar=True, verbose=0)


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


def vectorized_get_oem_number(df, oem_lookup, IGNORED_BRANDS):
    # Create a boolean mask for ignored brands
    ignored_mask = df["BRAND"].isin(IGNORED_BRANDS)

    # Create keys for lookup
    keys = list(zip(df["CODICE PRODOTTO"], df["BRAND"].str[:5]))

    # Vectorized lookup
    oem_numbers = np.array(
        [" | ".join(oem_lookup.get(key, ["Unknown OE"])) for key in keys]
    )

    # Apply the mask
    oem_numbers[ignored_mask] = ""

    return oem_numbers


def find_additional_cross_codes(codice_prodotto, padded_oe, cleaned_df, IGNORED_BRANDS):
    matches = cleaned_df[
        (cleaned_df["CODICE OE"] != "Unknown OE")
        & (~cleaned_df["BRAND"].isin(IGNORED_BRANDS))
    ]
    exact_matches = matches[
        matches["padded_oe"].str.contains(f" {codice_prodotto} ", regex=False)
    ]
    if not exact_matches.empty:
        return " | ".join(exact_matches["CODICE PRODOTTO"].unique())
    return ""


def update_brands(df_output, brands_file_path):
    # Load the brands file
    brands_df = pd.read_csv(brands_file_path, dtype=str)
    brands_df["Brand"] = brands_df["Brand"].astype(str).str.strip()
    brands_df["Match"] = brands_df["Match"].astype(str).str.strip()

    # Create a lookup dictionary from the brands file
    brand_lookup = dict(zip(brands_df["Brand"], brands_df["Match"]))

    # Update the BRANDS in the output dataframe
    tqdm.pandas(desc="Updating brands")
    df_output["BRAND"] = df_output["BRAND"].progress_apply(
        lambda x: brand_lookup.get(x, x)
    )
    return df_output


def optimized_cross_code_generation(cleaned_df, ignored_brands):
    cross_references = {}
    for _, row in tqdm(
        cleaned_df.iterrows(), total=len(cleaned_df), desc="Generating cross codes"
    ):
        codice_oe = row["CODICE OE"]
        codice_prodotto = row["CODICE PRODOTTO"]
        brand = row["BRAND"]

        if codice_oe != "Unknown OE" and brand not in ignored_brands:
            if codice_oe not in cross_references:
                cross_references[codice_oe] = []
            cross_references[codice_oe].append(codice_prodotto)

    cross_codes_series = pd.Series(index=cleaned_df.index, dtype=str)
    for codice_oe, prodotti in tqdm(
        cross_references.items(), desc="Updating CODICI CROSS"
    ):
        cross_codes = {
            prodotto: " | ".join([code for code in prodotti if code != prodotto])
            for prodotto in prodotti
        }
        cross_codes_series.update(pd.Series(cross_codes))

    return cross_codes_series.fillna("")


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

    output_path = "Z:/My Drive/rcs/"
    # Save the cleaned DataFrame
    output_filename = f"{file_type}File.csv"
    output_file_path = os.path.join(output_path, output_filename)
    df_combined.to_csv(output_file_path, index=False)
    print(f"\nSaved cleaned {file_type} file to: {output_file_path}")

    return df_combined


def process_files(
    articles_file_path,
    output_file_path,
    old_oems_folder,
    brands_file_path,
    warehouse_file_path,
    final_output_with_brands_path,
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

    # Debugging: Check if specific CODICE PRODOTTO and BRAND exist in both DataFrames
    test_codes = ["1905983", "27.564.00"]
    test_brands = ["IVECO", "UFI"]
    print("Checking for specific CODICE PRODOTTO and BRAND in warehouse_df:")
    print(
        warehouse_df[
            (warehouse_df["CODICE PRODOTTO"].isin(test_codes))
            & (warehouse_df["BRAND"].isin(test_brands))
        ]
    )
    print("Checking for specific CODICE PRODOTTO and BRAND in articles_df:")
    print(
        articles_df[
            (articles_df["CODICE PRODOTTO"].isin(test_codes))
            & (articles_df["BRAND"].isin(test_brands))
        ]
    )

    merged_df = pd.merge(
        articles_df,
        warehouse_df[["CODICE PRODOTTO", "BRAND", "UBICAZIONE"]],
        on=["CODICE PRODOTTO", "BRAND"],
        how="inner",  # Use 'inner' to get only successful matches
    )

    print("Columns in merged_df after merge:", merged_df.columns)
    print("Rows in merged_df after merge:", merged_df.shape[0])

    # Proceed with the rest of the processing
    merged_df["CODICE OE"] = pd.NA
    merged_df["CODICI CROSS"] = pd.NA
    merged_df["LINK IMMAGINE"] = pd.NA
    merged_df["CATEGORIA"] = pd.NA
    merged_df["SCHEDA TECNICA"] = pd.NA
    merged_df["SCHEDA DI SICUREZZA"] = pd.NA
    merged_df["CONFEZIONE"] = pd.NA
    merged_df["QUANTITÀ MINIMA"] = pd.NA
    merged_df["META.LUNGHEZZA"] = pd.NA
    merged_df["META.LARGHEZZA"] = pd.NA
    merged_df["META.PROFONDITA'"] = pd.NA
    merged_df["META. ..."] = pd.NA

    # Ensure specified columns are treated as strings
    columns_to_ensure_as_strings = [
        "CODICE PRODOTTO",
        "BRAND",
        "DESCRIZIONE",
        "CODICE OE",
        "CODICI CROSS",
        "LINK IMMAGINE",
        "CATEGORIA",
        "SCHEDA TECNICA",
        "SCHEDA DI SICUREZZA",
        "CONFEZIONE",
        "META.LUNGHEZZA",
        "META.LARGHEZZA",
        "META.PROFONDITA'",
        "META. ...",
        "UBICAZIONE",
    ]
    merged_df[columns_to_ensure_as_strings] = merged_df[
        columns_to_ensure_as_strings
    ].astype(str)

    # Update CODICE OE using the get_oem_number function
    merged_df["CODICE PRODOTTO"] = merged_df["CODICE PRODOTTO"].str.strip()
    merged_df["BRAND"] = merged_df["BRAND"].str.strip()

    old_oems_files = [
        file
        for file in os.listdir(old_oems_folder)
        if file.startswith("oemsDC") and file.endswith(".csv")
    ]
    all_oem_mappings = pd.DataFrame()

    for file_name in tqdm(old_oems_files, desc="Building old OEM mappings"):
        file_path = os.path.join(old_oems_folder, file_name)
        oems_df = pd.read_csv(file_path, dtype=str)
        oems_df["article_altc"] = oems_df["article_altc"].astype(str).str.strip()
        oems_df["oem_number"] = (
            oems_df["oem_number"].astype(str).str.strip().str.replace(" ", "")
        )
        oems_df["article_alt_brands"] = (
            oems_df["article_alt_brands"].astype(str).str.strip()
        )
        oems_df["brand_prefix"] = oems_df["article_alt_brands"].str[:5]
        all_oem_mappings = pd.concat(
            [all_oem_mappings, oems_df[["article_altc", "oem_number", "brand_prefix"]]]
        )

    oem_lookup = (
        all_oem_mappings.groupby(["article_altc", "brand_prefix"])["oem_number"]
        .apply(list)
        .to_dict()
    )

    # Update CODICE OE using the get_oem_number function
    tqdm.pandas(desc="Updating CODICE OE with old OEMs")
    merged_df["CODICE OE"] = vectorized_get_oem_number(
        merged_df, oem_lookup, IGNORED_BRANDS
    )

    # Update PREZZO based on PRZ. ULT. ACQ.
    merged_df["PREZZO"] = merged_df["PRZ. ULT. ACQ."].apply(
        lambda x: round(float(x) * 1.25, 2) if pd.notnull(x) else x
    )
    merged_df.drop(columns=["PRZ. ULT. ACQ."], inplace=True)

    # Debugging: Check if specific CODICE PRODOTTO and BRAND are in the final merged_df
    print("Checking for specific CODICE PRODOTTO and BRAND in final merged_df:")
    print(
        merged_df[
            (merged_df["CODICE PRODOTTO"].isin(test_codes))
            & (merged_df["BRAND"].isin(test_brands))
        ]
    )

    # Reorder columns
    columns_order = [
        "CODICE PRODOTTO",
        "CODICE OE",
        "CODICI CROSS",
        "BRAND",
        "DESCRIZIONE",
        "LINK IMMAGINE",
        "CATEGORIA",
        "GIACENZA",
        "PREZZO",
        "SCHEDA TECNICA",
        "SCHEDA DI SICUREZZA",
        "CONFEZIONE",
        "QUANTITÀ MINIMA",
        "META.LUNGHEZZA",
        "META.LARGHEZZA",
        "META.PROFONDITA'",
        "META. ...",
        "UBICAZIONE",  # Include UBICAZIONE for filtering
    ]
    merged_df = merged_df[columns_order]
    merged_df["CODICI CROSS"] = ""

    # Apply optimized cross-code generation function
    merged_df["CODICI CROSS"] = optimized_cross_code_generation(
        merged_df, IGNORED_BRANDS
    )

    # Handle cases where CODICE OE is unknown and brand is not ignored
    merged_df["padded_oe"] = " " + merged_df["CODICE OE"].str.strip() + " "
    unknown_oe_mask = (merged_df["CODICE OE"] == "Unknown OE") & (
        ~merged_df["BRAND"].isin(IGNORED_BRANDS)
    )
    merged_df.loc[unknown_oe_mask, "CODICI CROSS"] = merged_df.loc[
        unknown_oe_mask, "CODICE PRODOTTO"
    ].parallel_apply(
        lambda codice_prodotto: find_additional_cross_codes(
            codice_prodotto, merged_df["padded_oe"], merged_df, IGNORED_BRANDS
        )
    )

    # Debugging: Check if specific CODICE PRODOTTO and BRAND are in the final merged_df
    print("Checking for specific CODICE PRODOTTO and BRAND in final merged_df:")
    print(
        merged_df[
            (merged_df["CODICE PRODOTTO"].isin(test_codes))
            & (merged_df["BRAND"].isin(test_brands))
        ]
    )

    # Drop the 'padded_oe' column
    merged_df.drop(columns=["padded_oe"], inplace=True)

    # Fill the "CONFEZIONE" column with "1 pz" and the "QUANTITÀ MINIMA" column with "1"
    merged_df["CONFEZIONE"] = "1 pz"
    merged_df["QUANTITÀ MINIMA"] = "1"

    # Set CATEGORIA to "Ricambio"
    merged_df["CATEGORIA"] = "Ricambio"

    # Ensure specified columns remain empty
    columns_to_keep_empty = [
        "LINK IMMAGINE",
        "SCHEDA TECNICA",
        "SCHEDA DI SICUREZZA",
        "META.LUNGHEZZA",
        "META.LARGHEZZA",
        "META.PROFONDITA'",
        "META. ...",
    ]
    merged_df[columns_to_keep_empty] = ""

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
    print("Checking for specific CODICE PRODOTTO and BRAND in final merged_df:")
    print(
        merged_df[
            (merged_df["CODICE PRODOTTO"].isin(test_codes))
            & (merged_df["BRAND"].isin(test_brands))
        ]
    )

    # Update brands
    merged_df = update_brands(merged_df, brands_file_path)

    # After updating brands, set CODICE OE and CODICI CROSS to empty for ignored brands
    ignored_brands_mask = merged_df["BRAND"].isin(IGNORED_BRANDS)
    merged_df.loc[ignored_brands_mask, ["CODICE OE", "CODICI CROSS"]] = ""

    # Drop 'UBICAZIONE' column if not needed in the final output
    merged_df.drop(columns=["UBICAZIONE"], inplace=True)

    # **Add the custom rules here**

    # Convert 'PREZZO' to numeric if it's not already
    merged_df["PREZZO"] = pd.to_numeric(merged_df["PREZZO"], errors="coerce")

    # Filter out all rows where PREZZO is less than 4.50
    merged_df = merged_df[merged_df["PREZZO"] >= 4.50]

    # Add 7.50 to all remaining PREZZO
    merged_df["PREZZO"] = merged_df["PREZZO"] + 7.50

    # Define the custom rounding function
    def custom_round(price):
        if pd.isnull(price):
            return price
        decimal_part = price % 1
        if decimal_part <= 0.5:
            return np.floor(price - 1) + 0.9
        else:
            return np.floor(price) + 0.9

    # Apply the custom rounding to 'PREZZO'
    merged_df["PREZZO"] = merged_df["PREZZO"].apply(custom_round)

    # Save the final output
    merged_df.to_csv(final_output_with_brands_path, index=False)
    print(f"Brands updated and final file saved at {final_output_with_brands_path}")
