import os
import json
import logging
from google.cloud import firestore

class StorageUtil:
    def __init__(self, credentials_path=None, firestore_collection=None):
        self.firestore_collection = firestore_collection

        if credentials_path:
            if not os.path.exists(credentials_path):
                raise FileNotFoundError(f"Google credentials not found at {credentials_path}")
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
            self.firestore_client = firestore.Client()
        else:
            self.firestore_client = None

    def save_to_firestore(self, doc_id, data):
        """Save data to Firestore."""
        if not self.firestore_client or not self.firestore_collection:
            logging.error("Firestore client not initialized.")
            return

        try:
            self.firestore_client.collection(self.firestore_collection).document(doc_id).set(data)
            logging.info(f"Saved document to Firestore: {doc_id}")
        except Exception as e:
            logging.error(f"Error saving to Firestore: {str(e)}")

    def save_to_json(self, output_folder, filename, data):
        """Save data to JSON files locally."""
        os.makedirs(output_folder, exist_ok=True)
        filepath = os.path.join(output_folder, filename)
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)
        logging.info(f"Saved data to {filepath}")
