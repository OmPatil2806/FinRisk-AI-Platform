from typing import Dict, Any, List


def generate_insights(row: Dict[str, Any], risk_level: str, health_score: float) -> List[str]:
    insights = []

    er  = row.get("expense_ratio", 0)
    mr  = row.get("emi_ratio", 0)
    cr  = row.get("credit_score", 700)
    dti = row.get("debt_to_income_ratio", 0)
    ns  = row.get("net_savings", 0)
    sr  = row.get("savings_ratio", 0)
    lb  = row.get("loan_burden", 0)
    ib  = row.get("interest_burden", 0)

    badge   = {"High": "🔴 HIGH RISK", "Medium": "🟡 MEDIUM RISK", "Low": "🟢 LOW RISK"}[risk_level]
    tagline = {
        "High":   "Immediate financial restructuring needed.",
        "Medium": "Several areas need attention.",
        "Low":    "Financially healthy profile.",
    }[risk_level]
    insights.append(f"{badge} (Score: {health_score}/100) — {tagline}")

    if er > 0.85:
        insights.append(f"⚠️ OVERSPENDING: Expenses are {er*100:.0f}% of income. Target below 70%.")
    elif er > 0.70:
        insights.append(f"📊 High expense ratio ({er*100:.0f}%). Reduce discretionary spending.")

    if mr > 0.40:
        insights.append(f"🔴 DEBT OVERLOAD: EMI takes {mr*100:.0f}% of income. Recommended cap is 35-40%.")
    elif mr > 0.25:
        insights.append(f"📉 Moderate EMI burden ({mr*100:.0f}%). Monitor closely.")

    if dti > 0.4:
        insights.append(f"🚨 HIGH DTI: {dti:.2f} — lenders typically reject above 0.43.")

    if lb > 3:
        insights.append(f"💳 Loan principal is {lb:.1f}x annual income — above safe threshold.")

    if ib > 0.15:
        insights.append(f"📈 High interest burden ({ib*100:.0f}% of annual income). Consider refinancing.")

    if cr < 500:
        insights.append(f"🔴 CRITICAL CREDIT SCORE ({cr}): Focus on on-time payments immediately.")
    elif cr < 620:
        insights.append(f"⚠️ Poor credit score ({cr}). Target 680+ for better loan rates.")
    elif cr >= 750:
        insights.append(f"✅ Excellent credit score ({cr}). Eligible for premium loan rates.")

    if ns < 0:
        insights.append("🔴 NEGATIVE CASH FLOW: Monthly outflows exceed income. Urgent action required.")
    elif ns < 200:
        insights.append(f"⚠️ Near-zero monthly savings (${ns:.0f}). Build a 3-6 month emergency fund.")

    if sr < 0.05:
        insights.append("📦 Savings pool below 5% of annual income — critically low buffer.")
    elif sr > 0.50:
        insights.append("✅ Strong savings base. Consider diversifying into investments.")

    return insights
