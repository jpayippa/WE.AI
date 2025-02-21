import subprocess
import logging
import argparse
import os

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def run_stage(stage_name, script_path):
    """Run a specific stage of the pipeline."""
    logging.info(f"Starting {stage_name} stage...")
    result = subprocess.run(["python", script_path], capture_output=True, text=True)
    if result.returncode == 0:
        logging.info(f"{stage_name} stage completed successfully.")
    else:
        logging.error(f"Error during {stage_name} stage.")
        logging.error(f"Error Output: {result.stderr}")
        raise RuntimeError(f"{stage_name} stage failed.")

def main(stage=None):
    """Main function to execute the pipeline stages."""
    stages = {
        "scraping": {"name": "Scraping", "script": "./Code/main.py"},
        "rss": {"name": "RSS Fetching", "script": "./Code/rss_fetcher.py"},
        "cleaning": {"name": "Cleaning", "script": "./Code/data_cleaning.py"},
        "validation": {"name": "Validation", "script": "./Code/data_validation.py"}
    }

    if stage:
        if stage not in stages:
            logging.error(f"Invalid stage specified: {stage}")
            return
        # Run only the specified stage
        try:
            run_stage(stages[stage]["name"], stages[stage]["script"])
        except RuntimeError:
            logging.error(f"Pipeline stopped due to failure in {stages[stage]['name']} stage.")
            return
    else:
        # Run all stages in sequence
        for stage_key, stage_info in stages.items():
            try:
                run_stage(stage_info["name"], stage_info["script"])
            except RuntimeError:
                logging.error(f"Pipeline stopped due to failure in {stage_info['name']} stage.")
                return
    
    logging.info("Pipeline execution completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the pipeline or specific stages.")
    parser.add_argument(
        "--stage",
        choices=["scraping", "rss", "cleaning", "validation"],
        help="Specify the stage of the pipeline to execute. If not provided, the full pipeline will be executed.",
    )
    args = parser.parse_args()

    logging.info("Starting pipeline...")
    main(stage=args.stage)
    logging.info("Pipeline completed.")
