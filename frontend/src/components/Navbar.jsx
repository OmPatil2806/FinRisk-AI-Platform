import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';

export default function Navbar({ activePage, setPage }) {
  const { user, logout }             = useAuth();
  const { currency, changeCurrency, lastUpdated } = useCurrency();
  const [showMenu,  setShowMenu]     = useState(false);
  const [showCurr,  setShowCurr]     = useState(false);

  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',   icon: '📊' },
    { id: 'investment', label: 'Investments',  icon: '📈' },
    { id: 'history',    label: 'History',      icon: '🕒' },
  ];

  return (
    <nav style={{
      background: 'rgba(19,21,28,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 200,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1300, margin: '0 auto', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
          onClick={() => setPage('dashboard')}>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:'linear-gradient(135deg, var(--acc), #a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, boxShadow:'0 2px 8px rgba(108,99,255,0.4)',
          }}>₹</div>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:18 }}>
            FinRisk <span style={{ color:'var(--acc)', fontStyle:'italic' }}>AI</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display:'flex', gap:4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              background: activePage===item.id ? 'var(--acc-dim)' : 'transparent',
              border: activePage===item.id ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
              borderRadius:8, color: activePage===item.id ? 'var(--acc2)' : 'var(--txt3)',
              cursor:'pointer', display:'flex', alignItems:'center', gap:6,
              fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:13,
              padding:'7px 14px', transition:'all 0.2s',
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Right side: currency + user */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>

          {/* Currency selector */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setShowCurr(v=>!v); setShowMenu(false); }} style={{
              background:'var(--surface2)', border:'1px solid var(--border)',
              borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center',
              gap:6, padding:'7px 12px', fontSize:13, color:'var(--txt2)',
              fontFamily:"'IBM Plex Mono',monospace", transition:'all 0.2s',
            }}>
              <span>{CURRENCIES.find(c=>c.code===currency.code)?.flag}</span>
              <span style={{ fontWeight:600 }}>{currency.code}</span>
              <span style={{ fontSize:9 }}>▼</span>
            </button>

            {showCurr && (
              <div className="scale-in" style={{
                position:'absolute', right:0, top:'calc(100% + 6px)',
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:10, width:220, padding:6,
                boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:300,
              }}>
                {lastUpdated && (
                  <div style={{ fontSize:10, color:'var(--txt3)', padding:'4px 8px 8px', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
                    Rates updated: {lastUpdated}
                  </div>
                )}
                {CURRENCIES.map(c => (
                  <button key={c.code} onClick={() => { changeCurrency(c.code); setShowCurr(false); }} style={{
                    width:'100%', padding:'8px 10px', textAlign:'left',
                    background: currency.code===c.code ? 'var(--acc-dim)' : 'transparent',
                    border:'none', borderRadius:6,
                    color: currency.code===c.code ? 'var(--acc2)' : 'var(--txt2)',
                    cursor:'pointer', fontSize:13,
                    display:'flex', alignItems:'center', gap:10,
                    transition:'background 0.15s',
                  }}
                    onMouseEnter={e => { if(currency.code!==c.code) e.target.style.background='var(--surface2)'; }}
                    onMouseLeave={e => { if(currency.code!==c.code) e.target.style.background='transparent'; }}>
                    <span>{c.flag}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, minWidth:36 }}>{c.code}</span>
                    <span style={{ fontSize:12, color:'var(--txt3)' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User menu */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setShowMenu(v=>!v); setShowCurr(false); }} style={{
              background:'var(--surface2)', border:'1px solid var(--border)',
              borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center',
              gap:8, padding:'7px 12px', transition:'all 0.2s',
            }}>
              <div style={{
                width:26, height:26, borderRadius:'50%', display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700,
                background:'linear-gradient(135deg,var(--acc),#a855f7)', color:'#fff',
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize:13, color:'var(--txt2)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.name}
              </span>
              <span style={{ fontSize:9, color:'var(--txt3)' }}>▼</span>
            </button>

            {showMenu && (
              <div className="scale-in" style={{
                position:'absolute', right:0, top:'calc(100% + 6px)',
                background:'var(--surface)', border:'1px solid var(--border)',
                borderRadius:10, minWidth:200, padding:8,
                boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:300,
              }}>
                <div style={{ padding:'8px 12px 12px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
                  <div style={{ fontWeight:600 }}>{user?.name}</div>
                  <div style={{ fontSize:12, color:'var(--txt3)' }}>{user?.email}</div>
                </div>
                {[
                  { label:'📊 Dashboard',    page:'dashboard' },
                  { label:'📈 Investments',  page:'investment' },
                  { label:'🕒 History',      page:'history' },
                ].map(item => (
                  <button key={item.page} onClick={() => { setPage(item.page); setShowMenu(false); }} style={{
                    width:'100%', padding:'9px 12px', textAlign:'left', background:'transparent',
                    border:'none', borderRadius:6, color:'var(--txt2)', cursor:'pointer', fontSize:13,
                    display:'flex', alignItems:'center', gap:8, transition:'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {item.label}
                  </button>
                ))}
                <hr style={{ border:'none', borderTop:'1px solid var(--border)', margin:'6px 0' }}/>
                <button onClick={logout} style={{
                  width:'100%', padding:'9px 12px', textAlign:'left', background:'transparent',
                  border:'none', borderRadius:6, color:'var(--red)', cursor:'pointer', fontSize:13,
                  display:'flex', alignItems:'center', gap:8, transition:'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--red-dim)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  ↩ Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
