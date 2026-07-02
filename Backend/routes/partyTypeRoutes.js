const express = require('express');
const router = express.Router();
const { getPartyTypes, createPartyType, deletePartyType } = require('../controllers/partyTypeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPartyTypes).post(protect, createPartyType);
router.route('/:id').delete(protect, deletePartyType);

module.exports = router;
