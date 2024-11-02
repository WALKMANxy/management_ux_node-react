import multiprocessing
from concurrent.futures import ThreadPoolExecutor

from pandarallel import pandarallel

from .data_cleaning import merge_files
from .company1_processing import process_company1
from .company2_processing import process_company2

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
    company1_output,
    company2_output,
    brands_file_path,
    old_oems_folder,
    ignored_brands,
    inputs,  # Add the inputs for pricing adjustments
):
    # Merge files
    merged_df = merge_files(articles_file_path, warehouse_file_path)

    # Use ThreadPoolExecutor to run Tulero and Tyre24 processing concurrently
    with ThreadPoolExecutor() as executor:
        company1_future = executor.submit(
            process_company1,
            merged_df.copy(),  # Use copy to avoid potential conflicts
            brands_file_path,
            old_oems_folder,
            ignored_brands,
            inputs["company1_markup"],  # Pass markup for Tulero
            inputs["company1_shipping"],  # Pass shipping for Tulero
        )
        company2_future = executor.submit(
            process_company2,
            merged_df.copy(),  # Use copy to avoid potential conflicts
            tecdoc_file_path,
            inputs["company2_markup_it"],  # Pass markup for Tyre24 (Italy)
            inputs["company2_shipping_it"],  # Pass shipping for Tyre24 (Italy)
            inputs["company2_markup_de"],  # Pass markup for Tyre24 (Germany)
            inputs["company2_shipping_de"],  # Pass shipping for Tyre24 (Germany)
        )

        # Wait for both to complete and get the results
        company1_result = company1_future.result()
        company2_result = company2_future.result()

    # print("Both processes completed.")

    # Save the results to CSV files
    company1_result.to_csv(company1_output, index=False)
    company2_result.to_csv(company2_output, index=False)

    # print(f"Tulero CSV saved to {company1_output}")
    # print(f"Tyre24 CSV saved to {company2_output}")
