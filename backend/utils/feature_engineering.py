import pandas as pd
import numpy as np


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Fill missing
    df["loan_type"] = df["loan_type"].fillna("None")
    df["has_loan"]  = df["has_loan"].fillna("No")

    inc = df["monthly_income_usd"] + 1e-9
    ann = inc * 12

    # ── Core ratios ───────────────────────────────────────────────────────────
    df["expense_ratio"]     = df["monthly_expenses_usd"] / inc
    df["emi_ratio"]         = df["monthly_emi_usd"]       / inc
    df["savings_ratio"]     = df["savings_usd"]           / ann
    df["net_savings"]       = df["monthly_income_usd"] - df["monthly_expenses_usd"] - df["monthly_emi_usd"]
    df["net_savings_ratio"] = df["net_savings"]           / inc

    # ── Loan / debt burden ────────────────────────────────────────────────────
    df["loan_burden"]       = df["loan_amount_usd"]       / ann
    df["interest_burden"]   = (df["loan_interest_rate_pct"] / 100) * df["loan_amount_usd"] / ann
    df["total_debt_ratio"]  = (df["loan_amount_usd"] + df["monthly_emi_usd"] * df["loan_term_months"]) / ann

    # ── Liquidity & buffer ────────────────────────────────────────────────────
    df["months_of_expenses_saved"] = df["savings_usd"] / (df["monthly_expenses_usd"] + 1e-9)
    df["income_per_age"]           = inc / (df["age"] + 1e-9)

    # ── Credit health ─────────────────────────────────────────────────────────
    df["credit_score_norm"]  = (df["credit_score"] - 300) / 550   # 0–1 scale
    df["credit_dti_interaction"] = df["credit_score_norm"] * (1 - df["debt_to_income_ratio"].clip(0, 1))

    # ── Binary flags (from raw features — no leakage) ─────────────────────────
    df["overspending_flag"]  = (df["expense_ratio"]           > 0.75).astype(int)
    df["high_dti_flag"]      = (df["debt_to_income_ratio"]    > 0.35).astype(int)
    df["low_savings_flag"]   = (df["months_of_expenses_saved"] < 3.0).astype(int)
    df["high_emi_flag"]      = (df["emi_ratio"]               > 0.35).astype(int)
    df["credit_risk_flag"]   = (df["credit_score"]            < 580).astype(int)
    df["poor_credit_flag"]   = (df["credit_score"]            < 500).astype(int)

    # ── Composite stress index [0–1] ──────────────────────────────────────────
    df["financial_stress_index"] = (
        df["expense_ratio"].clip(0, 1)                          * 0.25
        + df["emi_ratio"].clip(0, 1)                            * 0.20
        + (1 - df["credit_score_norm"].clip(0, 1))              * 0.25
        + df["debt_to_income_ratio"].clip(0, 2) / 2            * 0.20
        + (1 - df["months_of_expenses_saved"].clip(0, 12) / 12) * 0.10
    ).clip(0, 1)

    return df


def compute_health_score(row: dict) -> float:
    score = 100.0

    # Expense burden
    score -= min(row["expense_ratio"] * 35, 28)

    # EMI burden
    score -= min(row["emi_ratio"] * 35, 18)

    # Credit contribution
    credit_norm = (row["credit_score"] - 300) / 550
    score += credit_norm * 20 - 10

    # Savings buffer reward
    months_buf = row.get("months_of_expenses_saved", 0)
    score += min(months_buf * 1.5, 12)

    # DTI penalty
    score -= min(row["debt_to_income_ratio"] * 6, 22)

    # Net savings reward
    if row["net_savings"] > 0:
        score += min(row["net_savings_ratio"] * 10, 8)

    return round(float(np.clip(score, 0, 100)), 2)
