"""
Supabase client configuration
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service key for backend (bypasses RLS)
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  # Anon key for user auth

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError(
        "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file"
    )

# Create Supabase client with service key (bypasses RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def get_supabase_client(access_token: Optional[str] = None) -> Client:
    """
    Get a Supabase client. 
    If access_token is provided, creates a client with user authentication.
    Otherwise returns the service client.
    """
    if access_token and SUPABASE_ANON_KEY:
        # Create client with user authentication
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        client.auth.set_session(access_token, None)
        return client
    return supabase

# Export for use in other modules
__all__ = ["supabase", "get_supabase_client"]