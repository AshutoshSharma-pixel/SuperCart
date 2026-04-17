const { Session, User, Store } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

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

exports.getStores = async (req, res, next) => {
    try {
        const stores = await Store.findAll({
            attributes: [
                'id', 'name', 'shopId', 'planTier', 'planExpiresAt', 
                'gracePeriodEndsAt', 'isLocked', 'ownerName', 'ownerPhone', 
                'ownerEmail', 'shopAddress', 'location', 'createdAt'
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(stores);
    } catch (error) {
        console.error('Get Stores Error:', error);
        next(error);
    }
};

exports.getStoreDetail = async (req, res, next) => {
    try {
        const { shopId } = req.params;
        const store = await Store.findOne({
            where: { shopId },
            attributes: [
                'id', 'name', 'shopId', 'planTier', 'planExpiresAt', 
                'gracePeriodEndsAt', 'isLocked', 'ownerName', 'ownerPhone', 
                'ownerEmail', 'shopAddress', 'location', 'createdAt'
            ]
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json(store);
    } catch (error) {
        console.error('Store Detail Error:', error);
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const [
            totalStores,
            activeStores,
            totalTransactions,
            totalRevenue,
            newStoresToday,
            transactionsToday
        ] = await Promise.all([
            Store.count(),
            Store.count({ where: { isLocked: false } }),
            Session.count({ where: { status: 'PAID' } }),
            Session.sum('totalAmount', { where: { status: 'PAID' } }),
            Store.count({ 
                where: { 
                    createdAt: { [Op.gte]: todayStart } 
                } 
            }),
            Session.count({ 
                where: { 
                    status: 'PAID', 
                    updatedAt: { [Op.gte]: todayStart } 
                } 
            })
        ]);

        res.json({
            totalStores,
            activeStores,
            totalTransactions,
            totalRevenue: totalRevenue || 0,
            newStoresToday,
            transactionsToday
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        next(error);
    }
};
