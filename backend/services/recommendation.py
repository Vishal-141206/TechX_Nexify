import os
import json
from groq import Groq

def recommend_cars(input_data):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return _emergency_fallback(input_data)
        
    client = Groq(api_key=api_key)
    
    car_condition = input_data.get("car_condition", "used")
    is_new = car_condition == "new"
    
    condition_text = "brand new" if is_new else "used"
    year_note = "year: int (current or upcoming model year, e.g. 2024-2026)" if is_new else "year: int (reasonable used car year, e.g. 2018-2023)"
    owner_note = "owner_count: int (always 0 for brand new cars)" if is_new else "owner_count: int (typically 1 or 2)"
    price_field = '"showroom_price": 1200000,' if is_new else ''
    price_note = "showroom_price: int (approximate on-road price in INR for brand new)" if is_new else ""
    
    prompt = f"""
You are an expert car buying advisor. Based on the user's profile, recommend exactly 3 distinct {condition_text} car models available in the Indian market.

User Profile:
- Budget: ₹{input_data.get('budget', 800000)}
- Usage: {input_data.get('usage', 'mixed')}
- Monthly KM: {input_data.get('monthly_km', 500)}
- Priority: {input_data.get('priority', 'comfort')}
- Family Size: {input_data.get('family_size', 4)}
- Fuel Preference: {input_data.get('fuel_preference', 'none')}
- Car Condition: {condition_text}

IMPORTANT: 
You MUST return the output as a RAW, VALID JSON array of EXACTLY 3 objects. 
DO NOT wrap the JSON in markdown code blocks (e.g. no ```json ... ```).
DO NOT include any introductory or concluding text. JUST the JSON array.

Strict JSON format per object:
{{
  "car": "Make and Model (e.g. Hyundai Creta)",
  "fit_score": 95,
  {price_field}
  "specs": {{
    "year": 2021,
    "mileage_kmpl": 16.5,
    "engine_cc": 1497,
    "owner_count": 1,
    "fuel_type": "Petrol",
    "transmission": "Manual"
  }}
}}

Notes for specs:
- fit_score: int (0 to 100 representing how perfectly it matches their profile)
{f'- {price_note}' if price_note else ''}
- {year_note}
- mileage_kmpl: float (realistic economy)
- engine_cc: int
- {owner_note}
- fuel_type: string (exactly one of: "Petrol", "Diesel", "Electric", "CNG")
- transmission: string (exactly one of: "Manual", "Automatic")
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        content = content.strip()
        cars = json.loads(content)
        
        if not isinstance(cars, list) or len(cars) == 0:
            return _emergency_fallback(input_data)
            
        # Validate structure loosely to prevent ML pipeline crash downstream
        for c in cars:
            c["fit_score"] = int(c.get("fit_score", 85))
            if is_new:
                c["showroom_price"] = int(c.get("showroom_price", input_data.get("budget", 800000)))
            if "specs" not in c:
                c["specs"] = {}
            s = c["specs"]
            s["year"] = int(s.get("year", 2025 if is_new else 2020))
            s["mileage_kmpl"] = float(s.get("mileage_kmpl", 15.0))
            s["engine_cc"] = int(s.get("engine_cc", 1200))
            s["owner_count"] = int(s.get("owner_count", 0 if is_new else 1))
            s["fuel_type"] = s.get("fuel_type", "Petrol").capitalize()
            s["transmission"] = s.get("transmission", "Manual").capitalize()
            
        return cars[:3]

    except Exception:
        return _emergency_fallback(input_data)

def _emergency_fallback(input_data):
    is_new = input_data.get("car_condition", "used") == "new"
    base = [
        {
            "car": "Maruti Swift",
            "fit_score": 88,
            "specs": {"year": 2025 if is_new else 2021, "mileage_kmpl": 22.0, "engine_cc": 1197, "owner_count": 0 if is_new else 1, "fuel_type": "Petrol", "transmission": "Manual"}
        },
        {
            "car": "Hyundai Venue",
            "fit_score": 85,
            "specs": {"year": 2025 if is_new else 2022, "mileage_kmpl": 17.5, "engine_cc": 998, "owner_count": 0 if is_new else 1, "fuel_type": "Petrol", "transmission": "Manual"}
        },
        {
            "car": "Honda City",
            "fit_score": 92,
            "specs": {"year": 2025 if is_new else 2020, "mileage_kmpl": 17.8, "engine_cc": 1498, "owner_count": 0 if is_new else 1, "fuel_type": "Petrol", "transmission": "Manual"}
        }
    ]
    if is_new:
        base[0]["showroom_price"] = 699000
        base[1]["showroom_price"] = 789000
        base[2]["showroom_price"] = 1199000
    return base
