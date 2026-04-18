const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(e => ({ field: e.path, message: e.msg }));
        console.error('Validation Error for', req.method, req.url, ':', errorDetails);
        return res.status(400).json({
            error: 'Validation failed',
            details: errorDetails
        });
    }
    next();
};

// Auth validators
const validateCustomerLogin = [
    body('phone')
        .trim()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Invalid Indian phone number'),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be 6 digits'),
    validate
];

const validateStoreLogin = [
    body('shopId')
        .trim()
        .matches(/^SCRT-[A-Z0-9]{6}$/)
        .withMessage('Invalid Shop ID format'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password too short'),
    validate
];

const validateStoreRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Store name must be 2-100 characters'),
    body('location')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Location must be 5-200 characters'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and a number'),
    body('ownerName').optional().trim().isLength({ max: 100 }),
    body('ownerPhone').optional().trim().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
    body('ownerEmail').optional().trim().isEmail().withMessage('Invalid email'),
    body('shopAddress').optional().trim().isLength({ max: 500 }),
    validate
];

// Cart validators
const validateStartSession = [
    body('userId').notEmpty().withMessage('userId is required'),
    body('storeId').isInt({ min: 1 }).withMessage('Invalid storeId'),
    validate
];

const validateAddToCart = [
    body('sessionId').isInt({ min: 1 }).withMessage('Invalid sessionId'),
    body('barcode').trim().isLength({ min: 1, max: 50 }).withMessage('Invalid barcode'),
    body('quantity').optional().isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
    validate
];

const validateRemoveFromCart = [
    body('sessionId').isInt({ min: 1 }).withMessage('Invalid sessionId'),
    body('productId').isInt({ min: 1 }).withMessage('Invalid productId'),
    validate
];

const validateUpdateQuantity = [
    body('sessionId').isInt({ min: 1 }).withMessage('Invalid sessionId'),
    body('productId').isInt({ min: 1 }).withMessage('Invalid productId'),
    body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
    validate
];

// Product validators
const validateAddProduct = [
    body('barcode').trim().isLength({ min: 1, max: 50 }).withMessage('Invalid barcode'),
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Product name required'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be 0 or more'),
    body('lowStockThreshold').optional().isInt({ min: 1 }).withMessage('Threshold must be at least 1'),
    body('discountType').optional().isIn(['PERCENTAGE', 'FLAT']).withMessage('Invalid discount type'),
    body('discountValue').optional().isFloat({ min: 0.01 }).withMessage('Invalid discount value'),
    body('discountExpiresAt').optional().isISO8601().withMessage('Invalid expiry date format'),
    validate
];

const validateUpdateProduct = [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('name').optional().trim().isLength({ min: 1, max: 200 }),
    body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('discountType').optional().isIn(['PERCENTAGE', 'FLAT']).withMessage('Invalid discount type'),
    body('discountValue').optional().isFloat({ min: 0.01 }).withMessage('Invalid discount value'),
    body('discountExpiresAt').optional().isISO8601().withMessage('Invalid expiry date format'),
    validate
];

const validateScanProduct = [
    body('barcode').trim().isLength({ min: 1, max: 50 }).withMessage('Barcode required'),
    validate
];

const validateReceiveStock = [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('note').optional().trim().isLength({ max: 200 }),
    validate
];

const validateAdjustStock = [
    param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
    body('quantity')
        .isInt()
        .not().equals('0')
        .withMessage('Quantity required and cannot be 0'),
    body('note').optional().trim().isLength({ max: 200 }),
    validate
];

// Payment validators
const validateCreateOrder = [
    body('sessionId').isInt({ min: 1 }).withMessage('Invalid sessionId'),
    validate
];

const validateVerifyPayment = [
    body('sessionId').isInt({ min: 1 }).withMessage('Invalid sessionId'),
    body('razorpay_order_id').trim().notEmpty().withMessage('Missing order ID'),
    body('razorpay_payment_id').trim().notEmpty().withMessage('Missing payment ID'),
    body('razorpay_signature').trim().notEmpty().withMessage('Missing signature'),
    validate
];

// Subscription validators
const validateSubscriptionOrder = [
    body('planTier')
        .isIn(['STARTER', 'GROWTH', 'ENTERPRISE'])
        .withMessage('Invalid plan tier'),
    validate
];

// Verification validators
const validateVerifyExit = [
    body('token').trim().notEmpty().withMessage('Exit token required'),
    validate
];

const validateMarkMismatch = [
    body('sessionId').isInt({ min: 1 }).withMessage('Invalid sessionId'),
    body('reason').optional().trim().isLength({ max: 500 }),
    validate
];

module.exports = {
    validateCustomerLogin,
    validateStoreLogin,
    validateStoreRegister,
    validateStartSession,
    validateAddToCart,
    validateRemoveFromCart,
    validateUpdateQuantity,
    validateAddProduct,
    validateUpdateProduct,
    validateScanProduct,
    validateReceiveStock,
    validateAdjustStock,
    validateCreateOrder,
    validateVerifyPayment,
    validateSubscriptionOrder,
    validateVerifyExit,
    validateMarkMismatch
};
