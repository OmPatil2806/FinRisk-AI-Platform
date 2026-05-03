import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useFinRisk() {
  const { apiFetch } = useAuth();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const analyze = useCallback(async (formData) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const { ok, data } = await apiFetch('/full-analysis', {
        method: 'POST', body: JSON.stringify(formData),
      });
      if (!ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
      return data;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  return { result, loading, error, analyze, setResult };
}
