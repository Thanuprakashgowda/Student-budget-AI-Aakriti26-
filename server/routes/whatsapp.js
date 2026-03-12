const express = require('express');
const twilio = require('twilio');
const Expense = require('../models/Expense');
const { encryptField } = require('../middleware/encryption');
const { categorize } = require('../../shared/categories');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const { Body, From } = req.body;
  const io = req.app.get('io');
  const command = Body.trim().toLowerCase();

  // Handle deletion command
  if (command === 'delete' || command === 'remove') {
    let deletedId = null;
    try {
      if (mongoose.connection.readyState === 1) {
        // Find and delete last expense for this phone number
        const lastExpense = await Expense.findOneAndDelete(
          { phone: From },
          { sort: { date: -1 } }
        );
        if (lastExpense) deletedId = lastExpense._id;
      } else {
        // In-memory deletion
        const dbState = req.app.get('dbState') || { expenses: [] };
        const idx = dbState.expenses.findIndex(e => e.phone === From);
        if (idx !== -1) {
          deletedId = dbState.expenses[idx]._id;
          dbState.expenses.splice(idx, 1);
        }
      }

      if (deletedId) {
        if (io) io.emit('expense:deleted', { id: deletedId });
        
        if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
          const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:+14155238886`,
            to: From,
            body: '🗑️ Last expense deleted successfully! Dashboard updated.'
          });
        }
      } else {
        if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
          const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:+14155238886`,
            to: From,
            body: '❌ No expenses found to delete.'
          });
        }
      }
    } catch (err) {
      console.error('WhatsApp deletion error:', err);
    }
    return res.sendStatus(200);
  }

  // Format expectation: "150 chai"
  const match = Body.match(/(\d+(?:\.\d+)?)\s*(.*)/);
  
  if (!match) {
    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:+14155238886`,
        to: From,
        body: 'Format: "150 chai" or "80 auto"'
      });
    }
    return res.sendStatus(200);
  }

  const rawAmount = match[1];
  const rawDescription = match[2] || 'WhatsApp entry';
  
  const categoryResult = categorize(rawDescription);

  const expenseData = {
    amount: parseFloat(rawAmount) || 0,
    description: rawDescription,
    category: categoryResult.category,
    aiConfidence: categoryResult.confidence,
    source: 'whatsapp',
    phone: From,
    userId: 'demo-user',
    date: new Date()
  };

  if (process.env.ENCRYPTION_KEY) {
    expenseData.amount_encrypted = encryptField(rawAmount);
    expenseData.description_encrypted = encryptField(rawDescription);
  }

  let savedExpense;
  try {
    if (mongoose.connection.readyState === 1) {
      savedExpense = new Expense(expenseData);
      await savedExpense.save();
    } else {
      // Fallback to in-memory if MongoDB is disconnected
      console.warn('⚠️  MongoDB disconnected, saving WhatsApp entry in-memory');
      const dbState = req.app.get('dbState') || { expenses: [] };
      savedExpense = { ...expenseData, _id: Date.now().toString() };
      dbState.expenses.unshift(savedExpense);
    }
    
    if (io && savedExpense) {
      io.emit('expense:created', savedExpense);
    }

    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:+14155238886`,
        to: From,
        body: `✅ ₹${rawAmount} ${expense.category} logged! Dashboard updated.`
      });
    }
  } catch (err) {
    console.error('WhatsApp logging error:', err);
  }

  res.sendStatus(200);
});

module.exports = router;
