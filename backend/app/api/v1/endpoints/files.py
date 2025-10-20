"""
File upload endpoints for WebDAV storage with Supabase
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional, List
from datetime import datetime
import uuid

from app.services.storage import storage_service
from app.core.supabase import supabase

router = APIRouter()

@router.post("/presigned-upload")
async def get_presigned_upload_url(
    filename: str,
    content_type: str,
    size_bytes: int,
    category: str = "general",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
):
    """
    Generate presigned URL for direct S3 upload
    """
    try:
        # Generate S3 key
        s3_key = storage_service.generate_s3_key(
            filename=filename,
            category=category,
            entity_type=entity_type,
            entity_id=entity_id
        )
        
        # Generate presigned POST data for browser upload
        presigned_data = storage_service.generate_presigned_post(
            s3_key=s3_key,
            content_type=content_type,
            max_file_size=size_bytes + 1024 * 1024  # Add 1MB buffer
        )
        
        # Return upload details
        return {
            "url": presigned_data["url"],
            "fields": presigned_data["fields"],
            "s3_key": s3_key,
            "bucket": storage_service.bucket_name,
            "s3_url": f"{storage_service.endpoint_url}/{storage_service.bucket_name}/{s3_key}",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    category: str = Query(default="general"),
    entity_type: Optional[str] = Query(default=None),
    entity_id: Optional[str] = Query(default=None),
    metadata: Optional[str] = Query(default=None),
):
    """
    Upload file to storage and save metadata to Supabase
    """
    try:
        # Upload to WebDAV storage
        upload_result = storage_service.upload_file(
            file=file.file,
            filename=file.filename,
            category=category,
            entity_type=entity_type,
            entity_id=entity_id,
            content_type=file.content_type,
            metadata={"original_metadata": metadata} if metadata else None
        )
        
        # Save to Supabase using SDK
        file_record = {
            'id': str(uuid.uuid4()),
            'filename': file.filename,
            'original_name': file.filename,
            'mime_type': file.content_type,
            'size_bytes': upload_result['size_bytes'],
            'bucket': upload_result['bucket'],
            'category': category,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'is_public': False,
            'metadata': {"original_metadata": metadata, "etag": upload_result['etag']} if metadata else {"etag": upload_result['etag']},
            'storage_path': upload_result['s3_key']
        }
        
        # Insert into Supabase
        result = supabase.table('files').insert(file_record).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise Exception("Failed to save file record to database")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}")
async def get_file(file_id: str):
    """
    Serve a file directly from storage
    Simple endpoint that works with <img src="/api/files/{id}"> tags
    """
    try:
        # Get file metadata from Supabase
        result = supabase.table('files').select('*').eq('id', file_id).is_('deleted_at', 'null').execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_record = result.data[0]
        
        # Get the storage path
        storage_path = file_record.get('storage_path') or file_record.get('s3_key')
        if not storage_path:
            raise HTTPException(status_code=404, detail="File path not found")
        
        # Construct WebDAV URL
        full_path = f"{storage_service.base_path}/{storage_path}"
        webdav_url = f"{storage_service.base_url}{full_path}"
        
        # Fetch file from WebDAV storage with authentication
        import requests
        response = requests.get(
            webdav_url,
            auth=storage_service.auth,
            stream=True
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="File not found in storage")
        
        # Stream the file back to the client with proper headers
        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=file_record.get('mime_type', 'application/octet-stream'),
            headers={
                'Cache-Control': 'public, max-age=86400',  # Cache for 1 day
                'Content-Disposition': f'inline; filename="{file_record.get("filename", "file")}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
):
    """
    Delete file from storage and mark as deleted in database
    """
    try:
        # Get file from Supabase
        result = supabase.table('files').select('s3_key').eq('id', file_id).is_('deleted_at', 'null').execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_record = result.data[0]
        
        # Delete from storage
        success = storage_service.delete_file(file_record['s3_key'])
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete from storage")
        
        # Soft delete in Supabase
        supabase.table('files').update({'deleted_at': datetime.now().isoformat()}).eq('id', file_id).execute()
        
        return {"message": "File deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_files(
    entity_type: str,
    entity_id: str,
    category: Optional[str] = Query(default=None),
):
    """
    Get all files for a specific entity
    """
    try:
        # Build query
        query = supabase.table('files').select('*').eq('entity_type', entity_type).eq('entity_id', entity_id).is_('deleted_at', 'null')
        
        if category:
            query = query.eq('category', category)
        
        # Execute query with ordering
        result = query.order('created_at', desc=True).execute()
        
        files = result.data or []
        
        # Generate signed URLs for private files
        for file in files:
            if not file.get('is_public', False):
                file['signed_url'] = storage_service.generate_presigned_url(
                    s3_key=file['s3_key'],
                    expires_in=3600
                )
        
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{file_id}/copy")
async def copy_file(
    file_id: str,
    new_entity_type: Optional[str] = None,
    new_entity_id: Optional[str] = None,
):
    """
    Create a copy of a file for a different entity
    """
    try:
        # Get original file from Supabase
        result = supabase.table('files').select('*').eq('id', file_id).is_('deleted_at', 'null').execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="File not found")
        
        original_file = result.data[0]
        
        # Generate new S3 key
        new_s3_key = storage_service.generate_s3_key(
            filename=original_file['original_name'],
            category=original_file['category'],
            entity_type=new_entity_type or original_file['entity_type'],
            entity_id=new_entity_id or original_file['entity_id']
        )
        
        # Copy in storage
        success = storage_service.copy_file(
            source_key=original_file['s3_key'],
            destination_key=new_s3_key
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to copy file")
        
        # Create new database record
        # Get original etag from metadata if available
        original_metadata = original_file.get('metadata', {})
        if isinstance(original_metadata, str):
            import json
            try:
                original_metadata = json.loads(original_metadata)
            except:
                original_metadata = {}

        new_file_record = {
            'id': str(uuid.uuid4()),
            'filename': original_file['filename'],
            'original_name': original_file['original_name'],
            'mime_type': original_file['mime_type'],
            'size_bytes': original_file['size_bytes'],
            'bucket': original_file['bucket'],
            'category': original_file['category'],
            'entity_type': new_entity_type or original_file['entity_type'],
            'entity_id': new_entity_id or original_file['entity_id'],
            'is_public': original_file.get('is_public', False),
            'metadata': original_metadata,
            'storage_path': new_s3_key
        }
        
        # Insert into Supabase
        result = supabase.table('files').insert(new_file_record).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise Exception("Failed to save copied file record")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))