import requests
from bs4 import BeautifulSoup
import pandas as pd
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


def get_sub_links(soup):
    """Extract sub-links from the main page."""
    links = []
    for a_tag in soup.select("a[href]"):
        href = a_tag.get("href")
        if href and "undergraduate/programs" in href:
            full_link = href if href.startswith("http") else f"https://www.eng.uwo.ca{href}"
            links.append(full_link)
    return list(set(links))  # Remove duplicates


def extract_main_page_data(soup):
    """Extract information from the main page."""
    data = {}
    headings = soup.find_all("h2")  # Assuming sections are under <h2> tags
    for heading in headings:
        section_title = heading.text.strip()
        content = heading.find_next("p").text.strip() if heading.find_next("p") else "No content available"
        data[section_title] = content
    return data


def extract_sub_page_data(url):
    """Extract information from a sub-page."""
    soup = fetch_page(url)
    if not soup:
        return None
    sub_page_data = {}
    sub_page_data['URL'] = url
    title = soup.find("h1").text.strip() if soup.find("h1") else "No Title Found"
    sub_page_data['Title'] = title
    paragraphs = soup.find_all("p")
    content = "\n".join(p.text.strip() for p in paragraphs)
    sub_page_data['Content'] = content
    return sub_page_data


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

    print("Extracting sub-links...")
    sub_links = get_sub_links(main_page_soup)
    print(f"Found {len(sub_links)} sub-links.")

    print("Extracting main page data...")
    main_page_data = extract_main_page_data(main_page_soup)

    print("Extracting sub-page data...")
    sub_page_data_list = [extract_sub_page_data(link) for link in sub_links if link]

    print("Combining data...")
    all_data = {
        "main_page": main_page_data,
        "sub_pages": sub_page_data_list
    }

    print(f"Saving data to {OUTPUT_FILE}...")
    save_to_json(all_data, OUTPUT_FILE)


if __name__ == "__main__":
    main()