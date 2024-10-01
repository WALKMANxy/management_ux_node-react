# utils/error_handlers.py
from PyQt6.QtWidgets import QMessageBox


def processing_error(main_window, error_message):
    main_window.timer.stop()
    main_window.progress_bar.setValue(100)
    main_window.process_button.setEnabled(True)
    # Reset button style as needed

    msg_box = QMessageBox(main_window)
    msg_box.setWindowTitle("Processing Complete with Errors")
    msg_box.setText(f"The following errors occurred:\n{error_message}")
    msg_box.setIcon(QMessageBox.Icon.Warning)
    retry_button = msg_box.addButton("Retry Upload", QMessageBox.ButtonRole.ActionRole)
    exit_button = msg_box.addButton("Exit", QMessageBox.ButtonRole.ActionRole)
    msg_box.exec()

    # Check which button was clicked
    if msg_box.clickedButton() == retry_button:
        main_window.start_processing()  # Retry processing
    elif msg_box.clickedButton() == exit_button:
        main_window.close()  # Exit the application
