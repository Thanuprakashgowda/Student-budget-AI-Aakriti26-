import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Use a generated or static session ID for the demo so they can use the app immediately
  const [userId] = useState(() => {
    let id = localStorage.getItem('sba_demo_id');
    if (!id) {
      id = 'demo-user-id-' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('sba_demo_id', id);
    }
    return id;
  });

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(userId); // We use userId as token to inject in headers
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Bypass authentication completely for Vercel demo deployment
    const demoUser = { _id: userId, name: 'Student', email: 'demo@studentbudgetai.com', college: '' };
    setUser(demoUser);
    localStorage.setItem('sba_token', userId);
    
    const budgetDone = localStorage.getItem(`sba_budget_done_${userId}`);
    if (!budgetDone) setIsNewUser(true);
    
    setLoading(false);
  }, [userId]);

  const login = useCallback(async () => true, []);
  const signup = useCallback(async () => true, []);
  
  const completeBudgetSetup = useCallback(() => {
    localStorage.setItem(`sba_budget_done_${userId}`, '1');
    setIsNewUser(false);
  }, [userId]);

  const logout = useCallback(() => {
    // Optionally redirect or reset state
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
