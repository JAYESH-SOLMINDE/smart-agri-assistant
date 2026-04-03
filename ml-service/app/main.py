# main.py — Entry point for the ML service
# This starts the FastAPI server

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predict import router as predict_router

# Create FastAPI app
app = FastAPI(
    title="Smart Agri ML Service",
    description="AI-powered crop disease detection API",
    version="1.0.0"
)

# Allow requests from our Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # In production, set this to your backend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register our prediction routes
app.include_router(predict_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "🌾 Smart Agri ML Service",
        "docs":    "Visit /docs to see all API endpoints",
        "health":  "Visit /health to check status"
    }