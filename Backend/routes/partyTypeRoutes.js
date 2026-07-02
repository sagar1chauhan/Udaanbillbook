const express = require('express');
const router = express.Router();
const { getPartyTypes, createPartyType } = require('../controllers/partyTypeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPartyTypes).post(protect, createPartyType);

module.exports = router;
