import os

# Set to True for development, False for production
DEBUG_MODE = False

if DEBUG_MODE:
    from tqdm import tqdm


def vectorized_get_oem_number(df, oem_lookup, IGNORED_BRANDS):
    import numpy as np

    ignored_mask = df["BRAND"].isin(IGNORED_BRANDS)
    keys = list(zip(df["CODICE PRODOTTO"], df["BRAND"].str[:5]))
    oem_numbers = np.array(
        [" | ".join(oem_lookup.get(key, ["Unknown OE"])) for key in keys]
    )
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
    import pandas as pd

    brands_df = pd.read_csv(brands_file_path, dtype=str)
    brands_df["Brand"] = brands_df["Brand"].astype(str).str.strip()
    brands_df["Match"] = brands_df["Match"].astype(str).str.strip()
    brand_lookup = dict(zip(brands_df["Brand"], brands_df["Match"]))

    if DEBUG_MODE:
        tqdm.pandas(desc="Updating brands")
        df_output["BRAND"] = df_output["BRAND"].progress_apply(
            lambda x: brand_lookup.get(x, x)
        )
    else:
        df_output["BRAND"] = df_output["BRAND"].apply(lambda x: brand_lookup.get(x, x))

    return df_output


def optimized_cross_code_generation(cleaned_df, ignored_brands):
    import pandas as pd

    cross_references = {}
    iterrows = (
        tqdm(
            cleaned_df.iterrows(), total=len(cleaned_df), desc="Generating cross codes"
        )
        if DEBUG_MODE
        else cleaned_df.iterrows()
    )

    for _, row in iterrows:
        codice_oe = row["CODICE OE"]
        codice_prodotto = row["CODICE PRODOTTO"]
        brand = row["BRAND"]

        if codice_oe != "Unknown OE" and brand not in ignored_brands:
            if codice_oe not in cross_references:
                cross_references[codice_oe] = []
            cross_references[codice_oe].append(codice_prodotto)

    cross_codes_series = pd.Series(index=cleaned_df.index, dtype=str)

    if DEBUG_MODE:
        for codice_oe, prodotti in tqdm(
            cross_references.items(), desc="Updating CODICI CROSS"
        ):
            cross_codes = {
                prodotto: " | ".join([code for code in prodotti if code != prodotto])
                for prodotto in prodotti
            }
            cross_codes_series.update(pd.Series(cross_codes))
    else:
        for codice_oe, prodotti in cross_references.items():
            cross_codes = {
                prodotto: " | ".join([code for code in prodotti if code != prodotto])
                for prodotto in prodotti
            }
            cross_codes_series.update(pd.Series(cross_codes))

    return cross_codes_series.fillna("")


def process_tulero(
    merged_df, brands_file_path, old_oems_folder, ignored_brands, markup, shipping_cost
):
    import numpy as np
    import pandas as pd

    # print("process_tulero function started")
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

    iter_old_oems_files = (
        tqdm(old_oems_files, desc="Building old OEM mappings")
        if DEBUG_MODE
        else old_oems_files
    )

    for file_name in iter_old_oems_files:
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

    if DEBUG_MODE:
        tqdm.pandas(desc="Updating CODICE OE with old OEMs")
        merged_df["CODICE OE"] = vectorized_get_oem_number(
            merged_df, oem_lookup, ignored_brands
        )
    else:
        merged_df["CODICE OE"] = vectorized_get_oem_number(
            merged_df, oem_lookup, ignored_brands
        )

    # Update PREZZO based on PRZ. ULT. ACQ.
    merged_df["PREZZO"] = merged_df["PRZ. ULT. ACQ."].apply(
        lambda x: round(float(x) * markup, 2) if pd.notnull(x) else x
    )
    merged_df.drop(columns=["PRZ. ULT. ACQ."], inplace=True)

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
    merged_df = merged_df[columns_order]
    merged_df["CODICI CROSS"] = ""

    # Apply optimized cross-code generation function
    merged_df["CODICI CROSS"] = optimized_cross_code_generation(
        merged_df, ignored_brands
    )

    # Handle cases where CODICE OE is unknown and brand is not ignored
    merged_df["padded_oe"] = " " + merged_df["CODICE OE"].str.strip() + " "
    unknown_oe_mask = (merged_df["CODICE OE"] == "Unknown OE") & (
        ~merged_df["BRAND"].isin(ignored_brands)
    )
    merged_df.loc[unknown_oe_mask, "CODICI CROSS"] = merged_df.loc[
        unknown_oe_mask, "CODICE PRODOTTO"
    ].parallel_apply(
        lambda codice_prodotto: find_additional_cross_codes(
            codice_prodotto, merged_df["padded_oe"], merged_df, ignored_brands
        )
    )

    # Drop the 'padded_oe' column
    merged_df.drop(columns=["padded_oe"], inplace=True)

    # Fill the "CONFEZIONE" column with "1 pz" and the "QUANTITÀ MINIMA" column with "1"
    merged_df["CONFEZIONE"] = "1 pz"
    merged_df["QUANTITÀ MINIMA"] = "1"

    # print("Filled 'CONFEZIONE' column with '1 pz' and 'QUANTITÀ MINIMA' column with '1'")

    # Set CATEGORIA to "Ricambio"
    merged_df["CATEGORIA"] = "Ricambio"

    # print("Set CATEGORIA to 'Ricambio'")

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

    # print("Ensured specified columns remain empty")

    # Update brands
    merged_df = update_brands(merged_df, brands_file_path)

    # print("Updated brands")

    # After updating brands, set CODICE OE and CODICI CROSS to empty for ignored brands
    ignored_brands_mask = merged_df["BRAND"].isin(ignored_brands)
    merged_df.loc[ignored_brands_mask, ["CODICE OE", "CODICI CROSS"]] = ""

    # print("Set CODICE OE and CODICI CROSS to empty for ignored brands")

    """  # Drop 'UBICAZIONE' column if not needed in the final output
    merged_df.drop(columns=["UBICAZIONE"], inplace=True)

    print("Dropped 'UBICAZIONE' column") """

    # **Add the custom rules here**

    # Convert 'PREZZO' to numeric if it's not already
    merged_df["PREZZO"] = pd.to_numeric(merged_df["PREZZO"], errors="coerce")

    # print("Converted 'PREZZO' to numeric if it's not already")

    # Filter out all rows where PREZZO is less than 4.50
    merged_df = merged_df[merged_df["PREZZO"] >= 4.50]

    # print("Filtered out all rows where PREZZO is less than 4.50")

    # Add 7.50 to all remaining PREZZO
    merged_df["PREZZO"] = merged_df["PREZZO"] + shipping_cost

    # print("Added 7.50 to all remaining PREZZO")

    # Define the custom rounding function
    def custom_round(price):
        if pd.isnull(price):
            return price
        decimal_part = price % 1
        if decimal_part <= 0.5:
            return np.floor(price - 1) + 0.9
        else:
            return np.floor(price) + 0.9

    # print("Defined the custom rounding function")

    # Apply the custom rounding to 'PREZZO'
    merged_df["PREZZO"] = merged_df["PREZZO"].apply(custom_round)

    # print("Applied the custom rounding to 'PREZZO'")

    tulero_df = merged_df

    # print("TULERO READY")

    return tulero_df
