const { Session, User, Product, CartItem } = require('../models');
const jwt = require('jsonwebtoken');

// Verify Exit QR
// Rules:
// 1. Token must be valid (signed)
// 2. Session must be PAID
// 3. Session must not be EXPIRED or USED
// 4. On success: Mark USED
exports.verifyExit = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ status: 'INVALID', error: 'No token provided' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(400).json({ status: 'INVALID', error: 'Token invalid or expired' });
        }

        const { sessionId } = decoded;
        const session = await Session.findByPk(sessionId, {
            include: [
                { model: Product, through: { attributes: ['quantity', 'priceSnapshot'] } },
                { model: User }
            ]
        });

        if (!session) {
            return res.status(404).json({ status: 'INVALID', error: 'Session not found' });
        }

        // Check Status
        if (session.status === 'USED') {
            return res.status(400).json({ status: 'USED', error: 'QR already used', session });
        }

        // Check Expiry (DB level check + Token expiry check handled by jwt.verify)
        if (session.status === 'EXPIRED' || (session.expiresAt && new Date() > new Date(session.expiresAt))) {
            // Auto-update to EXPIRED if not already
            if (session.status !== 'EXPIRED') {
                session.status = 'EXPIRED';
                await session.save();
            }
            return res.status(400).json({ status: 'EXPIRED', error: 'Session expired', session });
        }

        if (session.status !== 'PAID') {
            return res.status(400).json({ status: 'INVALID', error: `Session status is ${session.status}`, session });
        }

        // Success Path
        session.status = 'USED';
        await session.save();

        // Calculate Item Count
        let itemCount = 0;
        session.products.forEach(p => itemCount += p.cart_item.quantity);

        res.json({
            status: 'VALID',
            storeName: 'SuperMart', // Should come from Store relation
            itemCount,
            totalAmount: session.totalAmount,
            timestamp: new Date(),
            userTrustScore: session.user.trustScore,
            sessionId: session.id
        });

    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ status: 'ERROR', error: 'Server error' });
    }
};

// Mark Mismatch (Guard Flag)
// Rules:
// 1. Set Session -> FLAGGED
// 2. Reduce User Trust Score (e.g., -10)
exports.markMismatch = async (req, res) => {
    try {
        const { sessionId, reason } = req.body;

        const session = await Session.findByPk(sessionId, { include: [User] });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        session.status = 'FLAGGED';
        await session.save();

        if (session.user) {
            session.user.trustScore = Math.max(0, session.user.trustScore - 10);
            session.user.isFlagged = session.user.trustScore < 50; // Auto-flag user if score drops below 50
            await session.user.save();
        }

        res.json({ message: 'Session flagged and trust score updated', newScore: session.user.trustScore });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
