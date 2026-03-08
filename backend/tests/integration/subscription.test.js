const request = require('supertest');
const app = require('../../src/app');
const { createTestStore, getStoreToken } = require('../helpers');

describe('Subscription Status', () => {
    test('returns ACTIVE for store with valid plan', async () => {
        const store = await createTestStore();
        const token = await getStoreToken(store);

        const res = await request(app)
            .get('/api/subscription/status')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ACTIVE');
        expect(res.body.daysRemaining).toBeGreaterThan(0);
    });

    test('returns LOCKED for locked store', async () => {
        const store = await createTestStore({
            planExpiresAt: new Date(Date.now() - 5 * 86400000),
            gracePeriodEndsAt: new Date(Date.now() - 3 * 86400000)
        });
        const token = await getStoreToken(store);
        await store.update({ isLocked: true });

        const res = await request(app)
            .get('/api/subscription/status')
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.status).toBe('LOCKED');
    });

    test('returns NO_PLAN for newly registered store', async () => {
        const store = await createTestStore({
            planTier: null,
            planExpiresAt: null,
            gracePeriodEndsAt: null
        });
        const token = await getStoreToken(store);
        await store.update({ isLocked: true });

        const res = await request(app)
            .get('/api/subscription/status')
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.status).toBe('NO_PLAN');
    });
});
