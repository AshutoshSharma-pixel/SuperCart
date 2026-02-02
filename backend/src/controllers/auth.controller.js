const { User, Store } = require('../models');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        // Mock OTP verification for MVP (accept any 6 digit OTP)
        // In production, integrate with Twilio/SpringEdge
        if (!otp || otp.length !== 6) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Find or create user
        let user = await User.findOne({ where: { phone } });
        if (!user) {
            user = await User.create({ phone });
        }

        // Check if user is flagged
        if (user.isFlagged) {
            return res.status(403).json({ error: 'Account flagged. Contact store security.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({ token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
