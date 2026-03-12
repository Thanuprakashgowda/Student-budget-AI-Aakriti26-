import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const API = '/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sba_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // true only for brand-new signups → shows BudgetSetup wizard
  const [isNewUser, setIsNewUser] = useState(false);

  // Verify stored token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          // Check if this user has done budget setup before
          const budgetDone = localStorage.getItem(`sba_budget_done_${data.user._id}`);
          if (!budgetDone) setIsNewUser(true);
        } else {
          localStorage.removeItem('sba_token');
          setToken(null);
        }
      } catch {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({ _id: payload.id, name: 'Student', email: '', college: '' });
        } catch { }
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []); // eslint-disable-line

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) { setAuthError(data.error || 'Login failed'); return false; }
      localStorage.setItem('sba_token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Only show setup if they haven't done it before
      const budgetDone = localStorage.getItem(`sba_budget_done_${data.user._id}`);
      if (!budgetDone) setIsNewUser(true);
      return true;
    } catch {
      setAuthError('Cannot connect to server. Please try again.');
      return false;
    }
  }, []);

  const signup = useCallback(async (name, email, password, college) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, college })
      });
      const data = await res.json();
      if (!data.success) { setAuthError(data.error || 'Signup failed'); return false; }
      localStorage.setItem('sba_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsNewUser(true); // Always show setup for new accounts
      return true;
    } catch {
      setAuthError('Cannot connect to server. Please try again.');
      return false;
    }
  }, []);

  // Called when user finishes BudgetSetup
  const completeBudgetSetup = useCallback((userId) => {
    if (userId) localStorage.setItem(`sba_budget_done_${userId}`, '1');
    setIsNewUser(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sba_token');
    localStorage.removeItem('sba_points');
    localStorage.removeItem('sba_streak');
    setToken(null);
    setUser(null);
    setAuthError(null);
    setIsNewUser(false);
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, isNewUser, login, signup, logout, clearError, completeBudgetSetup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
