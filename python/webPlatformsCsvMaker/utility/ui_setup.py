# utils/ui_setup.py
import os
import platform

from PyQt6.QtGui import QFont, QIcon
from PyQt6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QProgressBar,
    QPushButton,
    QVBoxLayout,
)
from styles import app_stylesheet, light_stylesheet  # Import both stylesheets
from utils import create_ftp_section


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
    icon_path = os.path.join(base_path, "icons", "icon32.png")
    widgets["articles_button"].setIcon(QIcon(icon_path))
    widgets["articles_button"].clicked.connect(main_window.browse_articles)
    layout.addWidget(widgets["articles_button"])

    widgets["warehouse_label"] = QLabel("Select Warehouse File")  # New
    layout.addWidget(widgets["warehouse_label"])

    widgets["warehouse_entry"] = QLineEdit()  # New
    layout.addWidget(widgets["warehouse_entry"])

    widgets["warehouse_button"] = QPushButton("Browse")  # New
    widgets["warehouse_button"].setIcon(QIcon(icon_path))
    widgets["warehouse_button"].clicked.connect(main_window.browse_warehouse)
    layout.addWidget(widgets["warehouse_button"])

    # TecDoc ID File
    widgets["tecdoc_label"] = QLabel("Select TecDoc ID File")
    layout.addWidget(widgets["tecdoc_label"])

    widgets["tecdoc_entry"] = QLineEdit()
    layout.addWidget(widgets["tecdoc_entry"])

    widgets["tecdoc_button"] = QPushButton("Browse")
    widgets["tecdoc_button"].setIcon(QIcon(icon_path))
    widgets["tecdoc_button"].clicked.connect(main_window.browse_tecdoc)
    layout.addWidget(widgets["tecdoc_button"])

    # Create a horizontal layout for Tulero and Tyre24 sections
    ftp_layout = QHBoxLayout()

    # Tulero Section
    tulero_widget, tulero_widgets = create_ftp_section(main_window, "Tulero", base_path)
    ftp_layout.addWidget(tulero_widget)
    widgets.update(tulero_widgets)

    # Tyre24 Section
    tyre24_widget, tyre24_widgets = create_ftp_section(main_window, "Tyre24", base_path)
    ftp_layout.addWidget(tyre24_widget)
    widgets.update(tyre24_widgets)

    layout.addLayout(ftp_layout)



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
    widgets["attribution_label"].setStyleSheet(
        "color: white;" if is_windows_11() else "color: black;"
    )
    layout.addWidget(widgets["attribution_label"])

    return layout, widgets


def is_windows_11():
    """Determine if the OS is Windows 11."""
    if platform.system() == "Windows":
        version = platform.version()
        build_number = int(version.split(".")[-1])
        return build_number >= 22000  # Windows 11 builds start at 22000
    return False
