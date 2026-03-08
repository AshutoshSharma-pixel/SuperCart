const router = require('express').Router();
const checkSubscription = require('../middleware/subscription.middleware').checkSubscription;
const ctrl = require('../controllers/cart.controller');

const { validateStartSession, validateAddToCart, validateRemoveFromCart, validateUpdateQuantity } = require('../middleware/validators');

router.post('/start', checkSubscription, validateStartSession, ctrl.startSession);
router.post('/add', validateAddToCart, ctrl.addToCart);
router.post('/remove', validateRemoveFromCart, ctrl.removeFromCart);
router.put('/quantity', validateUpdateQuantity, ctrl.updateQuantity);
router.get('/:sessionId', ctrl.getCart);

module.exports = router;
