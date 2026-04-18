from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.analysis import analyze_car, run_assistant_pipeline

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    model: Optional[str] = ""
    year: Optional[int] = None
    make_year: Optional[int] = None
    mileage_kmpl: Optional[float] = 0.0
    engine_cc: Optional[int] = 0
    owner_count: Optional[int] = 0
    fuel_type: Optional[str] = "Petrol"
    transmission: Optional[str] = "Manual"

class AssistantRequest(BaseModel):
    budget: Optional[int] = 1000000
    usage: Optional[str] = "city"
    monthly_km: Optional[int] = 500
    priority: Optional[str] = "comfort"
    family_size: Optional[int] = 4
    fuel_preference: Optional[str] = "none"
    car_condition: Optional[str] = "used"

@app.get("/")
def home():
    return {"message": "CarSure AI API running"}

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    data_dict = data.dict()
    # Handle explicit nulls
    d = {
        "model": data_dict.get("model") or "",
        "year": data_dict.get("year") or data_dict.get("make_year") or 2018,
        "mileage_kmpl": data_dict.get("mileage_kmpl") or 15.0,
        "engine_cc": data_dict.get("engine_cc") or 1200,
        "owner_count": data_dict.get("owner_count") or 1,
        "fuel_type": data_dict.get("fuel_type") or "Petrol",
        "transmission": data_dict.get("transmission") or "Manual"
    }
    return analyze_car(d)

@app.post("/assistant")
def assistant(data: AssistantRequest):
    data_dict = data.dict()
    # Handle explicit nulls
    d = {
        "budget": data_dict.get("budget") or 1000000,
        "usage": data_dict.get("usage") or "city",
        "monthly_km": data_dict.get("monthly_km") or 500,
        "priority": data_dict.get("priority") or "comfort",
        "family_size": data_dict.get("family_size") or 4,
        "fuel_preference": data_dict.get("fuel_preference") or "none",
        "car_condition": data_dict.get("car_condition") or "used"
    }
    return run_assistant_pipeline(d)