from model.predictor import prepare_input, predict_price
from services.risk_engine import analyze_risk
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

    if fraud:
        recommendation = "Avoid 🚨"
    elif risk >= 8:
        recommendation = "Avoid ❌"
    elif risk >= 5:
        recommendation = "Risky ⚠️"
    else:
        recommendation = "Safe ✅"

    return {
    "price_range": price_range,
    "risk_score": risk,
    "fraud_detected": fraud,
    "hidden_damage": damage,
    "data_confidence": confidence,
    "recommendation": recommendation,
    "reasons": reasons}