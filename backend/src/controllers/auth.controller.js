const { User, Store } = require('../models');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
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
        next(error);
    }
};

exports.storeLogin = async (req, res, next) => {
    try {
        const { shopId, password } = req.body;
        const bcrypt = require('bcrypt'); // Added inline for simplicity, could be at the top

        if (!shopId || !password) {
            return res.status(400).json({ error: 'Shop ID and password required' });
        }

        const store = await Store.findOne({ where: { shopId } });
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Check if the store is locked
        if (store.isLocked) {
            return res.status(403).json({ error: 'Store account is locked due to expired subscription.' });
        }

        if (!store.passwordHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, store.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { storeId: store.id, shopId: store.shopId, role: 'store_owner' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, store });

    } catch (error) {
        console.error('Store login error:', error);
        next(error);
    }
};

exports.storeRegister = async (req, res, next) => {
    try {
        const { name, location, password } = req.body;
        const bcrypt = require('bcrypt');

        if (!name || !password) {
            return res.status(400).json({ error: 'Name and password required' });
        }

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let shopId = '';
        let isUnique = false;

        while (!isUnique) {
            let id = 'SCRT-';
            for (let i = 0; i < 6; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existing = await Store.findOne({ where: { shopId: id } });
            if (!existing) {
                shopId = id;
                isUnique = true;
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const store = await Store.create({
            name,
            location,
            shopId,
            passwordHash,
            isLocked: true // inactive until plan is purchased
        });

        // Don't send password hash back
        const { passwordHash: _, ...storeData } = store.toJSON();

        res.json({ shopId, store: storeData });

    } catch (error) {
        console.error('Store register error:', error);
        next(error);
    }
};

exports.adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
            return res.json({ token });
        }
        return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Admin login error:', error);
        next(error);
    }
};
