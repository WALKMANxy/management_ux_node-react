import os
import sys
import json
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QFileDialog,
    QProgressBar,
    QMessageBox,
    QWidget
)
from PyQt6.QtGui import QIcon, QFont
from worker import Worker
from styles import app_stylesheet

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
        self.setGeometry(100, 100, 800, 600)  # Increased the height to fit more widgets

        # Determine the base path for the icons
        if hasattr(sys, '_MEIPASS'):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.abspath(".")

        # Set the window icon
        self.setWindowIcon(QIcon(os.path.join(base_path, 'icons', 'icon256.ico')))

        self.articles_file = None
        self.output_folder = None
        self.oem_folder = None
        self.brands_file = None
        self.processing = False

        self.initUI()
        self.check_and_load_files()

    def initUI(self):
        self.setStyleSheet(app_stylesheet)

        # Determine the base path for the icons
        if hasattr(sys, '_MEIPASS'):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.abspath(".")

        layout = QVBoxLayout()

        welcome_label = QLabel("Welcome, user!")
        welcome_label.setFont(QFont("Roboto", 16, QFont.Weight.Bold))
        welcome_label.setStyleSheet("color: white;")
        layout.addWidget(welcome_label)

        self.articles_label = QLabel("Select Articles File")
        layout.addWidget(self.articles_label)

        self.articles_entry = QLineEdit()
        layout.addWidget(self.articles_entry)

        self.articles_button = QPushButton("Browse")
        icon_path = os.path.join(base_path, 'icons', 'icon32.png')
        self.articles_button.setIcon(QIcon(icon_path))
        self.articles_button.clicked.connect(self.browse_articles)
        layout.addWidget(self.articles_button)

        self.oem_label = QLabel("Select OEM Folder")
        layout.addWidget(self.oem_label)

        self.oem_entry = QLineEdit()
        layout.addWidget(self.oem_entry)

        self.oem_button = QPushButton("Browse")
        self.oem_button.setIcon(QIcon(icon_path))
        self.oem_button.clicked.connect(self.browse_oem)
        layout.addWidget(self.oem_button)

        self.brands_label = QLabel("Select Brands File")
        layout.addWidget(self.brands_label)

        self.brands_entry = QLineEdit()
        layout.addWidget(self.brands_entry)

        self.brands_button = QPushButton("Browse")
        self.brands_button.setIcon(QIcon(icon_path))
        self.brands_button.clicked.connect(self.browse_brands)
        layout.addWidget(self.brands_button)

        self.output_label = QLabel("Select Output Location")
        layout.addWidget(self.output_label)

        self.output_entry = QLineEdit()
        layout.addWidget(self.output_entry)

        self.output_button = QPushButton("Browse")
        self.output_button.setIcon(QIcon(icon_path))
        self.output_button.clicked.connect(self.browse_output)
        layout.addWidget(self.output_button)

        self.process_button = QPushButton("Process")
        self.process_button.setIcon(QIcon(icon_path))
        self.process_button.setEnabled(False)
        self.process_button.clicked.connect(self.start_processing)
        layout.addWidget(self.process_button)

        self.progress_bar = QProgressBar()
        self.progress_bar.setMinimum(0)
        self.progress_bar.setMaximum(100)
        layout.addWidget(self.progress_bar)

        self.attribution_label = QLabel()
        self.attribution_label.setText(
            '<a href="https://www.flaticon.com/free-icons/programming-language" title="programming language icons">Programming language icons created by Bamicon - Flaticon</a>'
        )
        self.attribution_label.setOpenExternalLinks(True)
        self.attribution_label.setStyleSheet("color: white;")
        layout.addWidget(self.attribution_label)

        container = QWidget()
        container.setLayout(layout)
        self.setCentralWidget(container)

    def check_and_load_files(self):
        config = load_config()

        data_folder = os.path.join(os.path.dirname(__file__), DATA_FOLDER)
        articles_file = config.get('articles_file', os.path.join(data_folder, 'articles.xls'))
        oem_folder = config.get('oem_folder', os.path.join(data_folder, 'oems'))
        brands_file = config.get('brands_file', os.path.join(data_folder, 'brands.csv'))
        output_folder = config.get('output_folder', os.path.join(os.path.dirname(__file__), OUTPUT_FOLDER))

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

        self.check_ready_to_process()

    def browse_articles(self):
        self.articles_file, _ = QFileDialog.getOpenFileName(
            self, "Select Articles File", "", "Excel files (*.xls;*.xlsx)"
        )
        self.articles_entry.setText(self.articles_file)
        self.articles_button.setStyleSheet("background-color: green; color: white;")
        self.check_ready_to_process()
        self.save_config()

    def browse_oem(self):
        self.oem_folder = QFileDialog.getExistingDirectory(
            self, "Select OEM Folder"
        )
        self.oem_entry.setText(self.oem_folder)
        self.oem_button.setStyleSheet("background-color: green; color: white;")
        self.check_ready_to_process()
        self.save_config()

    def browse_brands(self):
        self.brands_file, _ = QFileDialog.getOpenFileName(
            self, "Select Brands File", "", "CSV files (*.csv)"
        )
        self.brands_entry.setText(self.brands_file)
        self.brands_button.setStyleSheet("background-color: green; color: white;")
        self.check_ready_to_process()
        self.save_config()

    def browse_output(self):
        self.output_folder = QFileDialog.getExistingDirectory(
            self, "Select Output Location"
        )
        self.output_entry.setText(self.output_folder)
        self.output_button.setStyleSheet("background-color: green; color: white;")
        self.check_ready_to_process()
        self.save_config()

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

        self.worker = Worker(
            self.articles_file,
            f"{self.output_folder}/cleaned_Articles.csv",
            self.oem_folder,
            self.brands_file,
            f"{self.output_folder}/final_output_with_brands.csv"
        )
        self.worker.progress.connect(self.update_progress)
        self.worker.finished_processing.connect(self.processing_complete)
        self.worker.start()

    def update_progress(self, value):
        self.progress_bar.setValue(value)

    def processing_complete(self):
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

    def save_config(self):
        config = {
            'articles_file': self.articles_file,
            'oem_folder': self.oem_folder,
            'brands_file': self.brands_file,
            'output_folder': self.output_folder
        }
        save_config(config)


if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Set the Roboto font
    roboto_font = QFont("Roboto")
    app.setFont(roboto_font)

    main_window = MainWindow()
    main_window.show()

    sys.exit(app.exec())
