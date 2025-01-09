def clean_text(text):
    """Clean and normalize text."""
    if not text:
        return ""
    text = text.strip()
    phrases_to_remove = ["Quick Links", "© 1878 - Western University"]
    for phrase in phrases_to_remove:
        text = text.replace(phrase, "")
    return text


def extract_named_entities(paragraphs):
    """Extract named entities from paragraphs."""
    departments, locations, names = [], [], []

    for paragraph in paragraphs:
        if "Department" in paragraph or "Faculty" in paragraph:
            departments.append(paragraph)
        if "London" in paragraph or "Ontario" in paragraph:
            locations.append(paragraph)
        if "Dr." in paragraph or "Prof." in paragraph:
            names.append(paragraph)

    return {"departments": departments, "locations": locations, "names": names}
