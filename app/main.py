import os
import openai
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title=os.getenv("APP_NAME", "AI-ChatBot-API"),
    version=os.getenv("APP_VERSION", "1.0.0"),
    description="AI-Powered ChatBot API built with FastAPI and OpenAI"
)

# Serve static files (index.html)
app.mount("/static", StaticFiles(directory="static"), name="static")

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    message: str
    system_prompt: str = "You are a helpful assistant."

class ChatResponse(BaseModel):
    reply: str
    model: str
    tokens_used: int

@app.get("/health")
def health_check():
    return {"status": "healthy", "app": os.getenv("APP_NAME")}

# Serve chat UI at root
@app.get("/")
def root():
    return FileResponse("static/index.html")

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": request.system_prompt},
                {"role": "user",   "content": request.message}
            ]
        )
        reply      = response.choices[0].message.content
        model_used = response.model
        tokens     = response.usage.total_tokens
        return ChatResponse(reply=reply, model=model_used, tokens_used=tokens)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))