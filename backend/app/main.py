import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth_router,
    patients_router,
    doctors_router,
    appointments_router,
    medications_router,
    health_metrics_router,
    health_records_router,
    symptoms_router,
    ai_router,
    notifications_router,
    emergency_router,
    admin_router,
    gamification_router,
    dsa_router
)
from app.seed import seed_database

# Create all database tables on start
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Medicare-AI: AI-Powered Smart Healthcare Assistance & Management Platform Backend API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded medical files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount Routers under API prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(doctors_router, prefix=settings.API_PREFIX)
app.include_router(appointments_router, prefix=settings.API_PREFIX)
app.include_router(medications_router, prefix=settings.API_PREFIX)
app.include_router(health_metrics_router, prefix=settings.API_PREFIX)
app.include_router(health_records_router, prefix=settings.API_PREFIX)
app.include_router(symptoms_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)
app.include_router(emergency_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
app.include_router(gamification_router, prefix=settings.API_PREFIX)
app.include_router(dsa_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    # Automatically seed demo data if database is fresh
    seed_database()

@app.get("/")
def root():
    return {
        "project": "Medicare-AI",
        "status": "Online",
        "version": settings.VERSION,
        "docs": "/api/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Medicare-AI API Core",
        "environment": settings.ENVIRONMENT
    }

# Safe user-friendly global exception handler (Section 39)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal error securely on server
    print(f"[INTERNAL_SERVER_ERROR] {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "A server error occurred while processing your request.",
            "message": "Something went wrong on our end. Please try again in a few moments.",
            "path": request.url.path
        }
    )
