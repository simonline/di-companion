#!/usr/bin/env python3
"""
Main entry point for the DI Companion Backend
This file is kept for backwards compatibility
The actual application is in app/main.py
"""

import uvicorn
from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    ) 