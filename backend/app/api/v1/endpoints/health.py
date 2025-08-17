from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

@router.get("/")
async def root():
    """
    Root endpoint
    """
    return {"message": "DI Companion Chat API", "version": "1.0.0"}