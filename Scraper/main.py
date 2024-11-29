import requests
from bs4 import BeautifulSoup
import json
from config import BASE_URL, OUTPUT_FILE


def fetch_page(url):
    """Fetch a webpage and parse it with BeautifulSoup."""
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.text, 'html.parser')
    else:
        print(f"Failed to fetch {url} with status code {response.status_code}")
        return None


def extract_main_page_data(soup):
    """Extract information from the main page."""
    data = {}
    headings = soup.find_all("h2")  # Assuming sections are under <h2> tags
    for heading in headings:
        section_title = heading.text.strip()
        content = heading.find_next("p").text.strip() if heading.find_next("p") else "No content available"
        data[section_title] = content
    return data


def extract_learn_more_data(url):
    """Extract detailed information from the 'Learn More' page."""
    soup = fetch_page(url)
    if not soup:
        return None
    learn_more_data = {}
    title = soup.find("h1").text.strip() if soup.find("h1") else "No Title Found"
    paragraphs = soup.find_all("p")
    content = "\n".join(p.text.strip() for p in paragraphs)
    learn_more_data['Title'] = title
    learn_more_data['Content'] = content
    return learn_more_data


def save_to_json(data, file_name):
    """Save data to a JSON file."""
    with open(file_name, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    print(f"Data saved to {file_name}")


def main():
    print("Fetching main page...")
    main_page_soup = fetch_page(BASE_URL)
    if not main_page_soup:
        print("Failed to fetch main page. Exiting.")
        return

    print("Extracting main page data...")
    main_page_data = extract_main_page_data(main_page_soup)

    print("Extracting 'Learn More' page data from predefined links...")
    learn_more_links = {
        "Artificial Intelligence Systems Engineering": "https://www.eng.uwo.ca/electrical/undergraduate/Programs/artificial-intelligence-systems-engineering.html",
        "Chemical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/chemical.html",
        "Civil Engineering": "https://www.eng.uwo.ca/undergraduate/programs/civil.html",
        "Electrical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/electrical.html",
        "Integrated Engineering": "https://www.eng.uwo.ca/undergraduate/programs/Integrated.html",
        "Mechanical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/mechanical.html",
        "Mechatronic Systems Engineering": "https://www.eng.uwo.ca/undergraduate/programs/mechatronic.html",
        "Software Engineering": "https://www.eng.uwo.ca/undergraduate/programs/software.html"
    }

    learn_more_data = {}
    for program, link in learn_more_links.items():
        print(f"Fetching data for {program}...")
        learn_more_data[program] = extract_learn_more_data(link)

    print("Combining data...")
    all_data = {
        "main_page": main_page_data,
        "learn_more_pages": learn_more_data
    }

    print(f"Saving data to {OUTPUT_FILE}...")
    save_to_json(all_data, OUTPUT_FILE)


if __name__ == "__main__":
    main()
