const { addStock, deductStock, adjustStock, isLowStock } = require('../../src/utils/stock');
const { createTestStore, createTestProduct } = require('../helpers');

describe('Stock Utils', () => {
    let store, product;

    beforeEach(async () => {
        store = await createTestStore();
        product = await createTestProduct(store.id, { stock: 10, lowStockThreshold: 5 });
    });

    test('addStock increases stock correctly', async () => {
        const updated = await addStock(product.id, store.id, 5);
        expect(updated.stock).toBe(15);
        expect(updated.isOutOfStock).toBe(false);
    });

    test('addStock clears out of stock flag', async () => {
        await product.update({ stock: 0, isOutOfStock: true });
        const updated = await addStock(product.id, store.id, 10);
        expect(updated.isOutOfStock).toBe(false);
    });

    test('deductStock decreases stock correctly', async () => {
        const updated = await deductStock(product.id, store.id, 3, 1);
        expect(updated.stock).toBe(7);
    });

    test('deductStock flags out of stock when hits 0', async () => {
        const updated = await deductStock(product.id, store.id, 10, 1);
        expect(updated.stock).toBe(0);
        expect(updated.isOutOfStock).toBe(true);
    });

    test('stock never goes below 0', async () => {
        const updated = await deductStock(product.id, store.id, 999, 1);
        expect(updated.stock).toBe(0);
    });

    test('adjustStock works with positive quantity', async () => {
        const updated = await adjustStock(product.id, store.id, 5, 'Found extra');
        expect(updated.stock).toBe(15);
    });

    test('adjustStock works with negative quantity', async () => {
        const updated = await adjustStock(product.id, store.id, -3, 'Damaged goods');
        expect(updated.stock).toBe(7);
    });

    test('isLowStock returns true when at threshold', async () => {
        await product.update({ stock: 5, lowStockThreshold: 5 });
        expect(isLowStock(product)).toBe(true);
    });

    test('isLowStock returns false when above threshold', async () => {
        await product.update({ stock: 10, lowStockThreshold: 5 });
        expect(isLowStock(product)).toBe(false);
    });

    test('isLowStock returns false when out of stock', async () => {
        await product.update({ stock: 0, isOutOfStock: true });
        expect(isLowStock(product)).toBe(false);
    });
});
