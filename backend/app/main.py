from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import companies, search, bookmarks, auth
from app.db.session import engine
from app.models import base  # noqa: F401 – ensures models are registered


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="ScoutIT API",
    description="Google Maps for Tech Careers in India – backend API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://scoutit.in"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["Bookmarks"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "scoutit-api"}
