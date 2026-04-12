const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

const { validateCreateOrder, validateVerifyPayment } = require('../middleware/validators');

router.post('/create-order', validateCreateOrder, paymentController.createOrder);
router.post('/verify', validateVerifyPayment, paymentController.verifyPayment);

const storeAuth = require('../middleware/storeAuth');
router.get('/transactions', storeAuth, paymentController.getStoreTransactions);

module.exports = router;
