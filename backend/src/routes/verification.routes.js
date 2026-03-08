const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

const { validateVerifyExit, validateMarkMismatch } = require('../middleware/validators');

router.post('/verify-exit', validateVerifyExit, verificationController.verifyExit);
router.post('/mark-mismatch', validateMarkMismatch, verificationController.markMismatch);

module.exports = router;
