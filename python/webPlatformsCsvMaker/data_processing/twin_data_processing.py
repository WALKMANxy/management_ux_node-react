from concurrent.futures import ThreadPoolExecutor

from pandarallel import pandarallel

from .data_cleaning import merge_files
from .tulero_processing import process_tulero
from .tyre24_processing import process_tyre24

pandarallel.initialize(progress_bar=True, verbose=0)


def main(
    articles_file_path,
    warehouse_file_path,
    tecdoc_file_path,
    tulero_output,
    tyre24_output,
    brands_file_path,
    old_oems_folder,
    ignored_brands,
):
    # Merge files
    merged_df = merge_files(articles_file_path, warehouse_file_path)

    # Use ThreadPoolExecutor to run Tulero and Tyre24 processing concurrently
    with ThreadPoolExecutor() as executor:
        tulero_future = executor.submit(
            process_tulero,
            merged_df.copy(),  # Use copy to avoid potential conflicts
            brands_file_path,
            old_oems_folder,
            ignored_brands,
        )
        tyre24_future = executor.submit(
            process_tyre24,
            merged_df.copy(),  # Use copy to avoid potential conflicts
            tecdoc_file_path,
        )

        # Wait for both to complete and get the results
        tulero_result = tulero_future.result()
        tyre24_result = tyre24_future.result()

    # print("Both processes completed.")

    # Save the results to CSV files
    tulero_result.to_csv(tulero_output, index=False)
    tyre24_result.to_csv(tyre24_output, index=False)

    # print(f"Tulero CSV saved to {tulero_output}")
    # print(f"Tyre24 CSV saved to {tyre24_output}")


""" if __name__ == "__main__":
    articles_file_path = "path/to/articles_file.xlsx"
    warehouse_file_path = "path/to/warehouse_file.xlsx"
    tecdoc_file_path = "path/to/tecdoc_file.csv"
    tulero_output = "path/to/tulero_output.csv"
    tyre24_output = "path/to/tyre24_output.csv"
    brands_file_path = "path/to/brands_file.csv"
    old_oems_folder = "path/to/oems_folder"

    main(
        articles_file_path,
        warehouse_file_path,
        tecdoc_file_path,
        tulero_output,
        tyre24_output,
        brands_file_path,
        old_oems_folder,
        IGNORED_BRANDS,
    ) """
