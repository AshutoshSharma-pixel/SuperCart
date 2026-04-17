const { User, Store } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

        const { passwordHash, otpCode, otpExpiresAt, razorpayKeySecret, ...safeStore } = store.toJSON();
        res.json({ token, store: safeStore });

    } catch (error) {
        console.error('Store login error:', error);
        next(error);
    }
};

exports.storeRegister = async (req, res, next) => {
    try {
        const {
            name, location, password,
            ownerName, ownerPhone, ownerEmail, shopAddress
        } = req.body;

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
            ownerName,
            ownerPhone,
            ownerEmail,
            shopAddress,
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

exports.storeForgotPassword = async (req, res, next) => {
    try {
        const { shopId, email } = req.body;
        
        // Security: Generic success message regardless of outcome
        const genericSuccess = { success: true, message: 'If this Shop ID and email match our records, an OTP has been sent.' };

        if (!shopId || !email) {
            return res.json(genericSuccess);
        }

        const store = await Store.findOne({ where: { shopId } });
        if (!store || store.ownerEmail !== email) {
            return res.json(genericSuccess);
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await store.update({
            otpCode: otp,
            otpExpiresAt: expiresAt
        });

        if (resend) {
            try {
                await resend.emails.send({
                    from: 'SuperCart <onboarding@resend.dev>',
                    to: [email],
                    subject: 'SuperCart: Password Reset OTP',
                    html: `
                        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #2563eb;">Reset Your Store Password</h2>
                            <p>You requested a password reset for your SuperCart store.</p>
                            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <span style="font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #1f2937;">${otp}</span>
                            </div>
                            <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #9ca3af;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send reset email:', emailError);
                // We still return success to the user as per best practice
            }
        } else {
            console.warn('RESEND_API_KEY NOT CONFIGURED - OTP generated but not sent:', otp);
        }

        res.json(genericSuccess);

    } catch (error) {
        console.error('Store forgot password error:', error);
        next(error);
    }
};

exports.storeResetPassword = async (req, res, next) => {
    try {
        const { shopId, otp, newPassword } = req.body;

        if (!shopId || !otp || !newPassword) {
            return res.status(400).json({ error: 'Shop ID, OTP, and new password are required' });
        }

        const store = await Store.findOne({ where: { shopId } });
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Verify OTP and Expiry
        if (!store.otpCode || store.otpCode !== otp.toString()) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (new Date() > new Date(store.otpExpiresAt)) {
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // Update password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await store.update({
            passwordHash,
            otpCode: null,
            otpExpiresAt: null
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Store reset password error:', error);
        next(error);
    }
};
