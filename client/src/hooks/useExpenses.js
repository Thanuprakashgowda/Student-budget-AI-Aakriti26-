import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = '/api';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const nextIdRef = useRef(100);

  const computeTotals = useCallback((expList) => {
    const t = {};
    expList.forEach(e => { t[e.category] = (t[e.category] || 0) + e.amount; });
    setTotals(t);
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('sba_token');
      const res = await fetch(`${API_BASE}/expenses`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses);
        setTotals(data.totals || {});
        setServerOnline(true);
      }
    } catch {
      // Fallback to local state
      computeTotals(expenses);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    fetchExpenses();
  }, []); // eslint-disable-line
  useEffect(() => { computeTotals(expenses); }, [expenses, computeTotals]);

  const addExpense = useCallback(async (expenseData) => {
    if (!serverOnline) {
      // Local mode
      const newExp = { ...expenseData, _id: String(nextIdRef.current++), createdAt: new Date().toISOString() };
      setExpenses(prev => [newExp, ...prev]);
      return { success: true, expense: newExp };
    }
    try {
      const token = localStorage.getItem('sba_token');
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(prev => [data.expense, ...prev]);
        return data;
      }
    } catch {
      const newExp = { ...expenseData, _id: String(nextIdRef.current++), createdAt: new Date().toISOString() };
      setExpenses(prev => [newExp, ...prev]);
      return { success: true, expense: newExp };
    }
  }, [serverOnline]);

  const deleteExpense = useCallback(async (id) => {
    setExpenses(prev => prev.filter(e => e._id !== id));
    if (serverOnline) {
      try {
        const token = localStorage.getItem('sba_token');
        await fetch(`${API_BASE}/expenses/${id}`, { 
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      } catch { /* already removed locally */ }
    }
  }, [serverOnline]);

  const updateExpense = useCallback(async (id, data) => {
    setExpenses(prev => prev.map(e => e._id === id ? { ...e, ...data } : e));
    if (serverOnline) {
      try {
        const token = localStorage.getItem('sba_token');
        await fetch(`${API_BASE}/expenses/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(data)
        });
      } catch { /* already updated locally */ }
    }
  }, [serverOnline]);

  return { expenses, totals, loading, error, serverOnline, addExpense, deleteExpense, updateExpense, refetch: fetchExpenses };
};
