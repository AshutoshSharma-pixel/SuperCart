const { Session, User, Store } = require('../models');

exports.getTransactions = async (req, res, next) => {
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
