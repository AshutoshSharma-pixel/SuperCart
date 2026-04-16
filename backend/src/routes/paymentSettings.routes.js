const express = require('express');
const router = express.Router();
const { Store } = require('../models');
const storeAuth = require('../middleware/storeAuth');
const { encryptSecret } = require('../utils/encryption');

/**
 * POST /api/payment-settings
 * Saves store's Razorpay keys. Encrypts the secret before saving.
 */
router.post('/', storeAuth, async (req, res, next) => {
    try {
        const { razorpayKeyId, razorpayKeySecret } = req.body;

        if (!razorpayKeyId || !razorpayKeySecret) {
            return res.status(400).json({ error: 'razorpayKeyId and razorpayKeySecret are required' });
        }

        const encryptedSecret = encryptSecret(razorpayKeySecret);

        await Store.update(
            { 
                razorpayKeyId, 
                razorpayKeySecret: encryptedSecret 
            },
            { 
                where: { id: req.storeId } 
            }
        );

        res.json({ success: true, message: "Payment settings saved" });
    } catch (error) {
        console.error('Save Payment Settings Error:', error);
        next(error);
    }
});

/**
 * GET /api/payment-settings
 * Returns store's current Razorpay setup status.
 * Never returns the secret key.
 */
router.get('/', storeAuth, async (req, res, next) => {
    try {
        const store = await Store.findByPk(req.storeId);
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json({
            hasKeys: !!(store.razorpayKeyId && store.razorpayKeySecret),
            razorpayKeyId: store.razorpayKeyId || null
        });
    } catch (error) {
        console.error('Get Payment Settings Status Error:', error);
        next(error);
    }
});

module.exports = router;
