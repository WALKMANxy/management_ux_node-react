from PyQt6.QtCore import QThread, pyqtSignal, QTimer # type: ignore
from ftplib import FTP
from data_processing import process_files
import os

class Worker(QThread):
    progress = pyqtSignal(int)
    finished_processing = pyqtSignal()

    def __init__(self, articles_file, output_file, oem_folder, brands_file, final_output_file, ftp_host, ftp_user, ftp_pass, ftp_dir):
        super().__init__()
        self.articles_file = articles_file
        self.output_file = output_file
        self.oem_folder = oem_folder
        self.brands_file = brands_file
        self.final_output_file = final_output_file
        self.ftp_host = ftp_host
        self.ftp_user = ftp_user
        self.ftp_pass = ftp_pass
        self.ftp_dir = ftp_dir
        self.fake_progress = 0
        self.timer = None

    def run(self):
        # Start a QTimer to fake the progress
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_fake_progress)
        self.timer.start(200)  # Update every 200ms

        # Perform the actual processing
        process_files(
            self.articles_file,
            self.output_file,
            self.oem_folder,
            self.brands_file,
            self.final_output_file
        )

        # Upload the file via FTP after processing
        self.upload_to_ftp(self.final_output_file)

        # Stop the timer and ensure the progress bar reaches 100%
        self.timer.stop()
        self.progress.emit(100)
        self.finished_processing.emit()

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

    def upload_to_ftp(self, file_path):
        try:
            # Connect to the FTP server
            with FTP(self.ftp_host) as ftp:
                ftp.login(user=self.ftp_user, passwd=self.ftp_pass)
                ftp.cwd(self.ftp_dir)  # Navigate to the specified directory

                # Open the file in binary mode
                with open(file_path, 'rb') as file:
                    # Use FTP's storbinary method to upload the file
                    ftp.storbinary(f'STOR {os.path.basename(file_path)}', file)

            print(f"Successfully uploaded {file_path} to FTP server")
        except Exception as e:
            print(f"Failed to upload {file_path} to FTP server: {e}")