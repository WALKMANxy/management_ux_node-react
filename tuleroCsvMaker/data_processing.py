import pandas as pd   
import os
from tqdm import tqdm

IGNORED_BRANDS = [
    "AP", "AREXONS", "ASSO", "ATE", "ATECSO", "AUTOCLIMA", "BIRTH", "BOSCH", "BREMBO", 
    "BUGATTI", "CASCO", "CASTROL", "CEI", "CORTECO", "COVIND", "DAF", "DAYCO", "DELPHI", 
    "DENSO", "DOLZ", "ELRING", "EMMERRE", "ERA", "EXIDE", "FAG", "FEBI", "FERODO", 
    "FIAT", "FORD", "FRAP", "FTE", "GATES", "HELLA", "HOFFER", "IMASAF", "INA", "ISUZU", 
    "IVECO", "JAPANPARTS", "JAPKO", "KNECHT", "KRIOS", "LEMFORDER", "LUK", "MAHLE", 
    "MAN", "METELLI", "MEYLE", "MOBIL", "MONROE", "MOOG", "MULLER FILTER", "NISSAN", 
    "NISSENS", "NK", "NRF", "OLSA", "OMP", "PEUGEOT", "PIAGGIO", "PIERBURG", "RAICAM", 
    "RENAULT", "SACHS", "SCANIA", "SELENIA", "SIDAT", "SKF", "TEXTAR", "TRW", "TUDOR", 
    "UFI", "VALEO", "VEMA", "VITAL SUSPENSIONS", "VOLVO", "VOLKSWAGEN", "ZETA-ERRE", "ZF"
]

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

def get_oem_number(row, oem_lookup, IGNORED_BRANDS):
    if row["BRAND"] in IGNORED_BRANDS:
        return ""  # Skip filling OE code for ignored brands
    key = (row["CODICE PRODOTTO"], row["BRAND"][:5])
    return " | ".join(oem_lookup[key]) if key in oem_lookup else "Unknown OE"

def find_additional_cross_codes(codice_prodotto, padded_oe, cleaned_df, IGNORED_BRANDS):
    matches = cleaned_df[(cleaned_df["CODICE OE"] != "Unknown OE") & 
                         (~cleaned_df["BRAND"].isin(IGNORED_BRANDS))]
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
    for _, row in tqdm(cleaned_df.iterrows(), total=len(cleaned_df), desc="Generating cross codes"):
        codice_oe = row["CODICE OE"]
        codice_prodotto = row["CODICE PRODOTTO"]
        brand = row["BRAND"]

        if codice_oe != "Unknown OE" and brand not in ignored_brands:
            if codice_oe not in cross_references:
                cross_references[codice_oe] = []
            cross_references[codice_oe].append(codice_prodotto)

    cross_codes_series = pd.Series(index=cleaned_df.index, dtype=str)
    for codice_oe, prodotti in tqdm(cross_references.items(), desc="Updating CODICI CROSS"):
        cross_codes = {
            prodotto: " | ".join([code for code in prodotti if code != prodotto])
            for prodotto in prodotti
        }
        cross_codes_series.update(pd.Series(cross_codes))

    return cross_codes_series.fillna("")


def process_files(
    articles_file_path,
    output_file_path,
    old_oems_folder,
    brands_file_path,
    final_output_with_brands_path,
    update_progress=None,
):
    xls = pd.ExcelFile(articles_file_path)
    relevant_sheets = []
    first_sheet_validated = False

    for sheet_name in tqdm(xls.sheet_names, desc="Validating sheets"):
        df = pd.read_excel(xls, sheet_name=sheet_name, header=0, dtype=str)  # Ensure all columns are read as strings
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

    first_sheet_df = relevant_sheets[0][1].drop(columns=["mgs210"])
    aligned_sheets = [first_sheet_df]
    for sheet_name, df in relevant_sheets[1:]:
        df.columns = first_sheet_df.columns
        aligned_sheets.append(df)

    df_combined = pd.concat(aligned_sheets, ignore_index=True)
    df_combined = df_combined[~df_combined.iloc[:, 2].isin(["", "."])]
    df_combined = df_combined.drop(columns=["STAMPA LISTINI"])

    df_combined.columns = [
        "CODICE PRODOTTO",
        "BRAND",
        "DESCRIZIONE",
        "GIACENZA",
        "PRZ. ULT. ACQ.",
    ]

    for col in [
        "CODICE OE",
        "CODICI CROSS",
        "LINK IMMAGINE",
        "CATEGORIA",
        "SCHEDA TECNICA",
        "SCHEDA DI SICUREZZA",
        "CONFEZIONE",
        "QUANTITÀ MINIMA",
        "META.LUNGHEZZA",
        "META.LARGHEZZA",
        "META.PROFONDITA'",
        "META. ...",
    ]:
        df_combined[col] = pd.NA

    # Ensure specified columns are treated as strings
    columns_to_ensure_as_strings = [
        "CODICE PRODOTTO", "BRAND", "DESCRIZIONE", "CODICE OE", "CODICI CROSS", 
        "LINK IMMAGINE", "CATEGORIA", "SCHEDA TECNICA", "SCHEDA DI SICUREZZA",
        "CONFEZIONE", "META.LUNGHEZZA", "META.LARGHEZZA", "META.PROFONDITA'", "META. ..."
    ]
    df_combined[columns_to_ensure_as_strings] = df_combined[columns_to_ensure_as_strings].astype(str)

    df_combined["GIACENZA"] = pd.to_numeric(
        df_combined["GIACENZA"].str.replace(",", "."), errors="coerce"
    )
    df_combined["PRZ. ULT. ACQ."] = pd.to_numeric(
        df_combined["PRZ. ULT. ACQ."].str.replace(",", "."), errors="coerce"
    )

    df_combined = df_combined[df_combined["GIACENZA"] > 0]
    df_combined = df_combined[df_combined["PRZ. ULT. ACQ."].notna()]

    # No need to save and reload, continue with the DataFrame in memory
    cleaned_df = df_combined.copy()
    cleaned_df["CODICE PRODOTTO"] = cleaned_df["CODICE PRODOTTO"].str.strip()
    cleaned_df["CODICE OE"] = cleaned_df["CODICE OE"].str.strip()
    cleaned_df["BRAND"] = cleaned_df["BRAND"].str.strip()

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
        oems_df["article_alt_brands"] = oems_df["article_alt_brands"].astype(str).str.strip()
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
    cleaned_df["CODICE OE"] = cleaned_df.progress_apply(
        lambda row: get_oem_number(row, oem_lookup, IGNORED_BRANDS), axis=1
    )

    # Update PREZZO based on PRZ. ULT. ACQ.
    cleaned_df["PRZ. ULT. ACQ."] = pd.to_numeric(
        cleaned_df["PRZ. ULT. ACQ."], errors="coerce"
    )
    cleaned_df["PREZZO"] = cleaned_df["PRZ. ULT. ACQ."].apply(
        lambda x: round(x * 1.25, 2) if pd.notnull(x) else x
    )
    cleaned_df = cleaned_df.drop(columns=["PRZ. ULT. ACQ."])

    # Ensure specified columns are treated as strings before reordering
    cleaned_df[columns_to_ensure_as_strings] = cleaned_df[columns_to_ensure_as_strings].astype(str)

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
    ]
    cleaned_df = cleaned_df[columns_order]
    cleaned_df["CODICI CROSS"] = ""

    # Apply optimized cross-code generation function
    cleaned_df["CODICI CROSS"] = optimized_cross_code_generation(cleaned_df, IGNORED_BRANDS)

    # Handle cases where CODICE OE is unknown and brand is not ignored
    cleaned_df["padded_oe"] = " " + cleaned_df["CODICE OE"].str.strip() + " "
    unknown_oe_mask = (cleaned_df["CODICE OE"] == "Unknown OE") & (~cleaned_df["BRAND"].isin(IGNORED_BRANDS))
    cleaned_df.loc[unknown_oe_mask, "CODICI CROSS"] = cleaned_df.loc[
        unknown_oe_mask, "CODICE PRODOTTO"
    ].progress_apply(
        lambda codice_prodotto: find_additional_cross_codes(
            codice_prodotto, cleaned_df["padded_oe"], cleaned_df, IGNORED_BRANDS
        )
    )

    # Drop the 'padded_oe' column
    cleaned_df = cleaned_df.drop(columns=["padded_oe"])

    # Fill the "CONFEZIONE" column with "1 pz" and the "QUANTITÀ MINIMA" column with "1"
    cleaned_df["CONFEZIONE"] = "1 pz"
    cleaned_df["QUANTITÀ MINIMA"] = "1"

    # Set CATEGORIA to "Ricambio"
    cleaned_df["CATEGORIA"] = "Ricambio"

    # Ensure specified columns remain empty
    columns_to_keep_empty = [
        "LINK IMMAGINE", "SCHEDA TECNICA", "SCHEDA DI SICUREZZA",
        "META.LUNGHEZZA", "META.LARGHEZZA", "META.PROFONDITA'", "META. ..."
    ]
    cleaned_df[columns_to_keep_empty] = ""

    # Step 4: Update brands
    cleaned_df = update_brands(cleaned_df, brands_file_path)

    # After updating brands, set CODICE OE and CODICI CROSS to empty for ignored brands
    ignored_brands_mask = cleaned_df["BRAND"].isin(IGNORED_BRANDS)
    cleaned_df.loc[ignored_brands_mask, ["CODICE OE", "CODICI CROSS"]] = ""

    # Save the final output directly
    cleaned_df.to_csv(final_output_with_brands_path, index=False)
    print(f"Brands updated and final file saved at {final_output_with_brands_path}")

