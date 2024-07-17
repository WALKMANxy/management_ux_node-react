from PyQt6.QtCore import QThread, pyqtSignal
from data_processing import process_files

class Worker(QThread):
    progress = pyqtSignal(int)
    finished_processing = pyqtSignal()

    def __init__(self, articles_file, output_file, oem_folder, brands_file, final_output_file):
        super().__init__()
        self.articles_file = articles_file
        self.output_file = output_file
        self.oem_folder = oem_folder
        self.brands_file = brands_file
        self.final_output_file = final_output_file

    def run(self):
        process_files(
            self.articles_file,
            self.output_file,
            self.oem_folder,
            self.brands_file,
            self.final_output_file,
            self.update_progress
        )
        self.finished_processing.emit()

    def update_progress(self, current, total):
        progress = int(current / total * 100)
        self.progress.emit(progress)
