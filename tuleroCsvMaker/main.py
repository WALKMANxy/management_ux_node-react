import os
import sys
import json
from PyQt6.QtWidgets import QApplication, QMainWindow, QMessageBox, QWidget
from PyQt6.QtGui import QIcon, QFont
from PyQt6.QtCore import QTimer, QDateTime
from worker import Worker
from utils import setup_ui, browse_articles, browse_oem, browse_brands, browse_output

CONFIG_FILE = 'config.json'
DATA_FOLDER = 'Data'
OUTPUT_FOLDER = 'Output'

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as file:
            return json.load(file)
    return {}

def save_config(config):
    with open(CONFIG_FILE, 'w') as file:
        json.dump(config, file)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("CSV Transformer")
        self.setGeometry(100, 100, 800, 600)

        # Determine the base path for the icons
        base_path = sys._MEIPASS if hasattr(sys, '_MEIPASS') else os.path.abspath(".")
        self.setWindowIcon(QIcon(os.path.join(base_path, 'icons', 'icon256.ico')))

        # Setup UI using utils
        layout, widgets = setup_ui(self, base_path)
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        # Assign widget references to self for use in other methods
        self.articles_entry = widgets["articles_entry"]
        self.oem_entry = widgets["oem_entry"]
        self.brands_entry = widgets["brands_entry"]
        self.output_entry = widgets["output_entry"]
        self.ftp_host_entry = widgets["ftp_host_entry"]
        self.ftp_user_entry = widgets["ftp_user_entry"]
        self.ftp_pass_entry = widgets["ftp_pass_entry"]
        self.progress_bar = widgets["progress_bar"]
        self.process_button = widgets["process_button"]

        self.articles_button = widgets["articles_button"]
        self.oem_button = widgets["oem_button"]
        self.brands_button = widgets["brands_button"]
        self.output_button = widgets["output_button"]

        self.articles_file = None
        self.output_folder = None
        self.oem_folder = None
        self.brands_file = None
        self.ftp_host = None
        self.ftp_user = None
        self.ftp_pass = None
        self.processing = False

        self.timer = QTimer()
        self.fake_progress = 0
        self.timer.timeout.connect(self.update_fake_progress)

        self.check_and_load_files()

    def check_and_load_files(self):
        config = load_config()

        data_folder = os.path.join(os.path.dirname(__file__), DATA_FOLDER)
        articles_file = config.get('articles_file', os.path.join(data_folder, 'articles.xls'))
        oem_folder = config.get('oem_folder', os.path.join(data_folder, 'oems'))
        brands_file = config.get('brands_file', os.path.join(data_folder, 'brands.csv'))
        output_folder = config.get('output_folder', os.path.join(os.path.dirname(__file__), OUTPUT_FOLDER))
        self.ftp_host = config.get('ftp_host', '')
        self.ftp_user = config.get('ftp_user', '')
        self.ftp_pass = config.get('ftp_pass', '')

        if os.path.exists(articles_file):
            self.articles_file = articles_file
            self.articles_entry.setText(articles_file)
            self.articles_button.setStyleSheet("background-color: green; color: white;")
        if os.path.exists(oem_folder):
            self.oem_folder = oem_folder
            self.oem_entry.setText(oem_folder)
            self.oem_button.setStyleSheet("background-color: green; color: white;")
        if os.path.exists(brands_file):
            self.brands_file = brands_file
            self.brands_entry.setText(brands_file)
            self.brands_button.setStyleSheet("background-color: green; color: white;")
        if os.path.exists(output_folder):
            self.output_folder = output_folder
            self.output_entry.setText(output_folder)
            self.output_button.setStyleSheet("background-color: green; color: white;")
        else:
            os.makedirs(output_folder)

        self.ftp_host_entry.setText(self.ftp_host)
        self.ftp_user_entry.setText(self.ftp_user)
        self.ftp_pass_entry.setText(self.ftp_pass)

        self.check_ready_to_process()

    def check_ready_to_process(self):
        if self.articles_file and self.oem_folder and self.brands_file and self.output_folder:
            self.process_button.setEnabled(True)

    def start_processing(self):
        self.processing = True
        self.process_button.setEnabled(False)
        self.process_button.setStyleSheet(
            "background-color: lightgray; color: darkgray;"
        )
        self.progress_bar.setValue(0)

        # Generate the final output file name using the current date and time
        current_time = QDateTime.currentDateTime().toString("yyyyMMdd_HHmmss")
        final_output_file_name = f"rcs_stock_{current_time}.csv"
        final_output_path = os.path.join(self.output_folder, final_output_file_name)

        self.ftp_host = self.ftp_host_entry.text().strip()
        self.ftp_user = self.ftp_user_entry.text().strip()
        self.ftp_pass = self.ftp_pass_entry.text().strip()

        self.worker = Worker(
            self.articles_file,
            f"{self.output_folder}/cleaned_Articles.csv",
            self.oem_folder,
            self.brands_file,
            final_output_path,
            self.ftp_host,
            self.ftp_user,
            self.ftp_pass,
            ftp_dir="/csv/"
        )
        self.worker.progress.connect(self.update_progress)
        self.worker.finished_processing.connect(self.processing_complete)
        self.worker.start()

        # Start the fake progress after starting the worker
        self.fake_progress = 0
        self.timer.start(200)  # Update every 200ms

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
        self.progress_bar.setValue(int(self.fake_progress))

        # Stop the timer if it reaches 100%
        if self.fake_progress >= 100:
            self.timer.stop()


    def update_progress(self, value):
        self.progress_bar.setValue(value)

    def processing_complete(self):
        self.timer.stop()
        self.progress_bar.setValue(100)
        self.process_button.setEnabled(True)
        self.process_button.setStyleSheet("""
            QPushButton {
                font-family: 'Roboto';
                font-size: 14px;
                padding: 10px;
                border-radius: 10px;
                background-color: rgba(0, 122, 204, 0.8);
                color: white;
            }
            QPushButton:hover {
                background-color: rgba(0, 122, 204, 1.0);
            }
            QPushButton:disabled {
                background-color: lightgray;
                color: darkgray;
            }
        """)

        msg_box = QMessageBox(self)
        msg_box.setWindowTitle("Processing Complete")
        msg_box.setText(
            f"The file has been saved to {self.output_folder}/final_output_with_brands.csv"
        )
        msg_box.setIcon(QMessageBox.Icon.Information)
        msg_box.addButton(QMessageBox.StandardButton.Ok)
        exit_button = msg_box.addButton("Exit", QMessageBox.ButtonRole.ActionRole)
        exit_button.clicked.connect(self.close)
        msg_box.exec()

        # Save the configuration including the FTP credentials
        self.save_config()

    def save_config(self):
        config = {
            'articles_file': self.articles_file,
            'oem_folder': self.oem_folder,
            'brands_file': self.brands_file,
            'output_folder': self.output_folder,
            'ftp_host': self.ftp_host,
            'ftp_user': self.ftp_user,
            'ftp_pass': self.ftp_pass,
        }
        save_config(config)

    # Reuse functions from utils.py
    browse_articles = browse_articles
    browse_oem = browse_oem
    browse_brands = browse_brands
    browse_output = browse_output

if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Set the Roboto font
    roboto_font = QFont("Roboto")
    app.setFont(roboto_font)

    main_window = MainWindow()
    main_window.show()

    sys.exit(app.exec())
