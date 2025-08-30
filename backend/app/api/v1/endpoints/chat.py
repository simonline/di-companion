from fastapi import APIRouter, HTTPException
from typing import List
import google.generativeai as genai

from app.core.config import settings
from app.models.chat import ChatMessage, ChatRequest, ChatResponse

router = APIRouter()

# Configure Gemini with API key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat request using Google Gemini AI
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            generation_config={
                "temperature": settings.GEMINI_TEMPERATURE,
                "max_output_tokens": settings.GEMINI_MAX_TOKENS,
            }
        )
        
        # Prepare conversation history for Gemini
        history = []
        
        # Add system prompt as the first message if provided
        if request.systemPrompt:
            history.append({
                "role": "user",
                "parts": [f"System instruction: {request.systemPrompt}"]
            })
            history.append({
                "role": "model",
                "parts": ["Understood. I'll follow these instructions."]
            })
        
        # Add conversation history
        for msg in request.conversationHistory:
            # Map 'assistant' role to 'model' for Gemini
            role = "model" if msg.role == "assistant" else msg.role
            history.append({
                "role": role,
                "parts": [msg.content]
            })
        
        # Create a chat session with history
        chat_session = model.start_chat(history=history)
        
        # Send the current message and get response
        response = chat_session.send_message(request.message)
        
        # Extract the response text
        ai_response = response.text
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error communicating with Gemini: {str(e)}"
        )