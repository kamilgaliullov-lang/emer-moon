from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel
from typing import Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

WEATHER_API_URL = os.environ.get('WEATHER_API_URL', '')
WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', '')
AI_API_URL = os.environ.get('AI_API_URL', '')
AI_API_KEY = os.environ.get('AI_API_KEY', '')
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')


class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = ""
    user: Optional[str] = "anonymous"


class UserProfileRequest(BaseModel):
    user_id: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_mun: Optional[str] = None
    user_role: Optional[str] = "registered"
    user_premium: Optional[bool] = False


@api_router.get("/")
async def root():
    return {"message": "MMuni API", "status": "ok"}


@api_router.get("/weather")
async def get_weather(lat: float = Query(...), lng: float = Query(...)):
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{WEATHER_API_URL}data/2.5/weather",
                params={"lat": lat, "lon": lng, "appid": WEATHER_API_KEY, "units": "metric"}
            )
            return resp.json()
    except Exception as e:
        logging.error(f"Weather API error: {e}")
        return {"error": str(e)}


@api_router.post("/chat")
async def chat(req: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{AI_API_URL}/v1/chat-messages",
                headers={
                    "Authorization": f"Bearer {AI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "inputs": {},
                    "query": req.query,
                    "response_mode": "blocking",
                    "conversation_id": req.conversation_id or "",
                    "user": req.user or "anonymous"
                }
            )
            return resp.json()
    except Exception as e:
        logging.error(f"Chat API error: {e}")
        return {"error": str(e)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
