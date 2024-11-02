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
from translations import _





def setup_ui(main_window, base_path):
    layout = QVBoxLayout()
    widgets = {}

    # Apply the appropriate stylesheet based on the OS version
    if is_windows_11():
        main_window.setStyleSheet(app_stylesheet)
    else:
        main_window.setStyleSheet(light_stylesheet)

    welcome_label = QLabel(_("Welcome, user!"))
    welcome_label.setFont(QFont("Roboto", 16, QFont.Weight.Bold))
    welcome_label.setStyleSheet("color: white;" if is_windows_11() else "color: black;")
    layout.addWidget(welcome_label)

    # Create horizontal layouts for file selectors in pairs
    file_selector_layout_1 = QHBoxLayout()
    file_selector_layout_2 = QHBoxLayout()
    file_selector_layout_3 = QHBoxLayout()

    # Articles File Selector
    articles_layout = QVBoxLayout()
    widgets["articles_label"] = QLabel(_("Select Articles File"))
    articles_layout.addWidget(widgets["articles_label"])
    widgets["articles_entry"] = QLineEdit()
    articles_layout.addWidget(widgets["articles_entry"])
    widgets["articles_button"] = QPushButton(_("Browse"))
    icon_path = os.path.join(base_path, "icons", "icon32.png")
    widgets["articles_button"].setIcon(QIcon(icon_path))
    widgets["articles_button"].clicked.connect(main_window.browse_articles)
    articles_layout.addWidget(widgets["articles_button"])

    # Warehouse File Selector
    warehouse_layout = QVBoxLayout()
    widgets["warehouse_label"] = QLabel(_("Select Warehouse File"))
    warehouse_layout.addWidget(widgets["warehouse_label"])
    widgets["warehouse_entry"] = QLineEdit()
    warehouse_layout.addWidget(widgets["warehouse_entry"])
    widgets["warehouse_button"] = QPushButton(_("Browse"))
    widgets["warehouse_button"].setIcon(QIcon(icon_path))
    widgets["warehouse_button"].clicked.connect(main_window.browse_warehouse)
    warehouse_layout.addWidget(widgets["warehouse_button"])

    # Add Articles and Warehouse selectors to the first row
    file_selector_layout_1.addLayout(articles_layout)
    file_selector_layout_1.addLayout(warehouse_layout)
    layout.addLayout(file_selector_layout_1)

    # TecDoc ID Selector
    tecdoc_layout = QVBoxLayout()
    widgets["tecdoc_label"] = QLabel(_("Select TecDoc ID File"))
    tecdoc_layout.addWidget(widgets["tecdoc_label"])
    widgets["tecdoc_entry"] = QLineEdit()
    tecdoc_layout.addWidget(widgets["tecdoc_entry"])
    widgets["tecdoc_button"] = QPushButton(_("Browse"))
    widgets["tecdoc_button"].setIcon(QIcon(icon_path))
    widgets["tecdoc_button"].clicked.connect(main_window.browse_tecdoc)
    tecdoc_layout.addWidget(widgets["tecdoc_button"])

    # OEM Folder Selector
    oem_layout = QVBoxLayout()
    widgets["oem_label"] = QLabel(_("Select OEM Folder"))
    oem_layout.addWidget(widgets["oem_label"])
    widgets["oem_entry"] = QLineEdit()
    oem_layout.addWidget(widgets["oem_entry"])
    widgets["oem_button"] = QPushButton(_("Browse"))
    widgets["oem_button"].setIcon(QIcon(icon_path))
    widgets["oem_button"].clicked.connect(main_window.browse_oem)
    oem_layout.addWidget(widgets["oem_button"])

    # Add TecDoc and OEM selectors to the second row
    file_selector_layout_2.addLayout(tecdoc_layout)
    file_selector_layout_2.addLayout(oem_layout)
    layout.addLayout(file_selector_layout_2)

    # Brands File Selector
    brands_layout = QVBoxLayout()
    widgets["brands_label"] = QLabel(_("Select Brands File"))
    brands_layout.addWidget(widgets["brands_label"])
    widgets["brands_entry"] = QLineEdit()
    brands_layout.addWidget(widgets["brands_entry"])
    widgets["brands_button"] = QPushButton(_("Browse"))
    widgets["brands_button"].setIcon(QIcon(icon_path))
    widgets["brands_button"].clicked.connect(main_window.browse_brands)
    brands_layout.addWidget(widgets["brands_button"])

    # Output Location Selector
    output_layout = QVBoxLayout()
    widgets["output_label"] = QLabel(_("Select Output Location"))
    output_layout.addWidget(widgets["output_label"])
    widgets["output_entry"] = QLineEdit()
    output_layout.addWidget(widgets["output_entry"])
    widgets["output_button"] = QPushButton(_("Browse"))
    widgets["output_button"].setIcon(QIcon(icon_path))
    widgets["output_button"].clicked.connect(main_window.browse_output)
    output_layout.addWidget(widgets["output_button"])

    # Add Brands and Output selectors to the third row
    file_selector_layout_3.addLayout(brands_layout)
    file_selector_layout_3.addLayout(output_layout)
    layout.addLayout(file_selector_layout_3)

    # Create a horizontal layout for Tulero and Tyre24 sections
    ftp_layout = QHBoxLayout()

    # Tulero Section
    company1_widget, company1_widgets = create_ftp_section(main_window, "Tulero", base_path)
    ftp_layout.addWidget(company1_widget)
    widgets.update(company1_widgets)

    # Tyre24 Section
    company2_widget, company2_widgets = create_ftp_section(main_window, "Tyre24", base_path)
    ftp_layout.addWidget(company2_widget)
    widgets.update(company2_widgets)

    layout.addLayout(ftp_layout)

     # Create a horizontal layout for the markup and shipping cost inputs
    markup_layout = QHBoxLayout()
    shipping_layout = QHBoxLayout()

    # Markup input for Tulero
    company1_markup_layout = QVBoxLayout()
    widgets["company1_markup_label"] = QLabel(_("Select Markup for Tulero (%)"))
    company1_markup_layout.addWidget(widgets["company1_markup_label"])
    widgets["company1_markup_entry"] = QLineEdit()
    widgets["company1_markup_entry"].setPlaceholderText(_("Enter percentage (10-35%)"))
    company1_markup_layout.addWidget(widgets["company1_markup_entry"])
    markup_layout.addLayout(company1_markup_layout)

    # Shipping cost input for Tulero
    company1_shipping_layout = QVBoxLayout()
    widgets["company1_shipping_label"] = QLabel(_("Select Shipping Cost for Tulero (€)"))
    company1_shipping_layout.addWidget(widgets["company1_shipping_label"])
    widgets["company1_shipping_entry"] = QLineEdit()
    widgets["company1_shipping_entry"].setPlaceholderText(_("Enter cost (7.0-20.0)"))
    company1_shipping_layout.addWidget(widgets["company1_shipping_entry"])
    shipping_layout.addLayout(company1_shipping_layout)

    # Markup input for Tyre24 (Italy)
    company2_markup_it_layout = QVBoxLayout()
    widgets["company2_markup_it_label"] = QLabel(_("Select Markup for Tyre24 (Italy) (%)"))
    company2_markup_it_layout.addWidget(widgets["company2_markup_it_label"])
    widgets["company2_markup_it_entry"] = QLineEdit()
    widgets["company2_markup_it_entry"].setPlaceholderText(_("Enter percentage (10-35%)"))
    company2_markup_it_layout.addWidget(widgets["company2_markup_it_entry"])
    markup_layout.addLayout(company2_markup_it_layout)

    # Shipping cost input for Tyre24 (Italy)
    company2_shipping_it_layout = QVBoxLayout()
    widgets["company2_shipping_it_label"] = QLabel(_("Select Shipping Cost for Tyre24 (Italy) (€)"))
    company2_shipping_it_layout.addWidget(widgets["company2_shipping_it_label"])
    widgets["company2_shipping_it_entry"] = QLineEdit()
    widgets["company2_shipping_it_entry"].setPlaceholderText(_("Enter cost (7.0-20.0)"))
    company2_shipping_it_layout.addWidget(widgets["company2_shipping_it_entry"])
    shipping_layout.addLayout(company2_shipping_it_layout)

    # Markup input for Tyre24 (Germany)
    company2_markup_de_layout = QVBoxLayout()
    widgets["company2_markup_de_label"] = QLabel(_("Select Markup for Tyre24 (Germany) (%)"))
    company2_markup_de_layout.addWidget(widgets["company2_markup_de_label"])
    widgets["company2_markup_de_entry"] = QLineEdit()
    widgets["company2_markup_de_entry"].setPlaceholderText(_("Enter percentage (10-35%)"))
    company2_markup_de_layout.addWidget(widgets["company2_markup_de_entry"])
    markup_layout.addLayout(company2_markup_de_layout)

    # Shipping cost input for Tyre24 (Germany)
    company2_shipping_de_layout = QVBoxLayout()
    widgets["company2_shipping_de_label"] = QLabel(_("Select Shipping Cost for Tyre24 (Germany) (€)"))
    company2_shipping_de_layout.addWidget(widgets["company2_shipping_de_label"])
    widgets["company2_shipping_de_entry"] = QLineEdit()
    widgets["company2_shipping_de_entry"].setPlaceholderText(_("Enter cost (7.0-20.0)"))
    company2_shipping_de_layout.addWidget(widgets["company2_shipping_de_entry"])
    shipping_layout.addLayout(company2_shipping_de_layout)

    # Add the markup and shipping layouts to the main layout
    layout.addLayout(markup_layout)
    layout.addLayout(shipping_layout)

    # Create a horizontal layout for the Process and Upload buttons
    button_layout = QHBoxLayout()

    widgets["process_button"] = QPushButton(_("Process"))
    widgets["process_button"].setIcon(
        QIcon(os.path.join(base_path, "icons", "icon32.png"))
    )
    widgets["process_button"].setEnabled(False)
    widgets["process_button"].clicked.connect(main_window.start_processing)
    button_layout.addWidget(widgets["process_button"])

    widgets["upload_button"] = QPushButton(_("Upload"))
    widgets["upload_button"].setIcon(
        QIcon(os.path.join(base_path, "icons", "icon32.png"))
    )
    widgets["upload_button"].setEnabled(False)  # Initially disabled
    widgets["upload_button"].clicked.connect(main_window.start_upload)
    button_layout.addWidget(widgets["upload_button"])

    layout.addLayout(button_layout)

    # Progress bar
    widgets["progress_bar"] = QProgressBar()
    widgets["progress_bar"].setMinimum(0)
    widgets["progress_bar"].setMaximum(100)
    layout.addWidget(widgets["progress_bar"])

    # Attribution label
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
