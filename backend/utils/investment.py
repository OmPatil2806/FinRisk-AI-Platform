from typing import Dict, Any


FUND_DB = {
    "Low": [
        {
            "name":        "Mirae Asset Large Cap Fund",
            "type":        "Equity - Large Cap",
            "risk":        "Low-Moderate",
            "returns_3yr": 14.2,
            "returns_5yr": 16.8,
            "min_sip":     500,
            "platform":    "Groww",
            "url":         "https://groww.in/mutual-funds/mirae-asset-large-cap-fund-direct-growth",
            "tag":         "⭐ Top Rated",
        },
        {
            "name":        "SBI Bluechip Fund",
            "type":        "Equity - Large Cap",
            "risk":        "Low-Moderate",
            "returns_3yr": 13.5,
            "returns_5yr": 15.9,
            "min_sip":     500,
            "platform":    "ET Money",
            "url":         "https://www.etmoney.com/mutual-funds/sbi-bluechip-fund-direct-plan-growth/16",
            "tag":         "🏆 Best Rated",
        },
        {
            "name":        "HDFC Index Fund Nifty 50",
            "type":        "Index Fund",
            "risk":        "Low",
            "returns_3yr": 13.1,
            "returns_5yr": 15.3,
            "min_sip":     100,
            "platform":    "Zerodha Coin",
            "url":         "https://coin.zerodha.com/funds/HDFCNF50/info",
            "tag":         "💰 Low Cost",
        },
    ],
    "Medium": [
        {
            "name":        "Parag Parikh Flexi Cap Fund",
            "type":        "Equity - Flexi Cap",
            "risk":        "Moderate",
            "returns_3yr": 18.4,
            "returns_5yr": 22.1,
            "min_sip":     1000,
            "platform":    "Groww",
            "url":         "https://groww.in/mutual-funds/parag-parikh-flexi-cap-fund-direct-growth",
            "tag":         "⭐ Analyst Pick",
        },
        {
            "name":        "Axis Midcap Fund",
            "type":        "Equity - Mid Cap",
            "risk":        "Moderate-High",
            "returns_3yr": 19.2,
            "returns_5yr": 23.4,
            "min_sip":     500,
            "platform":    "ET Money",
            "url":         "https://www.etmoney.com/mutual-funds/axis-midcap-fund-direct-plan-growth/17",
            "tag":         "📈 High Growth",
        },
        {
            "name":        "ICICI Pru Balanced Advantage",
            "type":        "Hybrid - Dynamic",
            "risk":        "Moderate",
            "returns_3yr": 12.8,
            "returns_5yr": 14.6,
            "min_sip":     500,
            "platform":    "Zerodha Coin",
            "url":         "https://coin.zerodha.com",
            "tag":         "🛡️ Balanced",
        },
    ],
    "High": [
        {
            "name":        "Liquid Fund (Emergency)",
            "type":        "Debt - Liquid",
            "risk":        "Very Low",
            "returns_3yr": 6.8,
            "returns_5yr": 6.5,
            "min_sip":     100,
            "platform":    "Groww",
            "url":         "https://groww.in/mutual-funds/category/liquid-funds",
            "tag":         "🔒 Safe First",
        },
        {
            "name":        "SBI Short Term Debt Fund",
            "type":        "Debt - Short Term",
            "risk":        "Low",
            "returns_3yr": 7.2,
            "returns_5yr": 7.4,
            "min_sip":     500,
            "platform":    "ET Money",
            "url":         "https://www.etmoney.com/mutual-funds/debt",
            "tag":         "💼 Stable",
        },
        {
            "name":        "HDFC Gold Fund",
            "type":        "Gold ETF",
            "risk":        "Moderate",
            "returns_3yr": 11.3,
            "returns_5yr": 12.1,
            "min_sip":     100,
            "platform":    "Zerodha Coin",
            "url":         "https://coin.zerodha.com",
            "tag":         "🥇 Hedge",
        },
    ],
}

PLATFORMS = [
    {"name": "Groww",         "url": "https://groww.in",              "logo": "🌱", "desc": "Best for beginners"},
    {"name": "Zerodha Coin",  "url": "https://coin.zerodha.com",      "logo": "⚡", "desc": "Zero commission MF"},
    {"name": "ET Money",      "url": "https://www.etmoney.com",       "logo": "💹", "desc": "Smart portfolio tools"},
    {"name": "Kuvera",        "url": "https://kuvera.in",             "logo": "🎯", "desc": "Goal-based investing"},
    {"name": "Paytm Money",   "url": "https://www.paytmmoney.com",    "logo": "💰", "desc": "Easy SIP setup"},
    {"name": "Vanguard",      "url": "https://investor.vanguard.com", "logo": "🏦", "desc": "Global index funds"},
]


def generate_investment_plan(risk_level: str, row: Dict[str, Any]) -> Dict:
    income   = row.get("monthly_income_usd", 0)
    expenses = row.get("monthly_expenses_usd", 0)
    emi      = row.get("monthly_emi_usd", 0)
    savings  = row.get("savings_usd", 0)
    net      = income - expenses - emi

    # Safe investable amount
    emergency_target = expenses * 6
    emergency_gap    = max(0, emergency_target - savings)
    emergency_monthly= round(min(net * 0.3, emergency_gap / 12), 2) if emergency_gap > 0 else 0

    investable = max(0, net - emergency_monthly)

    # Allocation by risk level
    alloc = {
        "Low":    {"equity": 70, "debt": 20, "gold": 5,  "cash": 5},
        "Medium": {"equity": 45, "debt": 35, "gold": 10, "cash": 10},
        "High":   {"equity": 20, "debt": 50, "gold": 15, "cash": 15},
    }.get(risk_level, {"equity": 50, "debt": 30, "gold": 10, "cash": 10})

    monthly_sip = round(investable * 0.7, 2)

    # SIP projections at 12% annualised
    def sip_value(monthly, years, rate=0.12):
        r = rate / 12
        n = years * 12
        if r == 0:
            return monthly * n
        return round(monthly * ((((1 + r) ** n) - 1) / r) * (1 + r), 2)

    projections = {
        "1yr":  sip_value(monthly_sip, 1),
        "3yr":  sip_value(monthly_sip, 3),
        "5yr":  sip_value(monthly_sip, 5),
        "10yr": sip_value(monthly_sip, 10),
    }

    return {
        "monthly_investable":  round(investable, 2),
        "monthly_sip":         monthly_sip,
        "emergency_monthly":   emergency_monthly,
        "emergency_gap":       round(emergency_gap, 2),
        "allocation":          alloc,
        "projections":         projections,
        "recommended_funds":   FUND_DB.get(risk_level, FUND_DB["Medium"]),
        "platforms":           PLATFORMS,
    }
