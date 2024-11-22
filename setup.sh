#!/bin/bash

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Download SpaCy language model
python -m spacy download en_core_web_sm

echo "Setup complete. Activate your virtual environment with 'source venv/bin/activate'."
