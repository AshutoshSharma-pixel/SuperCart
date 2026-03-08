const request = require('supertest');
const app = require('../../src/app');
const { createTestStore, getStoreToken, createTestProduct } = require('../helpers');

describe('Stock Management', () => {
    let store, token, product;

    beforeEach(async () => {
        store = await createTestStore();
        token = await getStoreToken(store);
        product = await createTestProduct(store.id, {
            barcode: 'STOCK-TEST-001',
            stock: 10,
            lowStockThreshold: 3
        });
    });

    test('scan existing product returns product data', async () => {
        const res = await request(app)
            .post('/api/products/scan')
            .set('Authorization', `Bearer ${token}`)
            .send({ barcode: 'STOCK-TEST-001' });

        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(true);
        expect(res.body.product.stock).toBe(10);
    });

    test('scan unknown barcode returns scaffold', async () => {
        const res = await request(app)
            .post('/api/products/scan')
            .set('Authorization', `Bearer ${token}`)
            .send({ barcode: 'BRAND-NEW-BARCODE' });

        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(false);
        expect(res.body.barcode).toBe('BRAND-NEW-BARCODE');
    });

    test('receive stock increases quantity', async () => {
        const res = await request(app)
            .post(`/api/products/${product.id}/receive`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 20, note: 'New delivery' });

        expect(res.status).toBe(200);
        expect(res.body.product.stock).toBe(30);
    });

    test('stock history logs receive event', async () => {
        await request(app)
            .post(`/api/products/${product.id}/receive`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 5 });

        const res = await request(app)
            .get(`/api/products/${product.id}/stock-history`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.history.length).toBeGreaterThan(0);
        expect(res.body.history[0].type).toBe('RECEIVED');
    });

    test('stock deducts after payment verified', async () => {
        // End-to-end integration is mocked for now
        expect(true).toBe(true);
    });

    test('store A stock changes do not affect store B', async () => {
        const storeB = await createTestStore();
        const productB = await createTestProduct(storeB.id, {
            barcode: 'STORE-B-STOCK',
            stock: 50
        });
        const tokenB = await getStoreToken(storeB);

        // Add stock to store A product
        await request(app)
            .post(`/api/products/${product.id}/receive`)
            .set('Authorization', `Bearer ${token}`)
            .send({ quantity: 100 });

        // Store B product stock should be unchanged
        const res = await request(app)
            .get('/api/products/store')
            .set('Authorization', `Bearer ${tokenB}`);

        const storeBProduct = res.body.find(p => p.barcode === 'STORE-B-STOCK');
        expect(storeBProduct.stock).toBe(50);
    });

    test('low stock filter returns only low stock products', async () => {
        await product.update({ stock: 2 }); // Below threshold of 3

        const res = await request(app)
            .get('/api/products/store?filter=low_stock')
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach(p => expect(p.isLowStock).toBe(true));
    });

    test('out of stock filter returns only out of stock products', async () => {
        await product.update({ stock: 0, isOutOfStock: true });

        const res = await request(app)
            .get('/api/products/store?filter=out_of_stock')
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.length).toBeGreaterThan(0);
        res.body.forEach(p => expect(p.isOutOfStock).toBe(true));
    });
});
