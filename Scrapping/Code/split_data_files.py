import os
import json

def split_json_file(input_file, output_folder, max_size_kb=1000):
    """
    Splits a large JSON file into smaller files, each approximately max_size_kb in size.
    Ensures that individual records (objects) are never split across files.
    """
    os.makedirs(output_folder, exist_ok=True)

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Convert max size to bytes
    max_size_bytes = max_size_kb * 1024

    parts = []
    current_part = []
    current_size = 0

    for record in data:
        record_str = json.dumps(record, ensure_ascii=False, indent=4)
        record_size = len(record_str.encode('utf-8'))

        if current_size + record_size > max_size_bytes:
            # Save the current part
            parts.append(current_part)
            current_part = []
            current_size = 0

        current_part.append(record)
        current_size += record_size

    # Add the final part if not empty
    if current_part:
        parts.append(current_part)

    # Write each part to a separate file
    for idx, part in enumerate(parts):
        output_file = os.path.join(output_folder, f'split_data_part_1_{idx+1}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(part, f, indent=4, ensure_ascii=False)

    print(f"Split completed into {len(parts)} files.")

if __name__ == "__main__":
    input_file = './Data/split/split_data_part_1a.json'  # Adjust to your actual file
    output_folder = './Data/split/p1'
    max_size_kb = 1000  # 10 MB per file

    split_json_file(input_file, output_folder, max_size_kb)
