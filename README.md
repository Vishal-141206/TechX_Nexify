# CarSure

### AI-Powered Car Risk Assessment, Decision System & Buying Advisor

> **One intelligent platform to evaluate any car before you buy it — used or brand new.**

---

## Problem

Buying a used car in India is a gamble:

- **Sellers manipulate data** — odometer rollbacks, fake service records, hidden ownership transfers
- **No easy way to verify claims** — buyers rely on trust, not data
- **Pricing is opaque** — no standardized way to know if a deal is fair
- **Non-experts can't assess risk** — mechanical issues, fraud signals, and red flags go unnoticed

> Every year, **1 in 5 used cars** sold in India has tampered odometer readings.

---

## Solution

**CarSure AI** gives you two powerful tools:

1. **AI Car Analyzer** — Run rigorous diagnostics on a specific used vehicle (price prediction, risk scoring, fraud detection, AI advisor).
2. **AI Decision Dashboard** — Tell us your budget, lifestyle, and preferences. The system recommends the best cars, scores them across Fit/Risk/Sentiment, explains why the best wins, why others lose, and quantifies its own confidence.

Supports both **used cars** (ML-predicted pricing + risk scoring) and **brand new cars** (LLM showroom pricing + zero-risk baseline).

No guesswork. No assumptions. Just data.

---

## Key Features

| Feature | Description |
|---|---|
| **ML Price Prediction** | Trained model predicts fair market price range based on year, mileage, engine, fuel type, transmission, and ownership |
| **Risk Scoring Engine** | 0-10 score evaluating age, usage patterns, ownership history, and mechanical indicators |
| **3-Level Fraud Classification** | Cumulative signal-based fraud scoring: L1 Clean (0 signals), L2 Suspicious (1-2 signals), L3 High Risk (3+ signals) |
| **Data Confidence Rating** | Tells you how trustworthy the submitted data is — High / Medium / Low |
| **Dual Architecture** | Supports both single-vehicle diagnostics (`/analyze`) and a structured decision system (`/assistant`) |
| **Used vs New Toggle** | User selects car condition; used cars go through ML pricing + risk engine, new cars use LLM showroom pricing with zero risk |
| **Decision System** | Best Choice with comparative `why_this_wins`, `trade_offs`, and a numeric `decision_confidence` score |
| **Sentiment Humanization** | HuggingFace RoBERTa scores mapped to human labels: Positive / Neutral / Risk |
| **Why-Not Engine** | LLM-generated rejection reasons for every non-winning car, referencing risk, sentiment, and user profile mismatch |
| **Community Insights** | Scrapes `r/CarsIndia`, quantifies sentiment via `roberta-base-sentiment`, and extracts strict JSON `pros`, `cons`, `top_issue`, and `verdict` |

---

## Architecture

```
+-----------------------------------------------------+
|                   Next.js Frontend                   |
|  Cinematic scroll landing  ->  Analyze Car form      |
|  Decision Dashboard  ->  Comparison + Why-Not Grid   |
+------------------------+----------------------------+
                         | POST /analyze
                         | POST /assistant
                         v
+-----------------------------------------------------+
|                  FastAPI Backend                      |
|                                                      |
|  +--------------+  +--------------+  +------------+  |
|  | ML Predictor |  | Risk Engine  |  | Reddit API |  |
|  | (price_model |  | (fraud,risk, |  | (scraper)  |  |
|  |   .pkl)      |  |  confidence) |  |            |  |
|  +------+-------+  +------+-------+  +-----+------+  |
|         |                 |               |           |
|         +--------+--------+---------------+           |
|                  v                                    |
|  +--------------+  +--------------+  +-------------+ |
|  |  AI Advisor  |  |  Sentiment   |  | Why-Not     | |
|  |  Groq LLM    |  |  HuggingFace |  | Engine      | |
|  +--------------+  +--------------+  +-------------+ |
+-----------------------------------------------------+
```

---

## How It Works

### Analyze Car (Single Vehicle Diagnostics)

1. **User enters car details** — year, mileage (km/l), engine CC, owner count, fuel type, transmission
2. **ML model predicts price** — trained scikit-learn model outputs estimated market value
3. **Risk engine scores the car** — evaluates 10+ risk factors and flags fraud patterns
4. **AI Advisor generates recommendation** — LLM synthesizes all signals into a concise buying recommendation

### Decision Dashboard (Multi-Car Buying Assistant)

1. **User selects car condition** — Used Car or Brand New Car
2. **User enters preferences** — budget, usage, family size, priority, fuel preference
3. **LLM recommends 3 cars** — tailored to the user's exact profile with fit scores
4. **For used cars**: ML model predicts price + risk engine scores each car
5. **For new cars**: LLM provides showroom/on-road pricing, risk is set to 0
6. **Sentiment engine scores community feedback** — HuggingFace RoBERTa analyzes Reddit discussions
7. **Decision block selects the best car** — using `fit_score - risk_score` ranking
8. **Why-Not engine explains rejections** — 1-2 reasons per non-winning car
9. **Confidence score computed** — `0.5 * fit + 0.3 * sentiment + 0.2 * (100 - risk * 10)`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Framer Motion, Plus Jakarta Sans |
| **Backend API** | Python, FastAPI, Uvicorn |
| **ML Model** | scikit-learn (trained price prediction model) |
| **AI Advisor** | Groq API (LLaMA 3.3 70B Versatile) with fail-safe |
| **Sentiment** | HuggingFace Inference API (cardiffnlp/twitter-roberta-base-sentiment) |
| **Reddit Scraping** | Reddit JSON API with Groq-powered structured summarization |
| **Data Processing** | pandas, NumPy, joblib |

---

## Project Structure

```
TechX_Nexify/
|
|-- backend/
|   |-- main.py                        # FastAPI app with /analyze and /assistant endpoints
|   |-- requirements.txt               # Python dependencies
|   |-- model/
|   |   |-- predictor.py               # ML price prediction logic
|   |   |-- price_model.pkl            # Trained scikit-learn model
|   |-- services/
|   |   |-- analysis.py                # Main orchestrator (analyze_car + run_assistant_pipeline)
|   |   |-- risk_engine.py             # Risk scoring + 3-level fraud classification
|   |   |-- recommendation.py          # LLM-powered car recommendation engine (used + new)
|   |   |-- reddit_service.py          # Reddit scraper + Groq structured summarizer
|   |   |-- sentiment.py               # HuggingFace sentiment analysis + label humanization
|   |   |-- ai_advisor.py              # LLM + rule-based advisor for single car analysis
|   |-- utils/
|       |-- formatter.py               # Price formatting utility
|
|-- frontend/
|   |-- app/
|   |   |-- globals.css            # Global styles and design tokens
|   |   |-- layout.tsx             # Root layout (Plus Jakarta Sans font)
|   |   |-- page.tsx               # Home page (imports home-experience)
|   |   |-- analyze/
|   |   |   |-- page.tsx           # Single vehicle diagnostic form + analysis stream
|   |   |-- assistant/
|   |   |   |-- page.tsx           # Decision Dashboard (multi-car comparison)
|   |   |-- compare/
|   |       |-- page.tsx           # Car comparison page
|   |-- src/
|   |   |-- components/
|   |   |   |-- carsure/
|   |   |       |-- home-experience.tsx # Cinematic scroll landing + story frames + app section
|   |   |-- lib/
|   |       |-- api.ts                 # Centralized API network configurations
|   |-- public/
|   |   |-- black-arrow.png            # UI arrow asset (default state)
|   |   |-- white-arrow.png            # UI arrow asset (hover state)
|   |-- package.json
|   |-- tailwind.config.js
|   |-- tsconfig.json
|   |-- next.config.ts
|   |-- postcss.config.js
|   |-- eslint.config.mjs
|
|-- README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key (required for LLM advisor, recommendations, and why-not engine)

### Backend

```bash
cd backend
pip install -r requirements.txt
export GROQ_API_KEY="your_groq_api_key"
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Reference

### POST /analyze

Single-vehicle diagnostic endpoint.

**Request:**
```json
{
  "year": 2019,
  "mileage_kmpl": 18.5,
  "engine_cc": 1497,
  "owner_count": 2,
  "fuel_type": "Diesel",
  "transmission": "Manual"
}
```

**Response:**
```json
{
  "price_range": "5.5L - 6.5L",
  "risk_score": 5,
  "fraud_level": 2,
  "fraud_label": "Suspicious",
  "hidden_damage": false,
  "data_confidence": "High",
  "recommendation": "Risky",
  "reasons": ["Vehicle age may lead to increased wear"],
  "ai_advice": "Price estimate is 5.5L-6.5L with a risk score of 5/10..."
}
```

### POST /assistant

Multi-car decision dashboard endpoint.

**Request:**
```json
{
  "budget": 1000000,
  "usage": "city",
  "monthly_km": 500,
  "priority": "comfort",
  "family_size": 4,
  "fuel_preference": "none",
  "car_condition": "used"
}
```

**Response:**
```json
{
  "best_choice": {
    "car": "Hyundai Verna",
    "fit_score": 95,
    "risk_score": 3,
    "price_range": "6.5L - 7.5L",
    "sentiment": { "score": 78, "label": "Positive" },
    "why_this_wins": ["Best match for city + family usage", "Lower ownership cost"],
    "trade_offs": ["High infotainment replacement cost"]
  },
  "comparisons": [
    { "car": "Hyundai Verna", "fit_score": 95, "risk_score": 3, "sentiment": { "score": 78, "label": "Positive" }, "top_issue": "..." }
  ],
  "why_not": [
    { "car": "Honda City", "reasons": ["Lower fit for comfort usage", "Mixed CVT feedback"] }
  ],
  "community_insights": [
    { "car": "Hyundai Verna", "pros": ["...", "..."], "cons": ["...", "..."], "verdict": "..." }
  ],
  "decision_confidence": 87
}
```

---

## Risk Engine Logic

| Factor | Risk Impact | Fraud Signals | Confidence Impact |
|---|---|---|---|
| Low mileage on old car | +3 risk | +2 signals | -30% confidence |
| "Too perfect" profile (old, 1 owner, high mileage) | +2 risk | +2 signals | -20% confidence |
| Vehicle age > 12 years | +3 risk | -- | -10% confidence |
| 5+ owners | +3 risk | +1 signal | -15% confidence |
| Engine >3000cc with low efficiency | +2 risk, damage flag | -- | -10% confidence |
| Engine >3000cc with high efficiency | +2 risk | +2 signals | -20% confidence |
| Diesel with mileage < 12 | +1 risk | -- | -- |
| Old EV (>8 years) | +2 risk | -- | -10% confidence |
| Old car (>10yr) + many owners (>3) | +1 risk | +1 signal | -5% confidence |
| Old car (>10yr) + high mileage (>22) | +2 risk | +2 signals | -20% confidence |

### Fraud Classification Levels

| Level | Signal Count | Label | Action |
|---|---|---|---|
| L1 | 0 | Clean | No anomalies detected |
| L2 | 1-2 | Suspicious | Some patterns flagged, needs inspection |
| L3 | 3+ | High Risk | Multiple fraud indicators confirmed |

---

## Future Scope

- Integration with RTO and insurance APIs for real-time verification
- Computer vision for physical damage detection from images
- Real-time market price comparison across platforms
- Blockchain-based tamper-proof vehicle history
- Mobile app with camera-based VIN scanning

---

## Impact

- **Prevents financial loss** — buyers avoid overpriced or fraudulent cars
- **Builds market trust** — transparent, data-driven assessments
- **Democratizes expertise** — anyone can evaluate a car like a mechanic
- **Reduces fraud** — makes data manipulation detectable

---

## Team — TechX Nexify

Built for hackathon.

---

*CarSure AI transforms car buying from guesswork to data-driven decisions — making the process safer, smarter, and more transparent.*
