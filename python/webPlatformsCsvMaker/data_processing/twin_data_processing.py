import multiprocessing
from concurrent.futures import ThreadPoolExecutor

from pandarallel import pandarallel

from .data_cleaning import merge_files
from .tulero_processing import process_tulero
from .tyre24_processing import process_tyre24

multiprocessing.freeze_support()
multiprocessing.set_start_method("spawn", force=True)


pandarallel.initialize(
    progress_bar=False,
    verbose=0,
    nb_workers=multiprocessing.cpu_count(),
    use_memory_fs=False,
)


def main(
    articles_file_path,
    warehouse_file_path,
    tecdoc_file_path,
    tulero_output,
    tyre24_output,
    brands_file_path,
    old_oems_folder,
    ignored_brands,
    inputs,  # Add the inputs for pricing adjustments
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
            inputs["tulero_markup"],  # Pass markup for Tulero
            inputs["tulero_shipping"],  # Pass shipping for Tulero
        )
        tyre24_future = executor.submit(
            process_tyre24,
            merged_df.copy(),  # Use copy to avoid potential conflicts
            tecdoc_file_path,
            inputs["tyre24_markup_it"],  # Pass markup for Tyre24 (Italy)
            inputs["tyre24_shipping_it"],  # Pass shipping for Tyre24 (Italy)
            inputs["tyre24_markup_de"],  # Pass markup for Tyre24 (Germany)
            inputs["tyre24_shipping_de"],  # Pass shipping for Tyre24 (Germany)
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
