#  CarSure AI

### AI-Powered Used Car Risk Assessment, Fraud Detection & Buying Advisor

> **One intelligent platform to evaluate any used car before you buy it.**

---

##  Problem

Buying a used car in India is a gamble:

- **Sellers manipulate data** — odometer rollbacks, fake service records, hidden ownership transfers
- **No easy way to verify claims** — buyers rely on trust, not data
- **Pricing is opaque** — no standardized way to know if a deal is fair
- **Non-experts can't assess risk** — mechanical issues, fraud signals, and red flags go unnoticed

> Every year, **1 in 5 used cars** sold in India has tampered odometer readings.

---

##  Solution

**CarSure AI** analyzes a used car's data and generates a **complete intelligence report in seconds** — covering pricing, risk, fraud, vehicle verification, and an AI-generated buying recommendation.

No guesswork. No assumptions. Just data.

---

##  Key Features

| Feature | Description |
|---|---|
|  **ML Price Prediction** | Trained model predicts fair market price range based on year, mileage, engine, fuel type, transmission, and ownership |
|  **Risk Scoring Engine** | 0–10 score evaluating age, usage patterns, ownership history, and mechanical indicators |
|  **Fraud Detection** | Detects odometer tampering, suspicious data combinations, and "too perfect" seller profiles |
|  **Data Confidence Rating** | Tells you how trustworthy the submitted data is — High / Medium / Low |
|  **Vehicle Verification** | Cross-checks ownership, registration year, fuel type, challans, and accident history against official records |
|  **AI Buying Advisor** | LLM-powered single-response advisor that synthesizes all analysis into a clear 4-line recommendation |
|  **Explainable Reasons** | Every risk flag comes with a human-readable explanation of *why* |

---

##  Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│  Cinematic scroll landing → Full analysis form →    │
│  Analysis Card + Verification Card + AI Advisor     │
└──────────────────────┬──────────────────────────────┘
                       │ POST /analyze
                       ▼
┌─────────────────────────────────────────────────────┐
│                  FastAPI Backend                     │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ ML Predictor │  │ Risk Engine  │  │Verification│  │
│  │ (price_model │  │ (fraud,risk, │  │ (mock/API) │  │
│  │   .pkl)      │  │  confidence) │  │            │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                 │                │         │
│         └────────┬────────┘────────────────┘         │
│                  ▼                                   │
│         ┌──────────────┐                             │
│         │  AI Advisor  │  Groq LLM (llama-3.3-70b)  │
│         │  + Fallback  │  Rule-based if API fails    │
│         └──────────────┘                             │
└─────────────────────────────────────────────────────┘
```

---

##  How It Works

1. **User enters car details** — year, mileage (km/l), engine CC, owner count, fuel type, transmission, vehicle number (optional)
2. **ML model predicts price** — trained scikit-learn model outputs estimated market value
3. **Risk engine scores the car** — evaluates 10+ risk factors and flags fraud patterns
4. **Verification engine cross-checks** — matches seller claims against official vehicle records
5. **AI Advisor generates recommendation** — LLM synthesizes all signals into a 4-line buying recommendation
6. **Frontend displays results** — Analysis Card, Verification Card, and AI Advisor Card

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| **Backend API** | Python, FastAPI, Uvicorn |
| **ML Model** | scikit-learn (trained price prediction model) |
| **AI Advisor** | Groq API (LLaMA 3.3 70B Versatile) with fail-safe |
| **Verification** | Mock engine + pluggable external API support |
| **Data Processing** | pandas, NumPy, joblib |

---

##  Project Structure

```
CarSure/
├── backend/
│   ├── main.py                    # FastAPI app with /analyze endpoint
│   ├── model/
│   │   ├── predictor.py           # ML price prediction
│   │   └── price_model.pkl        # Trained model
│   ├── services/
│   │   ├── analysis.py            # Main orchestrator
│   │   ├── risk_engine.py         # Risk scoring + fraud detection
│   │   ├── verification.py        # Vehicle record verification
│   │   └── ai_advisor.py          # LLM + rule-based advisor
│   ├── utils/
│   │   └── formatter.py           # Price formatting
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Home (cinematic scroll landing)
│   │   │   ├── analyze/page.tsx   # Full analysis form + results
│   │   │   └── layout.tsx
│   │   └── components/
│   │       └── carsure/
│   │           └── home-experience.tsx
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

##  Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- (Optional) Groq API key for LLM-powered advisor

### Backend

```bash
cd backend
pip install -r requirements.txt
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

### Environment Variables (Optional)

```bash
# For LLM-powered AI advisor (falls back to rule-based if not set)
export GROQ_API_KEY="your_groq_api_key"

# For real vehicle verification API (uses mock data if not set)
export VEHICLE_VERIFICATION_API_URL="https://api.example.com/verify"
export VEHICLE_VERIFICATION_API_KEY="your_api_key"
```

---

##  API Reference

### `POST /analyze`

**Request:**
```json
{
  "year": 2019,
  "mileage_kmpl": 18.5,
  "engine_cc": 1497,
  "owner_count": 2,
  "fuel_type": "Diesel",
  "transmission": "Manual",
  "vehicle_number": "DL01AB1234"
}
```

**Response:**
```json
{
  "price_range": "₹5.5L - ₹6.5L",
  "risk_score": 5,
  "fraud_detected": false,
  "hidden_damage": false,
  "data_confidence": "High",
  "recommendation": "Risky ⚠️",
  "reasons": [
    "Vehicle age may lead to increased wear and reduced reliability"
  ],
  "verification": {
    "status": "Verified",
    "details": {
      "owner_count": 2,
      "registration_year": 2019,
      "fuel_type": "Diesel",
      "challan_count": 1,
      "accident_history": "Not Available"
    }
  },
  "ai_advice": "**Hyundai Venue**:\nPrice estimate is ₹5.5L-₹6.5L with a risk score of 5/10.\nVerification: Verified. Fraud: not detected.\nNo major red flags; a standard pre-purchase inspection is advised.\nRecommendation: Risky ⚠️"
}
```

---

## 🧪 Risk Engine Logic

| Factor | Risk Impact | Confidence Impact |
|---|---|---|
| Low mileage on old car | +3 risk, fraud flag | -30% confidence |
| "Too perfect" profile (old, 1 owner, high mileage) | +2 risk, fraud flag | -20% confidence |
| Vehicle age > 12 years | +3 risk | -10% confidence |
| 5+ owners | +3 risk | -15% confidence |
| Engine >3000cc with low efficiency | +2 risk, damage flag | -10% confidence |
| Diesel with mileage < 12 | +1 risk | — |
| Old EV (>8 years) | +2 risk | -10% confidence |
| Verification mismatch | +2-3 risk, fraud flag | — |

---

##  Future Scope

-  Integration with RTO & insurance APIs for real-time verification
-  Computer vision for physical damage detection from images
-  Real-time market price comparison across platforms
-  Blockchain-based tamper-proof vehicle history
-  Mobile app with camera-based VIN scanning

---

##  Impact

- **Prevents financial loss** — buyers avoid overpriced or fraudulent cars
- **Builds market trust** — transparent, data-driven assessments
- **Democratizes expertise** — anyone can evaluate a car like a mechanic
- **Reduces fraud** — makes data manipulation detectable

---

##  Team — TechX Nexify

Built for hackathon with ❤️

---

*CarSure AI transforms used car buying from guesswork to data-driven decisions — making the process safer, smarter, and more transparent.*
