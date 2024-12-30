import requests
from bs4 import BeautifulSoup
import json

# Configuration for file generation
BASE_URL = "https://www.eng.uwo.ca/undergraduate/first-year/academic_counselling_year1.html"
OUTPUT_JSON_FILE = "academic_counselling_info.json"
OUTPUT_TXT_FILE = "academic_counselling_info.txt"

def fetch_page(url):
    """Fetch a webpage and parse it with BeautifulSoup."""
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.text, 'html.parser')
    else:
        print(f"Failed to fetch {url} with status code {response.status_code}")
        return None

def extract_counselling_data(url):
    """Extract academic counselling information from the provided page."""
    soup = fetch_page(url)
    if not soup:
        return None

    counselling_data = []
    # Find content blocks (adjust tags and classes as necessary)
    content_sections = soup.find_all(["h2", "h3", "p", "ul", "ol"])
    current_section = {}

    for element in content_sections:
        if element.name in ["h2", "h3"]:
            # Save the previous section if it's not empty
            if current_section:
                counselling_data.append(current_section)
                current_section = {}
            # Start a new section
            current_section["Title"] = element.text.strip()
        elif element.name in ["p", "ul", "ol"]:
            # Add content to the current section
            current_section.setdefault("Content", []).append(element.text.strip())

    # Append the last section
    if current_section:
        counselling_data.append(current_section)

    # Format the content for consistency
    for section in counselling_data:
        section["Content"] = "\n".join(section.get("Content", []))

    return counselling_data

def save_to_json(data, file_name):
    """Save data to a JSON file."""
    with open(file_name, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    print(f"Data saved to JSON file: {file_name}")

def save_to_txt(data, file_name):
    """Save data to a TXT file."""
    with open(file_name, 'w', encoding='utf-8') as txt_file:
        for entry in data:
            txt_file.write(f"Title: {entry.get('Title', 'No Title')}\n")
            txt_file.write(f"Content:\n{entry.get('Content', 'No Content')}\n")
            txt_file.write("\n" + "-" * 50 + "\n")
    print(f"Data saved to TXT file: {file_name}")

def main():
    print("Fetching Academic Counselling information...")
    counselling_data = extract_counselling_data(BASE_URL)
    if counselling_data:
        # Save to JSON
        save_to_json(counselling_data, OUTPUT_JSON_FILE)
        # Save to TXT
        save_to_txt(counselling_data, OUTPUT_TXT_FILE)
    else:
        print("No data found or failed to fetch the page.")

if __name__ == "__main__":
    main()
