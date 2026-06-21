from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- Config ----------
mongo_url = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7  # 1 week session
ADMIN_USERNAME = os.environ["ADMIN_USERNAME"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

client = AsyncIOMotorClient(mongo_url)
db = client[DB_NAME]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/admin/login", auto_error=False)

# ---------- App ----------
app = FastAPI(title="Hot Spot Pizza API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")
logger = logging.getLogger("hotspot")


# ---------- Models ----------
class AdminLoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class VerifyResponse(BaseModel):
    valid: bool
    username: str | None = None


# ---------- Helpers ----------
def create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


async def get_current_admin(token: str | None = Depends(oauth2_scheme)) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_token(token)
    if not username or username != ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return username


async def ensure_admin_seed() -> None:
    existing = await db.admin_users.find_one({"username": ADMIN_USERNAME})
    if existing:
        return
    await db.admin_users.insert_one(
        {
            "username": ADMIN_USERNAME,
            "password_hash": pwd_context.hash(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    logger.info("Seeded default admin user: %s", ADMIN_USERNAME)


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"service": "Hot Spot Pizza API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "time": datetime.now(timezone.utc).isoformat()}


@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(payload: AdminLoginRequest):
    # Read seeded admin from Mongo; fall back to env-based check
    record = await db.admin_users.find_one({"username": payload.username})
    if not record:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(payload.password, record["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(payload.username)
    return TokenResponse(access_token=token, username=payload.username)


@api_router.get("/admin/verify", response_model=VerifyResponse)
async def admin_verify(username: str = Depends(get_current_admin)):
    return VerifyResponse(valid=True, username=username)


# ---------- App wiring ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await ensure_admin_seed()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
