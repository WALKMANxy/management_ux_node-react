# workerFtp.py

import os

from PyQt6.QtCore import QThread, pyqtSignal
from PyQt6.QtWidgets import (
    QDialog,
    QHBoxLayout,
    QLabel,
    QProgressBar,
    QPushButton,
    QVBoxLayout,
)
from translations import _
from utility.ftp_utils import upload_to_ftp


class UploadDialog(QDialog):
    def __init__(self, parent, output_folder, tulero_ftp_info, tyre24_ftp_info):
        super().__init__(parent)
        self.output_folder = output_folder
        self.tulero_ftp_info = tulero_ftp_info
        self.tyre24_ftp_info = tyre24_ftp_info

        self.setWindowTitle(_("Upload Files"))
        self.setModal(True)
        self.setMinimumWidth(375)
        self.setMinimumHeight(200)

        layout = QVBoxLayout()

        label = QLabel(_("Which file would you like to upload?"))
        layout.addWidget(label)

        button_layout = QHBoxLayout()

        self.tulero_button = QPushButton("Tulero")
        self.tulero_button.clicked.connect(self.upload_tulero)
        button_layout.addWidget(self.tulero_button)

        self.tyre24_button = QPushButton("Tyre24")
        self.tyre24_button.clicked.connect(self.upload_tyre24)
        button_layout.addWidget(self.tyre24_button)

        self.both_button = QPushButton(_("Both"))
        self.both_button.clicked.connect(self.upload_both)
        button_layout.addWidget(self.both_button)

        self.none_button = QPushButton(_("None"))
        self.none_button.clicked.connect(self.reject)
        button_layout.addWidget(self.none_button)

        layout.addLayout(button_layout)

        self.message_label = QLabel("")
        layout.addWidget(self.message_label)
        self.message_label.setWordWrap(True)  # Enable word wrapping for long messages

        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        layout.addWidget(self.progress_bar)

        self.setLayout(layout)
        self.worker = None

    def upload_tulero(self):
        self.upload_files(upload_tulero=True, upload_tyre24=False)

    def upload_tyre24(self):
        self.upload_files(upload_tulero=False, upload_tyre24=True)

    def upload_both(self):
        self.upload_files(upload_tulero=True, upload_tyre24=True)

    def upload_files(self, upload_tulero, upload_tyre24):
        if upload_tulero and not self.validate_ftp_info(self.tulero_ftp_info):
            self.message_label.setText(_("Tulero FTP info is incomplete."))
            return
        if upload_tyre24 and not self.validate_ftp_info(self.tyre24_ftp_info):
            self.message_label.setText(_("Tyre24 FTP info is incomplete."))
            return

        # Disable buttons
        self.tulero_button.setEnabled(False)
        self.tyre24_button.setEnabled(False)
        self.both_button.setEnabled(False)
        self.none_button.setEnabled(False)

        # Show progress bar
        self.progress_bar.setVisible(True)
        self.progress_bar.setMaximum(0)  # Indeterminate progress

        # Start upload worker
        self.worker = UploadWorker(
            self.output_folder,
            self.tulero_ftp_info,
            self.tyre24_ftp_info,
            upload_tulero,
            upload_tyre24,
        )
        self.worker.progress.connect(self.update_progress)
        self.worker.finished.connect(self.upload_finished)
        self.worker.start()

    def update_progress(self, message):
        self.message_label.setText(message)

    def upload_finished(self, result):
        # Hide progress bar
        self.progress_bar.setVisible(False)

        # Enable buttons
        self.tulero_button.setEnabled(True)
        self.tyre24_button.setEnabled(True)
        self.both_button.setEnabled(True)
        self.none_button.setEnabled(True)

        # Display result
        self.message_label.setText(result)

    def validate_ftp_info(self, ftp_info):
        """Validates that FTP info contains all necessary fields."""
        required_fields = ["host", "user", "pass", "dir"]
        for field in required_fields:
            if not ftp_info.get(field):
                return False
        return True


class UploadWorker(QThread):
    finished = pyqtSignal(str)
    progress = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(
        self,
        output_folder,
        tulero_ftp_info,
        tyre24_ftp_info,
        upload_tulero=True,
        upload_tyre24=True,
    ):
        super().__init__()
        self.output_folder = output_folder
        self.tulero_ftp_info = tulero_ftp_info
        self.tyre24_ftp_info = tyre24_ftp_info
        self.upload_tulero = upload_tulero
        self.upload_tyre24 = upload_tyre24

    def run(self):
        messages = []

        # Upload Tulero file if requested
        if self.upload_tulero:
            tulero_output_file = os.path.join(self.output_folder, "tulero_output.csv")
            self.progress.emit(_("Uploading Tulero file..."))
            tulero_success, tulero_error = upload_to_ftp(
                tulero_output_file, self.tulero_ftp_info
            )
            if tulero_success:
                messages.append(_("Tulero upload successful."))
            else:
                messages.append(_("Tulero upload failed: ") + tulero_error)

        # Upload Tyre24 file if requested
        if self.upload_tyre24:
            tyre24_output_file = os.path.join(self.output_folder, "tyre24_output.csv")
            self.progress.emit(_("Uploading Tyre24 file..."))
            tyre24_success, tyre24_error = upload_to_ftp(
                tyre24_output_file, self.tyre24_ftp_info
            )
            if tyre24_success:
                messages.append(_("Tyre24 upload successful."))
            else:
                messages.append(_("Tyre24 upload failed: ") + tyre24_error)

        # Combine all messages and emit the result
        final_message = (
            "\n".join(messages) if messages else _("No files were uploaded.")
        )
        self.finished.emit(final_message)
