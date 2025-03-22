# WE.AI – Western Engineering AI Assistant

[![Capstone Presentation – WE.AI](https://img.youtube.com/vi/qVxx_RitFgc/0.jpg)](https://youtu.be/qVxx_RitFgc)

WE.AI is a custom AI assistant built for Western Engineering students, faculty, and visitors. It is designed to deliver precise and context-aware answers about university policies, academic resources, and campus services using domain-specific data.

## 🚀 Current Status

WE.AI currently uses **Dialogflow CX** on **Google Cloud Vertex AI** as the primary backend for its virtual agent. This version loads structured text files (scraped from uwo.ca subdomains) to respond to user queries. Although it does not yet utilize the fine-tuned LLM, it demonstrates the full functionality of the product pipeline — from data ingestion to deployment.

## 🧠 Next Steps

We are now transitioning toward **training and deploying a fine-tuned LLM** to replace the Dialogflow agent. This model will be trained on the same domain-specific data for significantly improved performance, flexibility, and depth of understanding.

## 📂 Project Structure

WE.AI/ │ 
       ├── Scraping/ # Web scraping scripts to extract data from uwo.ca 
       ├── Backend/ # Logic for structuring and formatting scraped content 
       ├── Server/ # API & integration services 
       ├── frontend/ # Next.js-based web interface for students/faculty 
       ├── .gitignore 
       ├── Readme.md


## 🛠️ Tech Stack

- **Frontend**: Next.js
- **Backend/API**: Node.js
- **Data Handling**: Python (BeautifulSoup, Requests)
- **Deployment**: Google Cloud Vertex AI
- **AI Agent**: Dialogflow CX (soon to be replaced with a fine-tuned LLM)

## 📄 Data Pipeline

1. **Scraping** – Custom web scrapers pull updated data from uwo.ca
2. **Preprocessing** – Structured into clean text files with key metadata
3. **Dialogflow Agent** – Loads data for intent and entity matching
4. **LLM (Next Phase)** – Train a domain-specific model for enhanced conversational capabilities

## 🔜 Future Goals

- Complete fine-tuning of Mistral 7B or another performant open-source model
- Replace Dialogflow with a custom LLM backend hosted on Vertex AI
- Add persistent user context and session memory
- Launch mobile app companion for on-the-go queries

## 🎓 Capstone Info

This project was developed as part of the final year **Software Engineering Capstone Design Project** at Western University.

## 📽️ Demo Presentation

Click the image below to watch our capstone presentation on YouTube:

[![Watch Presentation](https://img.youtube.com/vi/qVxx_RitFgc/0.jpg)](https://youtu.be/qVxx_RitFgc)

---

Feel free to contribute or follow along as WE.AI evolves from a proof-of-concept into a scalable AI product for academic institutions.
