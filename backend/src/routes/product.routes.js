const router = require('express').Router();
const storeAuth = require('../middleware/storeAuth');
const checkSubscription = require('../middleware/subscription.middleware').checkSubscription;
const ctrl = require('../controllers/product.controller');

const {
    validateAddProduct,
    validateUpdateProduct,
    validateScanProduct,
    validateReceiveStock,
    validateAdjustStock
} = require('../middleware/validators');

// Public — customer app uses this
router.get('/', ctrl.getProductByBarcode);

// Store owner — all require auth + active subscription
router.get('/store', storeAuth, checkSubscription, ctrl.getStoreProducts);
router.post('/', storeAuth, checkSubscription, validateAddProduct, ctrl.addProduct);
router.put('/:id', storeAuth, checkSubscription, validateUpdateProduct, ctrl.updateProduct);
router.delete('/:id', storeAuth, checkSubscription, ctrl.deleteProduct);
router.patch('/:id/toggle-discount', storeAuth, checkSubscription, ctrl.toggleDiscount);

// Stock management
router.post('/scan', storeAuth, checkSubscription, validateScanProduct, ctrl.scanProduct);
router.post('/:id/receive', storeAuth, checkSubscription, validateReceiveStock, ctrl.receiveStock);
router.patch('/:id/adjust-stock', storeAuth, checkSubscription, validateAdjustStock, ctrl.adjustStock);
router.get('/:id/stock-history', storeAuth, checkSubscription, ctrl.getStockHistory);

module.exports = router;
