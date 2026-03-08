require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('./jobs/subscriptionCron'); // Start cron jobs

const app = express();
app.set('trust proxy', 1); // Respect X-Forwarded-For headers for rate limiting tests

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
}

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:5173', 'http://localhost:3000'];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
        }
    },
    crossOriginEmbedderPolicy: false // needed for PDF downloads
}));

app.use(morgan('dev'));
app.use(express.json());

const { authLimiter, paymentLimiter, generalLimiter } = require('./middleware/rateLimiter');
app.use(generalLimiter);

// Debug Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[REQ] ${req.method} ${req.url}`);
        console.log('[BODY]', JSON.stringify(req.body));
        next();
    });
}

app.get('/', (req, res) => {
    res.json({ message: 'SuperCart Backend requires Authentication' });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/stores', require('./routes/store.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/payment', paymentLimiter, require('./routes/payment.routes'));
app.use('/api/verification', require('./routes/verification.routes'));
app.use('/api/bill', require('./routes/bill.routes'));

app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/subscription', paymentLimiter, require('./routes/subscription.routes'));

app.use(require('./middleware/errorHandler'));

module.exports = app;
