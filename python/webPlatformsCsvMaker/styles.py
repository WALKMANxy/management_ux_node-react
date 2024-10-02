# styles.py

app_stylesheet = """
    QMainWindow {
        background: rgba(10, 10, 10, 0.8);
        border-radius: 15px;
    }
    QLabel, QLineEdit {
        font-family: 'Roboto';
        font-size: 14px;
        color: white;
    }
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
    QProgressBar {
        border-radius: 10px;
        text-align: center;
        font-family: 'Roboto';
        font-size: 14px;
        background-color: rgba(144, 238, 144, 0.3);  /* light green */
    }
    QProgressBar::chunk {
        background-color: rgba(0, 255, 0, 1.0);  /* bright green */
        border-radius: 10px;
    }
    /* Valid input */
    QLineEdit.valid {
        border: 2px solid green;
    }
    /* Invalid input */
    QLineEdit.invalid {
        border: 2px solid red;
    }
"""

light_stylesheet = """
    QMainWindow {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
    }
    QLabel, QLineEdit {
        font-family: 'Roboto';
        font-size: 14px;
        color: black;
    }
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
    QProgressBar {
        border-radius: 10px;
        text-align: center;
        font-family: 'Roboto';
        font-size: 14px;
        background-color: rgba(173, 216, 230, 0.3);  /* light blue */
    }
    QProgressBar::chunk {
        background-color: rgba(0, 122, 204, 1.0);  /* blue */
        border-radius: 10px;
    }
    /* Valid input */
    QLineEdit.valid {
        border: 2px solid green;
    }
    /* Invalid input */
    QLineEdit.invalid {
        border: 2px solid red;
    }
"""
