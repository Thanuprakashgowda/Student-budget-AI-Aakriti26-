const express = require('express');
const router = express.Router();
const { categorize } = require('../../shared/categories');

// POST /api/categorize - AI categorization
router.post('/', (req, res) => {
  try {
    const { description } = req.body;
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ success: false, error: 'Description is required' });
    }

    const result = categorize(description);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
