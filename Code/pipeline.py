import subprocess
import logging
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

def main():
    """Main function to execute the full pipeline."""
    stages = [
        {"name": "Scraping", "script": "./Code/main.py"},
        {"name": "Cleaning", "script": "./Code/data_cleaning.py"},
        {"name": "Validation", "script": "./Code/data_validation.py"},
        # Additional stages like transformation, model training, etc., can be added here.
    ]

    for stage in stages:
        try:
            run_stage(stage["name"], stage["script"])
        except RuntimeError as e:
            logging.error(f"Pipeline stopped due to failure in {stage['name']} stage.")
            return
    
    logging.info("Pipeline execution completed successfully.")

if __name__ == "__main__":
    logging.info("Starting pipeline...")
    main()
    logging.info("Pipeline completed.")
