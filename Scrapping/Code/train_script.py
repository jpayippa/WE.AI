import os
import json
import torch
import argparse
import logging
import datasets
from transformers import TrainingArguments, Trainer, AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from google.cloud import storage
from accelerate import infer_auto_device_map, dispatch_model
from transformers import BitsAndBytesConfig  # Import for 4-bit quantization

# Enable CUDA debugging
os.environ["CUDA_LAUNCH_BLOCKING"] = "1"  # Ensures CUDA errors appear at the exact location

# Initialize logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def upload_model_to_gcs(local_path, bucket_name, destination_blob_name):
    """Uploads the fine-tuned model to Google Cloud Storage (GCS)."""
    logging.info(f"Uploading fine-tuned model to GCS: gs://{bucket_name}/{destination_blob_name}...")

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_path)
        logging.info("Model uploaded successfully.")
    except Exception as e:
        logging.error(f"Model upload failed: {e}")
        exit(1)

def load_dataset(data_path):
    """Loads dataset from JSONL file."""
    logging.info(f"📥 Loading dataset from {data_path}...")

    try:
        dataset = datasets.load_dataset("json", data_files=data_path, split="train")
    except Exception as e:
        logging.error(f"Failed to load dataset: {e}")
        exit(1)

    # Validate dataset structure
    required_columns = ["input", "output"]
    for col in required_columns:
        if col not in dataset.column_names:
            logging.error(f"Dataset missing '{col}' column. Ensure JSONL is formatted correctly.")
            exit(1)

    return dataset

def preprocess_function(examples, tokenizer, max_length=1024):
    """Tokenizes dataset entries while ensuring correct format."""

    # # Ensure padding token exists
    # if tokenizer.pad_token is None:
    #     tokenizer.pad_token = tokenizer.eos_token  
    # Ensure the tokenizer has a padding token
    if tokenizer.pad_token is None:
        tokenizer.add_special_tokens({"pad_token": "[PAD]"})  # Add a custom PAD token if missing

    combined_texts = [inp + " " + out for inp, out in zip(examples["input"], examples["output"])]

    tokenized_outputs = tokenizer(
        combined_texts, 
        padding="max_length",
        truncation=True,
        max_length=max_length,
        return_tensors="pt"  # Change to PyTorch tensors for GPU compatibility
    )

    return {
        "input_ids": tokenized_outputs["input_ids"].tolist(),
        "attention_mask": tokenized_outputs["attention_mask"].tolist()
    }

def fine_tune(model_name, train_data, output_dir, gcs_bucket):
    """Fine-tunes the model."""

    # Retrieve Hugging Face API Token securely
    hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

    if not hf_token:
        logging.error("HUGGINGFACEHUB_API_TOKEN not set in environment.")
        exit(1)

    # Correct Model Identifier
    model_name = "mistralai/Mistral-7B-v0.1"

    logging.info(f"loading tokenizer for model {model_name} with authentication...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)

    # Ensure the tokenizer has a padding token
    if tokenizer.pad_token is None:
        tokenizer.add_special_tokens({"pad_token": "[PAD]"})  # Add a custom PAD token if missing

    # Load dataset
    dataset = load_dataset(train_data)
    dataset = dataset.map(lambda x: preprocess_function(x, tokenizer), batched=True)

    # Move dataset to GPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logging.info(f"Running on: {device}")

    # for batch in dataset:
    #     batch["input_ids"] = torch.tensor(batch["input_ids"]).to(device)
    #     batch["attention_mask"] = torch.tensor(batch["attention_mask"]).to(device)

    # **FIX**: Correct max_memory format
    if torch.cuda.is_available():
        num_gpus = torch.cuda.device_count()
        max_memory = {i: 24 * 1024**3 for i in range(num_gpus)}  # Correct format  
    else:
        max_memory = {"cpu": 32 * 1024**3}  # Correct format

    logging.info(f"🖥️ Allocating max memory: {max_memory}")

    # **🚀 Apply 4-bit Quantization for Efficiency**
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,  # Enables 4-bit training
        bnb_4bit_quant_type="nf4",  # Normalized Float (NF4) is best for LLMs
        bnb_4bit_compute_dtype=torch.bfloat16,  # Use bf16 for stability
        bnb_4bit_use_double_quant=True  # Further reduces memory usage
    )


    logging.info("Loading model...")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16,  # Switch to bf16 for stability
        quantization_config=quantization_config,
        device_map="auto",
        token=hf_token
    )
    # **Prepare model for LoRA training**
    model = prepare_model_for_kbit_training(model)  # Optimizes for low-bit training

    # Apply LoRA (Low-Rank Adaptation)
    peft_config = LoraConfig(
        r=32,
        lora_alpha=64,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.1,
        bias="none"
    )
    model = get_peft_model(model, peft_config)
    model.gradient_checkpointing_enable()  # Enable gradient checkpointing for memory efficiency
    # model = dispatch_model(model, device_map="auto") 

    # Move model to GPU
    # model.to(device)

    # # Ensure all layers are on GPU
    # for name, param in model.named_parameters():
    #     if param.device == torch.device("cpu"):
    #         logging.warning(f"{name} is still on CPU! Moving to GPU...")
    #         param.data = param.data.to(device)
    #         param.grad = param.grad.to(device) if param.grad is not None else None

    # Training Arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=16,
        num_train_epochs=3,
        save_strategy="epoch",
        save_total_limit=2,
        logging_dir=f"{output_dir}/logs",
        logging_steps=10,
        report_to="none",
        optim="adamw_torch_fused",
        fp16=False,  # Disable fp16
        bf16=True,   # Enable bf16
        evaluation_strategy="no",
        eval_steps=None,
        gradient_checkpointing=True,  # Enable gradient checkpointing
    )

    # Trainer Setup
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        tokenizer=tokenizer,
    )

    logging.info("Starting fine-tuning...")

    try:
        trainer.train()
    except Exception as e:
        logging.error(f"Training crashed: {e}")
        logging.info("Saving checkpoint before exiting...")
        trainer.save_model(output_dir)  # Save model checkpoint
        exit(1)  

    # Save the fine-tuned model locally
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    # Compress model for upload
    compressed_model_path = f"{output_dir}/model.tar.gz"
    os.system(f"tar -czvf {compressed_model_path} -C {output_dir} .")

    # Upload model to GCS
    upload_model_to_gcs(compressed_model_path, gcs_bucket, "fine_tuned_model.tar.gz")

    logging.info(f"Fine-tuning completed! Model saved to {output_dir} and uploaded to GCS.")

def main():
    parser = argparse.ArgumentParser(description="Fine-tune Mistral-7B on Vertex AI")
    parser.add_argument("--train_data", type=str, required=True, help="Path to training dataset")
    parser.add_argument("--output_dir", type=str, required=True, help="Path to save the fine-tuned model")
    parser.add_argument("--gcs_bucket", type=str, required=True, help="GCS bucket for saving model")
    args = parser.parse_args()

    print(f"Training Data: {args.train_data}")
    print(f"Output Dir: {args.output_dir}")
    print(f"GCS Bucket: {args.gcs_bucket}")

    os.makedirs(args.output_dir, exist_ok=True)
    fine_tune("mistralai/Mistral-7B-v0.1", args.train_data, args.output_dir, args.gcs_bucket)

if __name__ == "__main__":
    logging.info("Starting the fine-tuning script...")
    main()
    logging.info("Fine-tuning script completed.")
