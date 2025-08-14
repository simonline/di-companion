from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="DI Companion Chat API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Gemini
# The client will automatically use GEMINI_API_KEY env variable if set
# Otherwise, pass the API key directly
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else genai.Client()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    systemPrompt: str
    conversationHistory: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    return {"message": "DI Companion Chat API"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Prepare conversation history for Gemini
        # Gemini expects a different format than OpenAI
        history = []
        
        # Add system prompt as the first message if provided
        if request.systemPrompt:
            history.append({
                "role": "user",
                "parts": [{"text": f"System instruction: {request.systemPrompt}"}]
            })
            history.append({
                "role": "model",
                "parts": [{"text": "Understood. I'll follow these instructions."}]
            })
        
        # Add conversation history
        for msg in request.conversationHistory:
            # Map 'assistant' role to 'model' for Gemini
            role = "model" if msg.role == "assistant" else msg.role
            history.append({
                "role": role,
                "parts": [{"text": msg.content}]
            })
        
        # Create a chat session with history
        chat_session = client.chats.create(
            model="gemini-2.0-flash-exp",  # Using latest Gemini model
            history=history,
            config={
                "temperature": 0.7,
                "max_output_tokens": 1000,
            }
        )
        
        # Send the current message and get response
        response = chat_session.send_message(request.message)
        
        # Extract the response text
        ai_response = response.text
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Gemini: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 