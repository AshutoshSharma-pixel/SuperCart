const { Store } = require('../models');

const checkSubscription = async (req, res, next) => {
    try {
        // Find storeId from auth context, body, query or req.user context depending on the route
        const storeId = req.storeId || req.body.storeId || req.query.storeId || (req.user && req.user.storeId);

        if (!storeId || isNaN(parseInt(storeId))) {
            return res.status(400).json({ error: 'Valid Store ID is required to verify subscription.' });
        }

        const store = await Store.findByPk(storeId);

        if (!store) {
            return res.status(404).json({ error: 'Store not found.' });
        }

        if (store.isLocked) {
            return res.status(403).json({ error: 'Store account is locked due to expired subscription.' });
        }

        // Check if grace period has expired and lock the store dynamically
        if (store.gracePeriodEndsAt && new Date() > store.gracePeriodEndsAt) {
            store.isLocked = true;
            await store.save();
            return res.status(403).json({ error: 'Store account is locked due to expired subscription.' });
        }

        // Attach store reference for downstream usage
        req.store = store;

        next();
    } catch (error) {
        console.error('Subscription Middleware Error:', error);
        res.status(500).json({ error: 'Internal Server Error during subscription check.' });
    }
};

module.exports = { checkSubscription };
