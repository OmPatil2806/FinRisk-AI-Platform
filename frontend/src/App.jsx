import React, { useState } from 'react';
import { AuthProvider, useAuth }         from './context/AuthContext';
import { CurrencyProvider }              from './context/CurrencyContext';
import AuthPage       from './pages/AuthPage';
import DashboardPage  from './pages/DashboardPage';
import HistoryPage    from './pages/HistoryPage';
import InvestmentPage from './pages/InvestmentPage';
import Navbar         from './components/Navbar';
import './index.css';

function AppInner() {
  const { user, loading }       = useAuth();
  const [page, setPage]         = useState('dashboard');
  const [lastResult, setLastResult] = useState(null);
  const [lastForm,   setLastForm]   = useState(null);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div className="spinner" style={{ width:36, height:36, border:'3px solid var(--border2)', borderTopColor:'var(--acc)', borderRadius:'50%' }}/>
        <div style={{ fontSize:13, color:'var(--txt3)', letterSpacing:'1px' }}>Loading…</div>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Subtle grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(108,99,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.018) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <Navbar activePage={page} setPage={setPage}/>
        {page === 'dashboard'  && (
          <DashboardPage
            onViewInvestment={() => setPage('investment')}
            setLastResult={r => { setLastResult(r); }}
          />
        )}
        {page === 'investment' && (
          <InvestmentPage lastResult={lastResult} lastForm={lastForm}/>
        )}
        {page === 'history'    && <HistoryPage />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppInner />
      </CurrencyProvider>
    </AuthProvider>
  );
}
