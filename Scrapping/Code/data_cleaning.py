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
                    content = json.load(file)
                    if isinstance(content, list):
                        data.extend(content)
                    elif isinstance(content, dict):
                        data.append(content)
                    else:
                        logging.warning(f"Unexpected data format in file: {filename}")
                except json.JSONDecodeError as e:
                    logging.error(f"Error decoding JSON in file {filename}: {e}")
    logging.info("Loaded %d raw items from %d files.", len(data), len(os.listdir(raw_data_folder)))
    return data

def clean_data(item):
    """Clean and normalize a single data item."""
    cleaned_item = {
        "url": item.get("url", "").strip(),
        "scraped_at": item.get("scraped_at", ""),
        "headings": [clean_text(item.get("headings", ""))] if isinstance(item.get("headings"), str) else [],
        "paragraphs": list(set(clean_text(p).strip() for p in item.get("paragraphs", []) if p.strip())),
        "named_entities": {
            "people": list(set(item.get("named_entities", {}).get("people", []))),
            "organizations": list(set(item.get("named_entities", {}).get("organizations", []))),
            "locations": list(set(item.get("named_entities", {}).get("locations", [])))
        },
        "contact_info": {
            "phone": next((part.strip() for part in item.get("contact_info", "").split("|") if "Tel:" in part), None),
            "email": next((part.strip() for part in item.get("contact_info", "").split("|") if "@" in part), None),
            "address": " | ".join(part.strip() for part in item.get("contact_info", "").split("|") if "@" not in part and "Tel:" not in part)
        },
        "links": list({link["url"]: link for link in item.get("links", []) if "url" in link}.values())
    }
    return cleaned_item

def clean_raw_data(raw_data):
    """Clean and normalize the entire dataset."""
    logging.info("Cleaning raw data...")
    cleaned_data = []
    for item in raw_data:
        try:
            cleaned_item = clean_data(item)
            if cleaned_item["url"] and cleaned_item["paragraphs"]:
                cleaned_data.append(cleaned_item)
            else:
                logging.warning(f"Skipping incomplete data for URL: {item.get('url')}")
        except Exception as e:
            logging.error(f"Failed to process item: {item}. Error: {e}")
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
    raw_data_folder = "./Data/raw"
    cleaned_data_folder = "./Data/cleaned"
    raw_data = load_raw_data(raw_data_folder)
    cleaned_data = clean_raw_data(raw_data)
    save_cleaned_data(cleaned_data, cleaned_data_folder)

if __name__ == "__main__":
    logging.info("Starting data cleaning process...")
    main()
    logging.info("Data cleaning process completed.")
