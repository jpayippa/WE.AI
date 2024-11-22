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
                    if isinstance(content, list):  # Ensure content is a list
                        data.extend(content)
                    elif isinstance(content, dict):  # Single JSON object
                        data.append(content)
                    else:
                        logging.warning(f"Unexpected data format in file: {filename}")
                except json.JSONDecodeError as e:
                    logging.error(f"Error decoding JSON in file {filename}: {e}")
    logging.info("Loaded %d raw items from %d files.", len(data), len(os.listdir(raw_data_folder)))
    return data


def fix_data(item):
    """Attempt to fix improperly formatted data."""
    fixed_item = {}

    # Fix URL
    fixed_item["url"] = item.get("url", "").strip() if isinstance(item.get("url"), str) else ""

    # Fix scraped_at
    fixed_item["scraped_at"] = item.get("scraped_at", "") if isinstance(item.get("scraped_at"), str) else ""

    # Fix headings
    headings = item.get("headings", "")
    fixed_item["headings"] = [clean_text(headings)] if isinstance(headings, str) else []

    # Fix paragraphs
    paragraphs = item.get("paragraphs", [])
    if isinstance(paragraphs, list):
        fixed_item["paragraphs"] = list(set(clean_text(p).strip() for p in paragraphs if isinstance(p, str) and len(p.strip()) > 2))
    elif isinstance(paragraphs, str):  # If paragraphs is a single string
        fixed_item["paragraphs"] = [clean_text(paragraphs.strip())]
    else:
        fixed_item["paragraphs"] = []

    # Fix named entities
    named_entities = item.get("named_entities", {})
    fixed_item["named_entities"] = {
        "people": list(set(named_entities.get("people", []))) if isinstance(named_entities.get("people"), list) else [],
        "organizations": list(set(named_entities.get("organizations", []))) if isinstance(named_entities.get("organizations"), list) else [],
        "locations": list(set(named_entities.get("locations", []))) if isinstance(named_entities.get("locations"), list) else []
    }

    # Fix contact info
    contact_info = item.get("contact_info", "")
    if isinstance(contact_info, str):
        contact_parts = contact_info.split("|")
        fixed_item["contact_info"] = {
            "phone": next((part.strip() for part in contact_parts if "Tel:" in part), None),
            "email": next((part.strip() for part in contact_parts if "@" in part), None),
            "address": " | ".join(part.strip() for part in contact_parts if "@" not in part and "Tel:" not in part)
        }
    else:
        fixed_item["contact_info"] = {"phone": None, "email": None, "address": ""}

    # Fix links
    links = item.get("links", [])
    if isinstance(links, list) and all(isinstance(link, dict) and "url" in link for link in links):
        fixed_item["links"] = links
    else:
        fixed_item["links"] = []

    return fixed_item


def clean_raw_data(raw_data):
    """Clean and normalize the raw data."""
    logging.info("Cleaning raw data...")
    cleaned_data = []

    for item in raw_data:
        try:
            # Deduplicate and clean paragraphs
            paragraphs = list(set(clean_text(p).strip() for p in item.get("paragraphs", []) if len(p.strip()) > 2))
            
            # Deduplicate named entities
            named_entities = {
                "people": sorted(list(set(item.get("named_entities", {}).get("people", [])))),
                "organizations": sorted(list(set(item.get("named_entities", {}).get("organizations", [])))),
                "locations": sorted(list(set(item.get("named_entities", {}).get("locations", []))))
            }
            
            # Parse contact info into structured fields
            contact_info = item.get("contact_info", "")
            contact_parts = contact_info.split("|")
            phone = next((part.strip() for part in contact_parts if "Tel:" in part), None)
            email = next((part.strip() for part in contact_parts if "@" in part), None)
            address = " | ".join(part.strip() for part in contact_parts if "@" not in part and "Tel:" not in part)

            # Clean links
            links = item.get("links", [])
            unique_links = []
            seen_urls = set()
            for link in links:
                if link["url"] not in seen_urls:
                    unique_links.append(link)
                    seen_urls.add(link["url"])

            # Clean headings
            heading = item.get("headings", [""])[0]
            cleaned_heading = clean_text(heading.replace("<h1>", "").replace("</h1>", "").strip())

            cleaned_item = {
                "url": item.get("url", "").strip(),
                "scraped_at": item.get("scraped_at", ""),
                "headings": [cleaned_heading],
                "paragraphs": paragraphs,
                "contact_info": {
                    "address": address,
                    "phone": phone,
                    "email": email
                },
                "named_entities": named_entities,
                "links": unique_links
            }
            
            # Validate and add the cleaned item
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
    """Main function to clean raw and RSS data."""
    # Configurable paths
    raw_data_folder = "./Data/raw"
    cleaned_data_folder = "./Data/cleaned"

    # Load raw data (including RSS data)
    raw_data = load_raw_data(raw_data_folder)

    # Clean raw data
    cleaned_data = clean_raw_data(raw_data)

    # Save cleaned data
    save_cleaned_data(cleaned_data, cleaned_data_folder)


if __name__ == "__main__":
    logging.info("Starting data cleaning process...")
    main()
    logging.info("Data cleaning process completed.")
