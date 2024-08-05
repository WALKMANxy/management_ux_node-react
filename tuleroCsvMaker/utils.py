import os
import platform
from PyQt6.QtWidgets import (
    QVBoxLayout, QLabel, QLineEdit, QPushButton, QProgressBar, QFileDialog, QComboBox
)
from PyQt6.QtGui import QFont, QIcon
from styles import app_stylesheet, light_stylesheet  # Import both stylesheets

def setup_ui(main_window, base_path):
    layout = QVBoxLayout()
    widgets = {}

    # Apply the appropriate stylesheet based on the OS version
    if is_windows_11():
        main_window.setStyleSheet(app_stylesheet)
    else:
        main_window.setStyleSheet(light_stylesheet)

    welcome_label = QLabel("Welcome, user!")
    welcome_label.setFont(QFont("Roboto", 16, QFont.Weight.Bold))
    welcome_label.setStyleSheet("color: white;" if is_windows_11() else "color: black;")
    layout.addWidget(welcome_label)

    widgets["articles_label"] = QLabel("Select Articles File")
    layout.addWidget(widgets["articles_label"])

    widgets["articles_entry"] = QLineEdit()
    layout.addWidget(widgets["articles_entry"])

    widgets["articles_button"] = QPushButton("Browse")
    icon_path = os.path.join(base_path, 'icons', 'icon32.png')
    widgets["articles_button"].setIcon(QIcon(icon_path))
    widgets["articles_button"].clicked.connect(main_window.browse_articles)
    layout.addWidget(widgets["articles_button"])

    # FTP Host input
    widgets["ftp_host_label"] = QLabel("FTP Host")
    layout.addWidget(widgets["ftp_host_label"])

    widgets["ftp_host_entry"] = QLineEdit()
    layout.addWidget(widgets["ftp_host_entry"])

    # FTP User input
    widgets["ftp_user_label"] = QLabel("FTP User")
    layout.addWidget(widgets["ftp_user_label"])

    widgets["ftp_user_entry"] = QLineEdit()
    layout.addWidget(widgets["ftp_user_entry"])

    # FTP Password input
    widgets["ftp_pass_label"] = QLabel("FTP Password")
    layout.addWidget(widgets["ftp_pass_label"])

    widgets["ftp_pass_entry"] = QLineEdit()
    widgets["ftp_pass_entry"].setEchoMode(QLineEdit.EchoMode.Password)
    layout.addWidget(widgets["ftp_pass_entry"])

    # FTP Directory Combo Box
    widgets["ftp_dir_label"] = QLabel("FTP Directory")
    layout.addWidget(widgets["ftp_dir_label"])

    widgets["ftp_dir_combo"] = QComboBox()
    # Add directory options
    widgets["ftp_dir_combo"].addItems(["/", "/csv/", "/test/"])
    layout.addWidget(widgets["ftp_dir_combo"])

    # Connect this widget in MainWindow to use its current value when needed
    main_window.ftp_dir_combo = widgets["ftp_dir_combo"]  # This line makes the combo box accessible in MainWindow

    widgets["oem_label"] = QLabel("Select OEM Folder")
    layout.addWidget(widgets["oem_label"])

    widgets["oem_entry"] = QLineEdit()
    layout.addWidget(widgets["oem_entry"])

    widgets["oem_button"] = QPushButton("Browse")
    widgets["oem_button"].setIcon(QIcon(icon_path))
    widgets["oem_button"].clicked.connect(main_window.browse_oem)
    layout.addWidget(widgets["oem_button"])

    widgets["brands_label"] = QLabel("Select Brands File")
    layout.addWidget(widgets["brands_label"])

    widgets["brands_entry"] = QLineEdit()
    layout.addWidget(widgets["brands_entry"])

    widgets["brands_button"] = QPushButton("Browse")
    widgets["brands_button"].setIcon(QIcon(icon_path))
    widgets["brands_button"].clicked.connect(main_window.browse_brands)
    layout.addWidget(widgets["brands_button"])

    widgets["output_label"] = QLabel("Select Output Location")
    layout.addWidget(widgets["output_label"])

    widgets["output_entry"] = QLineEdit()
    layout.addWidget(widgets["output_entry"])

    widgets["output_button"] = QPushButton("Browse")
    widgets["output_button"].setIcon(QIcon(icon_path))
    widgets["output_button"].clicked.connect(main_window.browse_output)
    layout.addWidget(widgets["output_button"])

    widgets["process_button"] = QPushButton("Process")
    widgets["process_button"].setIcon(QIcon(icon_path))
    widgets["process_button"].setEnabled(False)
    widgets["process_button"].clicked.connect(main_window.start_processing)
    layout.addWidget(widgets["process_button"])

    widgets["progress_bar"] = QProgressBar()
    widgets["progress_bar"].setMinimum(0)
    widgets["progress_bar"].setMaximum(100)
    layout.addWidget(widgets["progress_bar"])

    widgets["attribution_label"] = QLabel()
    widgets["attribution_label"].setText(
        '<a href="https://www.flaticon.com/free-icons/programming-language" title="programming language icons">Programming language icons created by Bamicon - Flaticon</a>'
    )
    widgets["attribution_label"].setOpenExternalLinks(True)
    widgets["attribution_label"].setStyleSheet("color: white;" if is_windows_11() else "color: black;")
    layout.addWidget(widgets["attribution_label"])

    return layout, widgets

def is_windows_11():
    """Determine if the OS is Windows 11."""
    if platform.system() == "Windows":
        version = platform.version()
        build_number = int(version.split(".")[-1])
        return build_number >= 22000  # Windows 11 builds start at 22000
    return False

def browse_articles(main_window):
    articles_file, _ = QFileDialog.getOpenFileName(
        main_window, "Select Articles File", "", "Excel files (*.xls;*.xlsx)"
    )
    main_window.articles_file = articles_file
    main_window.articles_entry.setText(articles_file)
    main_window.articles_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()

def browse_oem(main_window):
    oem_folder = QFileDialog.getExistingDirectory(main_window, "Select OEM Folder")
    main_window.oem_folder = oem_folder
    main_window.oem_entry.setText(oem_folder)
    main_window.oem_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()

def browse_brands(main_window):
    brands_file, _ = QFileDialog.getOpenFileName(
        main_window, "Select Brands File", "", "CSV files (*.csv)"
    )
    main_window.brands_file = brands_file
    main_window.brands_entry.setText(brands_file)
    main_window.brands_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()

def browse_output(main_window):
    output_folder = QFileDialog.getExistingDirectory(main_window, "Select Output Location")
    main_window.output_folder = output_folder
    main_window.output_entry.setText(output_folder)
    main_window.output_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()
