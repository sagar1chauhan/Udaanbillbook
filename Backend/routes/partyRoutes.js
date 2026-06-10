const express = require('express');
const router = express.Router();
const { getParties, createParty, updateParty, deleteParty } = require('../controllers/partyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getParties).post(protect, createParty);
router.route('/:id').put(protect, updateParty).delete(protect, deleteParty);

module.exports = router;
