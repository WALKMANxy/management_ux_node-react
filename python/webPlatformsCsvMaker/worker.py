import os
from ftplib import FTP
from PyQt6.QtCore import QThread, QTimer, pyqtSignal  # type: ignore
from data_processing.ignored_brands import IGNORED_BRANDS
from data_processing.twin_data_processing import main as main_processing_function


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
        self.fake_progress = 0
        self.timer = None

    def run(self):
        # Start a QTimer to fake the progress
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_fake_progress)
        self.timer.start(200)  # Update every 200ms

        # Debugging prints
        print(f"Articles file: {self.articles_file}")
        print(f"Warehouse file: {self.warehouse_file}")
        print(f"Tecdoc file: {self.tecdoc_file}")
        print(f"OEM folder: {self.oem_folder}")
        print(f"Brands file: {self.brands_file}")
        print(f"Final output folder: {self.output_folder}")

        try:
            # Call the main data processing function

            tulero_output_file = os.path.join(self.output_folder, "tulero_output.csv")
            tyre24_output_file = os.path.join(self.output_folder, "tyre24_output.csv")

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
            )

            self.progress.emit(50)

            # Upload files to respective FTP servers
            tulero_success = self.upload_to_ftp(
                tulero_output_file, self.tulero_ftp_info
            )
            tyre24_success = self.upload_to_ftp(
                tyre24_output_file, self.tyre24_ftp_info
            )

            # Stop the timer and ensure the progress bar reaches 100%
            self.timer.stop()
            self.progress.emit(100)
            self.finished_processing.emit()
            if not tulero_success or not tyre24_success:
                failed_uploads = []
                if not tulero_success:
                    failed_uploads.append("Tulero")
                if not tyre24_success:
                    failed_uploads.append("Tyre24")
                failed_str = " and ".join(failed_uploads)
                self.error.emit(f"Upload failed for: {failed_str}")
            else:
             # Stop the timer and ensure the progress bar reaches 100%
                self.timer.stop()
                self.progress.emit(100)
                self.finished_processing.emit()

        except Exception as e:
            self.error.emit(str(e))



    def update_fake_progress(self):
        if self.fake_progress < 65:
            # 65% in 2 minutes (120 seconds)
            increment = 65 / (60 / 0.2)  # 0.2 seconds per update
            self.fake_progress += increment
        elif self.fake_progress < 100:
            # Remaining 35% in 7 minutes (420 seconds)
            increment = 35 / (210 / 0.2)  # 0.2 seconds per update
            self.fake_progress += increment

        # Cap the progress at 100%
        self.fake_progress = min(self.fake_progress, 100)

        # Update the progress bar with the new value
        self.progress.emit(int(self.fake_progress))

        # Stop the timer if it reaches 100%
        if self.fake_progress >= 100:
            self.timer.stop()

    def upload_to_ftp(self, file_path, ftp_info):
        # print(f"Uploading {file_path} to {ftp_info['host']}")
        try:
            ftp = FTP(ftp_info['host'])
            # print(f"Connected to {ftp_info['host']}")
            ftp.login(ftp_info['user'], ftp_info['pass'])
            # print(f"Logged in as {ftp_info['user']}")
            ftp.cwd(ftp_info['dir'])
            # print(f"Changed directory to {ftp_info['dir']}")
            with open(file_path, 'rb') as file:
                # print(f"Uploading {os.path.basename(file_path)}")
                ftp.storbinary(f'STOR {os.path.basename(file_path)}', file)
            ftp.quit()
            # print(f"Disconneced from {ftp_info['host']}")
            return True
        except Exception as e:
            print(f"FTP upload error for {ftp_info['host']}: {e}")
            return False
