from fastapi import APIRouter

from app.api.v1.endpoints import chat, health, files, documents

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(chat.router, prefix="/api", tags=["chat"])
api_router.include_router(files.router, prefix="/api/files", tags=["files"])
api_router.include_router(documents.router, prefix="/api/documents", tags=["documents"])