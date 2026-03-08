const request = require('supertest');
const app = require('../../src/app');
const { createTestStore, createTestUser, createTestProduct } = require('../helpers');

describe('Multi-Tenancy Isolation', () => {
    let storeA, storeB, userA, userB;

    beforeEach(async () => {
        storeA = await createTestStore();
        storeB = await createTestStore();
        userA = await createTestUser();
        userB = await createTestUser();
    });

    test('sessions are isolated per store', async () => {
        const sessionA = await request(app)
            .post('/api/cart/start')
            .send({ userId: userA.id, storeId: storeA.id });

        const sessionB = await request(app)
            .post('/api/cart/start')
            .send({ userId: userB.id, storeId: storeB.id });

        expect(sessionA.body.storeId).toBe(storeA.id);
        expect(sessionB.body.storeId).toBe(storeB.id);
        expect(sessionA.body.id).not.toBe(sessionB.body.id);
    });

    test('product scan in store A does not find store B product', async () => {
        await createTestProduct(storeB.id, { barcode: 'ONLY-IN-B' });

        // Start session in store A
        const sessionRes = await request(app)
            .post('/api/cart/start')
            .send({ userId: userA.id, storeId: storeA.id });

        // Try to add store B's product in store A session
        const res = await request(app)
            .post('/api/cart/add')
            .send({ sessionId: sessionRes.body.id, barcode: 'ONLY-IN-B', quantity: 1 });

        expect(res.status).toBe(404); // Product not found in this store
    });

    test('locking store B does not affect store A', async () => {
        await storeB.update({ isLocked: true });

        // Store A should still work
        const res = await request(app)
            .post('/api/cart/start')
            .send({ userId: userA.id, storeId: storeA.id });

        expect(res.status).toBe(200);
    });

    test('adding store B does not affect store A inventory', async () => {
        // Add 5 products to store A
        for (let i = 0; i < 5; i++) {
            await createTestProduct(storeA.id, { barcode: `STOREA-${i}` });
        }

        // Register store B with its own products
        for (let i = 0; i < 3; i++) {
            await createTestProduct(storeB.id, { barcode: `STOREB-${i}` });
        }

        // Store A should still have exactly 5 products
        const { Product } = require('../../src/models');
        const storeAProducts = await Product.findAll({ where: { storeId: storeA.id } });
        expect(storeAProducts.length).toBe(5);
    });
});
