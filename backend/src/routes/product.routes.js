const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getProductByBarcode);
router.post('/', productController.addProduct);

module.exports = router;
