const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/transactions', adminController.getTransactions);
router.get('/flags', adminController.getFlags);

module.exports = router;
