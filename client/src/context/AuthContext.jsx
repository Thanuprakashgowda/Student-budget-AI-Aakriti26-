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

  // Sync budgets to localStorage for demo mode
  const [demoBudgets, setDemoBudgets] = useState(() => {
    try {
      const stored = localStorage.getItem(`sba_budgets_${userId}`);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [demoTotalBudget, setDemoTotalBudget] = useState(() => {
    return parseFloat(localStorage.getItem(`sba_total_budget_${userId}`) || '0');
  });

  useEffect(() => {
    // Bypass authentication completely for Vercel demo deployment
    const demoUser = { 
      _id: userId, 
      name: 'Student', 
      email: 'demo@studentbudgetai.com', 
      college: '',
      budgets: demoBudgets,
      totalMonthlyBudget: demoTotalBudget
    };
    setUser(demoUser);
    localStorage.setItem('sba_token', userId);
    
    const budgetDone = localStorage.getItem(`sba_budget_done_${userId}`);
    if (!budgetDone) setIsNewUser(true);
    
    setLoading(false);
  }, [userId, demoBudgets, demoTotalBudget]);

  const updateBudgets = useCallback((newTotal, newBudgets) => {
    setDemoTotalBudget(newTotal);
    setDemoBudgets(newBudgets);
    localStorage.setItem(`sba_total_budget_${userId}`, String(newTotal));
    localStorage.setItem(`sba_budgets_${userId}`, JSON.stringify(newBudgets));
    
    // Mark setup as done if they have a budget
    if (newTotal > 0) {
      localStorage.setItem(`sba_budget_done_${userId}`, '1');
      setIsNewUser(false);
    }
  }, [userId]);

  const login = useCallback(async () => true, []);
  const signup = useCallback(async () => true, []);
  
  const completeBudgetSetup = useCallback((userId, total, budgets) => {
    updateBudgets(total, budgets);
    setIsNewUser(false);
  }, [updateBudgets]);

  const logout = useCallback(() => {
    // Optionally redirect or reset state
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, isNewUser, login, signup, logout, clearError, completeBudgetSetup, updateBudgets }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
