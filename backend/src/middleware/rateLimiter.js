const rateLimit = require('express-rate-limit');

const skipInTest = () => process.env.NODE_ENV === 'test';

// Strict limiter for auth endpoints (OTP, login, register)
const authLimiter = rateLimit({
    skip: skipInTest,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // max 10 attempts per IP per 15 mins
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Limiter for payment endpoints
const paymentLimiter = rateLimit({
    skip: skipInTest,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,                   // max 30 payment attempts per IP per hour
    message: { error: 'Too many payment requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// General API limiter
const generalLimiter = rateLimit({
    skip: skipInTest,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // max 200 requests per IP per 15 mins
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { authLimiter, paymentLimiter, generalLimiter };
