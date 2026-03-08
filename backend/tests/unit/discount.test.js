const { calculateDiscountedPrice } = require('../../src/utils/discount');

describe('calculateDiscountedPrice', () => {
    const baseProduct = {
        price: 100,
        isDiscountActive: true,
        discountExpiresAt: null
    };

    test('returns original price when no discount active', () => {
        const product = { ...baseProduct, isDiscountActive: false, discountType: 'PERCENTAGE', discountValue: 10 };
        const result = calculateDiscountedPrice(product);
        expect(result.finalPrice).toBe(100);
        expect(result.discountApplied).toBe(false);
        expect(result.savings).toBe(0);
    });

    test('applies percentage discount correctly', () => {
        const product = { ...baseProduct, discountType: 'PERCENTAGE', discountValue: 10 };
        const result = calculateDiscountedPrice(product);
        expect(result.finalPrice).toBe(90);
        expect(result.savings).toBe(10);
        expect(result.discountApplied).toBe(true);
    });

    test('applies flat discount correctly', () => {
        const product = { ...baseProduct, discountType: 'FLAT', discountValue: 25 };
        const result = calculateDiscountedPrice(product);
        expect(result.finalPrice).toBe(75);
        expect(result.savings).toBe(25);
    });

    test('price never goes below 0', () => {
        const product = { ...baseProduct, discountType: 'FLAT', discountValue: 200 };
        const result = calculateDiscountedPrice(product);
        expect(result.finalPrice).toBe(0);
    });

    test('expired discount is not applied', () => {
        const product = {
            ...baseProduct,
            discountType: 'PERCENTAGE',
            discountValue: 20,
            discountExpiresAt: new Date(Date.now() - 1000) // 1 second ago
        };
        const result = calculateDiscountedPrice(product);
        expect(result.discountApplied).toBe(false);
        expect(result.finalPrice).toBe(100);
    });

    test('future expiry discount is applied', () => {
        const product = {
            ...baseProduct,
            discountType: 'PERCENTAGE',
            discountValue: 50,
            discountExpiresAt: new Date(Date.now() + 86400000) // tomorrow
        };
        const result = calculateDiscountedPrice(product);
        expect(result.discountApplied).toBe(true);
        expect(result.finalPrice).toBe(50);
    });

    test('100% discount makes price 0', () => {
        const product = { ...baseProduct, discountType: 'PERCENTAGE', discountValue: 100 };
        const result = calculateDiscountedPrice(product);
        expect(result.finalPrice).toBe(0);
    });

    test('rounds to 2 decimal places', () => {
        const product = { ...baseProduct, price: 99, discountType: 'PERCENTAGE', discountValue: 33 };
        const result = calculateDiscountedPrice(product);
        expect(result.finalPrice).toBe(66.33);
    });
});
