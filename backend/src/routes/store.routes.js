const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

router.get('/:id', storeController.getStore);
router.post('/', storeController.createStore);

module.exports = router;
