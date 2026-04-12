const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { validateCustomerLogin, validateStoreLogin, validateStoreRegister } = require('../middleware/validators');

router.post('/login', validateCustomerLogin, authController.login);
router.post('/store-login', validateStoreLogin, authController.storeLogin);
router.post('/store-register', validateStoreRegister, authController.storeRegister);
router.post('/store-forgot-password', authController.storeForgotPassword);
router.post('/store-reset-password', authController.storeResetPassword);

module.exports = router;
