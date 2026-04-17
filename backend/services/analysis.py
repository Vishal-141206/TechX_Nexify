from model.predictor import prepare_input, predict_price
from services.risk_engine import analyze_risk
from services.verification import fetch_vehicle_data
from services.ai_advisor import generate_advice
from utils.formatter import format_price_range

def analyze_car(data):

    year = int(data["year"])
    mileage = float(data["mileage_kmpl"])
    engine = int(data["engine_cc"])
    owners = int(data["owner_count"])
    fuel = data["fuel_type"]
    transmission = data["transmission"]

    input_data = prepare_input(
        year, mileage, engine, owners, fuel, transmission
    )

    price = predict_price(input_data)
    price_range = format_price_range(price)

    risk, fraud, damage, reasons,confidence = analyze_risk(
        year, mileage, engine, owners, fuel
    )

    vehicle_number = str(data.get("vehicle_number", "")).strip()
    verification_details = fetch_vehicle_data(vehicle_number)
    mismatch_fields = []
    if verification_details.get("owner_count") is not None and verification_details["owner_count"] != owners:
        mismatch_fields.append("owner_count")
    if verification_details.get("registration_year") is not None and verification_details["registration_year"] != year:
        mismatch_fields.append("registration_year")
    if verification_details.get("fuel_type") is not None and str(verification_details["fuel_type"]).lower() != str(fuel).lower():
        mismatch_fields.append("fuel_type")

    if mismatch_fields:
        risk = min(10, risk + 2)
        fraud = True
        reasons.append("Mismatch with official vehicle records")
        verification = {
            "status": "Mismatch",
            "details": {
                "vehicle_number": vehicle_number,
                "mismatch_fields": mismatch_fields,
                **verification_details,
            },
        }
    else:
        verification = {
            "status": "Verified",
            "details": {
                "vehicle_number": vehicle_number or None,
                **verification_details,
            },
        }

    if fraud:
        recommendation = "Avoid 🚨"
    elif risk >= 8:
        recommendation = "Avoid ❌"
    elif risk >= 5:
        recommendation = "Risky ⚠️"
    else:
        recommendation = "Safe ✅"

    analysis_output = {
        "price_range": price_range,
        "risk_score": risk,
        "fraud_detected": fraud,
        "hidden_damage": damage,
        "data_confidence": confidence,
        "recommendation": recommendation,
        "reasons": reasons,
        "verification": verification,
    }
    analysis_output["ai_advice"] = generate_advice(analysis_output)

    return analysis_output
