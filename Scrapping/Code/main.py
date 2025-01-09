import json
from scrapy.crawler import CrawlerProcess
from eng_spider import EngSpider
import os
import random

def load_config():
    """Load configuration from the JSON file."""
    try:
        print("Loading configuration...")
        with open("./Config/config.json", "r") as file:
            config = json.load(file)
        print("Configuration loaded successfully.")
        return config
    except FileNotFoundError:
        print("Error: Config file not found. Please ensure `config.json` exists in the Config folder.")
        exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse `config.json`. Please check the file's syntax.\n{e}")
        exit(1)

def scrape_data(config):
    """Run the Scrapy spider with the provided configuration."""
    # Ensure required directories exist
    raw_data_dir = config.get("output_folder", "./Data/raw")
    logs_dir = config.get("log_folder", "./Results/logs")
    os.makedirs(raw_data_dir, exist_ok=True)
    os.makedirs(logs_dir, exist_ok=True)

    # Rotate user agent if provided in the config
    user_agent = random.choice(config.get("user_agents", [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    ]))

    print("Starting the scraping process...")

    # Initialize and configure Scrapy process
    process = CrawlerProcess(settings={
        "USER_AGENT": user_agent,
        "LOG_LEVEL": "INFO",  # Set log level to INFO for minimal output
        "LOG_FILE": os.path.join(logs_dir, "scrapy.log"),  # Save detailed logs in a file
        "ROBOTSTXT_OBEY": True,
        "RETRY_ENABLED": True,
        "RETRY_TIMES": config.get("retry_times", 5),
        "RETRY_HTTP_CODES": [500, 503, 504, 400, 403, 408],
        "DOWNLOAD_TIMEOUT": config.get("download_timeout", 15),
        "DOWNLOAD_DELAY": config.get("download_delay", 0.5),
        "CONCURRENT_REQUESTS": config.get("concurrent_requests", 8),
        "FEEDS": {os.path.join(raw_data_dir, "scraped_data.json"): {"format": "json"}},
    })

    # Run the spider with the loaded configuration
    process.crawl(EngSpider, config=config)
    process.start()

    print("Scraping process completed. Raw data saved in:", raw_data_dir)

def main():
    """Main function to manage scraping and RSS feed fetching."""
    config = load_config()

    # Run scraping
    scrape_data(config)

if __name__ == "__main__":
    print("Executing main script...")
    main()
