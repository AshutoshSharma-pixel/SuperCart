require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    console.log('[BODY]', JSON.stringify(req.body));
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'SuperCart Backend requires Authentication' });
});

// Database Connection
db.authenticate()
    .then(() => {
        console.log('Database connected...');
        // NOTE: db.sync() removed to prevent data loss on restart
        // Run seed.js manually to populate database
        app.listen(PORT, console.log(`Server started on port ${PORT}`));
    })
    .catch(err => console.log('Error: ' + err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/stores', require('./routes/store.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/verification', require('./routes/verification.routes'));
app.use('/api/bill', require('./routes/bill.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
