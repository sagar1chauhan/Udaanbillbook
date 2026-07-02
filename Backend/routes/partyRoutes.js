const express = require('express');
const router = express.Router();
const { getParties, createParty, updateParty, deleteParty } = require('../controllers/partyController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/').get(protect, getParties).post(protect, requirePermission('manage_parties'), createParty);
router.route('/:id').put(protect, requirePermission('manage_parties'), updateParty).delete(protect, requirePermission('manage_parties'), deleteParty);

module.exports = router;
