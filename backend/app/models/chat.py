from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    systemPrompt: str
    conversationHistory: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str