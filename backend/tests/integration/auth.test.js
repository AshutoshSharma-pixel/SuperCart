const request = require('supertest');
const app = require('../../src/app');
const { createTestStore } = require('../helpers');

describe('POST /api/auth/store-login', () => {
    let store;

    beforeEach(async () => {
        store = await createTestStore();
    });

    test('returns token with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/store-login')
            .send({ shopId: store.shopId, password: 'TestPass123' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('rejects wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/store-login')
            .send({ shopId: store.shopId, password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    test('rejects locked store', async () => {
        await store.update({ isLocked: true });
        const res = await request(app)
            .post('/api/auth/store-login')
            .send({ shopId: store.shopId, password: 'TestPass123' });
        expect(res.status).toBe(403);
    });

    test('rejects invalid shopId format', async () => {
        const res = await request(app)
            .post('/api/auth/store-login')
            .send({ shopId: 'INVALID', password: 'TestPass123' });
        expect(res.status).toBe(400);
    });

    // test('rate limits after 10 attempts', async () => {
    //    for (let i = 0; i < 10; i++) {
    //        await request(app).post('/api/auth/store-login').set('X-Forwarded-For', '123.45.67.89').send({ shopId: store.shopId, password: 'wrong' });
    //    }
    //    const res = await request(app)
    //        .post('/api/auth/store-login')
    //        .set('X-Forwarded-For', '123.45.67.89')
    //        .send({ shopId: store.shopId, password: 'TestPass123' });
    //    expect(res.status).toBe(429);
    // });
});

describe('POST /api/auth/store-register', () => {
    test('creates store and returns shopId', async () => {
        const res = await request(app)
            .post('/api/auth/store-register')
            .send({ name: 'New Store', location: 'Mumbai, India', password: 'NewPass123' });
        expect(res.status).toBe(200);
        expect(res.body.shopId).toMatch(/^SCRT-[A-Z0-9]{6}$/);
        expect(res.body.passwordHash).toBeUndefined(); // Never return hash
    });

    test('rejects weak password', async () => {
        const res = await request(app)
            .post('/api/auth/store-register')
            .send({ name: 'New Store', location: 'Mumbai, India', password: 'weak' });
        expect(res.status).toBe(400);
    });
});
