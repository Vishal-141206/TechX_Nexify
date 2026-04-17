def format_price_range(price):

    center = int(round(price / 100000) * 100000)
    lower = max(0, center - 50000)
    upper = center + 50000

    def format_lakh(v):
        return f"{v/100000:.1f}L"

    return f"₹{format_lakh(lower)} - ₹{format_lakh(upper)}"