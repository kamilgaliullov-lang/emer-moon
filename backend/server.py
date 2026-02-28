from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import httpx
import asyncio
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


@api_router.post("/user/update-profile")
async def update_user_profile(req: UserProfileRequest):
    """
    Create or update user profile using service role key (bypasses RLS).
    First tries UPDATE, if no record exists - creates via INSERT.
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logging.error("Supabase credentials not configured")
        return {"success": False, "error": "Server configuration error"}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # Build update payload
            update_data = {}
            if req.user_name is not None:
                update_data["user_name"] = req.user_name
            if req.user_email is not None:
                update_data["user_email"] = req.user_email
            if req.user_mun is not None:
                update_data["user_mun"] = req.user_mun
            if req.user_role is not None:
                update_data["user_role"] = req.user_role
            if req.user_premium is not None:
                update_data["user_premium"] = req.user_premium
            
            logging.info(f"Trying to update user {req.user_id}: {update_data}")
            
            # First try UPDATE
            resp = await client.patch(
                f"{SUPABASE_URL}/rest/v1/user?user_id=eq.{req.user_id}",
                headers=headers,
                json=update_data
            )
            
            if resp.status_code == 200:
                result = resp.json()
                if result and len(result) > 0:
                    logging.info(f"Successfully updated user profile for {req.user_id}")
                    return {"success": True, "data": result[0]}
                else:
                    # No rows updated - record doesn't exist, create via INSERT
                    logging.info(f"No record found for {req.user_id}, creating new record...")
                    
                    insert_data = {
                        "user_id": req.user_id,
                        "user_name": req.user_name,
                        "user_email": req.user_email,
                        "user_mun": req.user_mun,
                        "user_role": req.user_role or "registered",
                        "user_premium": req.user_premium if req.user_premium is not None else False
                    }
                    
                    insert_resp = await client.post(
                        f"{SUPABASE_URL}/rest/v1/user",
                        headers=headers,
                        json=insert_data
                    )
                    
                    if insert_resp.status_code in [200, 201]:
                        insert_result = insert_resp.json()
                        logging.info(f"Successfully created user profile for {req.user_id}")
                        return {"success": True, "data": insert_result[0] if insert_result else insert_data}
                    else:
                        logging.error(f"Failed to create user profile: {insert_resp.status_code} - {insert_resp.text}")
                        return {"success": False, "error": insert_resp.text}
            else:
                logging.error(f"Failed to update user profile: {resp.status_code} - {resp.text}")
                return {"success": False, "error": resp.text}
                
    except Exception as e:
        logging.error(f"User profile error: {e}")
        return {"success": False, "error": str(e)}


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
