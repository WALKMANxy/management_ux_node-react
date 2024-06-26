import os
import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QLabel, QLineEdit, QPushButton, QFileDialog, QProgressBar, QMessageBox, QWidget
from PyQt6.QtGui import QIcon, QFont
from PyQt6.QtCore import QTimer
from worker import Worker
from styles import app_stylesheet

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("CSV Transformer")
        self.setGeometry(100, 100, 800, 400)

        # Determine the base path for the icons
        if hasattr(sys, '_MEIPASS'):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.abspath(".")

        # Set the window icon
        self.setWindowIcon(QIcon(os.path.join(base_path, 'icons', 'icon256.ico')))

        self.tecdoc_file = None
        self.articles_file = None
        self.output_folder = None
        self.processing = False

        self.initUI()

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

        self.tecdoc_label = QLabel("Select TecDoc Brand ID File")
        layout.addWidget(self.tecdoc_label)

        self.tecdoc_entry = QLineEdit()
        layout.addWidget(self.tecdoc_entry)

        self.tecdoc_button = QPushButton("Browse")
        icon_path = os.path.join(base_path, 'icons', 'icon32.png')
        self.tecdoc_button.setIcon(QIcon(icon_path))
        self.tecdoc_button.clicked.connect(self.browse_tecdoc)
        layout.addWidget(self.tecdoc_button)

        self.articles_label = QLabel("Select Articles File")
        layout.addWidget(self.articles_label)

        self.articles_entry = QLineEdit()
        layout.addWidget(self.articles_entry)

        self.articles_button = QPushButton("Browse")
        self.articles_button.setIcon(QIcon(icon_path))
        self.articles_button.clicked.connect(self.browse_articles)
        layout.addWidget(self.articles_button)

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
        self.progress_bar.setTextVisible(False)  # Hide the text percentage
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

        # Timer for fake progress
        self.fake_progress_timer = QTimer()
        self.fake_progress_timer.timeout.connect(self.update_fake_progress)
        self.progress_value = 0

    def browse_tecdoc(self):
        self.tecdoc_file, _ = QFileDialog.getOpenFileName(
            self, "Select TecDoc Brand ID File", "", "CSV files (*.csv)"
        )
        self.tecdoc_entry.setText(self.tecdoc_file)
        self.check_ready_to_process()

    def browse_articles(self):
        self.articles_file, _ = QFileDialog.getOpenFileName(
            self, "Select Articles File", "", "Excel files (*.xlsx)"
        )
        self.articles_entry.setText(self.articles_file)
        self.check_ready_to_process()

    def browse_output(self):
        self.output_folder = QFileDialog.getExistingDirectory(
            self, "Select Output Location"
        )
        self.output_entry.setText(self.output_folder)
        self.check_ready_to_process()

    def check_ready_to_process(self):
        if self.tecdoc_file and self.articles_file and self.output_folder:
            self.process_button.setEnabled(True)

    def start_processing(self):
        self.processing = True
        self.process_button.setEnabled(False)
        self.process_button.setStyleSheet(
            "background-color: lightgray; color: darkgray;"
        )
        self.progress_bar.setValue(0)
        self.progress_value = 0

        self.worker = Worker(
            self.tecdoc_file,
            self.articles_file,
            f"{self.output_folder}/tyre24StockUpdate.csv",
        )
        self.worker.finished_processing.connect(self.processing_complete)
        self.worker.start()

        self.fake_progress_timer.start(1000)  # Update progress every second

    def update_fake_progress(self):
        if self.progress_value < 70:
            self.progress_value += 3.5  # Reach 70% in 20 seconds (3.5% per second)
        elif self.progress_value < 100:
            self.progress_value += (
                0.667  # Reach 100% in another 45 seconds (~0.667% per second)
            )
        self.progress_bar.setValue(int(self.progress_value))  # Cast to int

    def update_progress(self, value):
        pass  # Not used for fake progress

    def processing_complete(self):
        self.fake_progress_timer.stop()
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
            f"The file has been saved to {self.output_folder}/tyre24StockUpdate.csv"
        )
        msg_box.setIcon(QMessageBox.Icon.Information)
        msg_box.addButton(QMessageBox.StandardButton.Ok)
        exit_button = msg_box.addButton("Exit", QMessageBox.ButtonRole.ActionRole)
        exit_button.clicked.connect(self.close)
        msg_box.exec()


if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Set the Roboto font
    roboto_font = QFont("Roboto")
    app.setFont(roboto_font)

    main_window = MainWindow()
    main_window.show()

    sys.exit(app.exec())
