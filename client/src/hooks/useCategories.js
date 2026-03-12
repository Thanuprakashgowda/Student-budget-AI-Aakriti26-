import { useState, useEffect } from 'react';

// Hardcoded defaults
const DEFAULT_CATEGORIES = {
  Food: { emoji: '🍽️', color: '#FF8C00' },
  Transport: { emoji: '🚌', color: '#00D4FF' },
  Study: { emoji: '📚', color: '#00E676' },
  Entertainment: { emoji: '🎮', color: '#FF5252' }
};

const DEFAULT_BUDGETS = {
  Food: 2000,
  Transport: 1500,
  Study: 3000,
  Entertainment: 1000
};

// Colors for custom categories
const CUSTOM_COLORS = ['#FFD740', '#E040FB', '#00E5FF', '#FF4081', '#76FF03', '#F50057'];

export const useCategories = (userId) => {
  const [categories, setCategories] = useState([]);
  const [categorizing, setCategorizing] = useState(false);
  
  // Load categories and budgets on mount/user change
  useEffect(() => {
    if (!userId) {
      // Setup defaults if no user
      const defaultCats = Object.keys(DEFAULT_CATEGORIES).map(name => ({
        name,
        ...DEFAULT_CATEGORIES[name],
        budget: DEFAULT_BUDGETS[name],
        isCustom: false
      }));
      setCategories(defaultCats);
      return;
    }

    // Load from local storage for this specific user
    try {
      const stored = localStorage.getItem(`sba_cats_${userId}`);
      if (stored) {
        setCategories(JSON.parse(stored));
      } else {
        // Initialize defaults for this user
        const defaultCats = Object.keys(DEFAULT_CATEGORIES).map(name => ({
          name,
          ...DEFAULT_CATEGORIES[name],
          budget: DEFAULT_BUDGETS[name],
          isCustom: false
        }));
        setCategories(defaultCats);
        localStorage.setItem(`sba_cats_${userId}`, JSON.stringify(defaultCats));
      }
    } catch {
      console.error("Failed to load categories");
    }
  }, [userId]);

  const saveCategories = (newCats) => {
    setCategories(newCats);
    if (userId) {
      localStorage.setItem(`sba_cats_${userId}`, JSON.stringify(newCats));
    }
  };

  const addCategory = (name, budget, emoji) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return false; // Exists
    
    // Pick random neon color for custom cat
    const color = CUSTOM_COLORS[categories.length % CUSTOM_COLORS.length];
    
    const newCats = [...categories, {
      name, budget, emoji: emoji || '🏷️', color, isCustom: true
    }];
    saveCategories(newCats);
    return true;
  };

  const updateBudget = (name, newBudget) => {
    const newCats = categories.map(c => c.name === name ? { ...c, budget: newBudget } : c);
    saveCategories(newCats);
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

  // Turn array into object format for other components
  const totalsFormat = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.budget;
    return acc;
  }, {});

  const infoFormat = categories.reduce((acc, cat) => {
    acc[cat.name] = { color: cat.color, emoji: cat.emoji };
    return acc;
  }, {});

  return {
    categories,              // Array format for UI [{name, budget, emoji, color}]
    addCategory,
    updateBudget,
    CATEGORY_BUDGETS: totalsFormat, // For BudgetAlerts/Dashboard
    CATEGORY_INFO: infoFormat,      // For finding color/emoji by name
    categorize,
    categorizing
  };
};
