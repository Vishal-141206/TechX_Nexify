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


def _rule_based_advice(analysis, verification):
    verification_data = _normalize_verification(verification)
    details = verification_data.get("details", {}) if isinstance(verification_data.get("details"), dict) else {}

    price_range = analysis.get("price_range", "not available")
    risk_score = analysis.get("risk_score", "not available")
    recommendation = analysis.get("recommendation", "Manual review")
    fraud_detected = bool(analysis.get("fraud_detected", False))
    verification_status = verification_data.get("status", "Not Available")
    owner_count = details.get("owner_count")
    challan_count = details.get("challan_count")

    lines = [
        f"Price estimate is {price_range} and risk score is {risk_score}/10.",
        f"Verification status is {verification_status}; ownership records are {owner_count if owner_count is not None else 'not available'}.",
        f"Challan data is {challan_count if challan_count is not None else 'not available'} and fraud flag is {'detected' if fraud_detected else 'not detected'}.",
        (
            "Proceed only after checking RC and service history in person."
            if fraud_detected or verification_status == "Mismatch"
            else "No major red flags from submitted data, but perform a normal pre-purchase inspection."
        ),
        f"Recommendation: {recommendation}.",
    ]
    return "\n".join(lines)


def _trim_to_five_lines(text):
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""
    return "\n".join(lines[:5])


def _build_prompt(analysis, verification):
    return f"""
You are a car buying expert.

Analyze the following:

Car Analysis:
{json.dumps(analysis, ensure_ascii=False)}

Vehicle Records:
{json.dumps(verification, ensure_ascii=False)}

Explain clearly:

1. Is this car a good deal?
2. Any risks from ownership or challans?
3. Should the buyer proceed?

Rules:
- Max 5 lines
- Be practical and realistic
- Do NOT assume missing data
- If data is missing, say "not available"
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
                    "You are a practical used-car advisor."
                    " Never hallucinate missing data."
                    " Keep the answer to 5 lines max."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 180,
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

    cleaned = _trim_to_five_lines(content)
    return cleaned or None


def generate_ai_advice(analysis, verification):
    groq_advice = _call_groq(analysis, verification)
    if groq_advice:
        return groq_advice

    return _rule_based_advice(analysis, verification)


def generate_advice(analysis_output):
    verification = analysis_output.get("verification", {}) if isinstance(analysis_output, dict) else {}
    return generate_ai_advice(analysis_output, verification)