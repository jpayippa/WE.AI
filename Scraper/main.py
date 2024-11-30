import requests
from bs4 import BeautifulSoup
import json

# Configurations
FAQ_URL = "https://www.eng.uwo.ca/undergraduate/first-year/faq.html"
OUTPUT_FAQ_JSON = "first_year_faq.json"
OUTPUT_FAQ_TXT = "first_year_faq.txt"


def fetch_page(url):
    """Fetch a webpage and parse it with BeautifulSoup."""
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.text, 'html.parser')
    else:
        print(f"Failed to fetch {url} with status code {response.status_code}")
        return None


def extract_faq_data(soup):
    """Extract FAQ data from the page."""
    faq_data = {}

    # Locate the FAQ sections
    # Modify the selector below based on the page's HTML structure
    sections = soup.find_all("div", class_="accordion")  # Adjust class name if necessary

    for section in sections:
        # Extract the heading (e.g., "Student Centre")
        heading = section.find("h3")  # Change tag name if required
        if heading:
            heading_text = heading.text.strip()
        else:
            heading_text = "Unknown Section"

        # Extract the content inside the collapsible section
        content_div = section.find("div", class_="panel")  # Adjust class name if required
        if content_div:
            content = content_div.get_text(separator="\n").strip()
        else:
            content = "No content available."

        faq_data[heading_text] = content

    return faq_data


def save_to_json(data, file_name):
    """Save data to a JSON file."""
    with open(file_name, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    print(f"Data saved to JSON file: {file_name}")


def save_to_txt(data, file_name):
    """Save data to a TXT file."""
    with open(file_name, 'w', encoding='utf-8') as txt_file:
        for heading, content in data.items():
            txt_file.write(f"Section: {heading}\n")
            txt_file.write(f"Content:\n{content}\n")
            txt_file.write("\n" + "-"*50 + "\n")
    print(f"Data saved to TXT file: {file_name}")


def main():
    print("Fetching FAQ page...")
    soup = fetch_page(FAQ_URL)
    if not soup:
        print("Failed to fetch FAQ page. Exiting.")
        return

    print("Extracting FAQ data...")
    faq_data = extract_faq_data(soup)

    print("Saving FAQ data...")
    save_to_json(faq_data, OUTPUT_FAQ_JSON)
    save_to_txt(faq_data, OUTPUT_FAQ_TXT)


if __name__ == "__main__":
    main()
