const { Session, Product, CartItem, Store, User } = require('../models');


// Add Item to Cart
exports.addToCart = async (req, res) => {
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

        if (existingItem) {
            existingItem.quantity += qty; // Use qty
            // Update snapshot to latest price if needed, or keep original.
            // For security, we might want to keep the original,
            // OR update it to current price since they are buying more.
            // Let's update it to current price to be consistent.
            existingItem.priceSnapshot = product.price;
            await existingItem.save();
            console.log(`Updated CartItem ${existingItem.id}: quantity=${existingItem.quantity}, priceSnapshot=${existingItem.priceSnapshot}`);
        } else {
            await CartItem.create({
                sessionId,
                productId: product.id,
                quantity: qty, // Use qty
                priceSnapshot: product.price
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
        res.status(500).json({ error: 'Server error' });
    }
};

// Create New Session (Entry)
exports.startSession = async (req, res) => {
    try {
        console.log('Start Session Request Body:', req.body);
        let { userId, storeId } = req.body;

        if (!userId || !storeId) {
            return res.status(400).json({ error: 'Missing userId or storeId' });
        }

        // MVP Hack: Ensure User Exists
        // If ID 1 is sent but doesn't exist, fetch the seeded user
        // Using User model directly now
        let userExists = await User.findByPk(userId);
        if (!userExists) {
            console.log(`User ${userId} not found, looking for any user...`);
            const firstUser = await User.findOne();
            if (firstUser) {
                console.log(`Falling back to User ID: ${firstUser.id}`);
                userId = firstUser.id;
            } else {
                console.log('No users found! Creating default user...');
                const newUser = await User.create({
                    phone: '9999999999',
                    trustScore: 100
                });
                userId = newUser.id;
            }
        }

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
        const existingSession = await Session.findOne({
            where: { userId, storeId, status: 'ACTIVE' }
        });

        if (existingSession) {
            return res.json(existingSession);
        }

        const session = await Session.create({
            userId,
            storeId,
            status: 'ACTIVE'
        });

        res.json(session);
    } catch (error) {
        console.error('Start Session Error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

// Helper: Recalculate Total
async function calculateTotal(sessionId) {
    const session = await Session.findByPk(sessionId, {
        include: [{ model: Product, through: { attributes: ['quantity'] } }]
    });

    let total = 0;
    if (session.products) {
        session.products.forEach(p => {
            total += p.price * p.cart_item.quantity;
        });
    }

    session.totalAmount = total;
    await session.save();
}
