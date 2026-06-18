const express = require('express');
const router = express.Router();
const { getDashboardSummary, getAccountingData } = require('../services/reportService');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, async (req, res) => {
  try {
    const summary = await getDashboardSummary(req.user.id);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accounting', protect, async (req, res) => {
  try {
    const data = await getAccountingData(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
