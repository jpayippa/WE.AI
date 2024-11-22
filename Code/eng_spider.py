import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from datetime import datetime, timedelta
import os
import json
import random
import spacy
from Utils.text_processing import clean_text
import time
import hashlib


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

        # Initialize NLP model
        self.nlp = spacy.load("en_core_web_sm")

        # User agents for rotation
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
            'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        ]

        # Initialize counters
        self.start_time = time.time()
        self.pages_visited = 0
        self.total_scraped = 0
        self.error_counts = {"404": 0, "403": 0, "500": 0, "other": 0}

        # Log file paths
        self.progress_log = os.path.join(self.logs_dir, "progress.log")
        self.summary_log = os.path.join(self.logs_dir, "scraping_summary.log")

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
            self.pages_visited += 1  # Increment visited pages count

            # Extract headings, paragraphs, and contact info
            headings = response.css("h1, h2::text").getall()
            paragraphs = response.css("p::text, div.main-content p::text").getall()
            contact_info = response.css("div.contact-info, p:contains('Contact')::text").getall()

            # Filter empty or placeholder text
            paragraphs = [clean_text(p) for p in paragraphs if p.strip()]
            headings = [clean_text(h) for h in headings if h.strip()]

            # Extract links, ignoring empty or navigational links
            links = [
                {"text": link.css("::text").get(), "url": response.urljoin(link.attrib["href"])}
                for link in response.css("a[href]")
                if link.css("::text").get() and not link.attrib["href"].startswith("#")
            ]

            # Named entity extraction using NLP
            doc = self.nlp(" ".join(paragraphs))
            named_entities = {
                "people": [ent.text for ent in doc.ents if ent.label_ == "PERSON"],
                "organizations": [ent.text for ent in doc.ents if ent.label_ == "ORG"],
                "locations": [ent.text for ent in doc.ents if ent.label_ == "GPE"],
            }

            # Organize data
            structured_data = {
                "url": response.url,
                "scraped_at": datetime.utcnow().isoformat(),
                "headings": " | ".join(headings),
                "paragraphs": paragraphs,
                "contact_info": " | ".join(clean_text(text) for text in contact_info),
                "links": links,
                "named_entities": named_entities,
            }

            # Save to JSON, avoiding duplicates
            self.save_to_json(structured_data)
            self.total_scraped += 1  # Increment scraped count

            # Print and log progress
            self.log_progress()

            yield structured_data

        except Exception as e:
            self.logger.error(f"Error parsing {response.url}: {str(e)}")
            self.log_failed_url(response.url, response.status)

    def save_to_json(self, data):
        """Save structured data to a JSON file, avoiding duplicates."""
        content_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()
        filename = f"{content_hash}.json"
        filepath = os.path.join(self.output_folder, filename)

        if os.path.exists(filepath):
            self.logger.info(f"Skipped saving duplicate content for URL: {data['url']}")
            return

        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

        self.logger.info(f"Saved data to {filepath}")

    def log_progress(self):
        """Print and log progress in real-time."""
        elapsed_time = time.time() - self.start_time
        progress_message = (
            f"[Progress] Visited: {self.pages_visited} | "
            f"Scraped: {self.total_scraped} | "
            f"404s: {self.error_counts['404']} | "
            f"403s: {self.error_counts['403']} | "
            f"500s: {self.error_counts['500']} | "
            f"Elapsed: {timedelta(seconds=int(elapsed_time))}"
        )
        print(progress_message)

        # Append progress to the log file
        with open(self.progress_log, "a") as f:
            f.write(progress_message + "\n")

    def log_failed_url(self, url, status_code=None):
        """Log failed URLs and increment error counters."""
        try:
            if status_code == 404:
                self.error_counts["404"] += 1
                log_file = os.path.join(self.logs_dir, "404_errors.log")
            elif status_code == 403:
                self.error_counts["403"] += 1
                log_file = os.path.join(self.logs_dir, "403_errors.log")
            elif status_code == 500:
                self.error_counts["500"] += 1
                log_file = os.path.join(self.logs_dir, "500_errors.log")
            else:
                self.error_counts["other"] += 1
                log_file = os.path.join(self.logs_dir, "other_errors.log")

            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"{url}\n")
            self.logger.info(f"Logged error for URL: {url} (Status: {status_code})")
        except Exception as e:
            self.logger.error(f"Failed to log URL: {url} (Status: {status_code}). Error: {e}")

    def closed(self, reason):
        """Log summary of the scraping run."""
        elapsed_time = time.time() - self.start_time
        summary_message = (
            f"\n[Summary] Scraping completed in {timedelta(seconds=int(elapsed_time))}!\n"
            f"Total Pages Visited: {self.pages_visited}\n"
            f"Total Pages Scraped: {self.total_scraped}\n"
            f"404 Errors: {self.error_counts['404']}\n"
            f"403 Errors: {self.error_counts['403']}\n"
            f"500 Errors: {self.error_counts['500']}\n"
            f"Other Errors: {self.error_counts['other']}\n"
        )
        print(summary_message)

        # Write the summary to a log file
        with open(self.summary_log, "w") as f:
            f.write(summary_message)
