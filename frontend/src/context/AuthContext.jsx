import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || '';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('fr_token'));
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  }, [token]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch('/auth/me').then(({ ok, data }) => {
      if (ok) setUser(data.user);
      else    { localStorage.removeItem('fr_token'); setToken(null); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { ok, data } = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (!ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('fr_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, [apiFetch]);

  const login = useCallback(async (email, password) => {
    const { ok, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('fr_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, [apiFetch]);

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    localStorage.removeItem('fr_token');
    setToken(null);
    setUser(null);
  }, [apiFetch]);

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);