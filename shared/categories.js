const CATEGORY_RULES = {

  Food: {
    keywords: [
      'chai', 'tea', 'coffee', 'food', 'canteen', 'mess', 'biryani', 'dosa', 'idli',
      'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'burger', 'paratha', 'thali',
      'restaurant', 'hotel', 'swiggy', 'zomato', 'biscuit', 'samosa', 'roti', 'rice',
      'vada', 'pav', 'maggi', 'noodles', 'milk', 'juice', 'lassi', 'water', 'sandwich'
    ],
    budget: 2000,
    emoji: '🍽️',
    color: '#F6AD55'
  },

  Transport: {
    keywords: [
      'bus', 'auto', 'ola', 'uber', 'rapido', 'petrol', 'metro', 'train', 'cab',
      'rickshaw', 'cycle', 'bike', 'travel', 'fare', 'ticket', 'commute',
      'fuel', 'diesel', 'parking', 'toll'
    ],
    budget: 1000,
    emoji: '🚌',
    color: '#63B3ED'
  },

  Study: {
    keywords: [
      'book', 'books', 'print', 'fees', 'pen', 'notes', 'stationery', 'photocopy',
      'xerox', 'college', 'tuition', 'course', 'exam', 'lab', 'library', 'assignment',
      'project', 'notebook', 'ruler', 'calculator', 'highlighter'
    ],
    budget: 500,
    emoji: '📚',
    color: '#9F7AEA'
  },

  Sports: {
    keywords: [
      'cricket', 'football', 'badminton', 'tennis', 'basketball', 'volleyball',
      'gym', 'fitness', 'workout', 'sports', 'match', 'tournament', 'bat', 'ball',
      'racket', 'shuttle', 'court', 'jersey'
    ],
    budget: 200,
    emoji: '🏸',
    color: '#38B2AC'
  },

  Entertainment: {
    keywords: [
      'movie', 'netflix', 'hotstar', 'prime', 'spotify', 'game', 'gaming',
      'cinema', 'show', 'concert', 'event', 'party'
    ],
    budget: 1000,
    emoji: '🎮',
    color: '#FC8181'
  },

  Shopping: {
    keywords: [
      'shopping', 'clothes', 'fashion', 'shirt', 'jeans', 'tshirt', 'jacket',
      'shoes', 'sneakers', 'sandals', 'watch', 'bag', 'amazon', 'flipkart', 'mall'
    ],
    budget: 1500,
    emoji: '🛍️',
    color: '#ED64A6'
  },

  Health: {
    keywords: [
      'medicine', 'doctor', 'clinic', 'hospital', 'tablet', 'vitamin',
      'pharmacy', 'checkup', 'treatment'
    ],
    budget: 800,
    emoji: '💊',
    color: '#48BB78'
  },

  PersonalCare: {
    keywords: [
      'haircut', 'salon', 'barber', 'shampoo', 'soap', 'toothpaste',
      'skincare', 'cosmetics', 'perfume', 'grooming'
    ],
    budget: 600,
    emoji: '🧴',
    color: '#F687B3'
  },

  Bills: {
    keywords: [
      'electricity', 'bill', 'mobile recharge', 'recharge', 'data pack',
      'internet bill', 'wifi bill', 'subscription fee'
    ],
    budget: 800,
    emoji: '📄',
    color: '#ECC94B'
  },

  Hostel: {
    keywords: [
      'hostel', 'rent', 'room', 'accommodation', 'pg', 'maintenance',
      'room rent', 'hostel fee'
    ],
    budget: 0,
    emoji: '🏠',
    color: '#4FD1C5'
  },

  Gadgets: {
    keywords: [
      'mobile', 'phone', 'charger', 'headphones', 'earphones',
      'mouse', 'keyboard', 'usb', 'pendrive', 'tablet'
    ],
    budget: 0,
    emoji: '📱',
    color: '#667EEA'
  },

  OnlineServices: {
    keywords: [
      'cloud', 'hosting', 'domain', 'software', 'license', 'app purchase',
      'premium', 'online service'
    ],
    budget: 0,
    emoji: '☁️',
    color: '#4299E1'
  },


  Social: {
    keywords: [
      'gift', 'birthday', 'donation', 'celebration', 'treat', 'friends treat'
    ],
    budget: 0,
    emoji: '🎁',
    color: '#D53F8C'
  },

  Laundry: {
    keywords: [
      'laundry', 'washing', 'dry clean', 'iron', 'washing machine'
    ],
    budget: 0,
    emoji: '🧺',
    color: '#319795'
  },

  Miscellaneous: {
    keywords: [
      'misc', 'others', 'random', 'unknown'
    ],
    budget: 0,
    emoji: '📦',
    color: '#A0AEC0'
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
    { category: 'Miscellaneous', score: -1 }
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