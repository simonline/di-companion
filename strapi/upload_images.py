#!/usr/bin/env python3
import os
import requests
import json
import re

# Configurations
STRAPI_URL = 'https://api.di.sce.de/api'
API_TOKEN = '0dd8483b3276e682ca67d2e5601dbfffe21bbbd1daad583545d47babc93a56b66bfcad25e2623fd50bc748145a3843d9ec2edd3a390229308dd6ec2e831678bc78c318fcf1f1003ab858cee5eb317759e3f4c9eb7ff92028a6b090ee3f4a1024e137e9167bc0491f7cc45b4667ec53929c0fe186bfc29e36b1a919e7e85d4af3'
CONTENT_TYPE = 'patterns'
DIRECTORY = './images'

HEADERS = {
    'Authorization': f'Bearer {API_TOKEN}',
}

def get_all_patterns():
    """Fetch all patterns with their numbers and create ordered mapping."""
    url = f"{STRAPI_URL}/{CONTENT_TYPE}?pagination[pageSize]=100"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    patterns = response.json()['data']
    
    # Create ordered list of pattern numbers and their IDs
    pattern_data = []
    for pattern in patterns:
        pattern_data.append({
            'id': pattern['documentId'],
            'patternId': pattern['patternId'],
            'index': None  # Will be filled with corresponding image number
        })
    # sort by patternId
    pattern_data.sort(key=lambda x: x['patternId'])
    return pattern_data

def upload_image(file_path):
    """Upload an image to Strapi and return its media ID."""
    url = f"{STRAPI_URL}/upload"
    filename = os.path.basename(file_path)
    
    with open(file_path, 'rb') as file_data:
        files = {'files': (filename, file_data, 'image/jpeg')}
        response = requests.post(url, files=files, headers=HEADERS)
        if not response.ok:
            print(f"Failed to upload {filename}: {response.text}")
            return None
        data = response.json()
        return data[0]['id']

def update_pattern_image(pattern_id, image_id):
    """Update the pattern's image attribute with the uploaded image's media ID."""
    url = f"{STRAPI_URL}/{CONTENT_TYPE}/{pattern_id}"
    payload = {
        'data': {
            'image': image_id
        }
    }
    response = requests.put(
        url, 
        headers={**HEADERS, 'Content-Type': 'application/json'}, 
        json=payload
    )
    response.raise_for_status()
    return response.json()

def main():
    # Get all patterns
    patterns = get_all_patterns()
    
    # Sort and validate patterns
    print("Found patterns:")
    for pattern in patterns:
        print(f"- {pattern['patternId']}")
    
    # Get user confirmation
    input("\nPlease verify the pattern numbers above and press Enter to continue...")
    
    # Get image numbers from filenames
    images = []
    for filename in os.listdir(DIRECTORY):
        if filename.lower().startswith('rz-') and filename.lower().endswith('.jpg'):
            try:
                number = int(re.search(r'RZ-(\d+)\.jpg', filename, re.IGNORECASE).group(1))
                images.append((number, filename))
            except (ValueError, AttributeError):
                print(f"Warning: Could not parse image number from {filename}")
                continue
    
    # Sort images by number
    images.sort(key=lambda x: x[0])
    
    if len(images) != len(patterns):
        print(f"\nWarning: Number of images ({len(images)}) does not match number of patterns ({len(patterns)})")
        proceed = input("Do you want to continue? (y/n): ")
        if proceed.lower() != 'y':
            return
    
    print("\nProposed matching:")
    for i, ((image_num, image_file), pattern) in enumerate(zip(images, patterns)):
        print(f"Image RZ-{image_num}.jpg -> Pattern {pattern['patternId']}")
        pattern['index'] = image_num
    
    # Get final confirmation
    proceed = input("\nDoes this matching look correct? (y/n): ")
    if proceed.lower() != 'y':
        return
    
    # Process the matches
    successful = 0
    failed = []
    
    for pattern in patterns:
        if pattern['index'] is None:
            continue
            
        image_file = f"RZ-{pattern['index']}.jpg"
        image_path = os.path.join(DIRECTORY, image_file)
        
        try:
            print(f"\nProcessing {image_file} -> Pattern {pattern['patternId']}")
            
            # Upload image
            image_id = upload_image(image_path)
            if image_id:
                # Update pattern with image
                update_pattern_image(pattern['id'], image_id)
                print(f"Successfully linked {image_file} to pattern {pattern['patternId']}")
                successful += 1
            else:
                print(f"Failed to upload {image_file}")
                failed.append((image_file, pattern['patternId']))
                
        except Exception as e:
            print(f"Error processing {image_file}: {e}")
            failed.append((image_file, pattern['patternId']))
    
    # Print summary
    print("\nUpload Summary:")
    print(f"Total patterns: {len(patterns)}")
    print(f"Successfully processed: {successful}")
    print(f"Failed: {len(failed)}")
    
    if failed:
        print("\nFailed uploads:")
        for image_file, pattern_number in failed:
            print(f"- {image_file} -> {pattern_number}")

if __name__ == "__main__":
    main()
