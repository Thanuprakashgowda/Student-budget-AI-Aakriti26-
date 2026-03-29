const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
  try {
    const { message, expenses, budgets } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing. Using smart fallback advisor.');
      
      // Calculate context for fallback
      const totalSpent = expenses ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
      const totalBudget = budgets ? Object.values(budgets).reduce((sum, val) => sum + val, 0) : 0;
      const remaining = totalBudget - totalSpent;
      const overspentCategories = budgets ? Object.entries(budgets)
        .filter(([cat, budget]) => {
          const spent = expenses ? expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) : 0;
          return spent > budget;
        })
        .map(([cat]) => cat) : [];

      let fallbackReply = `Hi! I'm currently running in "Safe Mode" (no AI key found), but I can still analyze your data! 📊\n\n`;
      
      const msg = message.toLowerCase();
      if (msg.includes('status') || msg.includes('how am i doing') || msg.includes('budget')) {
        fallbackReply += `You have ₹${remaining.toLocaleString()} remaining from your ₹${totalBudget.toLocaleString()} budget. `;
        if (overspentCategories.length > 0) {
          fallbackReply += `Watch out! You've overspent in: ${overspentCategories.join(', ')}. ⚠️`;
        } else {
          fallbackReply += `You're doing great and staying within all your limits! 🌟`;
        }
      } else if (msg.includes('save') || msg.includes('advice') || msg.includes('tips')) {
        fallbackReply += `To save more this month, try to reduce spending in your top category. Currently, you've spent ₹${totalSpent.toLocaleString()} in total. Small changes like skipping one outside meal a week can add up! 💡`;
      } else if (msg.includes('hello') || msg.includes('hi')) {
        fallbackReply += `Hello student! How can I help you manage your money today? You can ask about your "status" or for "saving tips". 👋`;
      } else {
        fallbackReply += `I'm analyzing your data... You have ₹${remaining.toLocaleString()} left. If you set up a Gemini API key in your Vercel settings, I can give much more detailed AI advice! 🚀`;
      }

      return res.json({ success: true, reply: fallbackReply });
    }

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Prepare context
    const totalSpent = expenses ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
    const totalBudget = budgets ? Object.values(budgets).reduce((sum, val) => sum + val, 0) : 0;
    
    // Create a financial summary string
    let expensesSummary = 'No recent expenses.';
    if (expenses && expenses.length > 0) {
      // Send up to 20 most recent expenses to keep context window reasonable
      expensesSummary = expenses.slice(0, 20).map(e => `- ₹${e.amount} on ${e.description} (${e.category})`).join('\n');
    }

    let budgetsSummary = 'No category budgets set up.';
    if (budgets && Object.keys(budgets).length > 0) {
        budgetsSummary = Object.entries(budgets).map(([cat, budget]) => {
            const catSpent = expenses ? expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) : 0;
            return `- ${cat}: ₹${catSpent} spent out of ₹${budget} budget`;
        }).join('\n');
    }

    const systemPrompt = `You are StudentBudgetAI, a friendly and helpful financial assistant specifically designed for college/university students.
Your goal is to provide concise, actionable, and encouraging financial advice based on the user's personal spending data.
Use emojis occasionally to keep the tone light, modern, and engaging. Be empathetic to the typical student financial struggles.

Here is the user's current real-time financial context:
- Total Monthly Budget: ₹${totalBudget}
- Total Spent So Far: ₹${totalSpent}
- Remaining Budget: ₹${Math.max(0, totalBudget - totalSpent)}

Category Budgets & Status:
${budgetsSummary}

Recent Expenses (Latest first):
${expensesSummary}

User Query: ${message}

Instructions:
1. Respond directly to the User Query using the financial context provided above.
2. If they ask about overspending, let them know exactly where they are overspending based on their category budgets.
3. Keep your response relatively concise (under 3 paragraphs).
4. Do not hallucinatory expenses; only reference what's given. Format your response clearly.`;

    // Instantiate model inside the handler to pick up latest env vars if changed
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    res.json({ success: true, reply: responseText });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to process chat query. Ensure your API key is valid.' });
  }
});

module.exports = router;
