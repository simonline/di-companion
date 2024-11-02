#!/usr/bin/env python3

import os
import requests
import json

# Configurations
STRAPI_URL = 'https://api.di.sce.de/api'
API_TOKEN = '0dd8483b3276e682ca67d2e5601dbfffe21bbbd1daad583545d47babc93a56b66bfcad25e2623fd50bc748145a3843d9ec2edd3a390229308dd6ec2e831678bc78c318fcf1f1003ab858cee5eb317759e3f4c9eb7ff92028a6b090ee3f4a1024e137e9167bc0491f7cc45b4667ec53929c0fe186bfc29e36b1a919e7e85d4af3'

# Replace with your content type (e.g., 'products')
CONTENT_TYPE = 'patterns'
# Replace with the path to your images directory
DIRECTORY = './images'

HEADERS = {
    'Authorization': f'Bearer {API_TOKEN}',
}


def get_all_objects():
    """Fetch all objects from the specified content type."""
    url = f"{STRAPI_URL}/{CONTENT_TYPE}?pagination[pageSize]=100"
    response = requests.get(url, headers=HEADERS)
    response.raise_for_status()
    data = response.json()
    return data['data']


def upload_image(file_path):
    """Upload an image to Strapi and return its media ID."""
    url = f"{STRAPI_URL}/upload"
    filename = os.path.basename(file_path)
    with open(file_path, 'rb') as file_data:
        files = {'files': (filename, file_data, 'image/jpeg')}
        response = requests.post(url, files=files, headers=HEADERS)
        if not response.ok:
            import pdb
            pdb.set_trace()
    response.raise_for_status()
    data = response.json()
    return data[0]['id']


def update_object_image(object_id, image_id):
    """Update the object's image attribute with the uploaded image's media ID."""
    url = f"{STRAPI_URL}/{CONTENT_TYPE}/{object_id}"
    payload = {
        'data': {
            'image': image_id
        }
    }
    response = requests.put(
        url, headers={**HEADERS, 'Content-Type': 'application/json'}, json=payload)
    response.raise_for_status()
    return response.json()


def main():
    # Get all images in the directory
    images = [f for f in os.listdir(DIRECTORY) if f.lower().endswith('.jpg')]
    image_basenames = [os.path.splitext(f)[0] for f in images]
    images_linked = set()
    images_unlinked = set(image_basenames)

    # Get all objects from the content type
    objects = get_all_objects()

    objects_without_images = []

    for obj in objects:
        obj_id = obj['documentId']
        obj_name = obj['name']
        obj_image = obj.get('image', None)

        if obj_image is None:
            objects_without_images.append(obj_name)

        if obj_name in image_basenames:
            # There is an image matching this object's name
            # Construct the image filename
            image_filename = None
            for ext in ['.jpg', '.JPG']:
                filename = obj_name + ext
                if filename in images:
                    image_filename = filename
                    break
            if image_filename is None:
                print(f"Image file for {obj_name} not found.")
                continue
            image_path = os.path.join(DIRECTORY, image_filename)
            # Upload image
            try:
                image_id = upload_image(image_path)
                # Update object with image_id
                update_object_image(obj_id, image_id)
                print(
                    f"Updated object '{obj_name}' with image"
                )
                images_linked.add(obj_name)
                images_unlinked.discard(obj_name)
            except Exception as e:
                import pdb
                pdb.set_trace()
                print(f"Error uploading image for '{obj_name}': {e}")
        else:
            # No matching image for this object
            pass

    # Output lists
    print("\nObjects without images:")
    for obj_name in objects_without_images:
        if obj_name not in images_linked:
            print(f"- {obj_name}")

    print("\nImages that could not be linked:")
    for image_name in images_unlinked:
        print(f"- {image_name}")


if __name__ == "__main__":
    main()
