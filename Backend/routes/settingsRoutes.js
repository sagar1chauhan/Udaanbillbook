const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadLogo, uploadSignature, getActiveInvoiceTemplates } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/').get(protect, getSettings).put(protect, updateSettings);
router.post('/upload-logo', protect, upload.single('logo'), uploadLogo);
router.post('/upload-signature', protect, upload.single('signature'), uploadSignature);

// Vendor-facing: Get all active invoice templates
router.get('/invoice-templates', protect, getActiveInvoiceTemplates);

module.exports = router;
