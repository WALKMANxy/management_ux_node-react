"""tyre24csvmaker/worker.py"""

from PyQt6.QtCore import QThread, pyqtSignal
from data_processing import process_files


class Worker(QThread):
    progress = pyqtSignal(int)
    finished_processing = pyqtSignal()

    def __init__(self, tecdoc_file, articles_file, output_file):
        super().__init__()
        self.tecdoc_file = tecdoc_file
        self.articles_file = articles_file
        self.output_file = output_file

    def run(self):
        process_files(
            self.tecdoc_file, self.articles_file, self.output_file, self.update_progress
        )
        self.finished_processing.emit()

    def update_progress(self, current, total):
        pass  # We are not using this for fake progress bar
