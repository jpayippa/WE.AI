import requests
from bs4 import BeautifulSoup
import json

# Configuration for file generation
BASE_URL = "https://learning.uwo.ca/peer_assisted_learning/schedules/sciences_eng.html"
OUTPUT_JSON_FILE = "peer_assisted_learning_schedule.json"
OUTPUT_TXT_FILE = "peer_assisted_learning_schedule.txt"

def fetch_page(url):
    """Fetch a webpage and parse it with BeautifulSoup."""
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.text, 'html.parser')
    else:
        print(f"Failed to fetch {url} with status code {response.status_code}")
        return None

def extract_schedule_data(url):
    """Extract schedule data from the Peer-Assisted Learning page."""
    soup = fetch_page(url)
    if not soup:
        return None

    schedule_data = []
    # Look for tables or relevant tags
    tables = soup.find_all("table")
    for table in tables:
        headers = [header.text.strip() for header in table.find_all("th")]
        rows = table.find_all("tr")
        for row in rows[1:]:  # Skip header row
            values = [cell.text.strip() for cell in row.find_all("td")]
            if values:
                schedule_data.append(dict(zip(headers, values)))

    return schedule_data

def save_to_json(data, file_name):
    """Save data to a JSON file."""
    with open(file_name, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    print(f"Data saved to JSON file: {file_name}")

def save_to_txt(data, file_name):
    """Save data to a TXT file."""
    with open(file_name, 'w', encoding='utf-8') as txt_file:
        for entry in data:
            for key, value in entry.items():
                txt_file.write(f"{key}: {value}\n")
            txt_file.write("\n" + "-" * 50 + "\n")
    print(f"Data saved to TXT file: {file_name}")

def main():
    print("Fetching Peer-Assisted Learning schedule data...")
    schedule_data = extract_schedule_data(BASE_URL)
    if schedule_data:
        # Save to JSON
        save_to_json(schedule_data, OUTPUT_JSON_FILE)
        # Save to TXT
        save_to_txt(schedule_data, OUTPUT_TXT_FILE)
    else:
        print("No data found or failed to fetch the page.")

if __name__ == "__main__":
    main()
