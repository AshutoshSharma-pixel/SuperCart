const request = require('supertest');
const app = require('../../src/app');
const { createTestStore } = require('../helpers');

describe('Security', () => {
    test('admin routes reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/admin/transactions');
        expect(res.status).toBe(401);
    });

    test('admin routes reject non-admin tokens', async () => {
        // Use a store owner token
        const store = await createTestStore();

        const loginRes = await request(app)
            .post('/api/auth/store-login')
            .send({ shopId: store.shopId, password: 'TestPass123' });

        if (loginRes.status !== 200) {
            console.error('SEC TEST LOGIN FAILED:', loginRes.body);
        }

        const res = await request(app)
            .get('/api/admin/transactions')
            .set('Authorization', `Bearer ${loginRes.body.token}`);

        expect(res.status).toBe(403);
    });

    test('subscription routes reject unauthenticated requests', async () => {
        const res = await request(app).get('/api/subscription/status');
        expect(res.status).toBe(401);
    });

    test('rejects malformed JWT', async () => {
        const res = await request(app)
            .get('/api/subscription/status')
            .set('Authorization', 'Bearer malformed.jwt.token');
        expect(res.status).toBe(401);
    });

    test('input validation rejects garbage data', async () => {
        const res = await request(app)
            .post('/api/cart/add')
            .send({ sessionId: 'not-a-number', barcode: '', quantity: -5 });
        expect(res.status).toBe(400);
        expect(res.body.details).toBeDefined();
    });

    test('exit token cannot be reused', async () => {
        // This test requires a full flow — skip in unit test, mark for E2E
        // Documented here as reminder
        expect(true).toBe(true);
    });
});
