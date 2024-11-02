import pdb
import pandas as pd
import requests
import re


def to_snake_case(s):
    """Convert a string to snake_case."""
    s = s.lower()
    s = re.sub(r'[\s-]+', '_', s)
    s = re.sub(r'[^a-z0-9_]', '', s)
    return s


# Mapping of phase numbers to phase names
phase_mapping = {
    '1': 'start',
    '2': 'discover_explore',
    '3': 'transform',
    '4': 'create',
    '5': 'implement'
}

# Strapi API configuration
STRAPI_URL = 'https://api.di.sce.de/api/patterns'
API_TOKEN = '0dd8483b3276e682ca67d2e5601dbfffe21bbbd1daad583545d47babc93a56b66bfcad25e2623fd50bc748145a3843d9ec2edd3a390229308dd6ec2e831678bc78c318fcf1f1003ab858cee5eb317759e3f4c9eb7ff92028a6b090ee3f4a1024e137e9167bc0491f7cc45b4667ec53929c0fe186bfc29e36b1a919e7e85d4af3'

headers = {
    'Authorization': f'Bearer {API_TOKEN}',
    'Content-Type': 'application/json'
}

# Read the Excel file
excel_file = 'patterns.xlsx'

df_base = pd.read_excel(excel_file, sheet_name='Base')
df_desc = pd.read_excel(excel_file, sheet_name='Desc')

# Merge dataframes on 'Name', strip whitespace from 'Name' column
df = pd.merge(df_base, df_desc, on='Name', how='left')


# First pass: Create patterns without relatedPatterns
payloads = []
for index, row in df.iterrows():
    print(row)
    name = row['Name'].strip()
    description = row['Description'].strip()
    phase_str = str(row['Phase']).strip()
    category = row['Category']
    category_snake_case = to_snake_case(str(category))

    # Process phases
    phases = phase_str.split(';')
    phase_values = []
    for p in phases:
        p = p.strip()
        if p in phase_mapping:
            phase_values.append(phase_mapping[p])
        else:
            print(f"Unknown phase number '{p}' for pattern '{name}'")

    # Construct the data payload
    payloads.append({
        'data': {
            'name': name,
            'description': description,
            'phases': phase_values,
            'categories': [category_snake_case]
        }
    })

for payload in payloads:
    name = payload['data']['name']
    # Send POST request to create the pattern
    response = requests.post(STRAPI_URL, json=payload, headers=headers)
    if response.status_code in [200, 201]:
        pattern_data = response.json()
        pattern_id = pattern_data['data']['id']
        print(f"Created pattern '{name}' with ID {pattern_id}")
    else:
        print(f"Failed to create pattern '{name}': {response.text}")

# Initialize a mapping of pattern names to their Strapi IDs
pattern_id_map = {}

response = requests.get(STRAPI_URL, headers=headers, params={
                        "pagination[pageSize]": 100})
if response.status_code == 200:
    patterns = response.json().get('data', [])
    for pattern in patterns:
        pattern_id = pattern['documentId']
        name = pattern['name']
        if name and pattern_id:
            pattern_id_map[name.strip().lower()] = pattern_id
else:
    print(f"Failed to fetch patterns: {response.text}")
print(pattern_id_map)
# Second pass: Update patterns with relatedPatterns
related_payloads = []
for index, row in df.iterrows():
    name = row['Name'].strip().lower()
    pattern_id = pattern_id_map.get(name)
    if not pattern_id:
        print(f"Pattern ID not found for '{name}'")
        continue

    related_patterns_str = str(row['relatedPatterns'])
    if pd.isna(related_patterns_str) or related_patterns_str.strip() == '' or related_patterns_str.strip() == 'nan':
        # No related patterns to process
        continue

    related_pattern_names = related_patterns_str.split(' – ')
    related_pattern_ids = []
    for rp_name in related_pattern_names:
        rp_name = rp_name.strip().lower()
        rp_id = pattern_id_map.get(rp_name)
        if rp_id:
            related_pattern_ids.append(rp_id)
        else:
            print(
                f"Related pattern '{rp_name}' not found for pattern '{name}'"
            )

    if related_pattern_ids:
        # Construct the data payload to update the pattern
        related_payloads.append((
            pattern_id,
            {
                'data': {
                    'relatedPatterns': related_pattern_ids
                }
            }))

for pattern_id, payload in related_payloads:
    # Send PUT request to update the pattern
    url = f"{STRAPI_URL}/{pattern_id}"
    response = requests.put(url, json=payload, headers=headers)
    if response.status_code in [200, 201]:
        print(f"Updated pattern with related patterns")
    else:
        print(f"Failed to update pattern: {response.text}")
