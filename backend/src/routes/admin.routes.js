const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

const adminAuth = require('../middleware/adminAuth');

router.post('/login', adminController.adminLogin);
router.get('/transactions', adminAuth, adminController.getTransactions);
router.get('/stats', adminAuth, adminController.getStats);
router.get('/flags', adminAuth, adminController.getFlags);
router.get('/stores', adminAuth, adminController.getStores);
router.get('/stores/:shopId', adminAuth, adminController.getStoreDetail);

module.exports = router;
