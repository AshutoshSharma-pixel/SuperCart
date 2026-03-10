const { Session, User, Store } = require('../models');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: 'admin', role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '12h' }
            );
            return res.json({ token });
        }

        return res.status(401).json({ error: 'Invalid admin credentials' });
    } catch (error) {
        console.error('Admin Login Error:', error);
        next(error);
    }
}; exports.getTransactions = async (req, res, next) => {
    try {
        const sessions = await Session.findAll({
            include: [
                { model: User, attributes: ['id', 'phone', 'trustScore'] },
                { model: Store, attributes: ['name'] }
            ],
            order: [['updatedAt', 'DESC']],
            limit: 50 // Cap at 50 for MVP
        });
        res.json(sessions);
    } catch (error) {
        console.error('Transactions Error:', error);
        next(error);
    }
};

exports.getFlags = async (req, res, next) => {
    try {
        const sessions = await Session.findAll({
            where: { status: 'FLAGGED' },
            include: [
                { model: User },
                { model: Store }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        console.error('Flags Error:', error);
        next(error);
    }
};
