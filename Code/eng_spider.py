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
        self.logs_dir = os.path.join(config["output_folder"], "../logs")  # Save logs to Results/logs

        # Ensure the output and logs folders exist
        os.makedirs(self.output_folder, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)

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
            self.log_failed_url(response.url, response.status)

    def save_to_json(self, data, url):
        """Save structured data to a JSON file."""
        filename = f"{url.replace('https://', '').replace('/', '_').replace(':', '_')}.json"
        filepath = os.path.join(self.output_folder, filename)

        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

        self.logger.info(f"Saved data to {filepath}")

    def log_failed_url(self, url, status_code):
        """Log failed URLs into specific log files based on status code."""
        if status_code == 404:
            log_file = os.path.join(self.logs_dir, "404_errors.log")
        elif status_code == 403:
            log_file = os.path.join(self.logs_dir, "403_errors.log")
        elif status_code == 500:
            log_file = os.path.join(self.logs_dir, "500_errors.log")
        else:
            log_file = os.path.join(self.logs_dir, "other_errors.log")

        with open(log_file, "a", encoding="utf-8") as log_file:
            log_file.write(f"{url}\n")
        self.logger.info(f"Logged {status_code} error for URL: {url}")

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

    def closed(self, reason):
        """Log summary of the scraping run."""
        summary_file = os.path.join(self.logs_dir, "scraping_summary.log")

        with open(summary_file, "w", encoding="utf-8") as f:
            stats = self.crawler.stats.get_stats()
            f.write("Scraping Summary\n")
            f.write("=================\n")
            f.write(f"Finish Reason: {reason}\n")
            f.write(f"Total Requests: {stats.get('downloader/request_count', 0)}\n")
            f.write(f"Successful Responses (200): {stats.get('downloader/response_status_count/200', 0)}\n")
            f.write(f"404 Errors: {stats.get('downloader/response_status_count/404', 0)}\n")
            f.write(f"403 Errors: {stats.get('downloader/response_status_count/403', 0)}\n")
            f.write(f"500 Errors: {stats.get('downloader/response_status_count/500', 0)}\n")
            f.write(f"Retries: {stats.get('retry/count', 0)}\n")
            f.write(f"Total Items Scraped: {stats.get('item_scraped_count', 0)}\n")
        self.logger.info("Scraping summary saved.")
