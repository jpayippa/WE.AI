import os
import json
import logging
from Utils.text_processing import clean_text
from datetime import datetime


# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def load_raw_data(raw_data_folder):
    """Load raw JSON files from the specified folder."""
    logging.info("Loading raw data from folder: %s", raw_data_folder)
    data = []
    for filename in os.listdir(raw_data_folder):
        filepath = os.path.join(raw_data_folder, filename)
        if filename.endswith(".json"):
            with open(filepath, "r", encoding="utf-8") as file:
                try:
                    data.append(json.load(file))
                except json.JSONDecodeError as e:
                    logging.error(f"Error decoding JSON in file {filename}: {e}")
    logging.info("Loaded %d raw files.", len(data))
    return data


def clean_raw_data(raw_data):
    """Clean and normalize the raw data."""
    logging.info("Cleaning raw data...")
    cleaned_data = []
    for item in raw_data:
        cleaned_item = {
            "url": item.get("url", "").strip(),
            "scraped_at": item.get("scraped_at", ""),
            "headings": clean_text(item.get("headings", "")),
            "paragraphs": [clean_text(paragraph) for paragraph in item.get("paragraphs", []) if paragraph.strip()],
            "contact_info": clean_text(item.get("contact_info", "")),
            "named_entities": item.get("named_entities", {}),
            "links": item.get("links", []),
        }
        cleaned_data.append(cleaned_item)
    logging.info("Cleaned %d items.", len(cleaned_data))
    return cleaned_data


def save_cleaned_data(cleaned_data, output_folder):
    """Save cleaned data into the specified folder."""
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"cleaned_data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(cleaned_data, file, indent=4)
    logging.info("Cleaned data saved to %s", output_file)


def main():
    """Main function to clean raw data."""
    # Configurable paths
    raw_data_folder = "./Data/raw"
    cleaned_data_folder = "./Data/cleaned"

    # Load raw data
    raw_data = load_raw_data(raw_data_folder)

    # Clean raw data
    cleaned_data = clean_raw_data(raw_data)

    # Save cleaned data
    save_cleaned_data(cleaned_data, cleaned_data_folder)


if __name__ == "__main__":
    logging.info("Starting data cleaning process...")
    main()
    logging.info("Data cleaning process completed.")
