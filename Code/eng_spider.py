import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from datetime import datetime
import os
import json
import random
from Utils.text_processing import clean_text, extract_named_entities


class EngSpider(CrawlSpider):
    name = "eng_spider"

    def __init__(self, config, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = config["start_urls"]
        self.allowed_domains = config["allowed_domains"]
        self.output_folder = os.path.join(config["output_folder"], "raw")  # Save to Data/raw

        # Ensure the output folder exists
        os.makedirs(self.output_folder, exist_ok=True)

        # User agents for rotation
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
            'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        ]

    # Define rules for crawling and link extraction
    rules = (
        Rule(LinkExtractor(allow=()), callback="parse_item", follow=True),
    )

    def start_requests(self):
        """Start requests with random user agents."""
        for url in self.start_urls:
            headers = {'User-Agent': random.choice(self.user_agents)}
            yield scrapy.Request(url, headers=headers)

    def parse_item(self, response):
        """Parse the response and extract structured data."""
        try:
            # Extract headings, paragraphs, and contact info
            headings = response.css("h1::text").getall()
            paragraphs = response.css("p::text").getall()
            contact_info = response.css("div.contact-info, p:contains('Contact')::text").getall()

            # Extract links
            links = [
                {"text": link.css("::text").get(), "url": response.urljoin(link.attrib["href"])}
                for link in response.css("a[href]")
            ]

            # Organize data
            structured_data = {
                "url": response.url,
                "scraped_at": datetime.utcnow().isoformat(),
                "category": self.define_category(response.url),
                "headings": " | ".join(clean_text(text) for text in headings),
                "paragraphs": [clean_text(text) for text in paragraphs],
                "contact_info": " | ".join(clean_text(text) for text in contact_info),
                "links": links,
                "named_entities": extract_named_entities(paragraphs),
            }

            # Save to JSON
            self.save_to_json(structured_data, response.url)

            yield structured_data

        except Exception as e:
            self.logger.error(f"Error parsing {response.url}: {str(e)}")

    def save_to_json(self, data, url):
        """Save structured data to a JSON file."""
        filename = f"{url.replace('https://', '').replace('/', '_').replace(':', '_')}.json"
        filepath = os.path.join(self.output_folder, filename)

        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

        self.logger.info(f"Saved data to {filepath}")

    def define_category(self, url):
        """Define category based on URL structure."""
        if "faculty" in url:
            return "Faculty Information"
        elif "students" in url or "student_services" in url:
            return "Student Services"
        elif "research" in url:
            return "Research Initiatives"
        elif "admission" in url:
            return "Admissions"
        elif "campus" in url:
            return "Campus Life"
        elif "programs" in url or "undergraduate" in url or "graduate" in url:
            return "Programs"
        elif "clubs" in url:
            return "Student Clubs"
        elif "wellness" in url:
            return "Wellness Services"
        elif "support" in url or "resources" in url:
            return "Academic Resources"
        else:
            return "General"
