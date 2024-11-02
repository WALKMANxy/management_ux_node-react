import os

from data_processing.ignored_brands import IGNORED_BRANDS
from data_processing.twin_data_processing import main as main_processing_function
from PyQt6.QtCore import QThread, pyqtSignal
from workerFtp import UploadWorker


class Worker(QThread):
    progress = pyqtSignal(int)
    finished_processing = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(
        self,
        articles_file,
        warehouse_file,
        output_folder,
        oem_folder,
        brands_file,
        tecdoc_file,  # New
        company1_ftp_info,  # New
        company2_ftp_info,  # New
        validated_data,  # Add the inputs (markup and shipping costs)
        upload_company1=True,  # New parameter
        upload_company2=True,   # New parameter
    ):
        super().__init__()
        self.articles_file = articles_file
        self.warehouse_file = warehouse_file
        self.output_folder = output_folder
        self.oem_folder = oem_folder
        self.brands_file = brands_file
        self.tecdoc_file = tecdoc_file  # New
        self.company1_ftp_info = company1_ftp_info  # New
        self.company2_ftp_info = company2_ftp_info  # New
        self.inputs = validated_data  # Store the inputs
        self.upload_company1 = upload_company1  # New
        self.upload_company2 = upload_company2    # New
        self.timer = None

    def run(self):
        try:
            # Call the main data processing function
            company1_output_file = os.path.join(self.output_folder, "company1_output.csv")
            company2_output_file = os.path.join(self.output_folder, "company2_output.csv")

            try:
                # Run data processing
                main_processing_function(
                    self.articles_file,
                    self.warehouse_file,
                    self.tecdoc_file,
                    company1_output_file,
                    company2_output_file,
                    self.brands_file,
                    self.oem_folder,
                    IGNORED_BRANDS,
                    self.inputs,  # Pass the inputs here
                )
            except Exception as e:
                raise Exception(f"Data processing failed: {str(e)}")

            self.progress.emit(85)

            # Start FTP upload using UploadWorker
            self.upload_files()

        except Exception as e:
            self.error.emit(str(e))

    # In worker.py's Worker class
    def upload_files(self):
        """Handles file upload and catches more detailed errors."""
        try:
            if not self.upload_company1 and not self.upload_company2:
                # No uploads to perform
                self.finished_processing.emit("Processing completed successfully without uploads.")
                return

            upload_worker = UploadWorker(
                self.output_folder,
                self.company1_ftp_info,
                self.company2_ftp_info,
                upload_company1=self.upload_company1,  # Pass the flag
                upload_company2=self.upload_company2,  # Pass the flag
            )
            upload_worker.progress.connect(lambda message: self.progress.emit(message))
            upload_worker.finished.connect(self.on_upload_finished)
            upload_worker.error.connect(self.error.emit)  # Ensure errors are propagated
            upload_worker.start()
            upload_worker.wait()  # Wait for upload to finish

        except Exception as e:
            # Catch more specific errors from UploadWorker and emit them
            self.error.emit(f"FTP upload failed: {str(e)}")


    def on_upload_finished(self, result):
        """Handles successful upload completion."""
        if "failed" in result.lower():
            self.error.emit(result)  # Forward the failure message
        else:
            self.progress.emit(100)
            self.finished_processing.emit(result)
