import numpy as np
import pandas as pd


def process_company2(
    merged_df, tecdoc_file_path, markup_it, shipping_it, markup_de, shipping_de
):
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
        df_articles["TecDoc Brand ID"] = ""

        for i, row in df_articles.iterrows():
            brand_partial = row["TecDoc Brand"]
            if brand_partial in brands_to_ignore:
                df_articles.at[i, "TecDoc Brand ID"] = ""
            elif brand_partial in manual_mapping:
                tecdoc_brand = manual_mapping[brand_partial]
                df_articles.at[i, "TecDoc Brand"] = tecdoc_brand
                df_articles.at[i, "TecDoc Brand ID"] = tecdoc_brand_dict.get(
                    tecdoc_brand, ""
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
                    df_articles.at[i, "TecDoc Brand ID"] = ""

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
        & (merged_df["TecDoc Brand ID"] == ""),
        "TecDoc Brand ID",
    ] = ""

    # Multiply PRZ. ULT. ACQ. by 1.25 for both Price_Italia and Price_Germany
    merged_df["Price_Italia"] = merged_df["PRZ. ULT. ACQ."] * markup_it
    merged_df["Price_Germany"] = merged_df["PRZ. ULT. ACQ."] * markup_de

    # Apply the custom pricing logic from Tulero

    # First, filter out all rows where PRZ. ULT. ACQ. * 1.25 is less than 4.50
    merged_df = merged_df[merged_df["Price_Italia"] >= 4.50]

    # Add 7.50 to Price_Italia and 10.50 to Price_Germany
    merged_df["Price_Italia"] = merged_df["Price_Italia"] + shipping_it
    merged_df["Price_Germany"] = merged_df["Price_Germany"] + shipping_de

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

    # Filter out rows with TecDoc Brand 'RCS' and 'CC'
    merged_df = merged_df[~merged_df["TecDoc Brand"].isin(["RCS", "CC"])]

    company2_df = merged_df

    return company2_df
