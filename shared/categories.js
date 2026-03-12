// AI Categorization Logic - Keyword-based with confidence scoring
const CATEGORY_RULES = {
  Food: {
    keywords: ['chai', 'tea', 'coffee', 'food', 'canteen', 'mess', 'biryani', 'dosa', 'idli',
      'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'burger', 'paratha', 'thali',
      'restaurant', 'hotel', 'swiggy', 'zomato', 'biscuit', 'samosa', 'roti', 'rice',
      'vada', 'pav', 'maggi', 'noodles', 'milk', 'juice', 'lassi', 'water bottle'],
    budget: 2000,
    emoji: '🍽️',
    color: '#F6AD55'
  },
  Transport: {
    keywords: ['bus', 'auto', 'ola', 'uber', 'rapido', 'petrol', 'metro', 'train', 'cab',
      'rickshaw', 'cycle', 'bike', 'travel', 'fare', 'ticket', 'transport', 'commute',
      'fuel', 'diesel', 'parking', 'toll'],
    budget: 1500,
    emoji: '🚌',
    color: '#63B3ED'
  },
  Study: {
    keywords: ['books', 'book', 'print', 'fees', 'pen', 'notes', 'stationery', 'photocopy',
      'xerox', 'college', 'tuition', 'course', 'exam', 'lab', 'library', 'uniform',
      'laptop', 'internet', 'wifi', 'subscription', 'udemy', 'coursera', 'highlighter',
      'notebook', 'ruler', 'calculator'],
    budget: 3000,
    emoji: '📚',
    color: '#9F7AEA'
  },
  Entertainment: {
    keywords: ['movie', 'netflix', 'hotstar', 'prime', 'spotify', 'game', 'gaming', 'cafe',
      'outing', 'fun', 'party', 'concert', 'event', 'cricket', 'sport', 'gym',
      'swim', 'bowling', 'arcade', 'mall', 'shopping', 'clothes', 'fashion'],
    budget: 1000,
    emoji: '🎮',
    color: '#FC8181'
  }
};

/**
 * AI categorizer using keyword matching with confidence scoring
 * @param {string} description - Expense description
 * @returns {{category: string, confidence: number, emoji: string}}
 */
const categorize = (description) => {
  const desc = description.toLowerCase().trim();
  const scores = {};

  for (const [category, data] of Object.entries(CATEGORY_RULES)) {
    let score = 0;
    let matched = 0;
    for (const keyword of data.keywords) {
      if (desc.includes(keyword)) {
        // Longer keyword matches get higher score
        score += keyword.length * 2;
        matched++;
      }
    }
    scores[category] = { score, matched };
  }

  const bestCategory = Object.entries(scores).reduce((best, [cat, s]) =>
    s.score > best.score ? { category: cat, score: s.score } : best,
    { category: 'Food', score: -1 }
  );

  const totalScore = Object.values(scores).reduce((s, v) => s + v.score, 0);
  const confidence = totalScore > 0
    ? Math.min(0.95, 0.5 + (bestCategory.score / totalScore) * 0.5)
    : 0.5;

  return {
    category: bestCategory.category,
    confidence: parseFloat(confidence.toFixed(2)),
    emoji: CATEGORY_RULES[bestCategory.category].emoji
  };
};

const CATEGORIES = Object.keys(CATEGORY_RULES);
const CATEGORY_BUDGETS = Object.fromEntries(
  Object.entries(CATEGORY_RULES).map(([k, v]) => [k, v.budget])
);
const CATEGORY_COLORS = Object.fromEntries(
  Object.entries(CATEGORY_RULES).map(([k, v]) => [k, v.color])
);
const CATEGORY_EMOJIS = Object.fromEntries(
  Object.entries(CATEGORY_RULES).map(([k, v]) => [k, v.emoji])
);

module.exports = { categorize, CATEGORIES, CATEGORY_RULES, CATEGORY_BUDGETS, CATEGORY_COLORS, CATEGORY_EMOJIS };
