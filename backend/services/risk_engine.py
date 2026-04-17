def analyze_risk(year, mileage, engine, owners, fuel):

    age = 2025 - year

    risk = 3
    fraud_signals = 0  # Count fraud triggers for 3-level classification
    damage = False
    reasons = []
    confidence = 100

    # ODOMETER FRAUD (low mileage for age)
    if mileage < 10 and age > 5:
        fraud_signals += 2
        risk += 3
        confidence -= 30
        reasons.append("Mileage unusually low for vehicle age — possible odometer tampering")

    # TOO PERFECT DATA
    if age > 8 and owners == 1 and mileage > 20:
        fraud_signals += 2
        risk += 2
        confidence -= 20
        reasons.append("Unusually ideal profile — data may be manipulated")

    # AGE IMPACT
    if age > 12:
        risk += 3
        confidence -= 10
        reasons.append("Older vehicle likely to incur higher maintenance and repair costs")
    elif age > 8:
        risk += 2
        confidence -= 5
        reasons.append("Vehicle age may lead to increased wear and reduced reliability")

    # OWNERSHIP PATTERN
    if owners >= 5:
        risk += 3
        confidence -= 15
        fraud_signals += 1
        reasons.append("Frequent ownership changes may indicate recurring issues")
    elif owners >= 3:
        risk += 2
        confidence -= 10
        reasons.append("Multiple owners may reflect inconsistent maintenance history")

    # ENGINE + EFFICIENCY RELATION
    if engine > 3000 and mileage < 12:
        damage = True
        risk += 2
        confidence -= 10
        reasons.append("Low efficiency for high engine capacity may indicate engine wear")

    # ENGINE + HIGH MILEAGE (suspicious combo)
    if engine > 3000 and mileage > 20:
        fraud_signals += 2
        risk += 2
        confidence -= 20
        reasons.append("High engine capacity with unusually high efficiency — suspicious combination")

    # FUEL-SPECIFIC LOGIC
    if fuel == "Diesel" and mileage < 12:
        risk += 1
        reasons.append("Diesel vehicles typically offer better efficiency — deviation may signal issues")

    if fuel == "Electric" and age > 8:
        risk += 2
        confidence -= 10
        reasons.append("Older electric vehicles may face battery degradation concerns")

    # AGE + OWNERS COMBO
    if age > 10 and owners > 3:
        risk += 1
        confidence -= 5
        fraud_signals += 1
        reasons.append("Older vehicle with multiple owners increases reliability concerns")

    # EXTREME INCONSISTENCY CHECK
    if age > 10 and mileage > 22:
        fraud_signals += 2
        risk += 2
        confidence -= 20
        reasons.append("Mileage unusually high for older vehicle — possible inconsistency")

    # Cap risk
    risk = min(risk, 10)

    # Confidence label
    if confidence >= 80:
        confidence_label = "High"
    elif confidence >= 50:
        confidence_label = "Medium"
    else:
        confidence_label = "Low"

    # 3-Level Fraud Risk Classification
    # Level 1: Clean (0 signals)
    # Level 2: Suspicious (1-2 signals)
    # Level 3: High Risk (3+ signals)
    if fraud_signals >= 3:
        fraud_level = 3
        fraud_label = "High Risk"
    elif fraud_signals >= 1:
        fraud_level = 2
        fraud_label = "Suspicious"
    else:
        fraud_level = 1
        fraud_label = "Clean"

    # Default message
    if not reasons:
        reasons.append("No major risk factors detected — vehicle appears well-maintained")

    return risk, fraud_level, fraud_label, damage, reasons, confidence_label