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
import re
import pdfplumber
import requests
import logging

class EngSpider(CrawlSpider):
    name = "eng_spider"

    def __init__(self, config, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_urls = config["start_urls"]
        self.allowed_domains = config["allowed_domains"]
        self.output_folder = os.path.join(config["output_folder"], "raw")
        self.logs_dir = os.path.join(config["output_folder"], "../logs")
        os.makedirs(self.output_folder, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)

        self.nlp = spacy.load("en_core_web_trf")

        self.user_agents = config.get("user_agents", [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        ])

        self.visited_pages_log = os.path.join(self.logs_dir, "visited_pages.log")
        self.extracted_links_log = os.path.join(self.logs_dir, "extracted_links.log")
        self.misclassification_log = os.path.join(self.logs_dir, "misclassifications.log")
        self.start_time = time.time()
        self.pages_visited = 0
        self.total_scraped = 0
        self.visited_urls = set()

    rules = (
        Rule(LinkExtractor(allow_domains=["eng.uwo.ca"]), callback="parse_item", follow=True),
    )

    def parse_item(self, response):
        if response.url in self.visited_urls:
            return
        self.visited_urls.add(response.url)

        self.pages_visited += 1

        headings = response.css("h1, h2::text").getall()
        paragraphs = response.css("p::text, div.main-content p::text").getall()
        contact_info = response.css(
            "div.contact-info, div.profile-contact, div.staff-contact, p:contains('Contact')::text, p:contains('Tel:')::text, p:contains('Email')::text"
        ).getall()

        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        headings = [h.strip() for h in headings if h.strip()]

        section_context = "other"
        for heading in headings:
            heading_lower = heading.lower()
            if any(keyword in heading_lower for keyword in ["faculty", "staff", "team", "people", "contacts"]):
                section_context = "people"
            elif any(keyword in heading_lower for keyword in ["programs", "departments", "research"]):
                section_context = "programs"
            elif any(keyword in heading_lower for keyword in ["buildings", "facilities"]):
                section_context = "buildings"

        doc = self.nlp(" ".join(paragraphs))
        named_entities = {
            "people": [ent.text for ent in doc.ents if ent.label_ == "PERSON"] if section_context == "people" else [],
            "organizations": [ent.text for ent in doc.ents if ent.label_ == "ORG"],
            "locations": [ent.text for ent in doc.ents if ent.label_ == "GPE"]
        }

        if section_context == "people":
            manual_people = re.findall(r"\b[A-Z][a-z]+\s[A-Z][a-z]+\b", " ".join(paragraphs))
            named_entities["people"].extend(manual_people)

        tables = []
        for table in response.css('table'):
            headers = [h.get().strip() for h in table.css('th::text')]
            rows = []
            for row in table.css('tr'):
                cells = [c.get().strip() for c in row.css('td::text')]
                if cells and len(cells) == len(headers):
                    rows.append(dict(zip(headers, cells)))
            if rows:
                tables.append(rows)

        pdf_links = response.css('a[href$=".pdf"]::attr(href)').getall()
        pdf_texts = []
        pdf_folder = os.path.join(self.output_folder, '../pdfs')
        os.makedirs(pdf_folder, exist_ok=True)

        for pdf_link in pdf_links:
            pdf_url = response.urljoin(pdf_link)
            pdf_filename = hashlib.md5(pdf_url.encode()).hexdigest() + ".pdf"
            pdf_path = os.path.join(pdf_folder, pdf_filename)
            
            with open(pdf_path, 'wb') as f:
                f.write(requests.get(pdf_url).content)
            
            with pdfplumber.open(pdf_path) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
                pdf_texts.append({
                    "source": pdf_url,
                    "content": text
                })

        profile = {
            "name": response.css('div.profile h3::text').get(),
            "title": response.css('div.profile p:nth-child(2)::text').get(),
            "email": response.css('div.profile p:contains("Email")::text').re_first(r'Email:\s*(.*)'),
            "office": response.css('div.profile p:contains("Office")::text').re_first(r'Office:\s*(.*)')
        }

        links = [
            {"text": link.css("::text").get(), "url": response.urljoin(link.attrib["href"])}
            for link in response.css("a[href]")
            if link.css("::text").get() and not link.attrib["href"].startswith("#")
        ]

        structured_data = {
            "more_info_at": response.url,
            "scraped_at": datetime.utcnow().isoformat(),
            "headings": " | ".join(headings),
            "paragraphs": paragraphs,
            "tables": tables,
            "pdfs": pdf_texts,
            "profile": profile,
            "contact_info": " | ".join(contact_info),
            "links": links,
            "named_entities": named_entities,
            "section_context": section_context
        }

        self.save_to_json(structured_data)
        self.total_scraped += 1
        self.log_progress()
        yield structured_data

    def save_to_json(self, data):
        content_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()
        filepath = os.path.join(self.output_folder, f"{content_hash}.json")
        if os.path.exists(filepath):
            return
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

    def log_progress(self):
        elapsed_time = time.time() - self.start_time
        progress_message = (
            f"[Progress] Visited: {self.pages_visited} | Scraped: {self.total_scraped} "
            f"| Elapsed: {timedelta(seconds=int(elapsed_time))}"
        )
        print(progress_message)
        with open(self.visited_pages_log, "a") as f:
            f.write(progress_message + "\n")

if __name__ == "__main__":
    from scrapy.crawler import CrawlerProcess
    with open("config.json", "r") as f:
        config = json.load(f)

    process = CrawlerProcess({
        "USER_AGENT": random.choice(config["user_agents"]),
        "LOG_LEVEL": "INFO",
        "ROBOTSTXT_OBEY": False,
        "CONCURRENT_REQUESTS": config.get("concurrent_requests", 8),
        "DOWNLOAD_DELAY": config.get("download_delay", 0.5)
    })
    process.crawl(EngSpider, config=config)
    process.start()
