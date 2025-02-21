import os
import json
import logging
from google.cloud import aiplatform

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def upload_data_to_gcs(local_path, bucket_name, destination_blob_name):
    """Uploads a file to Google Cloud Storage."""
    from google.cloud import storage
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(local_path)
    logging.info("Uploaded %s to gs://%s/%s", local_path, bucket_name, destination_blob_name)

def submit_vertex_ai_training_job(project, location, model_name, gcs_train_data, output_dir):
    """Submits a training job to Vertex AI."""
    aiplatform.init(project=project, location=location)
    job = aiplatform.CustomTrainingJob(
        display_name="mistral-7b-finetune",
        script_path="train_script.py",
        container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-12:latest",
        model_serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/pytorch-gpu.1-12:latest",
    )
    
    model = job.run(
        dataset=gcs_train_data,
        base_output_dir=output_dir,
        replica_count=1,
        machine_type="n1-standard-8",
        accelerator_type="NVIDIA_TESLA_T4",
        accelerator_count=1,
    )
    
    logging.info("Training job submitted successfully.")
    return model

def main():
    project = "your-gcp-project-id"
    location = "us-central1"
    model_name = "mistralai/Mistral-7B"
    bucket_name = "your-gcs-bucket"
    gcs_train_data = f"gs://{bucket_name}/validated_data.jsonl"
    output_dir = f"gs://{bucket_name}/model_output"
    
    local_dataset_path = "./Data/validated/validated_data.jsonl"
    
    upload_data_to_gcs(local_dataset_path, bucket_name, "validated_data.jsonl")
    submit_vertex_ai_training_job(project, location, model_name, gcs_train_data, output_dir)

if __name__ == "__main__":
    logging.info("Starting Vertex AI model training pipeline...")
    main()
    logging.info("Vertex AI model training pipeline completed.")
