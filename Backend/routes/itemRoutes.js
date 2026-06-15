const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem, bulkCreateItems } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getItems).post(protect, createItem);
router.route('/bulk').post(protect, bulkCreateItems);
router.route('/:id').put(protect, updateItem).delete(protect, deleteItem);

module.exports = router;
