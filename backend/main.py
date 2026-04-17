from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from services.analysis import analyze_car

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "CarSure AI API running"}

@app.post("/analyze")
def analyze(data: dict):
    return analyze_car(data)