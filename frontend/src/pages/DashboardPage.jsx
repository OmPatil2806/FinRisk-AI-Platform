import React, { useState, useCallback, useRef } from 'react';
import InputPanel   from '../components/InputPanel';
import ResultsPanel from '../components/ResultsPanel';
import { useFinRisk } from '../hooks/useFinRisk';
import { useCurrency } from '../context/CurrencyContext';

const INITIAL = {
  age: 32, gender: 'Male', education_level: 'Bachelor',
  employment_status: 'Employed', monthly_income_usd: 5200,
  monthly_expenses_usd: 3100, savings_usd: 28000,
  has_loan: 'Yes', loan_type: 'Personal', loan_amount_usd: 18000,
  loan_term_months: 36, monthly_emi_usd: 620,
  loan_interest_rate_pct: 11.5, debt_to_income_ratio: 0.28, credit_score: 672,
};

export default function DashboardPage({ onViewInvestment, setLastResult }) {
  const [form, setForm]     = useState(INITIAL);
  const { result, loading, error, analyze } = useFinRisk();
  const { toUSD, currency } = useCurrency();
  const resultRef           = useRef(null);

  const handleChange = useCallback(e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }, []);

  const handleAnalyze = useCallback(async () => {
    // Convert currency inputs → USD before sending to backend
    const rate = 1; // toUSD handles conversion
    const payload = {
      ...form,
      monthly_income_usd:   toUSD(parseFloat(form.monthly_income_usd)   || 0),
      monthly_expenses_usd: toUSD(parseFloat(form.monthly_expenses_usd) || 0),
      savings_usd:          toUSD(parseFloat(form.savings_usd)          || 0),
      loan_amount_usd:      toUSD(parseFloat(form.loan_amount_usd)      || 0),
      monthly_emi_usd:      toUSD(parseFloat(form.monthly_emi_usd)      || 0),
    };
    const res = await analyze(payload);
    if (res) setLastResult(res);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, [form, analyze, toUSD, setLastResult]);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, marginBottom: 4 }}>
          Financial Risk Dashboard
        </div>
        <div style={{ color: 'var(--txt3)', fontSize: 13 }}>
          AI-powered analysis · Amounts in {currency.code} {currency.flag}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 22, alignItems: 'start' }}>
        <InputPanel
          form={form}
          onChange={handleChange}
          onAnalyze={handleAnalyze}
          loading={loading}
        />
        <div ref={resultRef}>
          <ResultsPanel
            result={result}
            loading={loading}
            error={error}
            formData={form}
            onViewInvestment={onViewInvestment}
          />
        </div>
      </div>
    </div>
  );
}
