import requests
import os
import json
from groq import Groq

def fetch_reddit_posts(car_name):
    url = f"https://www.reddit.com/r/CarsIndia/search.json?q={car_name.replace(' ', '+')}&restrict_sr=on&sort=relevance&t=all"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 CarSureBot"}
    try:
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code != 200:
            return []
        data = res.json()
        children = data.get('data', {}).get('children', [])
        return children[:10]
    except Exception:
        return []

def clean_posts(posts):
    texts = []
    for c in posts:
        title = c['data'].get('title', '')
        selftext = c['data'].get('selftext', '')
        combined = f"{title}. {selftext}"
        if len(combined) > 20: 
            texts.append(combined[:500]) # Cap length per post to avoid huge prompts
    return texts

def summarize_reviews(posts, car_name):
    default_fallback = {
        "pros": ["Comfortable ride", "Good general availability"],
        "cons": ["Varies by specific condition", "Maintenance costs"],
        "top_issue": "General wear and tear",
        "verdict": "Reliable if rigorously inspected."
    }

    if not posts:
        return default_fallback
        
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return default_fallback
        
    client = Groq(api_key=api_key)
    
    combined_text = "\n---\n".join(posts)
    
    prompt = f"""
These are Reddit discussions about the car "{car_name}":

{combined_text}

Extract:
- 2 strong positives 
- 2 real concerns
- 1 critical issue users mention often

Return ONLY JSON. Do not wrap in markdown syntax (```json). No extra text.
{{
  "pros": ["..."],
  "cons": ["..."],
  "top_issue": "...",
  "verdict": "..."
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:]
        if content.startswith("```"): content = content[3:]
        if content.endswith("```"): content = content[:-3]
        
        return json.loads(content.strip())
    except Exception:
        return default_fallback
