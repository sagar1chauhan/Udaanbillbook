const express = require('express');
const router = express.Router();
const { getDashboardSummary, getAccountingData } = require('../services/reportService');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, requirePermission('view_reports'), async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;
    const summary = await getDashboardSummary(ownerId);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accounting', protect, requirePermission('view_reports'), async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;
    const data = await getAccountingData(ownerId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
