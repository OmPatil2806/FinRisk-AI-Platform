<div align="center">

# FinRisk AI Platform

**AI-powered financial risk classification & investment intelligence**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://fin-risk-ai-platform-kx6fha4vo-ompatil2806s-projects.vercel.app/)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://finrisk-ai-platform.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Predicts **Low / Medium / High** financial risk using Random Forest ML · Computes Health Score (0–100) · Generates AI insights · SIP calculator · Multi-currency · PDF reports

**[Live Demo](https://fin-risk-ai-platform.vercel.app/)**

</div>

---

## Deployment

The application is fully deployed and publicly accessible.

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | [fin-risk-ai-platform-kx6fha4vo-ompatil2806s-projects.vercel.app](https://fin-risk-ai-platform-kx6fha4vo-ompatil2806s-projects.vercel.app/) |
| Backend API | Render | [finrisk-ai-platform.onrender.com](https://finrisk-ai-platform.onrender.com) |


---

## How It Works

### 1. Authentication
Register with name, email and password. Every session is secured with a token stored in SQLite. Login and logout are fully supported. All analysis history is tied to your account.

### 2. Financial Profile Input
Enter your complete financial profile including age, employment status, education, monthly income, monthly expenses, total savings, debt-to-income ratio, credit score, and loan details (type, amount, EMI, interest rate, tenure). All amount fields support multi-currency input.

### 3. Multi-Currency Support
Select your preferred currency from the navbar — USD, INR, EUR, GBP, AED, SGD, JPY, or CAD. Live exchange rates are fetched from ExchangeRate API. All inputs and outputs automatically convert to and from your selected currency. Your preference is saved across sessions.

### 4. AI Risk Classification Dashboard
After submitting your profile, the ML model runs a full analysis and returns:

- **Risk Level** — Low, Medium, or High, predicted by a Random Forest classifier trained on 32,424 records
- **Financial Health Score** — a composite score from 0 to 100 based on expense ratio, EMI burden, credit score, savings buffer, and DTI
- **Confidence Breakdown** — probability percentages for each risk class
- **Quick Metrics** — net monthly savings, expense ratio, stress index, months of emergency buffer
- **AI Insight Engine** — rule-based personalized signals such as overspending warnings, debt overload alerts, credit score flags, and savings recommendations
- **Engineered Feature Matrix** — all 14 derived financial features with warning highlights

### 5. Download PDF Report
Generate and download a 3-page branded PDF report containing your full financial profile, risk classification, confidence breakdown, engineered feature matrix, all AI insights, and your complete investment plan including SIP projections and fund recommendations.

### 6. Investment Intelligence
Based on your risk profile, the platform generates a personalized investment plan:

- **Monthly Investable Amount** — calculated after expenses, EMI, and emergency fund allocation
- **Recommended Monthly SIP** — 70% of investable amount directed toward systematic investment
- **Emergency Fund Target** — 6 months of expenses as a safety buffer with monthly contribution suggestion

### 7. SIP Calculator
Interactive SIP calculator where you can adjust monthly SIP amount, time period (years), and expected annual return rate. Results update in real time showing:

- Invested Amount
- Estimated Gains
- Total Portfolio Value
- Year-by-year projection table (1, 3, 5, 10, 15, 20, 25, 30 years)
- Money multiplier

### 8. Asset Allocation
Recommended portfolio split based on your risk profile:

| Profile | Equity | Debt | Gold | Cash |
|---------|--------|------|------|------|
| Low Risk | 70% | 20% | 5% | 5% |
| Medium Risk | 45% | 35% | 10% | 10% |
| High Risk | 20% | 50% | 15% | 15% |

### 9. Recommended Funds
Curated mutual fund recommendations based on your risk level with 3-year and 5-year historical returns, minimum SIP amount, and direct invest links to:

- **Groww** — best for beginners, zero commission
- **Zerodha Coin** — direct mutual funds, zero commission
- **ET Money** — smart portfolio tools and SIP tracking
- **Kuvera** — goal-based investing
- **Paytm Money** — easy SIP setup
- **Vanguard** — global index funds for international exposure

### 10. Analysis History
Every analysis is saved to your account. The history page shows all past analyses with date, risk level, health score, income, and credit score. Filter by High, Medium, or Low risk. Click any row to view full details including insights and probabilities. Delete individual records.

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

## Local Setup

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

## Tech Stack

**Backend** — Python 3.12 · Flask 3.0 · scikit-learn 1.5 · pandas · SQLite · Werkzeug  
**Frontend** — React 18 · jsPDF · ExchangeRate API  
**ML** — Random Forest · StandardScaler · OrdinalEncoder · ColumnTransformer  
**Deployment** — Vercel (frontend) · Render (backend)

---

<div align="center">
Built for educational and portfolio purposes · Not financial advice
</div>
