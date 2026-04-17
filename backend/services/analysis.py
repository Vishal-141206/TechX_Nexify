import os
from groq import Groq
from model.predictor import prepare_input, predict_price
from services.risk_engine import analyze_risk
from services.recommendation import recommend_cars
from services.reddit_service import fetch_reddit_posts, clean_posts, summarize_reviews
from services.ai_advisor import generate_ai_advice
from utils.formatter import format_price_range
from services.sentiment import analyze_sentiment
import json

def _recommendation_from_risk(risk, fraud_level):
    if fraud_level >= 3:
        return "Avoid"
    if risk >= 8:
        return "Avoid"
    if risk >= 5:
        return "Risky"
    return "Safe"


def _strip_json(content):
    """Strip markdown fences from LLM output."""
    if content.startswith("```json"): content = content[7:]
    if content.startswith("```"): content = content[3:]
    if content.endswith("```"): content = content[:-3]
    return content.strip()


def _generate_decision_block(best_car, all_cars, user_input):
    """Generate why_this_wins and trade_offs for the best car using Groq."""
    api_key = os.getenv("GROQ_API_KEY")
    fallback = {
        "why_this_wins": [
            "Strongest overall profile alignment",
            "Best value within budget constraints",
            "Lower risk compared to alternatives"
        ],
        "trade_offs": ["Specific trade-offs require deeper inspection"]
    }
    if not api_key:
        return fallback

    client = Groq(api_key=api_key)
    other_cars = [c["car"] for c in all_cars if c["car"] != best_car["car"]]

    prompt = f"""
You are a car buying decision advisor.

User profile:
{json.dumps(user_input)}

Best car selected: {best_car['car']} (Fit: {best_car['fit_score']}, Risk: {best_car['risk_score']}/10)
Other candidates: {', '.join(other_cars)}

Generate:
- "why_this_wins": 2-3 SHORT comparative reasons (must reference user input like usage/budget/family OR compare against the other cars). Max 10 words each.
- "trade_offs": 1-2 SHORT real negatives about this car. Max 8 words each.

Return ONLY raw JSON. No markdown blocks.
{{
  "why_this_wins": ["...", "..."],
  "trade_offs": ["..."]
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return json.loads(_strip_json(response.choices[0].message.content.strip()))
    except Exception:
        return fallback


def _generate_why_not(rejected_cars, best_car, user_input):
    """Generate rejection reasons for non-best cars."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or not rejected_cars:
        return [{"car": c["car"], "reasons": ["Lower overall fit score"]} for c in rejected_cars]

    client = Groq(api_key=api_key)

    cars_info = "\n".join([
        f"- {c['car']} (Fit: {c['fit_score']}, Risk: {c['risk_score']}/10, Sentiment: {c['sentiment']['score']})"
        for c in rejected_cars
    ])

    prompt = f"""
User profile: {json.dumps(user_input)}
Best car chosen: {best_car['car']}

These cars were NOT selected:
{cars_info}

For each rejected car, give 1-2 SHORT reasons why it lost (max 8 words each).
Reference: risk score, sentiment, or mismatch with user needs.

Return ONLY raw JSON array. No markdown blocks.
[
  {{"car": "...", "reasons": ["...", "..."]}},
  ...
]
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return json.loads(_strip_json(response.choices[0].message.content.strip()))
    except Exception:
        return [{"car": c["car"], "reasons": ["Lower overall fit score"]} for c in rejected_cars]


def analyze_car(data):
    """Single-vehicle rigorous diagnostic flow."""
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

    risk, fraud_level, fraud_label, damage, reasons, confidence = analyze_risk(
        year, mileage, engine, owners, fuel
    )

    recommendation = _recommendation_from_risk(risk, fraud_level)

    response = {
        "price_range": price_range,
        "risk_score": risk,
        "fraud_level": fraud_level,
        "fraud_label": fraud_label,
        "hidden_damage": damage,
        "data_confidence": confidence,
        "recommendation": recommendation,
        "reasons": reasons,
    }

    # Internal fields for AI advisor wrapper
    response["_model"] = str(data.get("model", "")).strip()

    try:
        response["ai_advice"] = generate_ai_advice(response)
    except Exception:
        response["ai_advice"] = "AI advice not available"

    response.pop("_model", None)
    return response


def run_assistant_pipeline(data):
    """Questionnaire-driven multi-car decision system."""
    top_cars = recommend_cars(data)
    is_new = data.get("car_condition", "used") == "new"

    comparisons = []
    community_insights = []
    enriched_candidates = []

    for car in top_cars:
        car_name = car["car"]
        specs = car["specs"]
        fit_score = car.get("fit_score", 85)

        if is_new:
            # New cars: use LLM-provided showroom price, no ML prediction or risk scoring
            raw_price = car.get("showroom_price", data.get("budget", 800000))
            price_range = format_price_range(raw_price)
            risk = 0
        else:
            # Used cars: ML price prediction + risk scoring
            model_input = prepare_input(
                specs["year"], specs["mileage_kmpl"], specs["engine_cc"],
                specs["owner_count"], specs["fuel_type"], specs["transmission"]
            )
            predicted_price = predict_price(model_input)
            price_range = format_price_range(predicted_price)
            risk, _, _, _, _, _ = analyze_risk(
                specs["year"], specs["mileage_kmpl"], specs["engine_cc"],
                specs["owner_count"], specs["fuel_type"]
            )

        # Reddit Data & Sentiment
        raw_posts = fetch_reddit_posts(car_name)
        cleaned_posts = clean_posts(raw_posts)
        sentiment_data = analyze_sentiment(cleaned_posts)
        insights = summarize_reviews(cleaned_posts, car_name)

        top_issue = insights.get("top_issue", "Minor issues reported")

        candidate = {
            "car": car_name,
            "fit_score": fit_score,
            "risk_score": risk,
            "price_range": price_range,
            "sentiment": sentiment_data,
            "top_issue": top_issue
        }
        enriched_candidates.append(candidate)

        comparisons.append({
            "car": car_name,
            "fit_score": fit_score,
            "risk_score": risk,
            "sentiment": sentiment_data,
            "top_issue": top_issue
        })

        community_insights.append({
            "car": car_name,
            "pros": insights.get("pros", []),
            "cons": insights.get("cons", []),
            "verdict": insights.get("verdict", "")
        })

    # Pick the best choice: fit_score - risk_score descending
    sorted_candidates = sorted(enriched_candidates, key=lambda x: x["fit_score"] - x["risk_score"], reverse=True)
    best = sorted_candidates[0]
    rejected = sorted_candidates[1:]

    # Generate decision block (why_this_wins + trade_offs)
    decision_block = _generate_decision_block(best, enriched_candidates, data)

    # Generate why_not for rejected cars
    why_not = _generate_why_not(rejected, best, data)

    # Calculate decision confidence
    decision_confidence = int(
        0.5 * best["fit_score"] +
        0.3 * best["sentiment"]["score"] +
        0.2 * (100 - best["risk_score"] * 10)
    )
    decision_confidence = max(0, min(100, decision_confidence))

    return {
        "best_choice": {
            "car": best["car"],
            "fit_score": best["fit_score"],
            "risk_score": best["risk_score"],
            "price_range": best["price_range"],
            "sentiment": best["sentiment"],
            "why_this_wins": decision_block.get("why_this_wins", []),
            "trade_offs": decision_block.get("trade_offs", [])
        },
        "comparisons": comparisons,
        "why_not": why_not,
        "community_insights": community_insights,
        "decision_confidence": decision_confidence
    }