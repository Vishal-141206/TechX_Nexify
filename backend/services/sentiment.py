import requests

API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment"


def sentiment_label(score):
    """Convert numeric sentiment score to human-readable label."""
    if score >= 70:
        return "Positive "
    elif score >= 40:
        return "Neutral "
    else:
        return "Risk "


def analyze_sentiment(posts):
    """Analyze sentiment of Reddit posts. Returns { "score": int, "label": str }."""
    if not posts:
        return {"score": 50, "label": sentiment_label(50)}

    text = " ".join(posts[:5])
    text = text[:1000]

    try:
        response = requests.post(API_URL, json={"inputs": text}, timeout=3)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and isinstance(result[0], list):
                scores = result[0]
                best = max(scores, key=lambda x: x['score'])

                # CardiffNLP mapping: LABEL_0 = negative, LABEL_1 = neutral, LABEL_2 = positive
                label_mapping = {
                    "LABEL_0": "negative",
                    "LABEL_1": "neutral",
                    "LABEL_2": "positive"
                }

                raw_label = label_mapping.get(best["label"], "neutral")
                score_val = int(best["score"] * 100)

                if raw_label == "negative":
                    sentiment_score = 50 - (score_val // 2)
                elif raw_label == "positive":
                    sentiment_score = 50 + (score_val // 2)
                else:
                    sentiment_score = 50

                return {
                    "score": sentiment_score,
                    "label": sentiment_label(sentiment_score)
                }
    except Exception:
        pass

    # Heuristic Fallback
    text_lower = text.lower()
    positive_words = ["good", "great", "excellent", "awesome", "amazing", "love", "reliable", "solid", "perfect", "worth", "best"]
    negative_words = ["bad", "terrible", "worst", "awful", "hate", "unreliable", "expensive", "issue", "problem", "fault", "junk"]

    pos_count = sum(text_lower.count(w) for w in positive_words)
    neg_count = sum(text_lower.count(w) for w in negative_words)

    total = pos_count + neg_count
    if total == 0:
        return {"score": 50, "label": sentiment_label(50)}

    sentiment_score = int((pos_count / total) * 100)
    return {
        "score": sentiment_score,
        "label": sentiment_label(sentiment_score)
    }
