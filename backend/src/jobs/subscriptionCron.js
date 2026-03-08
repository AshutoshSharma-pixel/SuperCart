const cron = require('node-cron');
const { Store, Product } = require('../models');
const { Op } = require('sequelize');

cron.schedule('0 * * * *', async () => {
    try {
        const locked = await Store.update(
            { isLocked: true },
            { where: { gracePeriodEndsAt: { [Op.lt]: new Date() }, isLocked: false } }
        );
        console.log(`[CRON] Locked ${locked[0]} expired stores`);
    } catch (error) {
        console.error('[CRON] Failed to lock expired stores:', error);
    }
});

// Run every hour — expire discounts whose expiry date has passed
cron.schedule('0 * * * *', async () => {
    try {
        const expired = await Product.update(
            { isDiscountActive: false },
            {
                where: {
                    isDiscountActive: true,
                    discountExpiresAt: { [Op.lt]: new Date() }
                }
            }
        );
        console.log(`[CRON] Deactivated ${expired[0]} expired discounts`);
    } catch (error) {
        console.error('[CRON] Failed to deactivate expired discounts:', error);
    }
});
