# utils/config.py
import json
import os

CONFIG_FILE = "config.json"
DATA_FOLDER = "Data"
OUTPUT_FOLDER = "Output"


def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as file:
            return json.load(file)
    return {}


def save_config(config):
    with open(CONFIG_FILE, "w") as file:
        json.dump(config, file, indent=4)
