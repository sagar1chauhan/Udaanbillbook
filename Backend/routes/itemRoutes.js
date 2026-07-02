const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem, bulkCreateItems } = require('../controllers/itemController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/').get(protect, getItems).post(protect, requirePermission('manage_items'), createItem);
router.route('/bulk').post(protect, requirePermission('manage_items'), bulkCreateItems);
router.route('/:id').put(protect, requirePermission('manage_items'), updateItem).delete(protect, requirePermission('manage_items'), deleteItem);

module.exports = router;
