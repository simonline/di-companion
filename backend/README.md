# DI Companion Chat Backend

A FastAPI backend that provides ChatGPT integration for the DI Companion application.

## Setup

**Option 1: Using Docker (Recommended)**
```bash
# Create environment file
cp env.example .env

# Add your OpenAI API key to the .env file:
# OPENAI_API_KEY=your_actual_openai_api_key_here

# Start with docker-compose (from project root)
docker-compose up -d backend
```

**Option 2: Local Development**
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory:
```bash
cp env.example .env
```

3. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

## Running the Backend

**With Docker:**
```bash
# Start the backend service
docker-compose up -d backend

# View logs
docker-compose logs -f backend
```

**Local Development:**
Start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /health` - Health check
- `POST /api/chat` - Chat with AI agent

### Chat Endpoint

**POST /api/chat**

Request body:
```json
{
  "message": "User's message",
  "systemPrompt": "System prompt for the AI agent",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant", 
      "content": "Previous AI response"
    }
  ]
}
```

Response:
```json
{
  "response": "AI agent's response"
}
```

## Development

The backend uses:
- FastAPI for the web framework
- OpenAI API for AI responses
- Python-dotenv for environment variable management
- CORS middleware for frontend communication 