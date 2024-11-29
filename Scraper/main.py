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


def extract_program_information(raw_content):
    """Extract only the relevant program information from raw content."""
    # Split the content into lines and remove irrelevant ones
    lines = raw_content.split("\n")
    irrelevant_keywords = [
        "©", "Western University", "Tel:", "Fax:", "contactWE", "Privacy",
        "Terms of Use", "Accessibility", "Web Standards", "Western Mail",
        "OWL", "Student Services", "Western Events", "Libraries", "Maps",
        "Office Hours:"
    ]
    relevant_lines = []
    for line in lines:
        line = line.strip()
        if not line or any(keyword in line for keyword in irrelevant_keywords):
            continue
        relevant_lines.append(line)

    # Combine cleaned lines into a single string
    return "\n".join(relevant_lines)


def extract_learn_more_data(url):
    """Extract and clean detailed information from the 'Learn More' page."""
    soup = fetch_page(url)
    if not soup:
        return None
    learn_more_data = {}
    title = soup.find("h1").text.strip() if soup.find("h1") else "No Title Found"
    paragraphs = soup.find_all("p")
    raw_content = "\n".join(p.text.strip() for p in paragraphs)
    clean_content = extract_program_information(raw_content)
    learn_more_data['Title'] = title
    learn_more_data['Content'] = clean_content
    return learn_more_data


def save_to_json(data, file_name):
    """Save data to a JSON file."""
    with open(file_name, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    print(f"Data saved to {file_name}")


def main():
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

    print("Saving cleaned data...")
    save_to_json(learn_more_data, OUTPUT_FILE)


if __name__ == "__main__":
    main()
