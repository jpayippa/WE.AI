import os
import json
import logging
from datetime import datetime


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
                    data.append(json.load(file))
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
        # Check required fields
        if item.get("url") and item.get("paragraphs"):
            valid_data.append(item)
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


if __name__ == "__main__":
    logging.info("Starting data validation process...")
    main()
    logging.info("Data validation process completed.")
