
from PyQt6.QtWidgets import QFileDialog

# Set up translation
from translations import _ as tr


def browse_articles(main_window):
    articles_file, _ = QFileDialog.getOpenFileName(
        main_window, tr("Select Articles File"), "", "Excel files (*.xls;*.xlsx)"
    )
    main_window.articles_file = articles_file
    main_window.articles_entry.setText(articles_file)
    main_window.articles_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()


def browse_warehouse(main_window):
    warehouse_file, _ = QFileDialog.getOpenFileName(
        main_window, tr("Select Warehouse File"), "", "Excel files (*.xls;*.xlsx)"
    )
    main_window.warehouse_file = warehouse_file
    main_window.warehouse_entry.setText(warehouse_file)
    main_window.warehouse_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()


def browse_tecdoc(main_window):
    tecdoc_file, _ = QFileDialog.getOpenFileName(
        main_window, tr("Select TecDoc ID File"), "", "CSV files (*.csv)"
    )
    main_window.tecdoc_file = tecdoc_file
    main_window.tecdoc_entry.setText(tecdoc_file)
    main_window.tecdoc_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()


def browse_oem(main_window):
    oem_folder = QFileDialog.getExistingDirectory(main_window, tr("Select OEM Folder"))
    main_window.oem_folder = oem_folder
    main_window.oem_entry.setText(oem_folder)
    main_window.oem_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()


def browse_brands(main_window):
    brands_file, _ = QFileDialog.getOpenFileName(
        main_window, tr("Select Brands File"), "", "CSV files (*.csv)"
    )
    main_window.brands_file = brands_file
    main_window.brands_entry.setText(brands_file)
    main_window.brands_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()


def browse_output(main_window):
    output_folder = QFileDialog.getExistingDirectory(
        main_window, tr("Select Output Location")
    )
    main_window.output_folder = output_folder
    main_window.output_entry.setText(output_folder)
    main_window.output_button.setStyleSheet("background-color: green; color: white;")
    main_window.check_ready_to_process()
    main_window.save_config()
