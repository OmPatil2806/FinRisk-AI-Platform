import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const RC = { High:'#ff4757', Medium:'#ff9500', Low:'#30d158' };

function SkeletonRow() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto', gap:16, padding:'16px 20px', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
      {[180,80,70,90,80,40].map((w,i) => (
        <div key={i} className="skeleton" style={{ height:14, width:w, borderRadius:4 }}/>
      ))}
    </div>
  );
}

function DetailModal({ a, onClose, fmt }) {
  if (!a) return null;
  const rc = RC[a.risk_level] || '#9da3b4';
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div className="scale-in" onClick={e => e.stopPropagation()} style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16,
        maxWidth:600, width:'100%', maxHeight:'85vh', overflow:'auto',
        boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Modal header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, color:'var(--txt3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:4 }}>Analysis #{a.id}</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:rc, marginBottom:2 }}>{a.risk_level} Risk</div>
            <div style={{ fontSize:12, color:'var(--txt3)' }}>{new Date(a.created_at).toLocaleString()}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:38, color:rc, lineHeight:1 }}>{a.health_score}</div>
            <div style={{ fontSize:11, color:'var(--txt3)' }}>Health Score</div>
          </div>
        </div>

        <div style={{ padding:'20px 24px' }}>
          {/* Prob bars */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Confidence</div>
            {[['HIGH',a.prob_high,'#ff4757'],['MEDIUM',a.prob_medium,'#ff9500'],['LOW',a.prob_low,'#30d158']].map(([l,v,c]) => (
              <div key={l} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:11, color:'var(--txt3)' }}>{l}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:c, fontWeight:700 }}>{((v||0)*100).toFixed(1)}%</span>
                </div>
                <div style={{ height:4, background:'var(--surface3)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(v||0)*100}%`, background:c, borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Financial data */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[
              ['Income',    fmt(a.monthly_income_usd)],
              ['Expenses',  fmt(a.monthly_expenses_usd)],
              ['Credit',    a.credit_score],
              ['DTI',       a.debt_to_income_ratio],
              ['Savings',   fmt(a.savings_usd)],
              ['Loan',      a.has_loan==='Yes' ? `${a.loan_type} · ${fmt(a.loan_amount_usd)}` : 'None'],
            ].map(([l,v]) => (
              <div key={l} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:3 }}>{l}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Insights */}
          {a.insights?.length > 0 && (
            <>
              <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>AI Insights</div>
              {a.insights.slice(0, 5).map((txt, i) => (
                <div key={i} style={{ padding:'10px 12px', marginBottom:6, background:'var(--surface2)', borderRadius:8, borderLeft:`3px solid ${i===0?rc:'var(--border2)'}`, fontSize:12, color:'var(--txt2)', lineHeight:1.6, fontWeight:i===0?600:400 }}>
                  {txt}
                </div>
              ))}
            </>
          )}
        </div>

        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { apiFetch }              = useAuth();
  const { fmt, currency }         = useCurrency();
  const [analyses, setAnalyses]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [selected, setSelected]   = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [filter,   setFilter]     = useState('All');

  const load = async () => {
    setLoading(true);
    const { ok, data } = await apiFetch('/history');
    if (ok) setAnalyses(data.analyses || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    setDeleting(id);
    await apiFetch(`/history/${id}`, { method: 'DELETE' });
    setAnalyses(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  };

  const filtered = filter === 'All' ? analyses : analyses.filter(a => a.risk_level === filter);

  const stats = analyses.length > 0 ? {
    total:    analyses.length,
    avgScore: (analyses.reduce((s, a) => s + (a.health_score||0), 0) / analyses.length).toFixed(1),
    high:     analyses.filter(a => a.risk_level === 'High').length,
    low:      analyses.filter(a => a.risk_level === 'Low').length,
  } : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, marginBottom:4 }}>Analysis History</div>
        <div style={{ fontSize:13, color:'var(--txt3)' }}>All your past financial risk analyses · {currency.code} {currency.flag}</div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Total Analyses', value:stats.total,    color:'var(--acc)' },
            { label:'Avg Health',     value:stats.avgScore, color:'var(--blue)' },
            { label:'High Risk',      value:stats.high,     color:'var(--red)' },
            { label:'Low Risk',       value:stats.low,      color:'var(--green)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'16px 20px' }}>
              <div style={{ fontSize:11, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>{s.label}</div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--surface)', borderRadius:10, padding:4, border:'1px solid var(--border)', width:'fit-content' }}>
        {['All','High','Medium','Low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 16px', borderRadius:7, border:'none', cursor:'pointer',
            background: filter===f ? 'var(--acc)' : 'transparent',
            color:      filter===f ? '#fff'       : 'var(--txt3)',
            fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:12,
            transition:'all 0.2s',
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:600, fontSize:14 }}>
            {filter === 'All' ? 'All Analyses' : `${filter} Risk`}
          </span>
          <span style={{ fontSize:12, color:'var(--txt3)' }}>{filtered.length} records</span>
        </div>

        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto', gap:16, padding:'10px 20px', background:'var(--surface2)', fontSize:11, fontWeight:600, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
          <span>Date & Time</span>
          <span>Risk Level</span>
          <span>Health Score</span>
          <span>Income</span>
          <span>Credit Score</span>
          <span></span>
        </div>

        {loading && [1,2,3,4,5].map(i => <SkeletonRow key={i}/>)}

        {!loading && filtered.length === 0 && (
          <div style={{ padding:'60px 20px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
            <div style={{ fontWeight:600, marginBottom:6, fontSize:16 }}>
              {analyses.length === 0 ? 'No analyses yet' : `No ${filter} risk analyses`}
            </div>
            <div style={{ fontSize:13, color:'var(--txt3)' }}>
              {analyses.length === 0 ? 'Run your first analysis from the Dashboard' : 'Try changing the filter'}
            </div>
          </div>
        )}

        {filtered.map((a, idx) => {
          const rc2 = RC[a.risk_level] || '#9da3b4';
          return (
            <div key={a.id}
              style={{
                display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto', gap:16,
                padding:'14px 20px', borderBottom:'1px solid var(--border)',
                alignItems:'center', cursor:'pointer', transition:'background 0.15s',
                animation:`slideIn 0.3s ease ${idx * 0.04}s forwards`, opacity:0,
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
              onClick={() => setSelected(a)}>
              <div>
                <div style={{ fontWeight:500, fontSize:13 }}>{new Date(a.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                <div style={{ fontSize:11, color:'var(--txt3)', marginTop:1 }}>{new Date(a.created_at).toLocaleTimeString()}</div>
              </div>
              <span className={`badge badge-${a.risk_level}`}>
                {a.risk_level==='High'?'⚠️':a.risk_level==='Medium'?'⚡':'✅'} {a.risk_level}
              </span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:15, fontWeight:700, color:rc2 }}>
                {a.health_score}
              </span>
              <span style={{ fontSize:13, color:'var(--txt2)' }}>{fmt(a.monthly_income_usd)}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13,
                color: a.credit_score < 580 ? 'var(--red)' : a.credit_score >= 720 ? 'var(--green)' : 'var(--txt2)' }}>
                {a.credit_score}
              </span>
              <button className="btn btn-danger btn-sm"
                onClick={e => { e.stopPropagation(); del(a.id); }}
                disabled={deleting === a.id}
                style={{ minWidth:32 }}>
                {deleting === a.id ? '…' : '🗑'}
              </button>
            </div>
          );
        })}
      </div>

      {selected && <DetailModal a={selected} onClose={() => setSelected(null)} fmt={fmt}/>}
    </div>
  );
}
