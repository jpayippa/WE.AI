import os
import json
import logging
from datetime import datetime
import csv


# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def load_cleaned_data(cleaned_data_folder):
    """Load cleaned JSON files from the specified folder."""
    logging.info("Loading cleaned data from folder: %s", cleaned_data_folder)
    data = []
    for filename in os.listdir(cleaned_data_folder):
        filepath = os.path.join(cleaned_data_folder, filename)
        if filename.endswith(".json"):
            with open(filepath, "r", encoding="utf-8") as file:
                try:
                    content = json.load(file)
                    if isinstance(content, list):
                        data.extend(content)  # Flatten nested lists
                    else:
                        data.append(content)
                except json.JSONDecodeError as e:
                    logging.error(f"Error decoding JSON in file {filename}: {e}")
    logging.info("Loaded %d cleaned files.", len(data))
    return data



def validate_data(data):
    """Validate cleaned data for completeness and consistency."""
    logging.info("Validating data...")
    valid_data = []
    invalid_data = []

    for item in data:
        # If item is a list, iterate through it
        if isinstance(item, list):
            for sub_item in item:
                if isinstance(sub_item, dict) and sub_item.get("url") and sub_item.get("paragraphs"):
                    valid_data.append(sub_item)
                else:
                    invalid_data.append(sub_item)
        elif isinstance(item, dict):
            # Check required fields
            if item.get("url") and item.get("paragraphs"):
                valid_data.append(item)
            else:
                invalid_data.append(item)
        else:
            invalid_data.append(item)

    logging.info("Validation complete: %d valid items, %d invalid items.", len(valid_data), len(invalid_data))
    return valid_data, invalid_data



def save_valid_data(valid_data, output_folder):
    """Save valid data into a specified folder."""
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"validated_data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(valid_data, file, indent=4)
    logging.info("Valid data saved to %s", output_file)


def save_invalid_data(invalid_data, output_folder):
    """Save invalid data for debugging and review."""
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"invalid_data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(invalid_data, file, indent=4)
    logging.info("Invalid data saved to %s", output_file)

def save_data_as_jsonl(data, output_path):
    """Save data in JSONL format."""
    with open(output_path, 'w', encoding='utf-8') as f:
        for record in data:
            f.write(json.dumps(record) + '\n')
    logging.info(f"Data exported to JSONL at: {output_path}")


def save_data_as_csv(data, output_path):
    """Save data in CSV format."""
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    logging.info(f"Data exported to CSV at: {output_path}")



def main():
    """Main function to validate cleaned data."""
    # Configurable paths
    cleaned_data_folder = "./Data/cleaned"
    validated_data_folder = "./Data/validated"
    invalid_data_folder = "./Data/invalid"

    # Load cleaned data
    cleaned_data = load_cleaned_data(cleaned_data_folder)

    # Validate data
    valid_data, invalid_data = validate_data(cleaned_data)

    # Save validated and invalid data
    save_valid_data(valid_data, validated_data_folder)
    save_invalid_data(invalid_data, invalid_data_folder)

    if valid_data:
        # Export validated data to JSONL
        save_data_as_jsonl(valid_data, os.path.join(validated_data_folder, 'validated_data.jsonl'))

        # Export validated data to CSV
        save_data_as_csv(valid_data, os.path.join(validated_data_folder, 'validated_data.csv'))



if __name__ == "__main__":
    logging.info("Starting data validation process...")
    main()
    logging.info("Data validation process completed.")
