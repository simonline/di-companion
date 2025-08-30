"""
WebDAV storage service for Hetzner Storage Box
"""

import os
import io
import uuid
import mimetypes
from typing import Optional, Dict, BinaryIO, Tuple
from datetime import datetime, timedelta
import requests
from requests.auth import HTTPBasicAuth
import hashlib
import jwt

class StorageService:
    """Service for managing file uploads to Hetzner Storage Box via WebDAV"""
    
    def __init__(self):
        # Use existing env variables, just reinterpret them for WebDAV
        self.base_url = os.getenv('HETZNER_S3_ENDPOINT', 'https://u456678.your-storagebox.de')
        self.username = os.getenv('HETZNER_ACCESS_KEY', 'u456678-sub2')
        self.password = os.getenv('HETZNER_SECRET_KEY')
        self.base_path = f"/{os.getenv('HETZNER_BUCKET', 'didc')}"
        
        # Auth for requests
        self.auth = HTTPBasicAuth(self.username, self.password)
        
        # Secret for signed URLs
        self.url_secret = os.getenv('URL_SIGNING_SECRET', 'di-companion-secret-key')
        
        # Compatibility attributes for existing code
        self.bucket_name = os.getenv('HETZNER_BUCKET', 'didc')
        self.endpoint_url = self.base_url
        
        # Initialize base directory
        self._ensure_base_directory()
    
    def _ensure_base_directory(self):
        """Create base directory if it doesn't exist"""
        try:
            response = requests.request(
                'MKCOL',
                f"{self.base_url}{self.base_path}",
                auth=self.auth,
                timeout=5
            )
            # 201 = created, 405 = already exists, both are OK
        except:
            pass  # Directory might already exist
    
    def generate_s3_key(
        self,
        filename: str,
        category: str = 'general',
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None
    ) -> str:
        """
        Generate a structured path for file organization
        
        Format: /bucket/category/entity_type/entity_id/YYYY/MM/timestamp_uuid_filename
        """
        # Clean filename
        safe_filename = "".join(c for c in filename if c.isalnum() or c in '.-_')
        
        # Generate unique identifier
        unique_id = str(uuid.uuid4())[:8]
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Build path components (without base_path as it's added later)
        path_parts = [category]
        
        if entity_type:
            path_parts.append(entity_type)
            if entity_id:
                path_parts.append(str(entity_id))
        
        # Add date organization
        now = datetime.now()
        path_parts.extend([str(now.year), f"{now.month:02d}"])
        
        # Add filename with unique identifier
        path_parts.append(f"{timestamp}_{unique_id}_{safe_filename}")
        
        return "/".join(path_parts)
    
    def upload_file(
        self,
        file: BinaryIO,
        filename: str,
        category: str = 'general',
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        content_type: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Upload a file via WebDAV
        
        Returns:
            Dict with upload details (s3_key, s3_url, etag, size, etc.)
        """
        # Generate storage key (compatible with S3 naming)
        s3_key = self.generate_s3_key(filename, category, entity_type, entity_id)
        
        # Full WebDAV path
        full_path = f"{self.base_path}/{s3_key}"
        full_url = f"{self.base_url}{full_path}"
        
        # Detect content type if not provided
        if not content_type:
            content_type, _ = mimetypes.guess_type(filename)
            content_type = content_type or 'application/octet-stream'
        
        # Read file content
        file_content = file.read()
        file_size = len(file_content)
        
        # Calculate MD5 hash
        md5_hash = hashlib.md5(file_content).hexdigest()
        
        # Create parent directories
        self._create_parent_directories(full_path)
        
        # Prepare headers
        headers = {
            'Content-Type': content_type,
            'Content-Length': str(file_size),
        }
        
        # Add metadata as custom headers
        if metadata:
            for key, value in metadata.items():
                headers[f'X-Meta-{key}'] = str(value)
        
        # Upload via PUT
        response = requests.put(
            full_url,
            data=file_content,
            auth=self.auth,
            headers=headers,
            timeout=30
        )
        
        if response.status_code not in [200, 201, 204]:
            raise Exception(f"Upload failed: {response.status_code} - {response.text}")
        
        # Return S3-compatible response
        return {
            'bucket': self.bucket_name,
            's3_key': s3_key,
            's3_url': full_url,
            'etag': md5_hash,  # Use MD5 as ETag
            'size_bytes': file_size,
            'content_type': content_type,
            'md5_hash': md5_hash,
            'uploaded_at': datetime.now().isoformat()
        }
    
    def _create_parent_directories(self, full_path: str):
        """Create parent directories recursively"""
        parts = full_path.split('/')[:-1]  # Exclude filename
        current_path = ""
        
        for part in parts:
            if not part:
                continue
            current_path = f"{current_path}/{part}" if current_path else f"/{part}"
            
            try:
                requests.request(
                    'MKCOL',
                    f"{self.base_url}{current_path}",
                    auth=self.auth,
                    timeout=5
                )
            except:
                pass  # Directory might already exist
    
    def generate_presigned_url(
        self,
        s3_key: str,
        expires_in: int = 3600,
        response_content_type: Optional[str] = None
    ) -> str:
        """
        Generate a signed URL for secure file access
        
        Args:
            s3_key: The storage path
            expires_in: URL expiration time in seconds (default: 1 hour)
            response_content_type: Override Content-Type header in response
        
        Returns:
            Signed URL string for API proxy endpoint
        """
        expiry = datetime.utcnow() + timedelta(seconds=expires_in)
        
        payload = {
            'path': s3_key,
            'exp': expiry.timestamp(),
        }
        
        if response_content_type:
            payload['content_type'] = response_content_type
        
        token = jwt.encode(payload, self.url_secret, algorithm='HS256')
        
        # Return URL to API endpoint that will validate and proxy
        api_base = os.getenv('API_BASE_URL', 'http://localhost:8000')
        return f"{api_base}/api/files/access/{token}"
    
    def generate_presigned_post(
        self,
        s3_key: str,
        expires_in: int = 3600,
        max_file_size: int = 10 * 1024 * 1024,  # 10MB default
        content_type: Optional[str] = None
    ) -> Dict:
        """
        Generate data for direct browser uploads via API proxy
        
        Returns:
            Dict with upload endpoint and authorization
        """
        # For WebDAV, we'll use an API endpoint that proxies the upload
        expiry = datetime.utcnow() + timedelta(seconds=expires_in)
        
        upload_token = jwt.encode(
            {
                'path': s3_key,
                'exp': expiry.timestamp(),
                'max_size': max_file_size,
                'content_type': content_type
            },
            self.url_secret,
            algorithm='HS256'
        )
        
        api_base = os.getenv('API_BASE_URL', 'http://localhost:8000')
        
        return {
            'url': f"{api_base}/api/files/upload",
            'fields': {
                'token': upload_token,
                'key': s3_key
            }
        }
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from storage
        
        Returns:
            True if successful, False otherwise
        """
        try:
            full_path = f"{self.base_path}/{s3_key}"
            full_url = f"{self.base_url}{full_path}"
            
            response = requests.delete(
                full_url,
                auth=self.auth,
                timeout=10
            )
            return response.status_code in [200, 204, 404]  # 404 = already gone
        except:
            return False
    
    def get_file_info(self, s3_key: str) -> Optional[Dict]:
        """
        Get metadata for a file
        
        Returns:
            Dict with file metadata or None if not found
        """
        try:
            full_path = f"{self.base_path}/{s3_key}"
            full_url = f"{self.base_url}{full_path}"
            
            response = requests.head(
                full_url,
                auth=self.auth,
                timeout=10
            )
            
            if response.status_code != 200:
                return None
            
            return {
                'size_bytes': int(response.headers.get('Content-Length', 0)),
                'content_type': response.headers.get('Content-Type', 'application/octet-stream'),
                'etag': response.headers.get('ETag', '').strip('"'),
                'last_modified': response.headers.get('Last-Modified', ''),
                'metadata': {}
            }
        except:
            return None
    
    def copy_file(
        self,
        source_key: str,
        destination_key: str,
        destination_bucket: Optional[str] = None
    ) -> bool:
        """
        Copy a file within storage
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # WebDAV COPY method
            source_path = f"{self.base_path}/{source_key}"
            dest_path = f"{self.base_path}/{destination_key}"
            
            response = requests.request(
                'COPY',
                f"{self.base_url}{source_path}",
                headers={'Destination': f"{self.base_url}{dest_path}"},
                auth=self.auth,
                timeout=10
            )
            return response.status_code in [201, 204]
        except:
            return False
    
    def list_files(
        self,
        prefix: str = '',
        max_keys: int = 1000,
        continuation_token: Optional[str] = None
    ) -> Dict:
        """
        List files with optional prefix filter
        Note: Basic implementation - for production use PROPFIND
        
        Returns:
            Dict with 'files' list
        """
        # For now, return empty list
        # In production, implement PROPFIND XML parsing
        return {'files': []}
    
    def validate_signed_url(self, token: str) -> Optional[str]:
        """
        Validate a signed URL token and return the storage path
        """
        try:
            payload = jwt.decode(token, self.url_secret, algorithms=['HS256'])
            return payload.get('path')
        except jwt.ExpiredSignatureError:
            return None
        except:
            return None

# Singleton instance
storage_service = StorageService()