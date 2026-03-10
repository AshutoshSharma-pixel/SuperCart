const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

const adminAuth = require('../middleware/adminAuth');

router.post('/login', adminController.adminLogin);
router.get('/transactions', adminAuth, adminController.getTransactions);
router.get('/flags', adminAuth, adminController.getFlags);

module.exports = router;
