import feedparser
import json
import os
import logging
from datetime import datetime

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def load_config():
    """Load configuration from the JSON file."""
    try:
        with open("./Config/config.json", "r") as file:
            config = json.load(file)
        return config
    except FileNotFoundError:
        logging.error("Config file not found. Please ensure 'config.json' exists in the Config folder.")
        exit(1)
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse 'config.json'. Error: {e}")
        exit(1)

def fetch_rss_feeds(config):
    """Fetch and parse RSS feeds based on the provided configuration."""
    rss_feeds = config.get("rss_feeds", [])
    if not rss_feeds:
        logging.warning("No RSS feeds specified in the configuration.")
        return []

    logging.info("Fetching RSS feeds...")
    rss_data = []

    for feed_url in rss_feeds:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                rss_data.append({
                    "title": entry.get("title", "").strip(),
                    "link": entry.get("link", "").strip(),
                    "published": entry.get("published", "").strip(),
                    "summary": entry.get("summary", "").strip(),
                })
        except Exception as e:
            logging.error(f"Failed to fetch or parse feed: {feed_url}. Error: {e}")
    
    logging.info(f"Fetched {len(rss_data)} entries from RSS feeds.")
    return rss_data

def save_rss_data(rss_data, output_folder):
    """Save RSS data to a JSON file."""
    os.makedirs(output_folder, exist_ok=True)
    output_file = os.path.join(output_folder, f"rss_data_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(rss_data, file, indent=4)
    logging.info(f"RSS data saved to {output_file}")

def main():
    """Main function to fetch and save RSS feed data."""
    config = load_config()
    output_folder = config.get("output_folder", "./Data/rss")
    rss_data = fetch_rss_feeds(config)
    if rss_data:
        save_rss_data(rss_data, output_folder)

if __name__ == "__main__":
    logging.info("Starting RSS feed fetching process...")
    main()
    logging.info("RSS feed fetching process completed.")
