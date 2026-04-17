import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant"


def _normalize_verification(verification):
    if isinstance(verification, dict):
        return verification
    return {"status": str(verification) if verification else "Not Available", "details": {}}


# ── Static model suggestion lookup by price bracket + fuel ──
_MODEL_SUGGESTIONS = {
    "petrol": {
        3: ["Maruti Alto", "Renault Kwid", "Datsun redi-GO"],
        5: ["Maruti Swift", "Hyundai i20", "Tata Altroz"],
        8: ["Hyundai Venue", "Tata Nexon", "Maruti Brezza"],
        12: ["Hyundai Creta", "Kia Seltos", "MG Astor"],
        20: ["Toyota Innova", "Skoda Slavia", "Hyundai Verna"],
        99: ["Toyota Fortuner", "MG Gloster", "Jeep Compass"],
    },
    "diesel": {
        3: ["Maruti Alto Diesel", "Maruti Celerio"],
        5: ["Maruti Swift Diesel", "Ford Figo"],
        8: ["Tata Nexon Diesel", "Hyundai Venue Diesel", "Mahindra XUV300"],
        12: ["Hyundai Creta Diesel", "Kia Seltos Diesel", "MG Hector"],
        20: ["Toyota Innova Crysta", "Mahindra XUV700", "Tata Safari"],
        99: ["Toyota Fortuner", "MG Gloster", "Mahindra Scorpio N"],
    },
    "electric": {
        8: ["Tata Tiago EV"],
        12: ["Tata Nexon EV", "MG ZS EV"],
        20: ["Tata Nexon EV Max", "Hyundai Kona EV"],
        99: ["BYD Atto 3", "BMW iX1", "Kia EV6"],
    },
    "cng": {
        5: ["Maruti Alto CNG", "Maruti WagonR CNG"],
        8: ["Maruti Dzire CNG", "Hyundai Aura CNG", "Tata Tigor CNG"],
        12: ["Maruti Ertiga CNG", "Hyundai Exter CNG"],
        99: ["Maruti XL6 CNG"],
    },
}


def _suggest_models(analysis):
    """Return a short string of suggested models based on price range and fuel type."""
    price_str = str(analysis.get("price_range", ""))
    fuel_raw = str(analysis.get("_fuel_type", "petrol")).strip().lower()
    fuel_key = fuel_raw if fuel_raw in _MODEL_SUGGESTIONS else "petrol"

    # Extract the upper price in lakhs from strings like "₹5.5L - ₹6.5L"
    import re
    numbers = re.findall(r"([\d.]+)L", price_str)
    if numbers:
        upper_price_lakh = float(numbers[-1])
    else:
        upper_price_lakh = 5.0

    bracket_map = _MODEL_SUGGESTIONS.get(fuel_key, _MODEL_SUGGESTIONS["petrol"])
    for threshold in sorted(bracket_map.keys()):
        if upper_price_lakh <= threshold:
            models = bracket_map[threshold]
            return ", ".join(models[:3])

    # fallback to highest bracket
    last_key = sorted(bracket_map.keys())[-1]
    return ", ".join(bracket_map[last_key][:3])


def _rule_based_advice(analysis, verification):
    verification_data = _normalize_verification(verification)

    price_range = analysis.get("price_range", "not available")
    risk_score = analysis.get("risk_score", "not available")
    recommendation = analysis.get("recommendation", "Manual review")
    fraud_detected = bool(analysis.get("fraud_detected", False))
    verification_status = verification_data.get("status", "Not Available")
    has_model = bool(str(analysis.get("_model", "")).strip())

    lines = [
        f"Price estimate is {price_range} with a risk score of {risk_score}/10.",
        f"Verification: {verification_status}. Fraud: {'detected — exercise caution' if fraud_detected else 'not detected'}.",
        (
            "Proceed only after verifying RC and service history in person."
            if fraud_detected or verification_status == "Mismatch"
            else "No major red flags from submitted data; a standard pre-purchase inspection is advised."
        ),
        f"Recommendation: {recommendation}.",
    ]

    if not has_model:
        suggestions = _suggest_models(analysis)
        lines.append(f"Cars in this range: {suggestions}.")

    return "\n".join(lines)


def _trim_response(text, max_lines=5):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""
    return "\n".join(lines[:max_lines])


def _build_prompt(analysis, verification):
    has_model = bool(str(analysis.get("_model", "")).strip())
    model_instruction = (
        ""
        if has_model
        else "\n- The user did NOT specify a car model. Suggest 2-3 popular Indian market models that typically fall in this price range and match the fuel type."
    )

    # Remove internal fields before sending to LLM
    clean_analysis = {k: v for k, v in analysis.items() if not k.startswith("_")}

    return f"""
You are a car buying advisor.

Car Analysis:
{json.dumps(clean_analysis, ensure_ascii=False)}

Vehicle Verification:
{json.dumps(verification, ensure_ascii=False)}

Explain in simple terms:
- Is this a good deal?
- Any risks?
- Should the buyer proceed?{model_instruction}

Rules:
- Max 5 lines
- No assumptions
- No hallucination
- Use only given data
""".strip()


def _call_groq(analysis, verification):
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL).strip() or DEFAULT_GROQ_MODEL
    api_url = os.getenv("GROQ_API_URL", GROQ_API_URL).strip() or GROQ_API_URL
    prompt = _build_prompt(analysis, verification)

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a car buying advisor for the Indian used-car market."
                    " Never hallucinate or assume missing data."
                    " Keep the answer to 5 lines max."
                    " Use only the given data."
                    " If no model is specified, suggest 2-3 popular models in the price range."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 200,
    }

    request = Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=8) as response:
            raw_response = response.read().decode("utf-8")
    except (HTTPError, URLError, OSError, TimeoutError, ValueError):
        return None

    try:
        decoded = json.loads(raw_response)
    except json.JSONDecodeError:
        return None

    choices = decoded.get("choices")
    if not isinstance(choices, list) or not choices:
        return None

    message = choices[0].get("message", {})
    if not isinstance(message, dict):
        return None

    content = message.get("content")
    if not isinstance(content, str):
        return None

    cleaned = _trim_response(content)
    return cleaned or None


def generate_ai_advice(analysis, verification):
    groq_advice = _call_groq(analysis, verification)
    if groq_advice:
        return groq_advice

    return _rule_based_advice(analysis, verification)


def generate_advice(analysis_output):
    verification = analysis_output.get("verification", {}) if isinstance(analysis_output, dict) else {}
    return generate_ai_advice(analysis_output, verification)