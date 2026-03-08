const router = require('express').Router();
const storeAuth = require('../middleware/storeAuth');
const sub = require('../controllers/subscription.controller');

const { validateSubscriptionOrder } = require('../middleware/validators');

router.get('/status', storeAuth, sub.getStatus);
router.post('/create-order', storeAuth, validateSubscriptionOrder, sub.createOrder);
router.post('/verify', storeAuth, sub.verifyPayment);

module.exports = router;
