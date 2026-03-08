const request = require('supertest');
const app = require('../../src/app');
const { createTestStore, getStoreToken, createTestProduct } = require('../helpers');

describe('Inventory Management', () => {
    let storeA, storeB, tokenA, tokenB;

    beforeEach(async () => {
        storeA = await createTestStore();
        storeB = await createTestStore();
        tokenA = await getStoreToken(storeA);
        tokenB = await getStoreToken(storeB);
    });

    test('store owner can add a product', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ barcode: 'INV-001', name: 'Test Item', price: 50 });
        expect(res.status).toBe(200);
        expect(res.body.storeId).toBe(storeA.id);
    });

    test('store A cannot see store B products', async () => {
        await createTestProduct(storeB.id, { barcode: 'STORE-B-001' });

        const res = await request(app)
            .get('/api/products/store')
            .set('Authorization', `Bearer ${tokenA}`);

        const barcodes = res.body.map(p => p.barcode);
        expect(barcodes).not.toContain('STORE-B-001');
    });

    test('store A cannot update store B product', async () => {
        const productB = await createTestProduct(storeB.id, { barcode: 'STORE-B-002' });

        const res = await request(app)
            .put(`/api/products/${productB.id}`)
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'Hacked Name' });

        expect(res.status).toBe(404); // Not found in store A
    });

    test('store A cannot delete store B product', async () => {
        const productB = await createTestProduct(storeB.id, { barcode: 'STORE-B-003' });

        const res = await request(app)
            .delete(`/api/products/${productB.id}`)
            .set('Authorization', `Bearer ${tokenA}`);

        expect(res.status).toBe(404);
    });

    test('same barcode allowed in two different stores', async () => {
        await createTestProduct(storeA.id, { barcode: 'SHARED-BARCODE' });

        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${tokenB}`)
            .send({ barcode: 'SHARED-BARCODE', name: 'Same Product', price: 40 });

        expect(res.status).toBe(200); // Should succeed — composite unique
    });

    test('cannot add duplicate barcode in same store', async () => {
        await createTestProduct(storeA.id, { barcode: 'DUPE-BARCODE' });

        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ barcode: 'DUPE-BARCODE', name: 'Duplicate', price: 40 });

        expect(res.status).toBe(400);
    });
});
