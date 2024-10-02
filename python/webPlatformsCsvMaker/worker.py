import os

from data_processing.ignored_brands import IGNORED_BRANDS
from data_processing.twin_data_processing import main as main_processing_function
from PyQt6.QtCore import QThread, pyqtSignal
from workerFtp import UploadWorker


class Worker(QThread):
    progress = pyqtSignal(int)
    finished_processing = pyqtSignal()
    error = pyqtSignal(str)

    def __init__(
        self,
        articles_file,
        warehouse_file,
        output_folder,
        oem_folder,
        brands_file,
        tecdoc_file,  # New
        tulero_ftp_info,  # New
        tyre24_ftp_info,  # New
        validated_data,  # Add the inputs (markup and shipping costs)
    ):
        super().__init__()
        self.articles_file = articles_file
        self.warehouse_file = warehouse_file
        self.output_folder = output_folder
        self.oem_folder = oem_folder
        self.brands_file = brands_file
        self.tecdoc_file = tecdoc_file  # New
        self.tulero_ftp_info = tulero_ftp_info  # New
        self.tyre24_ftp_info = tyre24_ftp_info  # New
        self.inputs = validated_data  # Store the inputs
        self.timer = None

    def run(self):
        try:
            # Call the main data processing function
            tulero_output_file = os.path.join(self.output_folder, "tulero_output.csv")
            tyre24_output_file = os.path.join(self.output_folder, "tyre24_output.csv")

            try:
                # Run data processing
                main_processing_function(
                    self.articles_file,
                    self.warehouse_file,
                    self.tecdoc_file,
                    tulero_output_file,
                    tyre24_output_file,
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

    def upload_files(self):
        """Handles file upload and catches more detailed errors."""
        try:
            upload_worker = UploadWorker(
                self.output_folder,
                self.tulero_ftp_info,
                self.tyre24_ftp_info,
                upload_tulero=True,
                upload_tyre24=True,
            )
            upload_worker.progress.connect(lambda message: self.progress.emit(message))
            upload_worker.finished.connect(self.on_upload_finished)
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
            self.finished_processing.emit()
