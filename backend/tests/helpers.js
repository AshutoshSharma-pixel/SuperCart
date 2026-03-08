const request = require('supertest');
const app = require('../src/app');
const { Store, User, Product, Session } = require('../src/models');
const bcrypt = require('bcrypt');

// Create a test store with active subscription
async function createTestStore(overrides = {}) {
    return await Store.create({
        name: 'Test Store',
        location: 'Test Location',
        shopId: `SCRT-${Math.random().toString(36).substr(2, 6).toUpperCase().padStart(6, '0')}`,
        passwordHash: await bcrypt.hash('TestPass123', 10),
        planTier: 'Starter',
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        gracePeriodEndsAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        isLocked: false,
        ...overrides
    });
}

// Get store owner JWT
async function getStoreToken(store) {
    const res = await request(app)
        .post('/api/auth/store-login')
        .send({ shopId: store.shopId, password: 'TestPass123' });
    return res.body.token;
}

// Create test customer
async function createTestUser() {
    return await User.create({ phone: `9${Math.floor(Math.random() * 900000000 + 100000000)}`, trustScore: 100 });
}

// Create test product
async function createTestProduct(storeId, overrides = {}) {
    return await Product.create({
        barcode: `TEST${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        name: 'Test Product',
        price: 100.00,
        storeId,
        ...overrides
    });
}

module.exports = { createTestStore, getStoreToken, createTestUser, createTestProduct };
