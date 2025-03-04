import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from datetime import datetime, timedelta
import os
import json
import random
import spacy
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
        
        # Ensure directories exist
        os.makedirs(self.output_folder, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        
        # NLP model
        self.nlp = spacy.load("en_core_web_sm")

        # User agents
        self.user_agents = config.get("user_agents", [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ])

        # Log files
        self.visited_pages_log = os.path.join(self.logs_dir, "visited_pages.log")
        self.skipped_pages_log = os.path.join(self.logs_dir, "skipped_pages.log")
        self.extracted_links_log = os.path.join(self.logs_dir, "extracted_links.log")

        # Crawler stats
        self.start_time = time.time()
        self.pages_visited = 0
        self.total_scraped = 0
        self.error_counts = {"404": 0, "403": 0, "500": 0, "other": 0}

        # Store visited URLs to avoid duplicate visits
        self.visited_urls = set()

    # ✅ **FIXED: Properly configure Scrapy to follow all internal links**
    rules = (
        Rule(LinkExtractor(allow_domains=["eng.uwo.ca"]), callback="parse_item", follow=True),
    )

    def parse_item(self, response):
        """Parse and extract structured data."""
        if response.url in self.visited_urls:
            return  # Skip already visited pages
        self.visited_urls.add(response.url)

        self.pages_visited += 1

        # Extract data
        headings = response.css("h1, h2::text").getall()
        paragraphs = response.css("p::text, div.main-content p::text").getall()
        contact_info = response.css("div.contact-info, p:contains('Contact')::text").getall()

        # Clean text
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        headings = [h.strip() for h in headings if h.strip()]

        # Extract and log links
        links = [
            {"text": link.css("::text").get(), "url": response.urljoin(link.attrib["href"])}
            for link in response.css("a[href]")
            if link.css("::text").get() and not link.attrib["href"].startswith("#")
        ]

        with open(self.extracted_links_log, "a", encoding="utf-8") as f:
            f.write(f"{response.url} -> {len(links)} links extracted\n")

        # Named entity extraction
        doc = self.nlp(" ".join(paragraphs))
        named_entities = {
            "people": [ent.text for ent in doc.ents if ent.label_ == "PERSON"],
            "organizations": [ent.text for ent in doc.ents if ent.label_ == "ORG"],
            "locations": [ent.text for ent in doc.ents if ent.label_ == "GPE"],
        }

        # Structured data
        structured_data = {
            "url": response.url,
            "scraped_at": datetime.utcnow().isoformat(),
            "headings": " | ".join(headings),
            "paragraphs": paragraphs,
            "contact_info": " | ".join(contact_info),
            "links": links,
            "named_entities": named_entities,
        }

        self.save_to_json(structured_data)
        self.total_scraped += 1
        self.log_progress()

        yield structured_data

    def save_to_json(self, data):
        """Save structured data to JSON."""
        content_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()
        filepath = os.path.join(self.output_folder, f"{content_hash}.json")

        if os.path.exists(filepath):
            return  # Avoid duplicates

        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

    def log_progress(self):
        """Print and log progress."""
        elapsed_time = time.time() - self.start_time
        progress_message = (
            f"[Progress] Visited: {self.pages_visited} | Scraped: {self.total_scraped} "
            f"| 404s: {self.error_counts['404']} | 403s: {self.error_counts['403']} "
            f"| Elapsed: {timedelta(seconds=int(elapsed_time))}"
        )
        print(progress_message)

        with open(self.visited_pages_log, "a") as f:
            f.write(progress_message + "\n")

    def log_failed_url(self, url, status_code=None):
        """Log failed URLs."""
        error_type = {404: "404_errors.log", 403: "403_errors.log", 500: "500_errors.log"}.get(status_code, "other_errors.log")
        log_file = os.path.join(self.logs_dir, error_type)

        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{url}\n")

    def closed(self, reason):
        """Log summary at the end of the scraping process."""
        elapsed_time = time.time() - self.start_time
        summary_message = (
            f"\n[Summary] Scraping completed in {timedelta(seconds=int(elapsed_time))}!\n"
            f"Total Pages Visited: {self.pages_visited}\n"
            f"Total Pages Scraped: {self.total_scraped}\n"
            f"404 Errors: {self.error_counts['404']}\n"
            f"403 Errors: {self.error_counts['403']}\n"
        )
        print(summary_message)
        with open(os.path.join(self.logs_dir, "scraping_summary.log"), "w") as f:
            f.write(summary_message)


if __name__ == "__main__":
    from scrapy.crawler import CrawlerProcess
    with open("config.json", "r") as f:
        config = json.load(f)

    process = CrawlerProcess({
        "USER_AGENT": random.choice(config["user_agents"]),
        "LOG_LEVEL": "INFO",
        "ROBOTSTXT_OBEY": False,  # ❗ Important: Ensures we can crawl the whole site
        "CONCURRENT_REQUESTS": config.get("concurrent_requests", 8),
        "DOWNLOAD_DELAY": config.get("download_delay", 0.5),
    })
    process.crawl(EngSpider, config=config)
    process.start()
