---

## Tulero Stock Updater

Tulero Stock Updater is a Python application designed to process and transform CSV files containing stock information. The application uses PyQt6 for its graphical user interface and includes features such as file browsing, progress tracking, and more.

## Features

- Select Articles File (Excel format)
- Select OEM Folder
- Select Brands File
- Select Output Location
- Process files and generate a transformed CSV file
- Progress tracking with a graphical progress bar
- User-friendly interface with icons and labels

## Prerequisites

- Python 3.12
- Virtual environment (optional but recommended)

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/tulero-stock-updater.git
   cd tulero-stock-updater
   ```

2. **Create and Activate a Virtual Environment**

   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows use `myenv\Scripts\activate`
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

## Development

**Run the Application**

```bash
python main.py
```

**Directory Structure**

```
tulero-stock-updater/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon64.png
│   ├── icon128.png
│   ├── icon256.ico
│   └── icon256.png
├── main.py
├── data_processing.py
├── styles.py
├── worker.py
├── utils.py
├── requirements.txt
└── README.md
```

## Building the Executable

To build a standalone executable for the application without UPX compression, follow these steps:

1. **Ensure all Dependencies are Installed**

2. **Activate the Virtual Environment**

   On Windows:

   ```bash
   myenv\Scripts\activate
   ```

   On macOS/Linux:

   ```bash
   source myenv/bin/activate
   ```

3. **Install Required Packages**

   ```bash
   pip install pyinstaller openpyxl PyQt6 pandas xlrd pandarallel babel tqdm
   ```

4. **Create the Executable**

   Use the following command to build the executable:

   ```no console

   pyinstaller --clean --onefile --noconsole --noupx --icon=icons/icon256.ico --add-data "icons;icons" --add-data "translations;translations" --name "WebStockUpdater" main.py

      console
pyinstaller --clean --onefile --noupx --icon=icons/icon256.ico --add-data "icons;icons" --add-data "translations;translations" --name "WebStockUpdater" main.py


   ```

   * `--onefile`: Creates a single executable file.
   * `--noconsole`: Prevents a console window from appearing (useful for GUI applications).
   * `--noupx`: Disables UPX compression.
   * `--icon=icons/icon256.ico`: Specifies the icon for the executable.
   * `--add-data "icons;icons"`: Includes the icons directory in the executable. The format is source_path;destination_path. On Windows, you should use a semicolon (;) to separate the paths.
   * `--name "TuleroStockUpdater"`: Sets the name of the output executable.

**Run the Executable**

The executable will be created in the dist directory. You can run it by navigating to the dist directory and executing the TuleroStockUpdater.exe file.

```bash
cd dist
./TuleroStockUpdater.exe
```

## Usage

**Launch the Application**

Open the TuleroStockUpdater.exe file created in the dist directory.

**Select Files and Output Location**

- Click the "Browse" button next to "Select Articles File" to choose the Excel file containing the articles.
- Click the "Browse" button next to "Select OEM Folder" to choose the folder containing the OEM CSV files.
- Click the "Browse" button next to "Select Brands File" to choose the CSV file containing the brand mappings.
- Click the "Browse" button next to "Select Output Location" to choose the directory where the processed CSV file will be saved.

**Start Processing**

Once all files and the output location are selected, click the "Process" button to start processing. The progress bar will update to show the progress of the processing.

**Processing Complete**

A message box will appear when the processing is complete, indicating the location of the saved CSV file.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Icons by Bamicon from Flaticon.
- PyQt6 for the GUI framework.
- Pandas for data processing.

## Contact

For any questions or suggestions, please contact yourname@yourdomain.com.

---
