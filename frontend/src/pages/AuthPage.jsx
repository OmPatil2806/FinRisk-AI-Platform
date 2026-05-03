import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off" />
    </div>
  );
}

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode,     setMode]    = useState('login');
  const [name,     setName]    = useState('');
  const [email,    setEmail]   = useState('');
  const [password, setPassword]= useState('');
  const [error,    setError]   = useState('');
  const [loading,  setLoading] = useState(false);

  const toggle = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); };

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else                  await register(name, email, password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }}/>

      <div className="fade-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--acc), #a855f7)',
            marginBottom: 16, boxShadow: '0 8px 24px rgba(108,99,255,0.4)',
          }}>
            <span style={{ fontSize: 26 }}>₹</span>
          </div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: 'var(--txt)', marginBottom: 4 }}>
            FinRisk <span style={{ color: 'var(--acc)', fontStyle: 'italic' }}>AI</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--txt3)' }}>
            Financial Risk & Intelligence Platform
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--txt3)', fontSize: 13, marginBottom: 28 }}>
            {mode === 'login'
              ? 'Sign in to access your financial dashboard'
              : 'Start your financial health journey'}
          </p>

          {mode === 'register' && (
            <Input label="Full Name" value={name} onChange={setName} placeholder="John Smith" />
          )}
          <Input label="Email Address" type="email" value={email} onChange={setEmail}
            placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword}
            placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'} />

          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(255,71,87,0.25)',
              borderRadius: 8, color: 'var(--red)', fontSize: 13, marginBottom: 16,
              padding: '10px 14px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className={`btn btn-primary btn-full btn-lg ${!loading ? 'glow-btn' : ''}`}
            onClick={submit} disabled={loading} onKeyDown={handleKey}
            style={{ marginBottom: 20 }}>
            {loading
              ? <><span className="spinner" style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block' }}/> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : mode === 'login' ? '→ Sign In' : '→ Create Account'
            }
          </button>

          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--txt3)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={toggle} style={{
              background: 'none', border: 'none', color: 'var(--acc)', cursor: 'pointer',
              fontWeight: 600, fontSize: 13,
            }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--txt3)' }}>
          Powered by Machine Learning · Data secured locally
        </div>
      </div>
    </div>
  );
}
