import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib

from utils.feature_engineering import engineer_features


# ── Feature sets ──────────────────────────────────────────────────────────────
NUMERICAL_FEATURES = [
    # Raw
    "age", "monthly_income_usd", "monthly_expenses_usd", "savings_usd",
    "loan_amount_usd", "loan_term_months", "monthly_emi_usd",
    "loan_interest_rate_pct", "debt_to_income_ratio", "credit_score",
    # Engineered
    "expense_ratio", "emi_ratio", "savings_ratio", "net_savings",
    "net_savings_ratio", "loan_burden", "interest_burden", "total_debt_ratio",
    "months_of_expenses_saved", "income_per_age",
    "credit_score_norm", "credit_dti_interaction", "financial_stress_index",
    # Flags
    "overspending_flag", "high_dti_flag", "low_savings_flag",
    "high_emi_flag", "credit_risk_flag", "poor_credit_flag",
]

CATEGORICAL_FEATURES = [
    "gender", "education_level", "employment_status", "loan_type",
]


# ── Risk label ────────────────────────────────────────────────────────────────
# Composite score across 4 independent raw dimensions (0-100).
# Labels are created from RAW columns only — not engineered features —
# so the model must learn real multi-dimensional patterns.
#
# Credit score   0-40 pts | DTI ratio    0-30 pts
# Expense ratio  0-20 pts | Savings buf  0-10 pts
#
# Low: 0-30  |  Medium: 31-54  |  High: 55-100

def _composite_risk_score(row) -> int:
    score = 0

    cs = row["credit_score"]
    if cs < 500:      score += 40
    elif cs < 580:    score += 28
    elif cs < 650:    score += 18
    elif cs < 720:    score += 8

    dti = row["debt_to_income_ratio"]
    if dti > 0.50:    score += 30
    elif dti > 0.35:  score += 20
    elif dti > 0.20:  score += 12
    elif dti > 0.10:  score += 5

    er = row["monthly_expenses_usd"] / (row["monthly_income_usd"] + 1e-9)
    if er > 0.75:     score += 20
    elif er > 0.60:   score += 13
    elif er > 0.45:   score += 6

    buf = row["savings_usd"] / (row["monthly_expenses_usd"] + 1e-9)
    if buf < 1:       score += 10
    elif buf < 3:     score += 6
    elif buf < 6:     score += 2

    return score


def create_risk_label(df: pd.DataFrame) -> pd.Series:
    scores = df.apply(_composite_risk_score, axis=1)
    return pd.cut(
        scores,
        bins=[-1, 30, 54, 100],
        labels=["Low", "Medium", "High"],
    ).astype(str)


# ── ML Pipeline ───────────────────────────────────────────────────────────────
def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), NUMERICAL_FEATURES),
        ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), CATEGORICAL_FEATURES),
    ])
    clf = RandomForestClassifier(
        n_estimators=300, max_depth=15, min_samples_leaf=3,
        class_weight="balanced", n_jobs=-1, random_state=42,
    )
    return Pipeline([("preprocessor", preprocessor), ("clf", clf)])


# ── Train ─────────────────────────────────────────────────────────────────────
def train():
    DATA_PATH  = os.path.join(BACKEND_DIR, "data", "dataset.csv")
    MODEL_PATH = os.path.join(BACKEND_DIR, "models", "risk_model.pkl")

    print(f"[INFO] Loading data  : {DATA_PATH}")
    print(f"[INFO] Model output  : {MODEL_PATH}")

    df = pd.read_csv(DATA_PATH)
    df = engineer_features(df)
    df["risk_level"] = create_risk_label(df)

    print(f"[INFO] Dataset shape : {df.shape}")
    print(f"[INFO] Label counts  :\n{df['risk_level'].value_counts()}\n")

    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    joblib.dump(pipeline, MODEL_PATH)
    print(f"\n[SUCCESS] Model saved -> {MODEL_PATH}")
    return pipeline


if __name__ == "__main__":
    train()
