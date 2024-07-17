#tuleroCsvMaker\utils.py

from PyQt6.QtWidgets import (
    QVBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QFileDialog,
    QProgressBar,
)


def setup_ui(main_window):
    layout = QVBoxLayout()
    widgets = {}

    welcome_label = QLabel("Welcome, user!")
    layout.addWidget(welcome_label)

    widgets["articles_label"] = QLabel("Select Articles File")
    layout.addWidget(widgets["articles_label"])

    widgets["articles_entry"] = QLineEdit()
    layout.addWidget(widgets["articles_entry"])

    widgets["articles_button"] = QPushButton("Browse")
    widgets["articles_button"].clicked.connect(main_window.browse_articles)
    layout.addWidget(widgets["articles_button"])

    widgets["oem_label"] = QLabel("Select OEM Folder")
    layout.addWidget(widgets["oem_label"])

    widgets["oem_entry"] = QLineEdit()
    layout.addWidget(widgets["oem_entry"])

    widgets["oem_button"] = QPushButton("Browse")
    widgets["oem_button"].clicked.connect(main_window.browse_oem)
    layout.addWidget(widgets["oem_button"])

    widgets["brands_label"] = QLabel("Select Brands File")
    layout.addWidget(widgets["brands_label"])

    widgets["brands_entry"] = QLineEdit()
    layout.addWidget(widgets["brands_entry"])

    widgets["brands_button"] = QPushButton("Browse")
    widgets["brands_button"].clicked.connect(main_window.browse_brands)
    layout.addWidget(widgets["brands_button"])

    widgets["output_label"] = QLabel("Select Output Location")
    layout.addWidget(widgets["output_label"])

    widgets["output_entry"] = QLineEdit()
    layout.addWidget(widgets["output_entry"])

    widgets["output_button"] = QPushButton("Browse")
    widgets["output_button"].clicked.connect(main_window.browse_output)
    layout.addWidget(widgets["output_button"])

    widgets["process_button"] = QPushButton("Process")
    widgets["process_button"].setEnabled(False)
    widgets["process_button"].clicked.connect(main_window.start_processing)
    layout.addWidget(widgets["process_button"])

    widgets["progress_bar"] = QProgressBar()
    widgets["progress_bar"].setMinimum(0)
    widgets["progress_bar"].setMaximum(100)
    widgets["progress_bar"].setTextVisible(False)
    layout.addWidget(widgets["progress_bar"])

    widgets["attribution_label"] = QLabel()
    widgets["attribution_label"].setText(
        '<a href="https://www.flaticon.com/free-icons/programming-language" title="programming language icons">Programming language icons created by Bamicon - Flaticon</a>'
    )
    widgets["attribution_label"].setOpenExternalLinks(True)
    layout.addWidget(widgets["attribution_label"])

    return layout, widgets


def browse_articles(main_window):
    articles_file, _ = QFileDialog.getOpenFileName(
        main_window, "Select Articles File", "", "Excel files (*.xls;*.xlsx)"
    )
    return articles_file


def browse_oem(main_window):
    oem_folder = QFileDialog.getExistingDirectory(main_window, "Select OEM Folder")
    return oem_folder


def browse_brands(main_window):
    brands_file, _ = QFileDialog.getOpenFileName(
        main_window, "Select Brands File", "", "CSV files (*.csv)"
    )
    return brands_file


def browse_output(main_window):
    output_folder = QFileDialog.getExistingDirectory(
        main_window, "Select Output Location"
    )
    return output_folder
