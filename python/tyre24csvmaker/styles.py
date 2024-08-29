"""tyre24csvmaker/styles.py"""

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
"""
