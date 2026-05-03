# FinRisk AI — Complete Setup Guide

## What's Included
- Auth (Register / Login / Logout) with SQLite
- AI Risk Prediction (Low / Medium / High)
- Financial Health Score (0–100)
- AI Insight Engine
- Multi-Currency (USD, INR, EUR, GBP, AED, SGD, JPY, CAD) with live rates
- Investment Intelligence Page (SIP Calculator, Fund Recommendations, Asset Allocation)
- Analysis History with stats, filter, delete
- PDF Report Download (jsPDF — 3-page branded PDF)
- SQLite Database (users, sessions, analyses)

## Folder Structure
```
finrisk_final/
├── backend/
│   ├── app.py                   Flask API
│   ├── database.py              SQLite auth + history
│   ├── requirements.txt
│   ├── data/dataset.csv         Training dataset (included)
│   ├── models/
│   │   ├── train.py             Train ML model
│   │   └── risk_model.pkl       Auto-generated after training
│   └── utils/
│       ├── feature_engineering.py
│       ├── insights.py
│       └── investment.py        Investment plan engine
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CurrencyContext.jsx   Live exchange rates
        ├── hooks/useFinRisk.js
        ├── utils/pdfReport.js        PDF generation
        ├── pages/
        │   ├── AuthPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── InvestmentPage.jsx
        │   └── HistoryPage.jsx
        └── components/
            ├── Navbar.jsx
            ├── Gauge.jsx
            ├── InputPanel.jsx
            └── ResultsPanel.jsx
```

---

## FIRST TIME SETUP

### Terminal 1 — Backend
```powershell
cd D:\APPS\finrisk_final\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python models/train.py
python app.py
```

### Terminal 2 — Frontend (Ctrl+Shift+` for new terminal)
```powershell
cd D:\APPS\finrisk_final\frontend
npm install
npm start
```

Open http://localhost:3000

---

## EVERY TIME AFTER (no reinstall needed)

### Terminal 1
```powershell
cd D:\APPS\finrisk_final\backend
venv\Scripts\activate
python app.py
```

### Terminal 2
```powershell
cd D:\APPS\finrisk_final\frontend
npm start
```

---

## API Endpoints

| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| POST   | /auth/register     | No   | Create account           |
| POST   | /auth/login        | No   | Sign in                  |
| POST   | /auth/logout       | Yes  | Sign out                 |
| GET    | /auth/me           | Yes  | Current user             |
| POST   | /full-analysis     | Yes  | Full AI analysis + invest|
| POST   | /investment-plan   | Yes  | Investment plan only     |
| GET    | /history           | Yes  | All analyses             |
| GET    | /history/<id>      | Yes  | Single analysis          |
| DELETE | /history/<id>      | Yes  | Delete analysis          |

---

## Database Location
```
D:\APPS\finrisk_final\backend\data\finrisk.db
```
View with DB Browser for SQLite: https://sqlitebrowser.org

## Common Errors
| Error | Fix |
|-------|-----|
| ModuleNotFoundError: utils | cd into backend/ first |
| Model not found | Run python models/train.py first |
| Execution policy error | Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser |
| npm not found | Install Node.js from https://nodejs.org |
