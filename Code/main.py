import json
from scrapy.crawler import CrawlerProcess
from eng_spider import EngSpider
import os


def load_config():
    """Load configuration from the JSON file."""
    try:
        with open("./Config/config.json", "r") as file:
            config = json.load(file)
        return config
    except FileNotFoundError:
        print("Error: Config file not found. Please ensure `config.json` exists in the Config folder.")
        exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse `config.json`. Please check the file's syntax.\n{e}")
        exit(1)


def main():
    """Run the Scrapy spider with the provided configuration."""
    # Load configuration
    config = load_config()

    # Ensure the logs directory exists
    logs_dir = "./Results/logs"
    os.makedirs(logs_dir, exist_ok=True)

    # Initialize and configure Scrapy process
    process = CrawlerProcess(settings={
        "USER_AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "LOG_LEVEL": "INFO",
        "LOG_FILE": os.path.join(logs_dir, "scrapy.log"),
        "ROBOTSTXT_OBEY": True,
        "RETRY_ENABLED": True,
        "RETRY_TIMES": 5,
        "RETRY_HTTP_CODES": [500, 503, 504, 400, 403, 408],
        "DOWNLOAD_TIMEOUT": 15,
        "DOWNLOAD_DELAY": 0.5,
        "CONCURRENT_REQUESTS": 8,
    })

    # Run the spider with the loaded configuration
    process.crawl(EngSpider, config=config)
    process.start()


if __name__ == "__main__":
    main()
