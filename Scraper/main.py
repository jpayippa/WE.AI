import requests
from bs4 import BeautifulSoup
import json
from config import BASE_URL, OUTPUT_JSON_FILE, OUTPUT_TXT_FILE, ADMISSION_REQUIREMENTS


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
    lines = raw_content.split("\n")
    irrelevant_keywords = [
        "©", "Western University", "Tel:", "Fax:", "contactWE", "Privacy",
        "Terms of Use", "Accessibility", "Web Standards", "Western Mail",
        "OWL", "Student Services", "Western Events", "Libraries", "Maps",
        "Office Hours:"
    ]
    relevant_lines = [line.strip() for line in lines if line.strip() and not any(keyword in line for keyword in irrelevant_keywords)]
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


def add_admission_requirements(program_data):
    """Add explicit admission requirements to the program data."""
    for program, requirements in ADMISSION_REQUIREMENTS.items():
        if program in program_data:
            program_data[program]["Average Required in First Year"] = requirements["Year 1 Average"]
            program_data[program]["Courses That Are Prioritized"] = requirements["Required Courses"]
    return program_data


def save_to_json(data, file_name):
    """Save data to a JSON file."""
    with open(file_name, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)
    print(f"Data saved to JSON file: {file_name}")


def save_to_txt(data, file_name):
    """Save data to a TXT file."""
    with open(file_name, 'w', encoding='utf-8') as txt_file:
        for program, details in data.items():
            txt_file.write(f"Program: {program}\n")
            txt_file.write(f"Title: {details.get('Title', 'No Title')}\n")
            txt_file.write(f"Content:\n{details.get('Content', 'No Content')}\n")
            txt_file.write(f"Average Required in First Year: {details.get('Average Required in First Year', 'N/A')}\n")
            txt_file.write(f"Courses That Are Prioritized: {details.get('Courses That Are Prioritized', 'N/A')}\n")
            txt_file.write("\n" + "-"*50 + "\n")
    print(f"Data saved to TXT file: {file_name}")


def main():
    print("Extracting 'Learn More' page data from predefined links...")
    learn_more_links = {
        "Artificial Intelligence Systems Engineering": "https://www.eng.uwo.ca/electrical/undergraduate/Programs/artificial-intelligence-systems-engineering.html",
        "Chemical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/chemical.html",
        "Civil Engineering": "https://www.eng.uwo.ca/undergraduate/programs/civil.html",
        "Electrical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/electrical.html",
        "Integrated Engineering": "https://www.eng.uwo.ca/undergraduate/programs/Integrated.html",
        "Mechanical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/mechanical.html",
        "Mechatronics Engineering": "https://www.eng.uwo.ca/undergraduate/programs/mechatronic.html",
        "Software Engineering": "https://www.eng.uwo.ca/undergraduate/programs/software.html",
        "Biomedical Engineering": "https://www.eng.uwo.ca/undergraduate/programs/software.html"
    }

    learn_more_data = {}
    for program, link in learn_more_links.items():
        print(f"Fetching data for {program}...")
        learn_more_data[program] = extract_learn_more_data(link)

    # Add explicit admission requirements
    learn_more_data = add_admission_requirements(learn_more_data)

    # Save to JSON
    save_to_json(learn_more_data, OUTPUT_JSON_FILE)

    # Save to TXT
    save_to_txt(learn_more_data, OUTPUT_TXT_FILE)


if __name__ == "__main__":
    main()
