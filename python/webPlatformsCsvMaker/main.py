# main.py

import multiprocessing
import os
import sys

from PyQt6.QtCore import QTimer
from PyQt6.QtGui import QDoubleValidator, QFont, QIcon, QIntValidator
from PyQt6.QtWidgets import QApplication, QLineEdit, QMainWindow, QMessageBox, QWidget
from translations import _
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
from workerFtp import UploadDialog

multiprocessing.freeze_support()

CONFIG_FILE = "config.json"
DATA_FOLDER = "Data"
OUTPUT_FOLDER = "Output"


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle(_("Web Platforms Stock Uploader"))
        self.setGeometry(100, 100, 800, 600)

        # Determine the base path for the icons
        base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
        icon_path = os.path.join(base_path, "icons", "icon256.ico")
        self.setWindowIcon(QIcon(icon_path))

        # Setup UI using utils
        layout, widgets = setup_ui(self, base_path)
        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

        # Assign widget references to self for use in other methods
        for widget_name in [
            "articles_entry",
            "oem_entry",
            "brands_entry",
            "output_entry",
            "warehouse_entry",
            "tecdoc_entry",
            "tulero_ftp_host_entry",
            "tulero_ftp_user_entry",
            "tulero_ftp_pass_entry",
            "tulero_ftp_dir_combo",
            "tyre24_ftp_host_entry",
            "tyre24_ftp_user_entry",
            "tyre24_ftp_pass_entry",
            "tyre24_ftp_dir_combo",
            "progress_bar",
            "process_button",
            "upload_button",
            "articles_button",
            "oem_button",
            "brands_button",
            "output_button",
            "warehouse_button",
            "tecdoc_button",
        ]:
            setattr(self, widget_name, widgets.get(widget_name))

        self.upload_button.setEnabled(False)  # Initially disabled

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

        # Set validators for percentage fields
        self.tulero_markup_entry = widgets.get("tulero_markup_entry")
        self.tyre24_markup_it_entry = widgets.get("tyre24_markup_it_entry")
        self.tyre24_markup_de_entry = widgets.get("tyre24_markup_de_entry")

        self.tulero_shipping_entry = widgets.get("tulero_shipping_entry")
        self.tyre24_shipping_it_entry = widgets.get("tyre24_shipping_it_entry")
        self.tyre24_shipping_de_entry = widgets.get("tyre24_shipping_de_entry")

        self.tulero_markup_entry.setValidator(QIntValidator(10, 35, self))
        self.tyre24_markup_it_entry.setValidator(QIntValidator(10, 35, self))
        self.tyre24_markup_de_entry.setValidator(QIntValidator(10, 35, self))

        # Set validators for shipping cost fields
        shipping_validator = QDoubleValidator(7.0, 20.0, 1, self)
        shipping_validator.setNotation(QDoubleValidator.Notation.StandardNotation)
        self.tulero_shipping_entry.setValidator(shipping_validator)
        self.tyre24_shipping_it_entry.setValidator(shipping_validator)
        self.tyre24_shipping_de_entry.setValidator(shipping_validator)

        # Connect textChanged signals to validation methods
        self.tulero_markup_entry.textChanged.connect(
            lambda: self.validate_percentage(self.tulero_markup_entry, "markup")
        )
        self.tyre24_markup_it_entry.textChanged.connect(
            lambda: self.validate_percentage(self.tyre24_markup_it_entry, "markup_it")
        )
        self.tyre24_markup_de_entry.textChanged.connect(
            lambda: self.validate_percentage(self.tyre24_markup_de_entry, "markup_de")
        )

        self.tulero_shipping_entry.textChanged.connect(
            lambda: self.validate_shipping(self.tulero_shipping_entry, "shipping")
        )
        self.tyre24_shipping_it_entry.textChanged.connect(
            lambda: self.validate_shipping(self.tyre24_shipping_it_entry, "shipping_it")
        )
        self.tyre24_shipping_de_entry.textChanged.connect(
            lambda: self.validate_shipping(self.tyre24_shipping_de_entry, "shipping_de")
        )

        # Initialize symbol appending (no longer needed)
        self.append_symbols()

        self.check_and_load_files()

        # Trigger validation for pre-filled fields
        self.validate_percentage(self.tulero_markup_entry, "markup")
        self.validate_percentage(self.tyre24_markup_it_entry, "markup_it")
        self.validate_percentage(self.tyre24_markup_de_entry, "markup_de")

        self.validate_shipping(self.tulero_shipping_entry, "shipping")
        self.validate_shipping(self.tyre24_shipping_it_entry, "shipping_it")
        self.validate_shipping(self.tyre24_shipping_de_entry, "shipping_de")

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

        # Load and set Markup and Shipping Costs
        # Markup Fields
        tulero_markup = config.get("tulero_markup", 1.25)  # Default: 1.25 (25%)
        tyre24_markup_it = config.get("tyre24_markup_it", 1.25)  # Default: 1.25 (25%)
        tyre24_markup_de = config.get("tyre24_markup_de", 1.25)  # Default: 1.25 (25%)

        # Convert internal value to display value (e.g., 1.25 -> 25)
        tulero_markup_display = int((tulero_markup - 1) * 100)
        tyre24_markup_it_display = int((tyre24_markup_it - 1) * 100)
        tyre24_markup_de_display = int((tyre24_markup_de - 1) * 100)

        # Set the text with '%' symbol
        self.tulero_markup_entry.setText(f"{tulero_markup_display}%")
        self.tyre24_markup_it_entry.setText(f"{tyre24_markup_it_display}%")
        self.tyre24_markup_de_entry.setText(f"{tyre24_markup_de_display}%")

        # Shipping Cost Fields
        tulero_shipping = config.get("tulero_shipping", 7.5)  # Default: 7.5€
        tyre24_shipping_it = config.get("tyre24_shipping_it", 7.5)  # Default: 7.5€
        tyre24_shipping_de = config.get("tyre24_shipping_de", 10.5)  # Default: 10.5€

        # Set the text with '€' symbol
        self.tulero_shipping_entry.setText(f"{tulero_shipping}€")
        self.tyre24_shipping_it_entry.setText(f"{tyre24_shipping_it}€")
        self.tyre24_shipping_de_entry.setText(f"{tyre24_shipping_de}€")

        # Existing file and folder loading logic
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

        # Ensure the output folder exists and set it
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        self.output_folder = output_folder
        self.output_entry.setText(output_folder)
        self.output_button.setStyleSheet("background-color: green; color: white;")

        self.check_ready_to_process()
        self.update_upload_button_state()

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

    def update_upload_button_state(self):
        try:
            tulero_csv = os.path.join(self.output_folder, "tulero_output.csv")
            tyre24_csv = os.path.join(self.output_folder, "tyre24_output.csv")
            if os.path.exists(tulero_csv) and os.path.exists(tyre24_csv):
                self.upload_button.setEnabled(True)
            else:
                self.upload_button.setEnabled(False)
        except FileNotFoundError:
            self.upload_button.setEnabled(False)

    def validate_percentage(self, field: QLineEdit, field_type: str):
        text = field.text().replace("%", "").strip()
        if text.isdigit():
            value = int(text)
            if 10 <= value <= 35:
                # Valid input
                field.setStyleSheet("border: 2px solid green;")
                # Prevent recursive signal emission
                field.blockSignals(True)
                field.setText(f"{value}%")
                field.blockSignals(False)
                setattr(self, f"{field_type}_value", 1 + value / 100.0)
            else:
                # Invalid range
                field.setStyleSheet("border: 2px solid red;")
        else:
            # Invalid input
            if text == "":
                field.setStyleSheet("")  # Reset style
            else:
                field.setStyleSheet("border: 2px solid red;")

    def validate_shipping(self, field: QLineEdit, field_type: str):
        text = field.text().replace("€", "").strip()
        try:
            value = float(text)
            # Round to one decimal place without modifying the text
            value = round(value, 1)
            if 7.0 <= value <= 20.0:
                # Valid input
                field.setStyleSheet("border: 2px solid green;")
                setattr(self, f"{field_type}_value", value)
            else:
                # Invalid range
                field.setStyleSheet("border: 2px solid red;")
        except ValueError:
            if text == "":
                field.setStyleSheet("")  # Reset style
            else:
                # Invalid input
                field.setStyleSheet("border: 2px solid red;")

    def append_symbols(self):
        # This method is no longer needed since symbols are handled in validation methods
        pass

    def validate_inputs(self):
        try:
            # Use the internally stored values
            config_values = {
                "tulero_markup": getattr(self, "markup_value", None),
                "tulero_shipping": getattr(self, "shipping_value", None),
                "tyre24_markup_it": getattr(self, "markup_it_value", None),
                "tyre24_shipping_it": getattr(self, "shipping_it_value", None),
                "tyre24_markup_de": getattr(self, "markup_de_value", None),
                "tyre24_shipping_de": getattr(self, "shipping_de_value", None),
            }

            # Check if any value is None (invalid or not set)
            if any(v is None for v in config_values.values()):
                raise ValueError(
                    _("Please correct the input fields highlighted in red.")
                )

            return config_values
        except ValueError as e:
            QMessageBox.warning(self, _("Input Error"), str(e))
            return None

    def start_processing(self):
        # Initialize and start the fake progress timer
        self.timer.start(200)  # Update every 200 ms

        # Validate inputs first
        validated_data = self.validate_inputs()
        if not validated_data:
            return  # Stop processing if inputs are invalid

        self.processing = True
        self.process_button.setEnabled(False)
        self.process_button.setStyleSheet(
            "background-color: lightgray; color: darkgray;"
        )
        self.upload_button.setEnabled(False)
        self.progress_bar.setValue(0)
        self.fake_progress = 0  # Reset fake progress

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

        # Initialize and start the Worker thread
        self.worker = Worker(
            self.articles_file,
            self.warehouse_file,
            self.output_folder,  # Pass the output directory, not a file path
            self.oem_folder,
            self.brands_file,
            self.tecdoc_file,  # New
            tulero_ftp_info,  # New
            tyre24_ftp_info,  # New
            validated_data,  # Pass the validated data
        )
        self.worker.progress.connect(self.on_worker_progress)
        self.worker.finished_processing.connect(self.processing_complete)
        self.worker.error.connect(
            lambda error_msg: processing_error(self, error_msg)
        )  # Connect to the imported error handler
        self.worker.start()

    def on_worker_progress(self, value):
        """
        Handles progress signals from the Worker.
        Boosts the fake progress to at least the real progress.
        """
        self.fake_progress = max(self.fake_progress, value)
        self.progress_bar.setValue(int(self.fake_progress))

    def update_fake_progress(self):
        """
        Updates the fake progress bar incrementally.
        Allows the fake progress to catch up to the real progress.
        """
        if self.fake_progress < 100:
            if self.fake_progress < 65:
                # 65% in 2 minutes (120 seconds)
                increment = 65 / (120 / 0.6)  # 0.2 seconds per update
            elif self.fake_progress < 100:
                # Remaining 35% in 7 minutes (420 seconds)
                increment = 35 / (120 / 0.2)  # 0.2 seconds per update
            self.fake_progress += increment
            self.fake_progress = min(self.fake_progress, 100)
            self.progress_bar.setValue(int(self.fake_progress))

    def processing_complete(self):
        self.timer.stop()
        self.progress_bar.setValue(100)
        self.process_button.setEnabled(True)
        self.upload_button.setEnabled(True)  # Enable the upload button after processing

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
        msg_box.setWindowTitle(_("Processing Complete"))
        msg_box.setText(_("The file has been successfully uploaded to the FTP server."))
        msg_box.setIcon(QMessageBox.Icon.Information)
        msg_box.addButton(QMessageBox.StandardButton.Ok)
        exit_button = msg_box.addButton(_("Exit"), QMessageBox.ButtonRole.ActionRole)
        exit_button.clicked.connect(self.close)
        msg_box.exec()

        # Save the configuration including the FTP credentials
        self.save_config()
        self.update_upload_button_state()

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
            "tulero_markup": getattr(self, "markup_value", 1.25),  # Default: 1.25
            "tulero_shipping": getattr(self, "shipping_value", 7.5),  # Default: 7.5€
            "tyre24_markup_it": getattr(self, "markup_it_value", 1.25),  # Default: 1.25
            "tyre24_shipping_it": getattr(
                self, "shipping_it_value", 7.5
            ),  # Default: 7.5€
            "tyre24_markup_de": getattr(self, "markup_de_value", 1.25),  # Default: 1.25
            "tyre24_shipping_de": getattr(
                self, "shipping_de_value", 10.5
            ),  # Default: 10.5€
        }
        save_config(config)

    def start_upload(self):
        # Collect FTP info
        tulero_ftp_info = {
            "host": self.tulero_ftp_host_entry.text().strip(),
            "user": self.tulero_ftp_user_entry.text().strip(),
            "pass": self.tulero_ftp_pass_entry.text().strip(),
            "dir": self.tulero_ftp_dir_combo.currentText().strip(),
        }

        tyre24_ftp_info = {
            "host": self.tyre24_ftp_host_entry.text().strip(),
            "user": self.tyre24_ftp_user_entry.text().strip(),
            "pass": self.tyre24_ftp_pass_entry.text().strip(),
            "dir": self.tyre24_ftp_dir_combo.currentText().strip(),
        }

        dialog = UploadDialog(
            self, self.output_folder, tulero_ftp_info, tyre24_ftp_info
        )
        dialog.exec()

    def show_error_message(self, error_msg):
        QMessageBox.critical(self, "Error", error_msg)
        self.processing = False
        self.process_button.setEnabled(True)
        self.upload_button.setEnabled(True)

    # Reuse functions from utils.py
    browse_articles = browse_articles
    browse_oem = browse_oem
    browse_brands = browse_brands
    browse_output = browse_output
    browse_warehouse = browse_warehouse  # Ensure this is included
    browse_tecdoc = browse_tecdoc  # Add this line


if __name__ == "__main__":
    try:
        app = QApplication(sys.argv)

        # Set the Roboto font
        roboto_font = QFont("Roboto")
        if not roboto_font.exactMatch():
            roboto_font = QFont("Arial")  # Fallback font
        app.setFont(roboto_font)

        main_window = MainWindow()
        main_window.show()

        sys.exit(app.exec())
    except Exception as e:
        # Log the critical error if needed
        print(f"Application crashed: {e}")
