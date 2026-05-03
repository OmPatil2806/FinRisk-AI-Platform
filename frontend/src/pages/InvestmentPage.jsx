import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const ALLOC_COLORS = {
  equity: '#6c63ff',
  debt:   '#30d158',
  gold:   '#f5c842',
  cash:   '#0a84ff',
};

const RISK_C = { High:'#ff4757', Medium:'#ff9500', Low:'#30d158' };

// ── SIP Calculator ────────────────────────────────────────────────────────────
function SIPCalculator({ fmt, toUSD }) {
  const [monthly,  setMonthly]  = useState(5000);
  const [years,    setYears]    = useState(10);
  const [rate,     setRate]     = useState(12);

  const r = rate / 100 / 12;
  const n = years * 12;
  const fv = r === 0
    ? monthly * n
    : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested  = monthly * n;
  const gains     = fv - invested;
  const multip    = fv / (invested || 1);

  const checkpoints = [1,3,5,10,15,20,25,30].filter(y => y <= years + 1);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, marginBottom:4 }}>SIP Calculator</div>
      <div style={{ fontSize:12, color:'var(--txt3)', marginBottom:20 }}>Estimate your SIP growth over time</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:24 }}>
        {[
          { label:'Monthly SIP Amount', value:monthly, setter:setMonthly, min:100,   max:500000, step:100 },
          { label:'Time Period (Years)', value:years,   setter:setYears,   min:1,     max:30,     step:1   },
          { label:'Expected Return (%)', value:rate,    setter:setRate,    min:1,     max:30,     step:0.5 },
        ].map(({label,value,setter,min,max,step}) => (
          <div key={label}>
            <label className="label">{label}</label>
            <input type="number" value={value} min={min} max={max} step={step}
              onChange={e => setter(Number(e.target.value))}
              style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:600 }}/>
            <input type="range" value={value} min={min} max={max} step={step}
              onChange={e => setter(Number(e.target.value))}
              style={{ width:'100%', marginTop:6, accentColor:'var(--acc)' }}/>
          </div>
        ))}
      </div>

      {/* Result cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Invested Amount',  value: fmt(invested),         color:'var(--txt2)' },
          { label:'Estimated Gains',  value: fmt(gains),            color:'var(--green)' },
          { label:'Total Value',      value: fmt(fv),               color:'var(--acc)' },
        ].map(({label,value,color}) => (
          <div key={label} style={{ background:'var(--surface2)', borderRadius:10, padding:'14px 16px', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>{label}</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Growth multiplier */}
      <div style={{ background:'var(--surface2)', borderRadius:10, padding:16, border:'1px solid var(--border)', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:12, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Money Multiplier
          </span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, color:'var(--acc)', fontWeight:700 }}>
            {multip.toFixed(2)}x
          </span>
        </div>
        <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min((multip-1)/19*100,100)}%`,
            background:'linear-gradient(90deg,var(--acc),#a855f7)', borderRadius:3,
            transition:'width 0.8s ease' }}/>
        </div>
      </div>

      {/* Projection table */}
      <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>
        Year-by-Year Projections
      </div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(checkpoints.length,4)},1fr)`, gap:8 }}>
        {checkpoints.map(y => {
          const ny = y * 12;
          const fvy = r === 0 ? monthly*ny : monthly * ((Math.pow(1+r,ny)-1)/r)*(1+r);
          return (
            <div key={y} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 12px',
              border: y === years ? '1px solid var(--acc)' : '1px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--txt3)', marginBottom:4 }}>{y} yr{y>1?'s':''}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700,
                color: y === years ? 'var(--acc)' : 'var(--txt)' }}>{fmt(fvy)}</div>
              <div style={{ fontSize:10, color:'var(--green)', marginTop:2 }}>
                +{(((fvy / (monthly*ny)) - 1) * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Asset Allocation ──────────────────────────────────────────────────────────
function AllocationChart({ alloc, investable, fmt }) {
  const items = Object.entries(alloc).map(([k, pct]) => ({
    key: k, label: k.charAt(0).toUpperCase() + k.slice(1),
    pct, amount: investable * pct / 100, color: ALLOC_COLORS[k] || '#888',
  }));
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, marginBottom:4 }}>Asset Allocation</div>
      <div style={{ fontSize:12, color:'var(--txt3)', marginBottom:20 }}>Recommended portfolio split based on your risk profile</div>

      {/* Bar */}
      <div style={{ display:'flex', height:16, borderRadius:8, overflow:'hidden', marginBottom:20 }}>
        {items.map(item => (
          <div key={item.key} style={{ width:`${item.pct}%`, background:item.color, transition:'width 0.8s ease' }}/>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {items.map(item => (
          <div key={item.key} style={{ background:'var(--surface2)', borderRadius:10, padding:'14px 16px',
            border:`1px solid ${item.color}33`, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:item.color, flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:13, fontWeight:600 }}>{item.label}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color:item.color }}>{item.pct}%</span>
              </div>
              <div style={{ fontSize:12, color:'var(--txt3)' }}>{fmt(item.amount)} / month</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Fund Cards ────────────────────────────────────────────────────────────────
function FundCard({ fund, fmt }) {
  return (
    <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px',
      transition:'border-color 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--acc)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{fund.name}</div>
          <div style={{ fontSize:11, color:'var(--txt3)' }}>{fund.type}</div>
        </div>
        <span style={{ background:'var(--acc-dim)', color:'var(--acc2)', fontSize:10, fontWeight:600,
          padding:'3px 8px', borderRadius:20, border:'1px solid rgba(108,99,255,0.3)', whiteSpace:'nowrap', marginLeft:10 }}>
          {fund.tag}
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
        {[
          { label:'3Y Returns', value:`${fund.returns_3yr}%`, color:'var(--green)' },
          { label:'5Y Returns', value:`${fund.returns_5yr}%`, color:'var(--green)' },
          { label:'Min SIP',    value:fmt(fund.min_sip),      color:'var(--txt)' },
        ].map(({label,value,color}) => (
          <div key={label} style={{ background:'var(--surface)', borderRadius:7, padding:'8px 10px' }}>
            <div style={{ fontSize:9, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{label}</div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--txt3)' }}>Risk: <strong style={{ color:'var(--txt2)' }}>{fund.risk}</strong></span>
        <a href={fund.url} target="_blank" rel="noreferrer"
          style={{ background:'var(--acc)', color:'#fff', borderRadius:7, padding:'7px 14px',
            fontSize:12, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
          Invest on {fund.platform} ↗
        </a>
      </div>
    </div>
  );
}

// ── Platform Links ────────────────────────────────────────────────────────────
function Platforms({ platforms }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, marginBottom:4 }}>Investment Platforms</div>
      <div style={{ fontSize:12, color:'var(--txt3)', marginBottom:20 }}>Trusted platforms to start your investment journey</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {platforms.map(p => (
          <a key={p.name} href={p.url} target="_blank" rel="noreferrer" style={{
            background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10,
            padding:'14px 16px', textDecoration:'none', display:'block',
            transition:'border-color 0.2s, transform 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--acc)'; e.currentTarget.style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{p.logo}</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--txt)', marginBottom:3 }}>{p.name}</div>
            <div style={{ fontSize:11, color:'var(--txt3)' }}>{p.desc}</div>
            <div style={{ fontSize:11, color:'var(--acc)', marginTop:8, fontWeight:600 }}>Open ↗</div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InvestmentPage({ lastResult, lastForm }) {
  const { apiFetch } = useAuth();
  const { fmt, toUSD, currency } = useCurrency();
  const [plan,    setPlan]    = useState(lastResult?.investment_plan || null);
  const [risk,    setRisk]    = useState(lastResult?.risk_level || null);
  const [loading, setLoading] = useState(false);

  // If no plan yet but we have a last result use it, else fetch
  useEffect(() => {
    if (lastResult?.investment_plan) {
      setPlan(lastResult.investment_plan);
      setRisk(lastResult.risk_level);
    }
  }, [lastResult]);

  const fmtPlan = useCallback((usdVal) => fmt(usdVal), [fmt]);

  if (loading) return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px', textAlign:'center' }}>
      <div className="spinner" style={{ width:36, height:36, border:'3px solid var(--border2)', borderTopColor:'var(--acc)', borderRadius:'50%', margin:'0 auto 16px' }}/>
      <div style={{ color:'var(--txt3)' }}>Loading investment plan…</div>
    </div>
  );

  if (!plan) return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📈</div>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, marginBottom:8 }}>No Investment Plan Yet</div>
      <div style={{ color:'var(--txt3)', marginBottom:24 }}>Run a financial analysis first to get your personalized investment plan</div>
    </div>
  );

  const rc = RISK_C[risk] || 'var(--acc)';

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, marginBottom:4 }}>Investment Intelligence</div>
        <div style={{ fontSize:13, color:'var(--txt3)' }}>
          Personalized plan based on your
          <span style={{ color:rc, fontWeight:700, marginLeft:4 }}>{risk} Risk</span> profile
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Monthly Investable', value: fmtPlan(plan.monthly_investable), color:'var(--acc)', sub:'After expenses & EMI' },
          { label:'Recommended SIP',    value: fmtPlan(plan.monthly_sip),         color:'var(--green)', sub:'70% of investable' },
          { label:'Emergency Monthly',  value: fmtPlan(plan.emergency_monthly),   color:'var(--amber)', sub:'Build safety net first' },
          { label:'10-Year Projection', value: fmtPlan(plan.projections?.['10yr']), color:'var(--blue)', sub:'At 12% p.a.' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding:'16px 18px' }}>
            <div style={{ fontSize:11, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>{item.label}</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:item.color, marginBottom:4 }}>{item.value}</div>
            <div style={{ fontSize:11, color:'var(--txt3)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* SIP Calculator */}
      <SIPCalculator fmt={fmtPlan} toUSD={toUSD} />

      {/* Asset Allocation */}
      {plan.allocation && (
        <AllocationChart alloc={plan.allocation} investable={plan.monthly_investable} fmt={fmtPlan} />
      )}

      {/* Recommended Funds */}
      {plan.recommended_funds?.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, marginBottom:4 }}>Recommended Funds</div>
          <div style={{ fontSize:12, color:'var(--txt3)', marginBottom:16 }}>
            Curated for <span style={{ color:rc, fontWeight:600 }}>{risk} Risk</span> profile · Returns are historical, not guaranteed
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
            {plan.recommended_funds.map(fund => (
              <FundCard key={fund.name} fund={fund} fmt={fmtPlan} />
            ))}
          </div>
        </div>
      )}

      {/* Platforms */}
      {plan.platforms && <Platforms platforms={plan.platforms} />}

      <div style={{ textAlign:'center', fontSize:11, color:'var(--txt3)', marginTop:8 }}>
        ⚠️ Past returns are not indicative of future performance. Investments are subject to market risk. Consult a SEBI-registered advisor.
      </div>
    </div>
  );
}
