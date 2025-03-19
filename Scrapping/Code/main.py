import json
import os
import random
import scrapy
from scrapy.crawler import CrawlerProcess
from eng_spider import EngSpider  # Ensure `eng_spider.py` is correctly placed

def load_config():
    """Load configuration from the JSON file."""
    base_dir = os.path.dirname(os.path.abspath(__file__))  # Get script's directory
    config_path = os.path.join(base_dir, "../Config/config.json")  # Path to config file

    try:
        print(f"Loading configuration from {config_path}...")
        with open(config_path, "r", encoding="utf-8") as file:
            config = json.load(file)
        print("Configuration loaded successfully.")
        return config
    except FileNotFoundError:
        print("Error: Config file not found. Ensure `config.json` exists in the `Config` folder.")
        exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse `config.json`. Check its syntax.\n{e}")
        exit(1)

def scrape_data(config):
    """Run the Scrapy spider using CrawlerProcess without requiring a Scrapy project."""
    raw_data_dir = config.get("output_folder", "./Data/raw")
    logs_dir = config.get("log_folder", "./Data/logs")
    os.makedirs(raw_data_dir, exist_ok=True)
    os.makedirs(logs_dir, exist_ok=True)

    # Rotate user agent if provided in the config
    user_agent = random.choice(config.get("user_agents", ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)"]))

    print("Starting the scraping process...")

    process = CrawlerProcess(settings={
        "USER_AGENT": user_agent,
        "LOG_LEVEL": "INFO",
        "LOG_FILE": os.path.join(logs_dir, "scrapy.log"),  # Save logs in file
        "ROBOTSTXT_OBEY": True,
        "RETRY_ENABLED": True,
        "RETRY_TIMES": 5,
        "RETRY_HTTP_CODES": [500, 503, 504, 400, 403, 408],
        "DOWNLOAD_TIMEOUT": 15,
        "DOWNLOAD_DELAY": 0.5,
        "CONCURRENT_REQUESTS": 8,
        "FEEDS": {
            os.path.join(raw_data_dir, "scraped_data.json"): {"format": "json"}
        },
    })

    # Run Scrapy spider directly
    process.crawl(EngSpider, config=config)
    process.start()  # Blocking call to run Scrapy properly

    print("Scraping process completed. Raw data saved in:", raw_data_dir)

def main():
    """Main function to run scraping."""
    config = load_config()
    scrape_data(config)

if __name__ == "__main__":
    print("Executing main script...")
    main()
