const request = require('supertest');
const app = require('../../src/app');
const { createTestStore, createTestUser, createTestProduct } = require('../helpers');

describe('Cart Flow', () => {
    let store, user, product, sessionId;

    beforeEach(async () => {
        store = await createTestStore();
        user = await createTestUser();
        product = await createTestProduct(store.id, { price: 100, barcode: 'CART-TEST-001' });
    });

    test('starts a session', async () => {
        const res = await request(app)
            .post('/api/cart/start')
            .send({ userId: user.id, storeId: store.id });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ACTIVE');
        sessionId = res.body.id;
    });

    test('adds item to cart', async () => {
        const startRes = await request(app)
            .post('/api/cart/start')
            .send({ userId: user.id, storeId: store.id });
        sessionId = startRes.body.id;

        const res = await request(app)
            .post('/api/cart/add')
            .send({ sessionId, barcode: product.barcode, quantity: 2 });
        expect(res.status).toBe(200);
    });

    test('cart total reflects discounted price', async () => {
        const discountedProduct = await createTestProduct(store.id, {
            price: 100,
            barcode: 'DISC-TEST-001',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            isDiscountActive: true
        });

        const startRes = await request(app)
            .post('/api/cart/start')
            .send({ userId: user.id, storeId: store.id });
        sessionId = startRes.body.id;

        await request(app)
            .post('/api/cart/add')
            .send({ sessionId, barcode: discountedProduct.barcode, quantity: 1 });

        const cartRes = await request(app).get(`/api/cart/${sessionId}`);
        console.log('CART RES BODY TOTAL AMOUNT:', cartRes.body);
        expect(cartRes.body.totalAmount).toBe(90); // 10% off ₹100
        expect(cartRes.body.items[0].discountApplied).toBe(true);
        expect(cartRes.body.items[0].originalPrice).toBe(100);
        expect(cartRes.body.items[0].finalPrice).toBe(90);
    });

    test('removes item from cart', async () => {
        const startRes = await request(app)
            .post('/api/cart/start')
            .send({ userId: user.id, storeId: store.id });
        sessionId = startRes.body.id;

        await request(app).post('/api/cart/add').send({ sessionId, barcode: product.barcode, quantity: 1 });

        const res = await request(app)
            .post('/api/cart/remove')
            .send({ sessionId, productId: product.id });
        expect(res.status).toBe(200);

        const cartRes = await request(app).get(`/api/cart/${sessionId}`);
        console.log('CART REMOVE RES BODY:', cartRes.body);
        expect(cartRes.body.items.length).toBe(0);
        expect(cartRes.body.totalAmount).toBe(0);
    });

    test('blocked if store is locked', async () => {
        await store.update({ isLocked: true });
        const res = await request(app)
            .post('/api/cart/start')
            .send({ userId: user.id, storeId: store.id });
        expect(res.status).toBe(403);
    });
});
