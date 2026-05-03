import os
import sys
import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BACKEND_DIR, "data", "finrisk.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            password    TEXT    NOT NULL,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token       TEXT    PRIMARY KEY,
            user_id     INTEGER NOT NULL,
            expires_at  TEXT    NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL,
            created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
            -- inputs
            age             INTEGER,
            gender          TEXT,
            education_level TEXT,
            employment_status TEXT,
            monthly_income_usd  REAL,
            monthly_expenses_usd REAL,
            savings_usd     REAL,
            has_loan        TEXT,
            loan_type       TEXT,
            loan_amount_usd REAL,
            loan_term_months INTEGER,
            monthly_emi_usd REAL,
            loan_interest_rate_pct REAL,
            debt_to_income_ratio   REAL,
            credit_score    INTEGER,
            -- results
            risk_level      TEXT,
            health_score    REAL,
            prob_high       REAL,
            prob_medium     REAL,
            prob_low        REAL,
            financial_stress_index REAL,
            expense_ratio   REAL,
            emi_ratio       REAL,
            net_savings     REAL,
            insights        TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()
    print(f"[DB] Initialized at {DB_PATH}")


# ── Auth helpers ──────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_user(name: str, email: str, password: str) -> dict:
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name.strip(), email.strip().lower(), hash_password(password))
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE email=?", (email.lower(),)).fetchone()
        return {"id": row["id"], "name": row["name"], "email": row["email"]}
    except sqlite3.IntegrityError:
        raise ValueError("Email already registered.")
    finally:
        conn.close()


def login_user(email: str, password: str) -> dict:
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email.strip().lower(), hash_password(password))
    ).fetchone()
    conn.close()
    if not row:
        raise ValueError("Invalid email or password.")
    return {"id": row["id"], "name": row["name"], "email": row["email"]}


def create_session(user_id: int) -> str:
    token = secrets.token_hex(32)
    expires = (datetime.utcnow() + timedelta(days=7)).isoformat()
    conn = get_conn()
    conn.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)", (token, user_id, expires))
    conn.commit()
    conn.close()
    return token


def get_user_from_token(token: str) -> dict | None:
    if not token:
        return None
    conn = get_conn()
    row = conn.execute("""
        SELECT u.id, u.name, u.email FROM users u
        JOIN sessions s ON s.user_id = u.id
        WHERE s.token=? AND s.expires_at > datetime('now')
    """, (token,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_session(token: str):
    conn = get_conn()
    conn.execute("DELETE FROM sessions WHERE token=?", (token,))
    conn.commit()
    conn.close()


# ── Analysis storage ──────────────────────────────────────────────────────────
def save_analysis(user_id: int, inputs: dict, result: dict) -> int:
    import json
    conn = get_conn()
    ef = result.get("engineered_features", {})
    pr = result.get("probabilities", {})
    c = conn.execute("""
        INSERT INTO analyses (
            user_id, age, gender, education_level, employment_status,
            monthly_income_usd, monthly_expenses_usd, savings_usd,
            has_loan, loan_type, loan_amount_usd, loan_term_months,
            monthly_emi_usd, loan_interest_rate_pct, debt_to_income_ratio, credit_score,
            risk_level, health_score, prob_high, prob_medium, prob_low,
            financial_stress_index, expense_ratio, emi_ratio, net_savings, insights
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        user_id,
        inputs.get("age"), inputs.get("gender"), inputs.get("education_level"),
        inputs.get("employment_status"), inputs.get("monthly_income_usd"),
        inputs.get("monthly_expenses_usd"), inputs.get("savings_usd"),
        inputs.get("has_loan"), inputs.get("loan_type"), inputs.get("loan_amount_usd"),
        inputs.get("loan_term_months"), inputs.get("monthly_emi_usd"),
        inputs.get("loan_interest_rate_pct"), inputs.get("debt_to_income_ratio"),
        inputs.get("credit_score"),
        result.get("risk_level"), result.get("health_score"),
        pr.get("High", 0), pr.get("Medium", 0), pr.get("Low", 0),
        ef.get("financial_stress_index", 0), ef.get("expense_ratio", 0),
        ef.get("emi_ratio", 0), ef.get("net_savings", 0),
        json.dumps(result.get("insights", [])),
    ))
    conn.commit()
    aid = c.lastrowid
    conn.close()
    return aid


def get_user_analyses(user_id: int) -> list:
    import json
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM analyses WHERE user_id=? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["insights"] = json.loads(d["insights"]) if d["insights"] else []
        except Exception:
            d["insights"] = []
        result.append(d)
    return result


def get_analysis_by_id(analysis_id: int, user_id: int) -> dict | None:
    import json
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM analyses WHERE id=? AND user_id=?",
        (analysis_id, user_id)
    ).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    try:
        d["insights"] = json.loads(d["insights"]) if d["insights"] else []
    except Exception:
        d["insights"] = []
    return d
