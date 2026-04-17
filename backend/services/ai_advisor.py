import json
import os
from groq import Groq

def generate_ai_advice(analysis):
    api_key = os.getenv("GROQ_API_KEY")
    try:
        client = Groq(api_key=api_key)
    except Exception as e:
        return f"AI advice not available (init error: {str(e)})"

    prompt = f"""
You are an expert car advisor.

Car Analysis:
{json.dumps(analysis, ensure_ascii=False, indent=2)}

Give:
- Final recommendation
- Mention key risks (if any)
- If "_model" is empty in Car Analysis, suggest 2-3 specific popular car models in this price range, don't use words like Since the "_model" field is empty- be professional
- IMPORTANT: You MUST completely wrap ANY car model names you mention in double asterisks, exactly like this: **Tata Nexon** or **Hyundai Creta**.

Rules:
- Max 5 sentences
- No assumptions
- No hallucination
- Be confident and practical
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content.strip()
        # Force a newline after every full stop (unless it's already a newline)
        content = content.replace(". ", ".\n")
        return content
    except Exception as e:
        return f"AI advice not available (API error: {str(e)})"
