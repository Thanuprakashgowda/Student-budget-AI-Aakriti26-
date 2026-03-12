const express = require('express');
const twilio = require('twilio');
const Expense = require('../models/Expense');
const { encryptField } = require('../middleware/encryption');
const { categorize } = require('../../shared/categories');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/webhook', async (req, res) => {

  const { Body, From } = req.body;
  const io = req.app.get('io');
  const command = Body.trim().toLowerCase();

  const client = process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  /*
  =================================
  REPORT / EXPORT COMMAND
  =================================
  */

  if (command === 'report' || command === 'export') {

    try {

      let expenses = [];

      if (mongoose.connection.readyState === 1) {
        expenses = await Expense.find({ phone: From }).sort({ date: -1 });
      } else {
        const dbState = req.app.get('dbState') || { expenses: [] };
        expenses = dbState.expenses.filter(e => e.phone === From);
      }

      if (!expenses.length) {

        if (client) {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
            to: From,
            body: '❌ No expenses found to generate report.'
          });
        }

        return res.sendStatus(200);
      }

      const reportsDir = path.join(__dirname, '../reports');

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
      }

      const fileName = `report_${Date.now()}.pdf`;
      const filePath = path.join(reportsDir, fileName);

      const doc = new PDFDocument();

      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(18).text('StudentBudgetAI Expense Report');
      doc.moveDown();

      let total = 0;

      expenses.forEach(e => {

        const line = `${new Date(e.date).toDateString()} | ₹${e.amount} | ${e.category} | ${e.description}`;

        doc.fontSize(12).text(line);

        total += Number(e.amount) || 0;
      });

      doc.moveDown();
      doc.fontSize(14).text(`Total Spent: ₹${total}`);

      doc.end();

      const publicUrl = `${process.env.SERVER_URL}/reports/${fileName}`;

      if (client) {

        await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
          to: From,
          body: '📄 Your expense report',
          mediaUrl: [publicUrl]
        });

      }

    } catch (err) {
      console.error('Report generation error:', err);
    }

    return res.sendStatus(200);
  }

  /*
  =================================
  DELETE COMMAND
  =================================
  */

  if (command === 'delete' || command === 'remove') {

    let deletedId = null;

    try {

      if (mongoose.connection.readyState === 1) {

        const lastExpense = await Expense.findOneAndDelete(
          { phone: From },
          { sort: { date: -1 } }
        );

        if (lastExpense) deletedId = lastExpense._id;

      } else {

        const dbState = req.app.get('dbState') || { expenses: [] };

        const idx = dbState.expenses.findIndex(e => e.phone === From);

        if (idx !== -1) {
          deletedId = dbState.expenses[idx]._id;
          dbState.expenses.splice(idx, 1);
        }

      }

      if (deletedId) {

        if (io) io.emit('expense:deleted', { id: deletedId });

        if (client) {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
            to: From,
            body: '🗑️ Last expense deleted successfully! Dashboard updated.'
          });
        }

      } else {

        if (client) {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
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

  /*
  =================================
  ADD EXPENSE
  =================================
  */

  const match = Body.match(/(\d+(?:\.\d+)?)\s*(.*)/);

  if (!match) {

    if (client) {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
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

      console.warn('⚠️ MongoDB disconnected, saving WhatsApp entry in-memory');

      const dbState = req.app.get('dbState') || { expenses: [] };

      savedExpense = {
        ...expenseData,
        _id: Date.now().toString()
      };

      dbState.expenses.unshift(savedExpense);

    }

    if (io && savedExpense) {
      io.emit('expense:created', savedExpense);
    }

    if (client) {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
        to: From,
        body: `✅ ₹${rawAmount} ${categoryResult.category} logged! Dashboard updated.`
      });
    }

  } catch (err) {
    console.error('WhatsApp logging error:', err);
  }

  res.sendStatus(200);
});

module.exports = router;