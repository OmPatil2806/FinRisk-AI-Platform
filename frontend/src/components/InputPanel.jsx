import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

function Field({ label, name, value, onChange, options, step, prefix }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="label">{label}</label>
      {options ? (
        <select name={name} value={value} onChange={onChange}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <div style={{ position:'relative' }}>
          {prefix && (
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
              color:'var(--txt3)', fontSize:13, fontFamily:"'IBM Plex Mono',monospace", pointerEvents:'none' }}>
              {prefix}
            </span>
          )}
          <input type="number" step={step||'any'} name={name} value={value} onChange={onChange}
            style={prefix ? { paddingLeft: prefix.length > 1 ? 32 : 24 } : {}}/>
        </div>
      )}
    </div>
  );
}

function SectionHead({ icon, title }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, marginTop:4 }}>
      <span>{icon}</span>
      <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', color:'var(--txt3)', textTransform:'uppercase' }}>
        {title}
      </span>
    </div>
  );
}

export default function InputPanel({ form, onChange, onAnalyze, loading }) {
  const { currency } = useCurrency();
  const sym = currency.symbol;

  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:16, overflow:'hidden', position:'sticky', top:76,
      boxShadow:'0 4px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        padding:'18px 22px', borderBottom:'1px solid var(--border)',
        background:'linear-gradient(135deg,rgba(108,99,255,0.08),transparent)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, marginBottom:2 }}>Financial Profile</div>
          <div style={{ fontSize:12, color:'var(--txt3)' }}>Amounts in {currency.code} {currency.flag}</div>
        </div>
      </div>

      <div style={{ padding:'18px 22px', maxHeight:'72vh', overflowY:'auto' }}>

        <SectionHead icon="👤" title="Personal" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
          <Field label="Age"          name="age"          value={form.age}          onChange={onChange}/>
          <Field label="Credit Score" name="credit_score" value={form.credit_score} onChange={onChange}/>
        </div>
        <Field label="Gender"     name="gender"            value={form.gender}            onChange={onChange} options={['Male','Female','Other']}/>
        <Field label="Education"  name="education_level"   value={form.education_level}   onChange={onChange} options={['High School','Bachelor','Master','PhD','Other']}/>
        <Field label="Employment" name="employment_status" value={form.employment_status} onChange={onChange} options={['Employed','Self-employed','Unemployed','Student','Retired']}/>

        <hr className="divider"/>
        <SectionHead icon="💰" title="Finances" />
        <Field label={`Monthly Income (${currency.code})`}   name="monthly_income_usd"   value={form.monthly_income_usd}   onChange={onChange} prefix={sym}/>
        <Field label={`Monthly Expenses (${currency.code})`} name="monthly_expenses_usd" value={form.monthly_expenses_usd} onChange={onChange} prefix={sym}/>
        <Field label={`Total Savings (${currency.code})`}    name="savings_usd"          value={form.savings_usd}          onChange={onChange} prefix={sym}/>
        <Field label="Debt-to-Income Ratio"                  name="debt_to_income_ratio" value={form.debt_to_income_ratio} onChange={onChange} step="0.01"/>

        <hr className="divider"/>
        <SectionHead icon="🏦" title="Loan" />
        <Field label="Has Active Loan" name="has_loan"  value={form.has_loan}  onChange={onChange} options={['No','Yes']}/>
        <Field label="Loan Type"       name="loan_type" value={form.loan_type} onChange={onChange} options={['None','Personal','Home','Auto','Education','Business']}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
          <Field label={`Loan Amount (${currency.code})`} name="loan_amount_usd"        value={form.loan_amount_usd}        onChange={onChange} prefix={sym}/>
          <Field label={`Monthly EMI (${currency.code})`} name="monthly_emi_usd"        value={form.monthly_emi_usd}        onChange={onChange} prefix={sym}/>
          <Field label="Term (months)"                    name="loan_term_months"       value={form.loan_term_months}       onChange={onChange}/>
          <Field label="Interest Rate %"                  name="loan_interest_rate_pct" value={form.loan_interest_rate_pct} onChange={onChange} step="0.1"/>
        </div>

        <button onClick={onAnalyze} disabled={loading}
          className={`btn btn-primary btn-full btn-lg ${!loading?'glow-btn':''}`}
          style={{ marginTop:8 }}>
          {loading
            ? <><span className="spinner" style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block' }}/> Analyzing…</>
            : '▶  Run AI Analysis'
          }
        </button>
      </div>
    </div>
  );
}
