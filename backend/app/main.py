from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.ai_tools import router as ai_tools_router
from app.api.evaluations import router as evaluations_router
from app.api.audit import router as audit_router
from app.api.candidates import router as candidates_router
from app.core.config import settings

import os

RENDER_EXTERNAL_URL = os.getenv("RENDER_EXTERNAL_URL")
servers = [{"url": RENDER_EXTERNAL_URL, "description": "Production"}] if RENDER_EXTERNAL_URL else []

from app.core.config import settings
from app.database.core import engine, Base, SessionLocal

Base.metadata.create_all(bind=engine)

# Ensure default admin user exists
from app.models.all import User
from app.core.security import get_password_hash
with SessionLocal() as db:
    if not db.query(User).filter(User.email == "admin@aihiringguardian.demo").first():
        admin_user = User(
            name="System Admin",
            email="admin@aihiringguardian.demo",
            password_hash=get_password_hash("password123"),
            role="ADMIN"
        )
        db.add(admin_user)
        db.commit()

app = FastAPI(
    title="AI Hiring Guardian API",
    description="Backend for AI Hiring Governance & Compliance OS",
    version="1.0.0",
    servers=servers,
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.compliance import router as compliance_router
from app.api.policies import router as policies_router
from app.api.monitoring import router as monitoring_router

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(ai_tools_router, prefix="/api/v1/ai-tools", tags=["AI Tools"])
app.include_router(evaluations_router, prefix="/api/v1/evaluations", tags=["Evaluations"])
app.include_router(audit_router, prefix="/api/v1/audit", tags=["Audit Trail"])
app.include_router(candidates_router, prefix="/api/v1/candidates", tags=["Candidate Governance"])
app.include_router(compliance_router, prefix="/api/v1/compliance", tags=["Compliance"])
app.include_router(policies_router, prefix="/api/v1/policies", tags=["Policies"])
app.include_router(monitoring_router, prefix="/api/v1/monitoring", tags=["Monitoring"])


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AI Hiring Guardian API is running"}

import traceback
from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.deps import get_db
from app.models.all import User
from sqlalchemy import text


