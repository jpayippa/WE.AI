import os
import json
import logging
import re
from datetime import datetime
from bs4 import BeautifulSoup  # New addition - Install using: pip install beautifulsoup4
from Utils.text_processing import clean_text

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Known mappings and misclassification rules
KNOWN_BUILDINGS = {"Spencer Engineering Building", "Thompson Engineering Building"}
KNOWN_PROGRAMS = {
    "Software Engineering", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"
}

# Load raw data
def load_raw_data(raw_data_folder):
    logging.info("Loading raw data from folder: %s", raw_data_folder)
    data = []
    for filename in os.listdir(raw_data_folder):
        filepath = os.path.join(raw_data_folder, filename)
        if filename.endswith(".json"):
            with open(filepath, "r", encoding="utf-8") as file:
                try:
                    content = json.load(file)
                    data.append(content)
                except json.JSONDecodeError as e:
                    logging.error(f"Failed to parse {filename}: {e}")
    logging.info("Loaded %d items.", len(data))
    return data

# HTML cleaning helper
def strip_html(text):
    """Remove HTML tags and decode HTML entities."""
    return BeautifulSoup(text, "html.parser").get_text(separator=" ").strip()

# Clean paragraphs (strip HTML + trim junk)
def clean_paragraphs(paragraphs):
    cleaned_paragraphs = []
    for para in paragraphs:
        para = strip_html(para)  # Remove HTML tags
        para = re.sub(r'\s+', ' ', para).strip()  # Collapse multiple spaces
        para = para.replace("|", "").strip()  # Remove lone pipe characters
        if para and para not in {"|", "-", "—"}:  # Drop garbage lines
            cleaned_paragraphs.append(para)
    return cleaned_paragraphs

# Fix misclassified entities
def fix_named_entities(item):
    corrected_entities = {"people": [], "organizations": [], "locations": []}

    for person in item["named_entities"].get("people", []):
        if person in KNOWN_BUILDINGS:
            logging.warning(f"Moving misclassified building '{person}' from people to locations.")
            corrected_entities["locations"].append(person)
        elif person in KNOWN_PROGRAMS:
            logging.warning(f"Moving misclassified program '{person}' from people to organizations.")
            corrected_entities["organizations"].append(person)
        else:
            corrected_entities["people"].append(person)

    corrected_entities["organizations"].extend(item["named_entities"].get("organizations", []))
    corrected_entities["locations"].extend(item["named_entities"].get("locations", []))

    item["named_entities"] = corrected_entities
    return item

# Extract contact info
def extract_contact_info(contact_info_str):
    phone = None
    email = None
    address_parts = []

    for part in contact_info_str.split("|"):
        part = part.strip()
        if "@" in part:
            email = part
        elif re.search(r'\b(Tel|Phone|Contact):\b', part, re.IGNORECASE):
            phone = part
        elif part:
            address_parts.append(part)

    return {
        "phone": phone,
        "email": email,
        "address": " | ".join(address_parts)
    }

# Full cleaning logic (with HTML strip and paragraph cleanup)
def clean_data(item):
    item = fix_named_entities(item)

    cleaned_item = {
        "more_info_at": item.get("more_info_at", "").strip(),
        "scraped_at": item.get("scraped_at", ""),
        "headings": [clean_text(strip_html(h)) for h in item.get("headings", "").split("|")],
        "paragraphs": clean_paragraphs(item.get("paragraphs", [])),
        "named_entities": item.get("named_entities", {}),
        "contact_info": extract_contact_info(item.get("contact_info", "")),
        "links": item.get("links", []),
        "section_context": item.get("section_context", "other"),
        "tables": item.get("tables", []),
        "pdfs": item.get("pdfs", []),
        "profile": item.get("profile", {})
    }

    return cleaned_item

# Main cleaning process
def clean_raw_data(raw_data):
    logging.info("Cleaning raw data...")
    cleaned_data = []
    for item in raw_data:
        try:
            cleaned_item = clean_data(item)
            if cleaned_item["more_info_at"] and cleaned_item["paragraphs"]:
                cleaned_data.append(cleaned_item)
            else:
                logging.warning(f"Skipping incomplete item from {item.get('more_info_at')}")
        except Exception as e:
            logging.error(f"Error cleaning item {item.get('more_info_at')}: {e}")
    logging.info("Cleaned %d items.", len(cleaned_data))
    return cleaned_data

# Save cleaned data
def save_cleaned_data(cleaned_data, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"cleaned_data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(cleaned_data, file, indent=4, ensure_ascii=False)
    logging.info("Saved cleaned data to %s", output_file)

# Entry point
def main():
    raw_data_folder = "./Data/raw"
    cleaned_data_folder = "./Data/cleaned"

    raw_data = load_raw_data(raw_data_folder)
    cleaned_data = clean_raw_data(raw_data)
    save_cleaned_data(cleaned_data, cleaned_data_folder)

if __name__ == "__main__":
    logging.info("Starting data cleaning process...")
    main()
    logging.info("Data cleaning process completed.")
