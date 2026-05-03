import React, { useState } from 'react';
import Gauge from './Gauge';
import { useCurrency } from '../context/CurrencyContext';
import { downloadPDFReport } from '../utils/pdfReport';

const RC = { High:'#ff4757', Medium:'#ff9500', Low:'#30d158' };
const RB = { High:'rgba(255,71,87,0.07)', Medium:'rgba(255,149,0,0.07)', Low:'rgba(48,209,88,0.07)' };
const ICON_C = { '🔴':'#ff4757','⚠️':'#ff9500','✅':'#30d158','📊':'#0a84ff','📉':'#0a84ff','📈':'#ff9500','🚨':'#ff4757','💳':'#ff9500','📦':'#9da3b4' };

function ProbBar({ label, value, color }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:'var(--txt3)', fontWeight:600 }}>{label}</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color, fontWeight:700 }}>{(value*100).toFixed(1)}%</span>
      </div>
      <div style={{ height:5, background:'var(--surface3)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${value*100}%`, background:color, borderRadius:3,
          boxShadow:`0 0 8px ${color}66`, transition:'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}/>
      </div>
    </div>
  );
}

export default function ResultsPanel({ result, loading, error, formData, onViewInvestment }) {
  const { fmt, currency } = useCurrency();
  const [tab,    setTab]    = useState('insights');
  const [dlding, setDlding] = useState(false);

  const handlePDF = async () => {
    setDlding(true);
    try { await downloadPDFReport(result, formData || {}, fmt, currency.code); }
    finally { setDlding(false); }
  };

  if (loading) return (
    <div style={{ minHeight:400, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div className="spinner" style={{ width:36, height:36, border:'3px solid var(--border2)', borderTopColor:'var(--acc)', borderRadius:'50%' }}/>
      <div style={{ fontSize:13, color:'var(--txt3)', letterSpacing:'1px' }}>Running ML Pipeline…</div>
    </div>
  );

  if (error) return (
    <div style={{ background:'var(--red-dim)', border:'1px solid rgba(255,71,87,0.25)', borderRadius:16, padding:32, textAlign:'center' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
      <div style={{ color:'var(--red)', fontWeight:600, marginBottom:6 }}>Analysis Failed</div>
      <div style={{ color:'var(--txt3)', fontSize:13 }}>{error}</div>
    </div>
  );

  if (!result) return (
    <div style={{ minHeight:420, border:'2px dashed var(--border)', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:40 }}>
      <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:42, opacity:0.08, color:'var(--acc)' }}>Ready</div>
      <div style={{ fontSize:13, color:'var(--txt3)', textAlign:'center', lineHeight:2 }}>
        Fill in your financial profile<br/>and click <strong style={{ color:'var(--acc)' }}>Run AI Analysis</strong>
      </div>
    </div>
  );

  const rc = RC[result.risk_level];
  const rb = RB[result.risk_level];
  const pr = result.probabilities || {};
  const ef = result.engineered_features || {};

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${rb},var(--surface))`, border:`1px solid ${rc}33`, borderRadius:16, padding:'24px 28px', marginBottom:16, boxShadow:`0 4px 24px ${rc}1a` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', marginBottom:8 }}>Risk Classification</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, color:rc, lineHeight:1, filter:`drop-shadow(0 0 16px ${rc}55)` }}>
              {result.risk_level}
            </div>
            <div style={{ marginTop:8, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span className={`badge badge-${result.risk_level}`}>
                {result.risk_level==='High'?'⚠️':result.risk_level==='Medium'?'⚡':'✅'} {result.risk_level} Risk
              </span>
              <span style={{ fontSize:12, color:'var(--txt3)' }}>· #{result.analysis_id} · {currency.code} {currency.flag}</span>
            </div>
          </div>
          <Gauge score={Math.round(result.health_score)} />
          <div style={{ minWidth:170 }}>
            <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:14 }}>Confidence</div>
            <ProbBar label="HIGH"   value={pr.High   || 0} color="#ff4757"/>
            <ProbBar label="MEDIUM" value={pr.Medium || 0} color="#ff9500"/>
            <ProbBar label="LOW"    value={pr.Low    || 0} color="#30d158"/>
          </div>
        </div>

        {/* Quick metrics */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:20, paddingTop:20, borderTop:`1px solid ${rc}22` }}>
          {[
            { label:'Net Savings/mo', val:fmt(ef.net_savings||0), color:(ef.net_savings||0)>=0?'var(--green)':'var(--red)' },
            { label:'Expense Ratio',  val:`${((ef.expense_ratio||0)*100).toFixed(1)}%`, color:(ef.expense_ratio||0)>0.7?'var(--red)':'var(--green)' },
            { label:'Stress Index',   val:`${((ef.financial_stress_index||0)*100).toFixed(0)}/100`, color:(ef.financial_stress_index||0)>0.6?'var(--red)':(ef.financial_stress_index||0)>0.35?'var(--amber)':'var(--green)' },
            { label:'Months Buffer',  val:`${(ef.months_of_expenses_saved||0).toFixed(1)}mo`, color:(ef.months_of_expenses_saved||0)<3?'var(--red)':(ef.months_of_expenses_saved||0)<6?'var(--amber)':'var(--green)' },
          ].map(m => (
            <div key={m.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'10px 14px' }}>
              <div style={{ fontSize:10, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 }}>{m.label}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:16, fontWeight:700, color:m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={handlePDF} disabled={dlding}>
          {dlding ? <><span className="spinner" style={{ width:12,height:12,border:'2px solid var(--border2)',borderTopColor:'var(--txt2)',borderRadius:'50%',display:'inline-block' }}/> Generating…</> : '⬇ Download PDF'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onViewInvestment}>
          📈 View Investment Plan
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:14, background:'var(--surface)', borderRadius:10, padding:4, border:'1px solid var(--border)', width:'fit-content' }}>
        {[['insights','💡 Insights'],['features','🔬 Features']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'7px 18px', borderRadius:7, border:'none', cursor:'pointer',
            background: tab===t ? 'var(--acc)' : 'transparent',
            color:      tab===t ? '#fff'       : 'var(--txt3)',
            fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:12,
            letterSpacing:'0.5px', textTransform:'uppercase', transition:'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      {/* Insights */}
      {tab==='insights' && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:22 }}>
          <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:16 }}>
            AI Insight Engine — {(result.insights||[]).length} signals
          </div>
          {(result.insights||[]).map((txt,i) => {
            const bc = ICON_C[txt.slice(0,2).trim()] || '#9da3b4';
            return (
              <div key={i} className={`row-${i}`} style={{ padding:'13px 16px', marginBottom:8, background:i===0?`${rc}0d`:'var(--surface2)', borderRadius:10, borderLeft:`3px solid ${bc}` }}>
                <p style={{ fontSize:13, lineHeight:1.65, color:i===0?'var(--txt)':'var(--txt2)', fontWeight:i===0?600:400 }}>{txt}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Features */}
      {tab==='features' && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:22 }}>
          <div style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:14 }}>
            Engineered Feature Matrix
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
            {[
              { label:'Expense Ratio',    val:`${((ef.expense_ratio||0)*100).toFixed(1)}%`,              warn:(ef.expense_ratio||0)>0.7 },
              { label:'EMI Ratio',        val:`${((ef.emi_ratio||0)*100).toFixed(1)}%`,                  warn:(ef.emi_ratio||0)>0.35 },
              { label:'Savings Ratio',    val:`${((ef.savings_ratio||0)*100).toFixed(1)}%`,              warn:(ef.savings_ratio||0)<0.05 },
              { label:'Stress Index',     val:`${((ef.financial_stress_index||0)*100).toFixed(1)}%`,     warn:(ef.financial_stress_index||0)>0.6 },
              { label:'Net Savings',      val:fmt(ef.net_savings||0),                                    warn:(ef.net_savings||0)<0 },
              { label:'Loan Burden',      val:`${(ef.loan_burden||0).toFixed(2)}x`,                      warn:(ef.loan_burden||0)>3 },
              { label:'Months Saved',     val:`${(ef.months_of_expenses_saved||0).toFixed(1)}mo`,         warn:(ef.months_of_expenses_saved||0)<3 },
              { label:'Interest Burden',  val:`${((ef.interest_burden||0)*100).toFixed(1)}%`,            warn:(ef.interest_burden||0)>0.15 },
              { label:'Credit Risk',      val:ef.credit_risk_flag?'FLAGGED':'CLEAR',                      warn:!!ef.credit_risk_flag },
            ].map(item => (
              <div key={item.label} style={{ background:'var(--surface2)', border:`1px solid ${item.warn?'rgba(255,71,87,0.25)':'var(--border)'}`, borderRadius:8, padding:'10px 12px' }}>
                <div style={{ fontSize:9, color:'var(--txt3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5 }}>{item.label}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:700, color:item.warn?'var(--red)':'var(--txt)' }}>{item.val}</div>
              </div>
            ))}
          </div>
          {/* Stress bar */}
          <div style={{ padding:16, background:'var(--surface2)', borderRadius:10, border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:11, color:'var(--txt3)', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase' }}>Financial Stress Index</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:(ef.financial_stress_index||0)>0.6?'var(--red)':'var(--txt)', fontWeight:700 }}>
                {((ef.financial_stress_index||0)*100).toFixed(1)} / 100
              </span>
            </div>
            <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:4, transition:'width 1s ease',
                width:`${(ef.financial_stress_index||0)*100}%`,
                background:'linear-gradient(90deg,#30d158,#ff9500,#ff4757)' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              {['Low','Moderate','High','Critical'].map(l => (
                <span key={l} style={{ fontSize:10, color:'var(--txt3)' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop:12, textAlign:'center', fontSize:11, color:'var(--txt3)' }}>
        Random Forest · 32,424 training samples · Amounts shown in {currency.code} {currency.flag}
      </div>
    </div>
  );
}
