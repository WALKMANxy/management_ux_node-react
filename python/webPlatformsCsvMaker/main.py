import os
import sys

from PyQt6.QtCore import QTimer  # type: ignore
from PyQt6.QtGui import QFont, QIcon  # type: ignore
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,  # type: ignore
    QMessageBox,
    QWidget,
)
from utility.config import load_config, save_config
from utility.error_handlers import processing_error
from utility.file_browser import (
    browse_articles,
    browse_brands,
    browse_oem,
    browse_output,
    browse_tecdoc,
    browse_warehouse,
)
from utility.ui_setup import setup_ui
from worker import Worker

CONFIG_FILE = "config.json"
DATA_FOLDER = "Data"
OUTPUT_FOLDER = "Output"


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Web Platforms Stock Uploader")
        self.setGeometry(100, 100, 800, 600)

        # Determine the base path for the icons
        base_path = sys._MEIPASS if hasattr(sys, "_MEIPASS") else os.path.abspath(".")
        self.setWindowIcon(QIcon(os.path.join(base_path, "icons", "icon256.ico")))

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
        self.warehouse_entry = widgets["warehouse_entry"]  # New
        self.tecdoc_entry = widgets["tecdoc_entry"]

        # After setup_ui in __init__
        self.tulero_ftp_host_entry = widgets["tulero_ftp_host_entry"]
        self.tulero_ftp_user_entry = widgets["tulero_ftp_user_entry"]
        self.tulero_ftp_pass_entry = widgets["tulero_ftp_pass_entry"]
        self.tulero_ftp_dir_combo = widgets["tulero_ftp_dir_combo"]

        self.tyre24_ftp_host_entry = widgets["tyre24_ftp_host_entry"]
        self.tyre24_ftp_user_entry = widgets["tyre24_ftp_user_entry"]
        self.tyre24_ftp_pass_entry = widgets["tyre24_ftp_pass_entry"]
        self.tyre24_ftp_dir_combo = widgets["tyre24_ftp_dir_combo"]
        self.progress_bar = widgets["progress_bar"]
        self.process_button = widgets["process_button"]

        self.articles_button = widgets["articles_button"]
        self.oem_button = widgets["oem_button"]
        self.brands_button = widgets["brands_button"]
        self.output_button = widgets["output_button"]
        self.warehouse_button = widgets["warehouse_button"]  # New
        self.tecdoc_button = widgets["tecdoc_button"]

        self.articles_file = None
        self.output_folder = None
        self.oem_folder = None
        self.warehouse_file = None  # New
        self.tecdoc_file = None

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
        articles_file = config.get(
            "articles_file", os.path.join(data_folder, "articles.xls")
        )
        oem_folder = config.get("oem_folder", os.path.join(data_folder, "oems"))
        brands_file = config.get("brands_file", os.path.join(data_folder, "brands.csv"))
        warehouse_file = config.get(
            "warehouse_file", os.path.join(data_folder, "warehouse.xls")
        )  # New
        tecdoc_file = config.get(
            "tecdoc_file", os.path.join(data_folder, "tecdoc_brand_id.csv")
        )
        output_folder = config.get(
            "output_folder", os.path.join(os.path.dirname(__file__), OUTPUT_FOLDER)
        )

        # Load Tulero FTP credentials
        self.tulero_ftp_host = config.get("tulero_ftp_host", "")
        self.tulero_ftp_user = config.get("tulero_ftp_user", "")
        self.tulero_ftp_pass = config.get("tulero_ftp_pass", "")
        self.tulero_ftp_dir = config.get("tulero_ftp_dir", "/")

        # Load Tyre24 FTP credentials
        self.tyre24_ftp_host = config.get("tyre24_ftp_host", "")
        self.tyre24_ftp_user = config.get("tyre24_ftp_user", "")
        self.tyre24_ftp_pass = config.get("tyre24_ftp_pass", "")
        self.tyre24_ftp_dir = config.get("tyre24_ftp_dir", "/")

        # Set the UI elements
        self.tulero_ftp_host_entry.setText(self.tulero_ftp_host)
        self.tulero_ftp_user_entry.setText(self.tulero_ftp_user)
        self.tulero_ftp_pass_entry.setText(self.tulero_ftp_pass)
        self.tulero_ftp_dir_combo.setCurrentText(self.tulero_ftp_dir)

        self.tyre24_ftp_host_entry.setText(self.tyre24_ftp_host)
        self.tyre24_ftp_user_entry.setText(self.tyre24_ftp_user)
        self.tyre24_ftp_pass_entry.setText(self.tyre24_ftp_pass)
        self.tyre24_ftp_dir_combo.setCurrentText(self.tyre24_ftp_dir)

        if "ftp_dir" in config:  # Ensure the ftp_dir is in the configuration
            self.ftp_dir_combo.setCurrentText(config["ftp_dir"])

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
        if os.path.exists(warehouse_file):  # New
            self.warehouse_file = warehouse_file
            self.warehouse_entry.setText(warehouse_file)
            self.warehouse_button.setStyleSheet(
                "background-color: green; color: white;"
            )
        if os.path.exists(tecdoc_file):
            self.tecdoc_file = tecdoc_file
            self.tecdoc_entry.setText(tecdoc_file)
            self.tecdoc_button.setStyleSheet("background-color: green; color: white;")
        if os.path.exists(output_folder):
            self.output_folder = output_folder
            self.output_entry.setText(output_folder)
            self.output_button.setStyleSheet("background-color: green; color: white;")
        else:
            os.makedirs(output_folder)

        self.check_ready_to_process()

    def check_ready_to_process(self):
        if (
            self.articles_file
            and self.oem_folder
            and self.brands_file
            and self.output_folder
            and self.warehouse_file
            and self.tecdoc_file  # New condition
        ):
            self.process_button.setEnabled(True)

    def start_processing(self):
        print(f"Processing with warehouse file: {self.warehouse_file}")

        self.processing = True
        self.process_button.setEnabled(False)
        self.process_button.setStyleSheet(
            "background-color: lightgray; color: darkgray;"
        )
        self.progress_bar.setValue(0)

        # Collect Tulero FTP info
        tulero_ftp_info = {
            "host": self.tulero_ftp_host_entry.text().strip(),
            "user": self.tulero_ftp_user_entry.text().strip(),
            "pass": self.tulero_ftp_pass_entry.text().strip(),
            "dir": self.tulero_ftp_dir_combo.currentText().strip(),
        }

        # Collect Tyre24 FTP info
        tyre24_ftp_info = {
            "host": self.tyre24_ftp_host_entry.text().strip(),
            "user": self.tyre24_ftp_user_entry.text().strip(),
            "pass": self.tyre24_ftp_pass_entry.text().strip(),
            "dir": self.tyre24_ftp_dir_combo.currentText().strip(),
        }

        self.worker = Worker(
            self.articles_file,
            self.warehouse_file,
            self.output_folder,  # Pass the output directory, not a file path
            self.oem_folder,
            self.brands_file,
            self.tecdoc_file,  # New
            tulero_ftp_info,  # New
            tyre24_ftp_info,  # New
        )
        self.worker.progress.connect(self.update_progress)
        self.worker.finished_processing.connect(self.processing_complete)
        self.worker.error.connect(
            lambda error_msg: processing_error(self, error_msg)
        )  # Connect to the imported error handler
        self.worker.start()

        self.fake_progress = 0
        self.timer.start(200)

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
        msg_box.setText("The file has been successfully uploaded to the FTP server.")
        msg_box.setIcon(QMessageBox.Icon.Information)
        msg_box.addButton(QMessageBox.StandardButton.Ok)
        exit_button = msg_box.addButton("Exit", QMessageBox.ButtonRole.ActionRole)
        exit_button.clicked.connect(self.close)
        msg_box.exec()

        # Save the configuration including the FTP credentials
        self.save_config()

    def save_config(self):
        config = {
            "articles_file": self.articles_file,
            "oem_folder": self.oem_folder,
            "brands_file": self.brands_file,
            "output_folder": self.output_folder,
            "warehouse_file": self.warehouse_file,  # New
            "tecdoc_file": self.tecdoc_file,
            "tulero_ftp_host": self.tulero_ftp_host_entry.text().strip(),
            "tulero_ftp_user": self.tulero_ftp_user_entry.text().strip(),
            "tulero_ftp_pass": self.tulero_ftp_pass_entry.text().strip(),
            "tulero_ftp_dir": self.tulero_ftp_dir_combo.currentText().strip(),
            "tyre24_ftp_host": self.tyre24_ftp_host_entry.text().strip(),
            "tyre24_ftp_user": self.tyre24_ftp_user_entry.text().strip(),
            "tyre24_ftp_pass": self.tyre24_ftp_pass_entry.text().strip(),
            "tyre24_ftp_dir": self.tyre24_ftp_dir_combo.currentText().strip(),
        }
        save_config(config)

    # Reuse functions from utils.py
    browse_articles = browse_articles
    browse_oem = browse_oem
    browse_brands = browse_brands
    browse_output = browse_output
    browse_warehouse = browse_warehouse  # Ensure this is included
    browse_tecdoc = browse_tecdoc  # Add this line


if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Set the Roboto font
    roboto_font = QFont("Roboto")
    app.setFont(roboto_font)

    main_window = MainWindow()
    main_window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Set the Roboto font
    roboto_font = QFont("Roboto")
    app.setFont(roboto_font)

    main_window = MainWindow()
    main_window.show()

    sys.exit(app.exec())
