const { Session, Product, CartItem, Store, User } = require('../models');
const { calculateDiscountedPrice } = require('../utils/discount');


// Add Item to Cart
exports.addToCart = async (req, res, next) => {
    try {
        console.log('Add to Cart Request:', req.body);
        const { sessionId, barcode, quantity } = req.body;
        const qty = quantity || 1; // Use qty for consistency with original, or just use quantity

        // Find Session
        const session = await Session.findByPk(sessionId);
        if (!session) {
            console.log('Session not found:', sessionId);
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Invalid or inactive session' });
        }

        console.log('Session found:', session.id, 'StoreId:', session.storeId);

        // Find Product by barcode AND storeId
        const product = await Product.findOne({
            where: {
                barcode,
                storeId: session.storeId
            }
        });

        console.log('Product search - Barcode:', barcode, 'StoreId:', session.storeId);
        console.log('Product found:', product ? product.id : 'NOT FOUND');

        if (!product) {
            return res.status(404).json({ error: 'Product not found in this store' });
        }

        // Check if item already in cart
        const existingItem = await CartItem.findOne({
            where: { sessionId, productId: product.id }
        });

        const priceInfo = calculateDiscountedPrice(product);

        if (existingItem) {
            existingItem.quantity += qty;
            existingItem.priceSnapshot = priceInfo.originalPrice;
            existingItem.finalPriceSnapshot = priceInfo.finalPrice;
            existingItem.discountApplied = priceInfo.discountApplied;
            existingItem.discountType = priceInfo.discountType;
            existingItem.discountValue = priceInfo.discountValue;
            existingItem.savings = priceInfo.savings;
            await existingItem.save();
            console.log(`Updated CartItem ${existingItem.id}: quantity=${existingItem.quantity}, finalPriceSnapshot=${existingItem.finalPriceSnapshot}`);
        } else {
            await CartItem.create({
                sessionId,
                productId: product.id,
                quantity: qty,
                priceSnapshot: priceInfo.originalPrice,
                finalPriceSnapshot: priceInfo.finalPrice,
                discountApplied: priceInfo.discountApplied,
                discountType: priceInfo.discountType,
                discountValue: priceInfo.discountValue,
                savings: priceInfo.savings
            });
            console.log(`Created new CartItem for sessionId=${sessionId}, productId=${product.id}, quantity=${qty}`);
        }

        // Update Total (Naive approach, usually done via DB hooks or aggregation)
        // Here we re-calculate purely for response
        await calculateTotal(session.id);
        const updatedSession = await Session.findByPk(session.id, { include: [Product] });
        console.log('Session total updated:', updatedSession.totalAmount);

        res.json(updatedSession);

    } catch (error) {
        console.error('Add to cart error:', error);
        next(error);
    }
};

// Create New Session (Entry)
exports.startSession = async (req, res, next) => {
    try {
        console.log('Start Session Request Body:', req.body);
        let { userId, storeId } = req.body;

        if (!userId || !storeId) {
            return res.status(400).json({ error: 'Missing userId or storeId' });
        }

        // User lookup/creation by Firebase UID
        let user = await User.findOne({ where: { firebaseUid: userId } });
        if (!user) {
            console.log(`No user found with firebaseUid: ${userId}. Creating new user...`);
            user = await User.create({
                firebaseUid: userId,
                phone: null,
                trustScore: 100
            });
        }
        
        // Use the internal integer database ID for the remainder of the session logic
        userId = user.id;

        // Ensure Store Exists (Self-healing)
        const storeExists = await Store.findByPk(storeId);
        if (!storeExists) {
            console.log(`Store ${storeId} not found! Creating default store...`);
            // We force ID 1 if possible, or just create one and use its ID
            // Sequelize doesn't support forcing ID easily unless defined, 
            // but we can try to find ANY store or create new
            const firstStore = await Store.findOne();
            if (firstStore) {
                console.log(`Falling back to Store ID: ${firstStore.id}`);
                storeId = firstStore.id;
            } else {
                const newStore = await Store.create({
                    name: 'SuperMart Default',
                    location: 'Default Location',
                    upiId: 'default@upi'
                });
                storeId = newStore.id;
            }
        }

        // Check for existing active session
        let session = await Session.findOne({
            where: { userId, storeId, status: 'ACTIVE' }
        });

        if (!session) {
            session = await Session.create({
                userId,
                storeId,
                status: 'ACTIVE'
            });
        }

        // Fetch store details to include in response
        const store = await Store.findByPk(storeId);

        res.json({
            ...session.toJSON(),
            store: {
                name: store.name,
                location: store.location,
                shopId: store.shopId
            }
        });
    } catch (error) {
        console.error('Start Session Error:', error);
        next(error);
    }
};

// Helper: Recalculate Total
async function calculateTotal(sessionId) {
    const items = await CartItem.findAll({ where: { sessionId } });
    let total = 0;
    items.forEach(item => {
        total += item.finalPriceSnapshot * item.quantity;
    });
    total = Math.round(total * 100) / 100;
    await Session.update({ totalAmount: total }, { where: { id: sessionId } });
}

exports.getCart = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findByPk(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const items = await CartItem.findAll({
            where: { sessionId },
            include: [{ model: Product, attributes: ['id', 'name', 'barcode', 'price'] }]
        });

        const cartItems = items.map(item => ({
            cartItemId: item.id,
            productId: item.productId,
            name: item.product.name,
            barcode: item.product.barcode,
            quantity: item.quantity,
            originalPrice: item.priceSnapshot,
            finalPrice: item.finalPriceSnapshot,
            discountApplied: item.discountApplied,
            discountType: item.discountType,
            discountValue: item.discountValue,
            savingsPerUnit: item.savings,
            totalSavings: Math.round(item.savings * item.quantity * 100) / 100,
            lineTotal: Math.round(item.finalPriceSnapshot * item.quantity * 100) / 100
        }));

        const totalSavings = cartItems.reduce((sum, i) => sum + i.totalSavings, 0);

        res.json({
            sessionId,
            status: session.status,
            items: cartItems,
            totalAmount: session.totalAmount,
            totalSavings: Math.round(totalSavings * 100) / 100
        });
    } catch (error) {
        console.error('Get Cart Error:', error);
        next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const { sessionId, productId } = req.body;

        const session = await Session.findByPk(sessionId);
        if (!session || session.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Invalid or inactive session' });
        }

        const deleted = await CartItem.destroy({
            where: { sessionId, productId }
        });

        if (!deleted) return res.status(404).json({ error: 'Item not found in cart' });

        await calculateTotal(sessionId);
        const updatedSession = await Session.findByPk(sessionId);

        res.json({ message: 'Item removed', totalAmount: updatedSession.totalAmount });
    } catch (error) {
        console.error('Remove from Cart Error:', error);
        next(error);
    }
};

exports.updateQuantity = async (req, res, next) => {
    try {
        const { sessionId, productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1. Use remove endpoint to delete item.' });
        }

        const session = await Session.findByPk(sessionId);
        if (!session || session.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Invalid or inactive session' });
        }

        const item = await CartItem.findOne({ where: { sessionId, productId } });
        if (!item) return res.status(404).json({ error: 'Item not found in cart' });

        item.quantity = quantity;
        await item.save();

        await calculateTotal(sessionId);
        const updatedSession = await Session.findByPk(sessionId);

        res.json({ message: 'Quantity updated', totalAmount: updatedSession.totalAmount });
    } catch (error) {
        console.error('Update Quantity Error:', error);
        next(error);
    }
};
