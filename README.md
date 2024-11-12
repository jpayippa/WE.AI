# WE.AI

WE.AI is an intelligent virtual assistant designed to provide students, faculty, and visitors of Western University with quick and accessible information about campus services, academic resources, and general inquiries. This project leverages the LLaMa2 language model to deliver accurate and context-specific responses. The data is collected through a custom web scraper and organized in a structured database to enhance training and querying.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
Students at Western University face challenges in navigating university information across various platforms. WE.AI addresses this by offering a single point of interaction for users to inquire about campus resources, services, events, and general information.

## Features
- **Text-based Interaction**: Users can ask questions related to Western University and receive prompt responses.
- **Database of University Data**: Information is sourced from the Western University website, particularly focused on the `eng.uwo.ca` domain for testing.
- **Custom Web Scraper**: The project includes a Python-based web scraper to extract and update information.
- **LLaMa2 Integration**: LLaMa2 is utilized as the language model, trained on Western-specific data to tailor responses.

## Tech Stack
- **Backend**: Python, MongoDB
- **Frontend**: React Native (for future mobile app integration)
- **Machine Learning Model**: LLaMa2 (Meta's large language model)
- **Scraping**: Python (BeautifulSoup, Requests)
- **Database**: MongoDB for flexible data storage

## Installation
To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/username/weai-assistant.git
   cd weai-assistant
   ```
2. Set up the environment: Ensure Python 3.x is installed and set up a virtual environment.
   ```python3 -m venv env
    source env/bin/activate   
    # On Windows, use `env\Scripts\activate`
     ```
3. Install dependencies:
     ```pip install -r requirements.txt```
4. Set up environment variables: Create a .env file with required configuration for database connection and any API keys.
5. Run the Web Scraper: To populate the database, run the web scraper to collect data from Western’s engineering subdomain.
      ```python uwo_spider.py```
6. Launch the backend: After scraping, you can start building and testing the backend API.
     ```python app.py   # Assuming Flask or a similar framework is used```


## Usage
1. Data Collection: Run uwo_spider.py to scrape and update data from eng.uwo.ca.
2. Training and Testing: Use the collected data to train the LLaMa2 model on the specifics of Western University.
3. AI Assistant Queries: Interact with WE.AI through a simple API or CLI tool (work in progress).
   
## Project Structure

```weai-assistant/
│
├── data/                   # Directory for raw and processed data
│   └── refined_eng_data.json
├── scripts/                # Web scraping and data handling scripts
│   └── uwo_spider.py
├── app/                    # Backend application code
│   ├── app.py              # Entry point for the backend
│   └── config.py           # Configuration for app settings
├── models/                 # Directory for training and storing ML models
│
├── .env                    # Environment variables (not included in version control)
├── .gitignore              # Git ignore file
├── README.md               # Project documentation
└── requirements.txt        # Python dependencies
```
## Contributing
We welcome contributions from the community! Please open issues for suggestions or report bugs, and feel free to submit pull requests for improvements or features.

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Commit your changes (git commit -am 'Add new feature').
4. Push to the branch (git push origin feature-branch).
5. Open a pull request.
   
## License
This project is licensed under the MIT License - see the LICENSE file for details.
