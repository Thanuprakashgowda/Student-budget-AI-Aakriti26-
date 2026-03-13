import { useState, useEffect, useMemo } from 'react';

// Hardcoded defaults (matching shared/categories.js)
const DEFAULT_CATEGORIES = {
  Food: { emoji: '🍽️', color: '#F6AD55' },
  Transport: { emoji: '🚌', color: '#63B3ED' },
  Study: { emoji: '📚', color: '#9F7AEA' },
  Sports: { emoji: '🏸', color: '#38B2AC' },
  Entertainment: { emoji: '🎮', color: '#FC8181' },
  Shopping: { emoji: '🛍️', color: '#ED64A6' },
  Health: { emoji: '💊', color: '#48BB78' },
  PersonalCare: { emoji: '🧴', color: '#F687B3' },
  Bills: { emoji: '📄', color: '#ECC94B' },
  Hostel: { emoji: '🏠', color: '#4FD1C5' },
  Gadgets: { emoji: '📱', color: '#667EEA' },
  OnlineServices: { emoji: '☁️', color: '#4299E1' },
  Travel: { emoji: '✈️', color: '#38A169' },
  Social: { emoji: '🎁', color: '#D53F8C' },
  Laundry: { emoji: '🧺', color: '#319795' },
  Miscellaneous: { emoji: '📦', color: '#A0AEC0' }
};

const DEFAULT_BUDGETS = {
  Food: 2000,
  Transport: 1500,
  Study: 3000,
  Sports: 1200,
  Entertainment: 1000,
  Shopping: 1500,
  Health: 800,
  PersonalCare: 600,
  Bills: 800,
  Hostel: 3000,
  Gadgets: 1500,
  OnlineServices: 700,
  Travel: 2500,
  Social: 800,
  Laundry: 300,
  Miscellaneous: 500
};

// Colors for custom categories
const CUSTOM_COLORS = ['#FFD740', '#E040FB', '#00E5FF', '#FF4081', '#76FF03', '#F50057'];
const EMPTY_BUDGETS = {};

export const useCategories = (userId, userBudgets = EMPTY_BUDGETS) => {
  const [categories, setCategories] = useState([]);
  const [categorizing, setCategorizing] = useState(false);
  
  // Load categories and budgets on mount/user change
  useEffect(() => {
    const initCats = () => {
      const dbBudgets = userBudgets || {};
      
      const mergedCats = Object.keys(DEFAULT_CATEGORIES).map(name => ({
        name,
        ...DEFAULT_CATEGORIES[name],
        budget: dbBudgets[name] !== undefined ? dbBudgets[name] : DEFAULT_BUDGETS[name],
        isCustom: false
      }));

      // Find any custom categories in local storage (keeping those local for now or can sync later)
      try {
        const stored = localStorage.getItem(`sba_custom_cats_${userId}`);
        if (stored) {
          const custom = JSON.parse(stored);
          return [...mergedCats, ...custom];
        }
      } catch (e) {
        console.error("Local custom cats error", e);
      }
      
      return mergedCats;
    };

    setCategories(initCats());
  }, [userId, JSON.stringify(userBudgets)]);

  const saveToBackend = async (categoryName, budget) => {
    if (!userId || userId === 'demo-user-id') return;
    
    try {
      const token = localStorage.getItem('sba_token');
      // Construct current budget map
      const currentMap = categories.reduce((acc, c) => {
        acc[c.name] = c.name === categoryName ? budget : c.budget;
        return acc;
      }, {});

      await fetch('/api/auth/budgets', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ budgets: currentMap })
      });
    } catch (e) {
      console.error("Sync error", e);
    }
  };

  const addCategory = (name, budget, emoji) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return false;
    const color = CUSTOM_COLORS[categories.length % CUSTOM_COLORS.length];
    const newCat = { name, budget: parseFloat(budget) || 0, emoji: emoji || '🏷️', color, isCustom: true };
    const newCats = [...categories, newCat];
    setCategories(newCats);
    
    if (userId) {
      const customOnly = newCats.filter(c => c.isCustom);
      localStorage.setItem(`sba_custom_cats_${userId}`, JSON.stringify(customOnly));
    }
    return true;
  };

  const updateBudget = async (name, newBudget) => {
    const val = parseFloat(newBudget) || 0;
    setCategories(prev => prev.map(c => c.name === name ? { ...c, budget: val } : c));
    await saveToBackend(name, val);
  };

  const categorize = async (description) => {
    if (!description || description.trim().length < 3) return null;
    setCategorizing(true);
    try {
      // Local fallback keywords
      const fallbackKeywords = {
        food: ['food', 'chai', 'coffee', 'lunch', 'dinner', 'snack', 'canteen'],
        transport: ['bus', 'auto', 'ola', 'uber', 'rapido', 'train', 'metro'],
        study: ['book', 'pen', 'fees', 'tuition', 'print', 'xerox', 'stationery', 'library'],
        entertainment: ['movie', 'game', 'spotify', 'netflix', 'fun', 'party']
      };
      
      const input = description.toLowerCase();
      let bestMatch = null;
      for (const [key, words] of Object.entries(fallbackKeywords)) {
        if (words.some(w => input.includes(w))) {
          const found = categories.find(c => c.name.toLowerCase() === key);
          if (found) { bestMatch = found.name; break; }
        }
      }
      
      if (bestMatch) {
        setCategorizing(false);
        return { category: bestMatch, confidence: 0.85 };
      }

      // Try server
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      const data = await res.json();
      if (data.success && data.category) {
        const found = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
        setCategorizing(false);
        return { category: found ? found.name : (categories[0]?.name || 'Food'), confidence: data.confidence || 0.8 };
      }
    } catch (e) {
      console.error("Categorization error", e);
    }
    setCategorizing(false);
    return null;
  };

  // Memoize derivation to prevent infinite loops in consumers
  const totalsFormat = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.name] = cat.budget;
      return acc;
    }, {});
  }, [categories]);

  const infoFormat = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.name] = { color: cat.color, emoji: cat.emoji };
      return acc;
    }, {});
  }, [categories]);

  return {
    categories,              
    addCategory,
    updateBudget,
    CATEGORY_BUDGETS: totalsFormat, 
    CATEGORY_INFO: infoFormat,      
    categorize,
    categorizing
  };
};
