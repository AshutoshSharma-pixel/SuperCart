const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Guard, Store, Session, CartItem, Product } = require('../models');

// POST /api/guards/login
exports.guardLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const guard = await Guard.findOne({
            where: { email },
            include: [{ model: Store, attributes: ['id', 'name', 'location'] }]
        });

        if (!guard) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, guard.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!guard.isActive) {
            return res.status(403).json({ error: 'Account deactivated' });
        }

        // Update last login
        guard.lastLoginAt = new Date();
        await guard.save();

        const token = jwt.sign(
            { guardId: guard.id, storeId: guard.storeId, role: 'guard' },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            token,
            guard: {
                id: guard.id,
                name: guard.name,
                email: guard.email,
                storeId: guard.storeId,
                shiftScans: guard.shiftScans,
                store: guard.store ? { name: guard.store.name, location: guard.store.location } : null
            }
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/guards/verify-exit
exports.verifyExit = async (req, res, next) => {
    try {
        const { exitToken } = req.body;
        if (!exitToken) {
            return res.status(400).json({ verified: false, reason: 'No exit token provided' });
        }

        // Decode the exit token (it's a JWT signed with the same secret)
        let decoded;
        try {
            decoded = jwt.verify(exitToken, process.env.JWT_SECRET);
        } catch (e) {
            return res.json({ verified: false, reason: 'Invalid or expired exit token' });
        }

        const { sessionId } = decoded;
        const session = await Session.findByPk(sessionId, {
            include: [
                { model: Store, attributes: ['name', 'location'] }
            ]
        });

        if (!session) {
            return res.json({ verified: false, reason: 'Session not found' });
        }

        if (session.status !== 'PAID') {
            return res.json({ verified: false, reason: 'Payment not completed' });
        }

        // Fetch cart items with product details
        const cartItems = await CartItem.findAll({
            where: { sessionId: session.id },
            include: [{ model: Product, attributes: ['name', 'price'] }]
        });

        const items = cartItems.map(ci => ({
            name: ci.product?.name || 'Unknown',
            quantity: ci.quantity,
            lineTotal: ci.finalPriceSnapshot * ci.quantity
        }));

        const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

        // Increment guard's shift scans
        const guard = await Guard.findByPk(req.guardId);
        if (guard) {
            guard.shiftScans += 1;
            await guard.save();
        }

        // Mark session as USED
        session.status = 'USED';
        await session.save();

        res.json({
            verified: true,
            session: {
                id: session.id,
                totalAmount: session.totalAmount,
                exitToken: session.exitToken
            },
            items,
            totalItems,
            store: session.store ? { name: session.store.name } : null
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/guards/profile
exports.getGuardProfile = async (req, res, next) => {
    try {
        const guard = await Guard.findByPk(req.guardId, {
            attributes: { exclude: ['passwordHash'] },
            include: [{ model: Store, attributes: ['name', 'location'] }]
        });
        if (!guard) return res.status(404).json({ error: 'Guard not found' });
        res.json({ guard });
    } catch (error) {
        next(error);
    }
};

// POST /api/guards/create (store owner creates guard)
exports.createGuard = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existing = await Guard.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'A guard with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const guard = await Guard.create({
            name,
            email,
            passwordHash,
            storeId: req.storeId
        });

        res.status(201).json({
            success: true,
            guard: { id: guard.id, name: guard.name, email: guard.email }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/guards (store owner lists guards)
exports.listGuards = async (req, res, next) => {
    try {
        const guards = await Guard.findAll({
            where: { storeId: req.storeId },
            attributes: { exclude: ['passwordHash'] },
            order: [['createdAt', 'DESC']]
        });
        res.json({ guards });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/guards/:id
exports.deleteGuard = async (req, res, next) => {
    try {
        const guard = await Guard.findByPk(req.params.id);
        if (!guard) return res.status(404).json({ error: 'Guard not found' });
        if (guard.storeId !== req.storeId) {
            return res.status(403).json({ error: 'Not authorized to delete this guard' });
        }
        await guard.destroy();
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
