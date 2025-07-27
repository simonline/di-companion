from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import openai
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

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

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
        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": request.systemPrompt}
        ]
        
        # Add conversation history
        for msg in request.conversationHistory:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add the current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        
        # Extract the response
        ai_response = response.choices[0].message.content
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with OpenAI: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 