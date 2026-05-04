<div align="center">

# FinRisk AI Platform

**AI-powered financial risk classification & investment intelligence**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Predicts **Low / Medium / High** financial risk using Random Forest ML · Computes Health Score (0–100) · Generates AI insights · SIP calculator · Multi-currency · PDF reports

</div>

---

## Features

- Auth — Register / Login / Logout with SQLite sessions
- AI Risk Prediction — Low / Medium / High (Random Forest, 32,424 samples)
- Financial Health Score — composite 0–100 formula
- AI Insight Engine — rule-based personalized signals
- Multi-Currency — USD, INR, EUR, GBP, AED, SGD, JPY, CAD (live rates)
- Investment Intelligence — SIP calculator, fund recommendations, asset allocation
- Analysis History — stats, filter by risk, delete
- PDF Report — 3-page branded download (jsPDF)
- SQLite Database — users, sessions, analyses

---

## Project Structure

```
finrisk-ai-platform/
├── backend/            Flask API · ML inference · SQLite
│   ├── app.py          8 REST endpoints
│   ├── database.py     Auth + analysis storage
│   ├── models/         Random Forest pipeline
│   ├── utils/          Feature engineering · Insights · Investment engine
│   └── data/           Training dataset (32,424 records)
├── frontend/           React 18 dashboard
│   └── src/
│       ├── pages/      Auth · Dashboard · Investments · History
│       ├── components/ Navbar · Gauge · InputPanel · ResultsPanel
│       ├── context/    Auth · Currency (live exchange rates)
│       └── utils/      PDF report generator
└── ml/
    ├── train.py        ML pipeline training script
    └── notebooks/      EDA · Feature engineering · Model evaluation
```

---

## Quick Start

**Terminal 1 — Backend**
```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
python models/train.py
python app.py
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install && npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Sign in |
| POST | `/auth/logout` | Yes | Sign out |
| GET | `/auth/me` | Yes | Current user |
| POST | `/full-analysis` | Yes | Risk + insights + investment plan |
| POST | `/investment-plan` | Yes | Investment plan only |
| GET | `/history` | Yes | All past analyses |
| DELETE | `/history/<id>` | Yes | Delete analysis |

---

## ML Model

| | |
|---|---|
| Algorithm | Random Forest (300 trees, max_depth=15) |
| Features | 30 (26 numerical + 4 categorical) |
| Label Design | Composite 4-dimension risk score (avoids data leakage) |
| Accuracy | 99.75% · Macro F1: 0.998 |
| Training samples | 25,939 · Test: 6,485 |

Key engineered features: `expense_ratio`, `emi_ratio`, `financial_stress_index`, `months_of_expenses_saved`, `credit_dti_interaction`

---

## Database

Auto-created at `backend/data/finrisk.db` on first run.
View with [DB Browser for SQLite](https://sqlitebrowser.org).

---

## Tech Stack

**Backend** — Python 3.12 · Flask 3.0 · scikit-learn 1.5 · pandas · SQLite · Werkzeug  
**Frontend** — React 18 · jsPDF · ExchangeRate API  
**ML** — Random Forest · StandardScaler · OrdinalEncoder · ColumnTransformer

---

<div align="center">
Built for educational and portfolio purposes · Not financial advice
</div>
