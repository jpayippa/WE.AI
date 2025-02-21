import os
import json
import scrapy
from scrapy.crawler import CrawlerProcess
import trafilatura
import phonenumbers
import spacy
import pandas as pd
import random
import time
import hashlib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EngSpider(scrapy.Spider):
    name = "eng_spider"

    def __init__(self, config, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = config["start_urls"]
        self.allowed_domains = config["allowed_domains"]
        self.output_folder = os.path.join(config["output_folder"], "raw")
        self.logs_dir = os.path.join(config["log_folder"], "logs")

        os.makedirs(self.output_folder, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)

        self.nlp = spacy.load("en_core_web_sm")
        self.user_agents = config["user_agents"]
        self.start_time = time.time()
        self.pages_visited = 0
        self.total_scraped = 0
        self.error_counts = {"404": 0, "403": 0, "500": 0, "other": 0}
        self.progress_log = os.path.join(self.logs_dir, "progress.log")
        self.summary_log = os.path.join(self.logs_dir, "scraping_summary.log")
        
        logger.info("Spider initialized. Starting URLs: %s", self.start_urls)

    def start_requests(self):
        for url in self.start_urls:
            headers = {'User-Agent': random.choice(self.user_agents)}
            logger.info(f"Starting crawl on: {url}")
            yield scrapy.Request(url, headers=headers)

    def parse(self, response):
        self.pages_visited += 1
        extracted_text = trafilatura.extract(response.text)
        tables = self.extract_tables(response)
        contact_info = self.extract_contact_info(response.text)
        named_entities = self.extract_named_entities(extracted_text)

        data = {
            "url": response.url,
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "text": extracted_text[:500],
            "tables": tables,
            "contact_info": contact_info,
            "named_entities": named_entities
        }

        self.save_to_json(data)
        self.total_scraped += 1
        self.log_progress(response)
        
        logger.info(f"Successfully scraped: {response.url}")
        yield data

        for link in response.css("a::attr(href)").getall():
            yield response.follow(link, self.parse)

    def extract_contact_info(self, text):
        phones = [phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
                  for match in phonenumbers.PhoneNumberMatcher(text, "CA")]
        email = next((word for word in text.split() if "@" in word and "uwo.ca" in word), "")
        return {"phone": phones, "email": email}

    def extract_named_entities(self, text):
        doc = self.nlp(text)
        return {
            "organizations": [ent.text for ent in doc.ents if ent.label_ == "ORG"],
            "people": [ent.text for ent in doc.ents if ent.label_ == "PERSON"],
            "locations": [ent.text for ent in doc.ents if ent.label_ in ["GPE", "LOC"]]
        }

    def extract_tables(self, response):
        tables = pd.read_html(response.text)
        return [table.to_dict(orient="records") for table in tables] if tables else []

    def save_to_json(self, data):
        content_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()
        filepath = os.path.join(self.output_folder, f"{content_hash}.json")
        if os.path.exists(filepath):
            logger.info(f"Skipping duplicate content for: {data['url']}")
            return
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)
        logger.info(f"Saved data to: {filepath}")

    def log_progress(self, response):
        elapsed_time = time.time() - self.start_time
        progress_message = (
            f"[Progress] Visited: {self.pages_visited} | "
            f"Scraped: {self.total_scraped} | "
            f"Elapsed: {elapsed_time:.2f}s"
        )
        print(progress_message)
        logger.info(progress_message)
        with open(self.progress_log, "a") as f:
            f.write(progress_message + "\n")

    def closed(self, reason):
        elapsed_time = time.time() - self.start_time
        summary_message = (
            f"\n[Summary] Scraping completed in {elapsed_time:.2f}s\n"
            f"Total Pages Visited: {self.pages_visited}\n"
            f"Total Pages Scraped: {self.total_scraped}\n"
            f"404 Errors: {self.error_counts['404']}\n"
            f"403 Errors: {self.error_counts['403']}\n"
            f"500 Errors: {self.error_counts['500']}\n"
            f"Other Errors: {self.error_counts['other']}\n"
        )
        print(summary_message)
        logger.info(summary_message)
        with open(self.summary_log, "w") as f:
            f.write(summary_message)

if __name__ == "__main__":
    with open("config.json", "r") as f:
        config = json.load(f)
    process = CrawlerProcess()
    process.crawl(EngSpider, config=config)
    process.start()
