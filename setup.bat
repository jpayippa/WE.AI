@echo off
REM Create a virtual environment
python -m venv venv
call venv\Scripts\activate

REM Upgrade pip
pip install --upgrade pip

REM Install dependencies
pip install -r requirements.txt

REM Download SpaCy language model
python -m spacy download en_core_web_sm

echo Setup complete. Activate your virtual environment with 'venv\Scripts\activate'.
