from model.predictor import prepare_input, predict_price
from services.ai_advisor import generate_ai_advice
from services.risk_engine import analyze_risk
from services.verification import fetch_vehicle_data
from utils.formatter import format_price_range


def _recommendation_from_risk(risk, fraud):
    if fraud:
        return "Avoid 🚨"
    if risk >= 8:
        return "Avoid ❌"
    if risk >= 5:
        return "Risky ⚠️"
    return "Safe ✅"


def _normalize_text(value):
    if value is None:
        return ""
    return str(value).strip().lower()


def _empty_verification_details(vehicle_number, source, note):
    return {
        "owner_count": None,
        "registration_year": None,
        "fuel_type": None,
        "challan_count": None,
        "accident_history": "Not Available",
        "vehicle_number": vehicle_number,
        "source": source,
        "mismatch_fields": [],
        "note": note,
    }


def _build_verification(vehicle_number, owner_count, year, fuel_type):
    if not vehicle_number:
        return {
            "status": "Not Available",
            "details": _empty_verification_details(
                None,
                "not_provided",
                "Vehicle number not provided; verification skipped.",
            ),
        }, {
            "risk_delta": 0,
            "fraud": False,
            "reasons": [],
        }

    official_data = fetch_vehicle_data(vehicle_number)

    if official_data.get("source") == "unavailable":
        return "Not Available", {
            "risk_delta": 0,
            "fraud": False,
            "reasons": ["Vehicle verification service not available"],
        }

    mismatch_fields = []
    verification_reasons = []
    risk_delta = 0
    fraud = False

    official_owner_count = official_data.get("owner_count")
    if official_owner_count is not None and int(official_owner_count) != owner_count:
        mismatch_fields.append("owner_count")
        fraud = True
        risk_delta += 3
        verification_reasons.append("Mismatch with official ownership records")

    official_registration_year = official_data.get("registration_year")
    if official_registration_year is not None and int(official_registration_year) != year:
        mismatch_fields.append("registration_year")
        fraud = True
        risk_delta += 2
        verification_reasons.append("Registration year mismatch with official records")

    official_fuel_type = official_data.get("fuel_type")
    if official_fuel_type and _normalize_text(official_fuel_type) != _normalize_text(fuel_type):
        mismatch_fields.append("fuel_type")
        fraud = True
        risk_delta += 2
        verification_reasons.append("Fuel type mismatch with official records")

    challan_count = official_data.get("challan_count")
    if isinstance(challan_count, int) and challan_count >= 3:
        risk_delta += 1
        verification_reasons.append("Multiple challans found in official records")

    accident_history = official_data.get("accident_history")
    if accident_history == "Available":
        risk_delta += 2
        verification_reasons.append("Accident history found in official records")

    verification_status = "Mismatch" if mismatch_fields else "Verified"

    return {
        "status": verification_status,
        "details": {
            "owner_count": official_owner_count,
            "registration_year": official_registration_year,
            "fuel_type": official_fuel_type,
            "challan_count": official_data.get("challan_count"),
            "accident_history": official_data.get("accident_history", "Not Available"),
            "vehicle_number": vehicle_number,
            "source": official_data.get("source", "mock"),
            "mismatch_fields": mismatch_fields,
        },
    }, {
        "risk_delta": risk_delta,
        "fraud": fraud,
        "reasons": verification_reasons,
    }


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
    try:
        verification, verification_impact = _build_verification(
            vehicle_number,
            owners,
            year,
            fuel,
        )
    except Exception:
        verification = {"status": "Not Available", "details": {}}
        verification_impact = {"risk_delta": 0, "fraud": False, "reasons": ["Verification service encountered an error"]}

    risk = min(10, risk + verification_impact.get("risk_delta", 0))
    if verification_impact.get("fraud"):
        fraud = True
    for reason in verification_impact.get("reasons", []):
        if reason not in reasons:
            reasons.append(reason)

    if isinstance(verification, str) and verification == "Not Available":
        for reason in verification_impact.get("reasons", []):
            if reason not in reasons:
                reasons.append(reason)

    recommendation = _recommendation_from_risk(risk, fraud)

    response = {
        "price_range": price_range,
        "risk_score": risk,
        "fraud_detected": fraud,
        "hidden_damage": damage,
        "data_confidence": confidence,
        "recommendation": recommendation,
        "reasons": reasons,
        "verification": verification,
    }

    # Internal fields for AI advisor (prefixed with _ so they're stripped before LLM)
    response["_model"] = str(data.get("model", "")).strip()
    response["_fuel_type"] = fuel

    verification_for_ai = verification if isinstance(verification, dict) else {"status": "Not Available", "details": {}}
    try:
        response["ai_advice"] = generate_ai_advice(response, verification_for_ai)
    except Exception:
        response["ai_advice"] = "AI advice not available"

    # Remove internal fields from final API response
    response.pop("_model", None)
    response.pop("_fuel_type", None)

    return response