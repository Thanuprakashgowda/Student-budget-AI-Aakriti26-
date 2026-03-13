const express = require('express');
const twilio = require('twilio');
const Expense = require('../models/Expense');
const { encryptField } = require('../middleware/encryption');
const { categorize } = require('../../shared/categories');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/webhook', async (req, res) => {

  const { Body, From } = req.body;

  console.log("Incoming WhatsApp:", Body, From);

  const io = req.app.get('io');
  const command = Body.trim().toLowerCase();

  const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  /*
  ============================
  DELETE LAST EXPENSE
  ============================
  */

  if (command === 'delete' || command === 'remove') {

    try {

      let deletedExpense;

      if (mongoose.connection.readyState === 1) {

        deletedExpense = await Expense.findOneAndDelete(
          { phone: From },
          { sort: { date: -1 } }
        );

      } else {

        const dbState = req.app.get('dbState');

        const idx = dbState.expenses.findIndex(e => e.phone === From);

        if (idx !== -1) {
          deletedExpense = dbState.expenses[idx];
          dbState.expenses.splice(idx, 1);
        }

      }

      if (deletedExpense) {

        if (io) {
          io.emit('expense:deleted', { id: deletedExpense._id });
        }

        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: From,
          body: '🗑️ Last expense deleted successfully.'
        });

      } else {

        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: From,
          body: '❌ No expenses found to delete.'
        });

      }

    } catch (err) {

      console.error("Delete error:", err);

    }

    return res.sendStatus(200);
  }

  /*
  ============================
  ADD NEW EXPENSE
  ============================
  */

  const match = Body.match(/(\d+(?:\.\d+)?)\s*(.*)/);

  if (!match) {

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: From,
      body: 'Format: "150 chai" or "80 auto"'
    });

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

    /*
    ============================
    SAVE EXPENSE
    ============================
    */

    if (mongoose.connection.readyState === 1) {

      savedExpense = new Expense(expenseData);
      await savedExpense.save();

    } else {

      console.warn('⚠️ MongoDB not connected, using in-memory mode');

      const dbState = req.app.get('dbState');

      savedExpense = {
        ...expenseData,
        _id: Date.now().toString()
      };

      dbState.expenses.unshift(savedExpense);

    }

    /*
    ============================
    UPDATE DASHBOARD
    ============================
    */

    if (io && savedExpense) {
      io.emit('expense:created', savedExpense);
    }

    /*
    ============================
    WHATSAPP CONFIRMATION
    ============================
    */

    await client.messages.create({

      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: From,
      body: `✅ Expense saved: ₹${rawAmount} (${categoryResult.category})`

    });

  } catch (err) {

    console.error("Expense save error:", err);

  }

  res.sendStatus(200);

});

module.exports = router;