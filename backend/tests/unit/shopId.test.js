// Test the generateShopId function 
const { Store } = require('../../src/models');
const crypto = require('crypto');

// Extracted from auth.controller.js for testing
const generateShopId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'SCRT-';
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

describe('generateShopId', () => {
    test('generates correct format SCRT-XXXXXX', () => {
        const id = generateShopId();
        expect(id).toMatch(/^SCRT-[A-Z0-9]{6}$/);
    });

    test('generates unique IDs', () => {
        const ids = new Set();
        for (let i = 0; i < 1000; i++) {
            ids.add(generateShopId());
        }
        // With 36^6 possibilities, 1000 should all be unique
        expect(ids.size).toBe(1000);
    });
});
