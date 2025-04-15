import pandas as pd
import requests
import re


def to_snake_case(s):
    """Convert a string to snake_case."""
    s = s.lower()
    s = re.sub(r'[\s-]+', '_', s)
    s = re.sub(r'[^a-z0-9_]', '', s)
    return s


# Strapi API configuration
STRAPI_URL = 'https://api.di.sce.de/api/methods'
API_TOKEN = '6e4197bca49df737136fcefdfce4f9c8c14242ba0eb7cb9610c48af7a88512f380acf965350d1498cb27e8839fe7a46f47c04fb24a287e883fd57b9b010d60bf995e1d308986b4a1a0a88c793e01c4e62fcdb67159f7971157bd9e648df44ec6d786b4af829a960383cd9013050c3efa3b82a97e65e716e9788f651e6051178d'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Read the CSV file
df = pd.read_csv('methods.csv')

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

# Process methods
for index, row in df.iterrows():
    # Process categories
    categories = []
    if pd.notna(row['Categories']):
        category_list = [cat.strip() for cat in str(row['Categories']).split(',')]
        categories = [to_snake_case(cat) for cat in category_list]

    # Process phases
    phases = []
    if pd.notna(row['Phases']):
        phase_list = [phase.strip() for phase in str(row['Phases']).split(',')]
        phases = [phase for phase in phase_list if phase]

    # Process related patterns
    related_pattern_ids = []
    if pd.notna(row['Patterns']):
        # Replace - with – in the patterns string
        patterns_str = str(row['Patterns']).replace('-', '–')
        # Split by either ", " or ","
        pattern_list = [p.strip() for p in re.split(r',\s*|,\s*', patterns_str)]
        for pattern_name in pattern_list:
            if not pattern_name:
                continue
            # If there's no – in the pattern name, add it after the first char
            if '–' not in pattern_name:
                pattern_name = pattern_name[0] + '–' + pattern_name[1:]
            pattern_id = pattern_id_map.get(pattern_name.strip().lower())
            if pattern_id:
                related_pattern_ids.append(pattern_id)
            else:
                print(f"Pattern '{pattern_name}' not found for method '{row['Method']}'")

    # Construct the data payload
    payload = {
        'data': {
            'name': row['Method'],
            'categories': categories,
            'phases': phases,
            'patterns': related_pattern_ids,
            'url': row['Link'] if pd.notna(row['Link']) else None
        }
    }

    # Send POST request to create the method
    response = requests.post(STRAPI_URL, json=payload, headers=headers)
    if response.status_code in [200, 201]:
        method_data = response.json()
        method_id = method_data['data']['id']
        print(f"Created method '{row['Method']}' with ID {method_id}")
    else:
        print(f"Failed to create method '{row['Method']}': {response.text}")
