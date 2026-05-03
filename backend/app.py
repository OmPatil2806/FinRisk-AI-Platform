import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from utils.feature_engineering import engineer_features, compute_health_score
from utils.insights import generate_insights
from utils.investment import generate_investment_plan
from models.train import NUMERICAL_FEATURES, CATEGORICAL_FEATURES
from database import (
    init_db, create_user, login_user, create_session,
    get_user_from_token, delete_session,
    save_analysis, get_user_analyses, get_analysis_by_id
)

app = Flask(__name__)
CORS(app, supports_credentials=True)

init_db()

MODEL_PATH = os.path.join(BACKEND_DIR, "models", "risk_model.pkl")
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("\n[ERROR] Model not found.\n[FIX]  Run: python models/train.py\n")

model = joblib.load(MODEL_PATH)
print(f"[INFO] Model loaded from {MODEL_PATH}")

DEFAULTS = {
    "age": 30, "gender": "Other", "education_level": "Bachelor",
    "employment_status": "Employed", "job_title": "Unknown",
    "monthly_income_usd": 3000.0, "monthly_expenses_usd": 2000.0,
    "savings_usd": 5000.0, "has_loan": "No", "loan_type": "None",
    "loan_amount_usd": 0.0, "loan_term_months": 0, "monthly_emi_usd": 0.0,
    "loan_interest_rate_pct": 0.0, "debt_to_income_ratio": 0.0,
    "credit_score": 650, "savings_to_income_ratio": 1.0,
    "region": "Other", "record_date": "2024-01-01",
}

EF_KEYS = [
    "expense_ratio", "emi_ratio", "savings_ratio", "financial_stress_index",
    "net_savings", "net_savings_ratio", "loan_burden", "interest_burden",
    "months_of_expenses_saved", "overspending_flag", "high_dti_flag",
    "low_savings_flag", "credit_risk_flag", "poor_credit_flag",
]

NUMERIC_FIELDS = [
    "age", "monthly_income_usd", "monthly_expenses_usd", "savings_usd",
    "loan_amount_usd", "loan_term_months", "monthly_emi_usd",
    "loan_interest_rate_pct", "debt_to_income_ratio", "credit_score",
    "savings_to_income_ratio",
]


def get_token():
    auth = request.headers.get("Authorization", "")
    return auth.replace("Bearer ", "").strip() or None


def require_auth():
    user = get_user_from_token(get_token())
    if not user:
        return None, (jsonify({"error": "Unauthorized"}), 401)
    return user, None


def prepare(payload):
    row = {**DEFAULTS, **payload}
    # Cast all numeric fields to float — frontend sends strings
    for field in NUMERIC_FIELDS:
        try:
            row[field] = float(row[field])
        except (ValueError, TypeError):
            row[field] = DEFAULTS.get(field, 0.0)
    return engineer_features(pd.DataFrame([row]))


# ── Auth ──────────────────────────────────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
def register():
    data     = request.get_json(force=True)
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()
    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    try:
        user  = create_user(name, email, password)
        token = create_session(user["id"])
        return jsonify({"user": user, "token": token}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    try:
        user  = login_user(data.get("email", ""), data.get("password", ""))
        token = create_session(user["id"])
        return jsonify({"user": user, "token": token})
    except ValueError as e:
        return jsonify({"error": str(e)}), 401


@app.route("/auth/logout", methods=["POST"])
def logout():
    delete_session(get_token())
    return jsonify({"message": "Logged out."})


@app.route("/auth/me", methods=["GET"])
def me():
    user = get_user_from_token(get_token())
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": user})


# ── Analysis ──────────────────────────────────────────────────────────────────
@app.route("/full-analysis", methods=["POST"])
def full_analysis():
    user, err = require_auth()
    if err:
        return err

    payload  = request.get_json(force=True)
    df       = prepare(payload)
    features = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    risk     = model.predict(features)[0]
    proba    = model.predict_proba(features)[0].tolist()
    classes  = list(model.classes_)
    hs       = compute_health_score(df.iloc[0].to_dict())
    row_dict = df.iloc[0].to_dict()
    ins      = generate_insights(row_dict, risk, hs)
    inv_plan = generate_investment_plan(risk, row_dict)

    result = {
        "risk_level":          risk,
        "health_score":        hs,
        "probabilities":       dict(zip(classes, [round(p, 4) for p in proba])),
        "insights":            ins,
        "investment_plan":     inv_plan,
        "engineered_features": {k: round(float(row_dict[k]), 4) for k in EF_KEYS},
    }

    aid = save_analysis(user["id"], payload, result)
    result["analysis_id"] = aid
    return jsonify(result)


@app.route("/investment-plan", methods=["POST"])
def investment_plan():
    user, err = require_auth()
    if err:
        return err
    payload  = request.get_json(force=True)
    df       = prepare(payload)
    features = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    risk     = model.predict(features)[0]
    row_dict = df.iloc[0].to_dict()
    plan     = generate_investment_plan(risk, row_dict)
    return jsonify({"risk_level": risk, "plan": plan})


@app.route("/history", methods=["GET"])
def history():
    user, err = require_auth()
    if err:
        return err
    return jsonify({"analyses": get_user_analyses(user["id"])})


@app.route("/history/<int:aid>", methods=["GET"])
def history_detail(aid):
    user, err = require_auth()
    if err:
        return err
    a = get_analysis_by_id(aid, user["id"])
    return jsonify(a) if a else (jsonify({"error": "Not found"}), 404)


@app.route("/history/<int:aid>", methods=["DELETE"])
def delete_analysis(aid):
    user, err = require_auth()
    if err:
        return err
    from database import get_conn
    conn = get_conn()
    conn.execute("DELETE FROM analyses WHERE id=? AND user_id=?", (aid, user["id"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Deleted."})


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5050)
