import json
import os
from urllib import request


def _fallback_advice(analysis_output: dict) -> str:
    fraud = analysis_output.get("fraud_detected")
    risk = analysis_output.get("risk_score", 0)
    recommendation = analysis_output.get("recommendation", "Review details")
    price_range = analysis_output.get("price_range", "N/A")

    if fraud:
        return (
            f"Estimated price range is {price_range}. Risk score is {risk}/10 with fraud indicators present. "
            f"Recommendation: {recommendation}. Proceed only after strict document and service-history verification."
        )
    if risk >= 6:
        return (
            f"Estimated price range is {price_range}. Risk score is {risk}/10, which suggests caution. "
            f"Recommendation: {recommendation}. Negotiate carefully and inspect service records before buying."
        )
    return (
        f"This car appears comparatively safer to consider. Estimated price range is {price_range} with risk score "
        f"{risk}/10. Recommendation: {recommendation}. A standard pre-purchase inspection is still advised."
    )


def generate_advice(analysis_output: dict) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return _fallback_advice(analysis_output)

    prompt = (
        "You are CarSure AI advisor. Explain this car analysis in 3-5 concise lines.\n"
        f"Price range: {analysis_output.get('price_range')}\n"
        f"Risk score: {analysis_output.get('risk_score')}\n"
        f"Fraud detected: {analysis_output.get('fraud_detected')}\n"
        f"Recommendation: {analysis_output.get('recommendation')}\n"
        f"Reasons: {analysis_output.get('reasons', [])}\n"
    )
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 180,
    }
    req = request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
        content = data["choices"][0]["message"]["content"].strip()
        return content or _fallback_advice(analysis_output)
    except Exception:
        return _fallback_advice(analysis_output)
