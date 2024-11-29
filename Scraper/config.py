# Configuration for file generation and GCP bucket
BASE_URL = "https://www.eng.uwo.ca/undergraduate/programs/index.html"
OUTPUT_JSON_FILE = "undergraduate_programs_data.json"
OUTPUT_TXT_FILE = "undergraduate_programs_data.txt"

# Admission requirements data
ADMISSION_REQUIREMENTS = {
    "Chemical Engineering": {
        "Year 1 Average": "> 60%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Chem 1302A/B, ES 1050"
    },
    "Civil Engineering": {
        "Year 1 Average": "> 60%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Phys 1401A, ES 1022Y, ES 1021A/B"
    },
    "Electrical Engineering": {
        "Year 1 Average": "> 60%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Phys 1402B, ES 1036A/B"
    },
    "Integrated Engineering": {
        "Year 1 Average": "> 60%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Bus 1299E, Phys 1401A, Phys 1402B, ES 1022Y"
    },
    "Mechanical Engineering": {
        "Year 1 Average": "> 60%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Phys 1401A, ES 1022Y, ES 1021A/B"
    },
    "Mechatronics Engineering": {
        "Year 1 Average": "> 70%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Phys 1401A, Phys 1402B, ES 1022Y, ES 1036A/B, ES 1050"
    },
    "Software Engineering": {
        "Year 1 Average": "> 60%",
        "Required Courses": "NMM 1411A/B, NMM 1412A/B, NMM 1414A/B, Physics 1402A/B (60%), ES 1036A/B (70%)"
    },
    "Biomedical Engineering": {
        "Year 1 Average": "> 70%",
        "Required Courses": "All first-year curriculum requirements in the Faculty of Engineering."
    },
    "Artificial Intelligence Systems Engineering": {
        "Year 1 Average": "> 75%",
        "Required Courses": "All first-year curriculum requirements in the Faculty of Engineering."
    }
}
