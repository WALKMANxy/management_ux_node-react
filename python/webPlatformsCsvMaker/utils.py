from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import QComboBox, QLabel, QLineEdit, QVBoxLayout, QWidget, QCheckBox


def create_ftp_section(main_window, title, base_path):
    section_widget = QWidget()
    section_layout = QVBoxLayout()
    section_widget.setLayout(section_layout)
    widgets = {}

    # Title Label
    title_label = QLabel(title)
    title_label.setFont(QFont("Roboto", 14, QFont.Weight.Bold))
    section_layout.addWidget(title_label)

    # FTP Host
    host_label = QLabel(f"{title} FTP Host")
    section_layout.addWidget(host_label)
    host_entry = QLineEdit()
    section_layout.addWidget(host_entry)
    widgets[f"{title.lower()}_ftp_host_entry"] = host_entry

    # FTP User
    user_label = QLabel(f"{title} FTP User")
    section_layout.addWidget(user_label)
    user_entry = QLineEdit()
    section_layout.addWidget(user_entry)
    widgets[f"{title.lower()}_ftp_user_entry"] = user_entry

    # FTP Password
    pass_label = QLabel(f"{title} FTP Password")
    section_layout.addWidget(pass_label)
    pass_entry = QLineEdit()
    pass_entry.setEchoMode(QLineEdit.EchoMode.Password)
    section_layout.addWidget(pass_entry)
    widgets[f"{title.lower()}_ftp_pass_entry"] = pass_entry

    # FTP Directory Combo Box
    dir_label = QLabel(f"{title} FTP Directory")
    section_layout.addWidget(dir_label)
    dir_combo = QComboBox()
    dir_combo.addItems(["/", "/csv/", "/test/"])
    section_layout.addWidget(dir_combo)
    widgets[f"{title.lower()}_ftp_dir_combo"] = dir_combo

   # Add the Upload Checkbox with Correct Naming
    upload_checkbox = QCheckBox(f"Enable Upload to {title}")
    upload_checkbox.setChecked(True)  # Default: enabled
    section_layout.addWidget(upload_checkbox)
    widgets[f"upload_{title.lower()}_checkbox"] = upload_checkbox  # Changed naming


    return section_widget, widgets