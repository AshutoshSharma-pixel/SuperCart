const { Session, Product, CartItem, Store } = require('../models');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Sequelize } = require('sequelize');
const { decryptSecret } = require('../utils/encryption');

// Note: Global razorpay instance removed to favor store-specific instances in controllers


// 1. Create Order
exports.createOrder = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findByPk(sessionId, {
            include: [{ model: Store }]
        });

        if (!session || session.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Invalid or inactive session' });
        }

        const store = session.store;
        if (!store || !store.razorpayKeyId || !store.razorpayKeySecret) {
            return res.status(400).json({ error: "Store has not configured payment settings" });
        }

        let razorpayKeySecret;
        try {
            razorpayKeySecret = decryptSecret(store.razorpayKeySecret);
        } catch (err) {
            console.error('Decryption failed for store', store.id, err);
            return res.status(500).json({ error: "Internal server error: payment configuration issue" });
        }

        const razorpay = new Razorpay({
            key_id: store.razorpayKeyId,
            key_secret: razorpayKeySecret
        });

        // Calculate amount (ensure it matches DB total or recalculate)
        // For safety, let's recalculate or trust the totalAmount if updated
        // Razorpay expects amount in paise (multiply by 100)
        const amount = Math.round(session.totalAmount * 100);

        if (amount <= 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_${sessionId}`,
            payment_capture: 1 // Auto capture
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: store.razorpayKeyId
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        next(error);
    }
};

// 2. Verify Payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const { sessionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const session = await Session.findByPk(sessionId, {
            include: [{ model: Store }]
        });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const store = session.store;
        if (!store || !store.razorpayKeySecret) {
            return res.status(400).json({ error: "Store has not configured payment settings" });
        }

        let razorpayKeySecret;
        try {
            razorpayKeySecret = decryptSecret(store.razorpayKeySecret);
        } catch (err) {
            console.error('Decryption failed for store', store.id, err);
            return res.status(500).json({ error: "Internal server error: payment configuration issue" });
        }

        // Verify Signature
        // content to hash: order_id + "|" + payment_id
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Success
            session.status = 'PAID';

            const { deductStock } = require('../utils/stock');
            const cartItems = await CartItem.findAll({
                where: { sessionId: session.id },
                include: [{ model: Product }]
            });

            // Deduct stock for each item sold
            for (const item of cartItems) {
                try {
                    await deductStock(
                        item.productId,
                        session.storeId,
                        item.quantity,
                        session.id
                    );
                } catch (err) {
                    // Log but don't fail the payment
                    console.error(`Stock deduction failed for product ${item.productId}:`, err.message);
                }
            }

            session.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins exit time

            // Generate Exit Token
            const tokenPayload = {
                sessionId: session.id,
                amount: session.totalAmount,
                ts: Date.now()
            };
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '10m' });
            session.exitToken = token;

            await session.save();

            return res.json({
                success: true,
                status: 'PAID',
                exitToken: token
            });
        } else {
            return res.status(400).json({ error: 'Invalid signature' });
        }

    } catch (error) {
        console.error('Verify Error:', error);
        next(error);
    }
};

exports.getStoreTransactions = async (req, res, next) => {
    try {
        const storeId = req.storeId;

        // Fetch sessions with their cart item count
        const transactions = await Session.findAll({
          where: {
            storeId,
            status: ['PAID', 'USED', 'FLAGGED']
          },
          attributes: [
            'id',
            'status',
            'totalAmount',
            'createdAt',
            [
              Sequelize.literal(`(
                SELECT COUNT(*) FROM cart_items
                WHERE cart_items."sessionId" = session.id
              )`),
              'itemCount'
            ]
          ],
          order: [['createdAt', 'DESC']]
        });

        const result = transactions.map(t => {
          const data = t.toJSON();
          return {
            id: data.id,
            sessionId: String(data.id),
            amount: data.totalAmount,
            status: data.status.toLowerCase(),
            itemCount: parseInt(data.itemCount || 0),
            createdAt: data.createdAt
          };
        });

        res.json(result);
    } catch (error) {
        console.error('Get Store Transactions Error:', error);
        next(error);
    }
};
