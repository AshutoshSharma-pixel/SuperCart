const { Store } = require('../models');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLAN_PRICES = {
    STARTER: 99900,    // ₹999
    GROWTH: 350000,    // ₹3,500
    ENTERPRISE: 800000 // ₹8,000
};

exports.getStatus = async (req, res, next) => {
    try {
        const store = await Store.findByPk(req.storeId);
        if (!store) return res.status(404).json({ error: 'Store not found' });

        let status = 'NO_PLAN';
        let daysRemaining = 0;
        const now = new Date();

        if (store.planExpiresAt) {
            const tempExpiresAt = new Date(store.planExpiresAt);
            const tempGraceEndsAt = store.gracePeriodEndsAt ? new Date(store.gracePeriodEndsAt) : null;

            if (store.isLocked || (tempGraceEndsAt && now > tempGraceEndsAt)) {
                status = 'LOCKED';
            } else if (now > tempExpiresAt) {
                status = 'GRACE_PERIOD';
                daysRemaining = Math.max(0, Math.ceil((tempGraceEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            } else {
                status = 'ACTIVE';
                daysRemaining = Math.max(0, Math.ceil((tempExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            }
        }

        res.json({
            shopId: store.shopId,
            planTier: store.planTier,
            planExpiresAt: store.planExpiresAt,
            gracePeriodEndsAt: store.gracePeriodEndsAt,
            isLocked: store.isLocked,
            daysRemaining,
            status
        });
    } catch (error) {
        console.error('Get Subscription Status Error:', error);
        next(error);
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const { planTier } = req.body;

        if (!PLAN_PRICES[planTier]) {
            return res.status(400).json({ error: 'Invalid plan tier' });
        }

        const amount = PLAN_PRICES[planTier];

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `sub_${req.storeId}_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create Subscription Order Error:', error);
        next(error);
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const { planTier, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const store = await Store.findByPk(req.storeId);
        if (!store) return res.status(404).json({ error: 'Store not found' });

        if (!PLAN_PRICES[planTier]) {
            return res.status(400).json({ error: 'Invalid plan tier' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            const now = new Date();
            let newExpiresAt = new Date();

            if (store.planExpiresAt && store.planExpiresAt > now) {
                // Renewing early -> append to existing expriy
                newExpiresAt = new Date(store.planExpiresAt.getTime() + (30 * 24 * 60 * 60 * 1000));
            } else {
                // Expanding an expired plan or establishing a new plan
                newExpiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
            }

            const newGraceEndsAt = new Date(newExpiresAt.getTime() + (2 * 24 * 60 * 60 * 1000));

            store.planExpiresAt = newExpiresAt;
            store.gracePeriodEndsAt = newGraceEndsAt;
            store.planTier = planTier;
            store.isLocked = false;

            await store.save();

            return res.json({
                success: true,
                status: 'ACTIVE',
                planExpiresAt: newExpiresAt,
                gracePeriodEndsAt: newGraceEndsAt,
                planTier
            });
        } else {
            return res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Verify Subscription Error:', error);
        next(error);
    }
};
