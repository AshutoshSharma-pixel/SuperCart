const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill.controller');

router.get('/:sessionId', billController.generateBill);

module.exports = router;
