"""
Document upload endpoints for WebDAV storage with Supabase
Documents are similar to files but specifically for user-uploaded documents
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends, Header
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
import uuid
import requests

from app.services.storage import storage_service
from app.core.supabase import supabase

router = APIRouter()

async def get_optional_user_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Get the user token if provided, otherwise return None"""
    if not authorization:
        return None
    
    if not authorization.startswith("Bearer "):
        return None
    
    return authorization.replace("Bearer ", "")

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Query(default="general"),
    entity_type: Optional[str] = Query(default=None),
    entity_id: Optional[str] = Query(default=None),
    entity_field: Optional[str] = Query(default=None),
    metadata: Optional[str] = Query(default=None),
    access_token: Optional[str] = Depends(get_optional_user_token),
):
    """
    Upload document to storage and save metadata to Supabase documents table
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
        
        # Get current user from auth token if provided
        user_id = None
        if access_token:
            try:
                auth_response = supabase.auth.get_user(access_token)
                if auth_response and auth_response.user:
                    user_id = auth_response.user.id
            except Exception as e:
                # Log but don't fail if auth check fails
                print(f"Warning: Could not get user from token: {e}")
        
        # Save to Supabase documents table
        document_record = {
            'id': str(uuid.uuid4()),
            'filename': file.filename,
            'original_name': file.filename,
            'mime_type': file.content_type or 'application/octet-stream',
            'size_bytes': upload_result['size_bytes'],
            'bucket': 'documents',  # Using documents bucket conceptually
            'storage_path': upload_result['s3_key'],
            'category': category,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'entity_field': entity_field,
            'metadata': {"original_metadata": metadata} if metadata else {},
            'uploaded_by': user_id,  # Now properly set from auth
            'uploaded_at': datetime.now().isoformat(),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Insert into Supabase documents table
        result = supabase.table('documents').insert(document_record).execute()
        
        if result.data:
            return {
                "id": result.data[0]['id'],
                "filename": result.data[0]['filename'],
                "mime_type": result.data[0]['mime_type'],
                "size_bytes": result.data[0]['size_bytes'],
                "entity_type": result.data[0].get('entity_type'),
                "entity_id": result.data[0].get('entity_id'),
                "entity_field": result.data[0].get('entity_field'),
                "url": f"/api/documents/{result.data[0]['id']}"
            }
        else:
            raise Exception("Failed to save document record to database")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}")
async def get_document(document_id: str, download: bool = True):
    """
    Serve a document directly from storage
    """
    try:
        # Get document metadata from Supabase
        result = supabase.table('documents').select('*').eq('id', document_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document_record = result.data[0]
        
        # Get the storage path
        storage_path = document_record.get('storage_path')
        if not storage_path:
            raise HTTPException(status_code=404, detail="Document path not found")
        
        # Construct WebDAV URL
        full_path = f"{storage_service.base_path}/{storage_path}"
        webdav_url = f"{storage_service.base_url}{full_path}"
        
        # Fetch document from WebDAV storage with authentication
        response = requests.get(
            webdav_url,
            auth=storage_service.auth,
            stream=True
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Document not found in storage")
        
        # Stream the document back to the client with proper headers
        # Use 'attachment' for downloads, 'inline' for viewing
        disposition = 'attachment' if download else 'inline'
        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=document_record.get('mime_type', 'application/octet-stream'),
            headers={
                'Cache-Control': 'public, max-age=86400',  # Cache for 1 day
                'Content-Disposition': f'{disposition}; filename="{document_record.get("filename", "document")}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete document from storage and database
    """
    try:
        # Get document from Supabase
        result = supabase.table('documents').select('storage_path').eq('id', document_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        document_record = result.data[0]
        
        # Delete from storage
        if document_record.get('storage_path'):
            success = storage_service.delete_file(document_record['storage_path'])
            
            if not success:
                # Log error but continue to delete from database
                print(f"Warning: Failed to delete document from storage: {document_record['storage_path']}")
        
        # Delete from Supabase (hard delete for documents)
        supabase.table('documents').delete().eq('id', document_id).execute()
        
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entity/{entity_type}/{entity_id}")
async def get_entity_documents(
    entity_type: str,
    entity_id: str,
    entity_field: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
):
    """
    Get all documents for a specific entity
    """
    try:
        # Build query
        query = supabase.table('documents').select('*').eq('entity_type', entity_type).eq('entity_id', entity_id)
        
        if entity_field:
            query = query.eq('entity_field', entity_field)
        if category:
            query = query.eq('category', category)
        
        # Execute query with ordering
        result = query.order('created_at', desc=True).execute()
        
        documents = result.data or []
        
        # Add URL for each document
        for doc in documents:
            doc['url'] = f"/api/documents/{doc['id']}"
        
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))