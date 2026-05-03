import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_KEY = '4551365025508c2f2fa8586f';

export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',      flag: '🇺🇸' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',   flag: '🇮🇳' },
  { code: 'EUR', symbol: '€',  name: 'Euro',           flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',  name: 'British Pound',  flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham',     flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',   flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency]   = useState(() => {
    const saved = localStorage.getItem('fr_currency');
    return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0]; // USD default
  });
  const [rates,    setRates]      = useState({ USD: 1 });
  const [loading,  setLoading]    = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch rates from exchangerate-api (base USD)
  const fetchRates = useCallback(async () => {
    try {
      const res  = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
      const data = await res.json();
      if (data.result === 'success') {
        setRates(data.conversion_rates);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn('Exchange rate fetch failed, using fallback rates');
      // Fallback rates (approximate)
      setRates({
        USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79,
        AED: 3.67, SGD: 1.34, JPY: 149.5, CAD: 1.36,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Refresh every 30 minutes
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const changeCurrency = useCallback((code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem('fr_currency', code);
    }
  }, []);

  // Convert USD → selected currency
  const convert = useCallback((usdAmount) => {
    if (!usdAmount || isNaN(usdAmount)) return 0;
    const rate = rates[currency.code] || 1;
    return parseFloat((usdAmount * rate).toFixed(2));
  }, [rates, currency]);

  // Convert selected currency → USD (for sending to backend)
  const toUSD = useCallback((amount) => {
    if (!amount || isNaN(amount)) return 0;
    const rate = rates[currency.code] || 1;
    return parseFloat((amount / rate).toFixed(2));
  }, [rates, currency]);

  // Format with symbol
  const fmt = useCallback((usdAmount, decimals = 0) => {
    const val = convert(usdAmount);
    if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(val).toLocaleString()}`;
    }
    return `${currency.symbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }, [convert, currency]);

  return (
    <CurrencyContext.Provider value={{
      currency, currencies: CURRENCIES, rates,
      loading, lastUpdated,
      changeCurrency, convert, toUSD, fmt,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
