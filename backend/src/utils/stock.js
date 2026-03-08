const { Product, StockLog } = require('../models');

/**
 * Add stock to a product. Used when store receives new inventory.
 * Returns updated product.
 */
async function addStock(productId, storeId, quantity, note = 'Stock received') {
    const product = await Product.findOne({ where: { id: productId, storeId } });
    if (!product) throw new Error('Product not found in this store');
    if (quantity < 1) throw new Error('Quantity must be at least 1');

    const stockBefore = product.stock;
    const stockAfter = stockBefore + quantity;

    product.stock = stockAfter;
    product.isOutOfStock = false; // Clear out of stock flag when stock added
    await product.save();

    await StockLog.create({
        productId,
        storeId,
        type: 'RECEIVED',
        quantity,
        stockBefore,
        stockAfter,
        note
    });

    return product;
}

/**
 * Deduct stock when a customer purchases. Called from cart controller.
 * Returns updated product.
 */
async function deductStock(productId, storeId, quantity, sessionId) {
    const product = await Product.findOne({ where: { id: productId, storeId } });
    if (!product) throw new Error('Product not found');

    const stockBefore = product.stock;
    const stockAfter = Math.max(0, stockBefore - quantity); // Never go below 0

    product.stock = stockAfter;

    // Flag as out of stock if hits 0
    if (stockAfter === 0) {
        product.isOutOfStock = true;
    }

    await product.save();

    await StockLog.create({
        productId,
        storeId,
        type: 'SOLD',
        quantity: -quantity,   // Negative — stock went down
        stockBefore,
        stockAfter,
        note: `Sold in session ${sessionId}`,
        sessionId
    });

    return product;
}

/**
 * Manual stock adjustment by store owner.
 * Can be positive (found extra stock) or negative (damaged goods etc.)
 */
async function adjustStock(productId, storeId, quantity, note = 'Manual adjustment') {
    const product = await Product.findOne({ where: { id: productId, storeId } });
    if (!product) throw new Error('Product not found in this store');

    const stockBefore = product.stock;
    const stockAfter = Math.max(0, stockBefore + quantity);

    product.stock = stockAfter;
    product.isOutOfStock = stockAfter === 0;
    await product.save();

    await StockLog.create({
        productId,
        storeId,
        type: 'ADJUSTED',
        quantity,
        stockBefore,
        stockAfter,
        note
    });

    return product;
}

/**
 * Check if a product is low on stock.
 */
function isLowStock(product) {
    return !product.isOutOfStock &&
        product.stock > 0 &&
        product.stock <= product.lowStockThreshold;
}

module.exports = { addStock, deductStock, adjustStock, isLowStock };
