from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
import google.generativeai as genai
from datetime import datetime

from app.core.config import settings
from app.core.supabase import get_supabase_client, supabase
from app.models.chat import ChatMessage, ChatRequest, ChatResponse

router = APIRouter()

# Configure Gemini with API key
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


async def find_or_create_conversation(user_id: str, agent_id: str, startup_id: Optional[str] = None):
    """Find existing conversation or create new one"""
    try:
        # Try to find existing conversation
        query = supabase.table('chat_conversations').select('*').eq('user_id', user_id).eq('agent_id', agent_id)

        if startup_id:
            query = query.eq('startup_id', startup_id)
        else:
            query = query.is_('startup_id', 'null')

        result = query.order('last_message_at', desc=True).limit(1).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        # Create new conversation
        new_conversation = {
            'user_id': user_id,
            'agent_id': agent_id,
            'startup_id': startup_id,
            'last_message_at': datetime.utcnow().isoformat()
        }

        result = supabase.table('chat_conversations').insert(new_conversation).execute()
        return result.data[0]
    except Exception as e:
        print(f"Error finding/creating conversation: {e}")
        return None


async def save_message(conversation_id: str, content: str, sender: str):
    """Save a message to the database"""
    try:
        message_data = {
            'conversation_id': conversation_id,
            'content': content,
            'sender': sender
        }

        result = supabase.table('chat_messages').insert(message_data).execute()

        # Update conversation's last_message_at
        supabase.table('chat_conversations').update({
            'last_message_at': datetime.utcnow().isoformat()
        }).eq('id', conversation_id).execute()

        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error saving message: {e}")
        return None

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, authorization: Optional[str] = Header(None)):
    """
    Process a chat request using Google Gemini AI and save to database
    """
    try:
        # Extract user_id from JWT token
        user_id = None
        if authorization and authorization.startswith('Bearer '):
            token = authorization.split(' ')[1]
            try:
                # Get user from token using Supabase
                client = get_supabase_client(token)
                user = client.auth.get_user(token)
                if user and user.user:
                    user_id = user.user.id
            except Exception as e:
                print(f"Error getting user from token: {e}")

        # Find or create conversation (only if we have user_id)
        conversation = None
        if user_id:
            conversation = await find_or_create_conversation(
                user_id=user_id,
                agent_id=request.agentId,
                startup_id=request.startupId
            )

        # Save user message (if we have a conversation)
        if conversation:
            await save_message(
                conversation_id=conversation['id'],
                content=request.message,
                sender='user'
            )

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

        # Save agent response (if we have a conversation)
        if conversation:
            await save_message(
                conversation_id=conversation['id'],
                content=ai_response,
                sender='agent'
            )

        return ChatResponse(response=ai_response)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error communicating with Gemini: {str(e)}"
        )


@router.get("/chat/history")
async def get_chat_history(
    agent_id: str,
    startup_id: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Get chat history for a specific agent and user
    """
    try:
        # Extract user_id from JWT token
        user_id = None
        if authorization and authorization.startswith('Bearer '):
            token = authorization.split(' ')[1]
            try:
                # Get user from token using Supabase
                client = get_supabase_client(token)
                user = client.auth.get_user(token)
                if user and user.user:
                    user_id = user.user.id
            except Exception as e:
                print(f"Error getting user from token: {e}")
                raise HTTPException(status_code=401, detail="Invalid authentication")

        if not user_id:
            raise HTTPException(status_code=401, detail="Authentication required")

        # Find conversation
        query = supabase.table('chat_conversations').select('*').eq('user_id', user_id).eq('agent_id', agent_id)

        if startup_id:
            query = query.eq('startup_id', startup_id)
        else:
            query = query.is_('startup_id', 'null')

        conversation_result = query.order('last_message_at', desc=True).limit(1).execute()

        if not conversation_result.data or len(conversation_result.data) == 0:
            # No conversation found, return empty messages
            return {"messages": []}

        conversation = conversation_result.data[0]

        # Get messages for this conversation
        messages_result = supabase.table('chat_messages').select('*').eq(
            'conversation_id', conversation['id']
        ).order('created_at', desc=False).execute()

        return {"messages": messages_result.data or []}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving chat history: {str(e)}"
        )