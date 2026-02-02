const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

router.post('/verify-exit', verificationController.verifyExit);
router.post('/mark-mismatch', verificationController.markMismatch);

module.exports = router;
