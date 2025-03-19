import os
import json
import logging
from datetime import datetime
import csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def load_cleaned_data(folder):
    data = []
    for file in os.listdir(folder):
        if file.endswith(".json"):
            with open(os.path.join(folder, file), encoding="utf-8") as f:
                try:
                    content = json.load(f)
                    data.extend(content if isinstance(content, list) else [content])
                except json.JSONDecodeError as e:
                    logging.error(f"Error loading {file}: {e}")
    return data

def validate_item(item):
    required_fields = [
        "more_info_at", 
        "scraped_at", 
        "headings", 
        "paragraphs", 
        "links", 
        "named_entities", 
        "contact_info"
    ]

    for field in required_fields:
        if field not in item:
            return False, f"Missing required field: {field}"

    if not item["more_info_at"].startswith("http"):
        return False, "Invalid URL in more_info_at"

    if not item["paragraphs"]:
        return False, "No usable paragraphs found"

    # Links should be a list of {"text": ..., "url": ...}
    if not isinstance(item["links"], list) or not all("url" in link for link in item["links"]):
        return False, "Invalid or missing link structure"

    # Named entities should be a dict with lists
    if not isinstance(item["named_entities"], dict) or not all(isinstance(v, list) for v in item["named_entities"].values()):
        return False, "Invalid named_entities format"

    # Contact info should have at least one useful piece of info
    contact = item.get("contact_info", {})
    if not (contact.get("phone") or contact.get("email") or contact.get("address")):
        logging.warning(f"Item missing full contact info: {item['more_info_at']}")

    return True, None


def validate_data(data):
    valid, invalid = [], []
    for item in data:
        is_valid, reason = validate_item(item)
        if is_valid:
            valid.append(item)
        else:
            invalid.append({**item, "validation_reason": reason})
    return valid, invalid

def save_data(data, folder, prefix):
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, f"{prefix}_data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def save_csv(data, path):
    if not data:
        return  # No data to save

    # Collect all possible keys across all items for CSV headers (some items might miss fields)
    all_keys = set()
    for item in data:
        all_keys.update(item.keys())

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=sorted(all_keys))
        writer.writeheader()
        for item in data:
            writer.writerow({key: item.get(key, "") for key in all_keys})

def main():
    folder = "./Data/cleaned"
    valid_folder = "./Data/validated"
    invalid_folder = "./Data/invalid"

    data = load_cleaned_data(folder)
    if not data:
        logging.error("No data found in the cleaned folder.")
        return

    valid, invalid = validate_data(data)

    save_data(valid, valid_folder, "validated")
    save_data(invalid, invalid_folder, "invalid")

    if valid:
        save_csv(valid, os.path.join(valid_folder, "validated_data.csv"))

    if invalid:
        save_csv(invalid, os.path.join(invalid_folder, "invalid_data.csv"))

    logging.info(f"Validation complete. Valid: {len(valid)}, Invalid: {len(invalid)}")

if __name__ == "__main__":
    logging.info("Starting data validation...")
    main()
    logging.info("Data validation complete.")
