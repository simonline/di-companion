from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    systemPrompt: str
    conversationHistory: List[ChatMessage]
    agentId: str
    startupId: Optional[str] = None

class ChatResponse(BaseModel):
    response: str