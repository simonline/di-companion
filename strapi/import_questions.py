import pandas as pd
import requests
import re
import json


def to_snake_case(s):
    """Convert a string to snake_case."""
    s = s.lower()
    s = re.sub(r'[\s-]+', '_', s)
    s = re.sub(r'[^a-z0-9_]', '', s)
    return s


# Strapi API configuration
STRAPI_URL = 'https://api.di.sce.de/api/questions'
API_TOKEN = '6e4197bca49df737136fcefdfce4f9c8c14242ba0eb7cb9610c48af7a88512f380acf965350d1498cb27e8839fe7a46f47c04fb24a287e883fd57b9b010d60bf995e1d308986b4a1a0a88c793e01c4e62fcdb67159f7971157bd9e648df44ec6d786b4af829a960383cd9013050c3efa3b82a97e65e716e9788f651e6051178d'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Read the CSV file
df = pd.read_csv('questions.csv')

# First, get all patterns to create a mapping of pattern names to IDs
pattern_id_map = {}
pattern_response = requests.get('https://api.di.sce.de/api/patterns', headers=headers, params={"pagination[pageSize]": 100})
if pattern_response.status_code == 200:
    patterns = pattern_response.json().get('data', [])
    for pattern in patterns:
        pattern_id = pattern['documentId']
        name = pattern['patternId']
        if name and pattern_id:
            pattern_id_map[name.strip().lower()] = pattern_id
else:
    print(f"Failed to fetch patterns: {pattern_response.text}")

# Process questions
for index, row in df.iterrows():
    # Process categories
    categories = []
    if pd.notna(row['categories']):
        category_list = [cat.strip() for cat in str(row['categories']).split(',')]
        categories = [to_snake_case(cat) for cat in category_list]

    # Process phases
    phases = []
    if pd.notna(row['phases']):
        phase_list = [phase.strip() for phase in str(row['phases']).split(',')]
        phases = [phase for phase in phase_list if phase]

    # Process related patterns
    related_pattern_ids = []
    if pd.notna(row['patterns']):
        pattern_list = [p.strip() for p in str(row['patterns']).split(',')]
        for pattern_name in pattern_list:
            if not pattern_name:
                continue
            if '–' not in pattern_name:
                pattern_name = pattern_name[0] + '–' + pattern_name[1:]
            if len(pattern_name) == 3:
                pattern_name = pattern_name[:1] + '–0' + pattern_name[2:]
            pattern_id = pattern_id_map.get(pattern_name.strip().lower())
            if pattern_id:
                related_pattern_ids.append(pattern_id)
            else:
                print(f"Pattern '{pattern_name}' not found for question '{row['question']}'")

    # Process options
    options = None
    if pd.notna(row['options']):
        try:
            options = json.loads(str(row['options']))
        except json.JSONDecodeError:
            print(f"Invalid JSON in options for question '{row['question']}'")

    # Construct the data payload
    payload = {
        'data': {
            'question': row['question'],
            'survey': row['survey'] if pd.notna(row['survey']) else None,
            'type': row['type'],
            'isHidden': row['isHidden'].lower() == 'yes' if pd.notna(row['isHidden']) else False,
            'maxLength': row['maxLength'] if pd.notna(row['maxLength']) else None,
            'options': options,
            'helpText': row['helpText'] if pd.notna(row['helpText']) else None,
            'showRequestCoach': row['showRequestCoach'].lower() == 'yes' if pd.notna(row['showRequestCoach']) else False,
            'categories': categories,
            'phases': phases,
            'patterns': related_pattern_ids
        }
    }

    # Send POST request to create the question
    response = requests.post(STRAPI_URL, json=payload, headers=headers)
    if response.status_code in [200, 201]:
        question_data = response.json()
        question_id = question_data['data']['id']
        print(f"Created question '{row['question']}' with ID {question_id}")
    else:
        print(f"Failed to create question '{row['question']}': {response.text}")
