#!/usr/bin/env python3
"""
Simple test script for the chat API
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_chat_api():
    """Test the chat API endpoint"""
    
    # Check if API key is set
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ GEMINI_API_KEY not found in .env file")
        print("Please add your Google Gemini API key to the .env file")
        return False
    
    # Test data
    test_data = {
        "message": "Hello! I'm a startup founder and I need help with my business strategy.",
        "systemPrompt": "You are a business strategy expert specializing in startup development. Help founders with business model validation, market analysis, competitive positioning, and strategic planning. Provide actionable advice and frameworks.",
        "conversationHistory": []
    }
    
    try:
        # Make request to the API
        response = requests.post(
            "http://localhost:8000/api/chat",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat API test successful!")
            print(f"Response: {result['response'][:100]}...")
            return True
        else:
            print(f"❌ Chat API test failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
        print("Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
        return False

if __name__ == "__main__":
    print("Testing DI Companion Chat API...")
    print("=" * 40)
    
    # Test health endpoint first
    if test_health_endpoint():
        # Test chat endpoint
        test_chat_api()
    else:
        print("\nPlease start the backend server first:")
        print("python main.py") 