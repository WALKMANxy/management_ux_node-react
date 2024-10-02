import gettext
import locale

# import logging
import os
import sys


def setup_translation():
    # Configure logging for debugging
    # logging.basicConfig(level=logging.DEBUG)

    # Get the system locale
    current_locale, encoding = locale.getdefaultlocale()
    # logging.debug(f"Detected system locale: {current_locale}, encoding: {encoding}")

    # Use 'en' as fallback if locale is not detected
    if not current_locale:
        current_locale = "en"
        # logging.debug("Locale not detected. Falling back to English ('en').")

    # Extract the language code (e.g., 'en' from 'en_US')
    language = current_locale.split("_")[0]
    # logging.debug(f"Extracted language code: {language}")

    # Determine if the app is running as a bundled executable
    if getattr(sys, "frozen", False):
        # PyInstaller creates a temporary folder and stores path in _MEIPASS
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.abspath(".")

    # Define the directory where the translations are stored
    translations_dir = os.path.join(base_dir, "translations")
    # logging.debug(f"Translations directory: {translations_dir}")

    # Load the appropriate translation
    try:
        lang = gettext.translation(
            "messages", localedir=translations_dir, languages=[language]
        )
        lang.install()
        _ = lang.gettext
        # logging.debug(f"Loaded translation for language: {language}")
    except FileNotFoundError:
        # Fallback to default language (English)
        _ = gettext.gettext
        """ logging.warning(
            f"Translation for language '{language}' not found. Falling back to English."
        ) """

    return _


# Initialize the translation function
_ = setup_translation()
