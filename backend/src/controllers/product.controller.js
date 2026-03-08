const { Product } = require('../models');

exports.getProductByBarcode = async (req, res, next) => {
    try {
        const { barcode, storeId } = req.query;

        if (!barcode || !storeId) {
            return res.status(400).json({ error: 'Barcode and Store ID required' });
        }

        const product = await Product.findOne({
            where: { barcode, storeId }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found in this store' });
        }

        const { calculateDiscountedPrice } = require('../utils/discount');
        res.json({ ...product.toJSON(), currentPricing: calculateDiscountedPrice(product) });
    } catch (error) {
        console.error('Get product error:', error);
        next(error);
    }
};

exports.getStoreProducts = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { filter } = req.query;

        let whereClause = { storeId };
        if (filter === 'low_stock') {
            whereClause.isOutOfStock = false;
        } else if (filter === 'out_of_stock') {
            whereClause.isOutOfStock = true;
        }

        const products = await Product.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        const { calculateDiscountedPrice } = require('../utils/discount');
        const { isLowStock } = require('../utils/stock');
        const result = products.map(p => ({
            ...p.toJSON(),
            currentPricing: calculateDiscountedPrice(p),
            isLowStock: isLowStock(p)
        }));

        if (filter === 'low_stock') {
            return res.json(result.filter(p => p.isLowStock));
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.addProduct = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const {
            barcode, name, price,
            stock, lowStockThreshold,
            discountType, discountValue, discountExpiresAt, isDiscountActive
        } = req.body;

        if (discountType && !['PERCENTAGE', 'FLAT'].includes(discountType)) {
            return res.status(400).json({ error: 'discountType must be PERCENTAGE or FLAT' });
        }
        if (discountType === 'PERCENTAGE' && discountValue > 100) {
            return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
        }
        if (discountType === 'FLAT' && discountValue >= price) {
            return res.status(400).json({ error: 'Flat discount cannot exceed product price' });
        }

        const product = await Product.create({
            barcode, name, price, storeId,
            stock: stock || 0,
            lowStockThreshold: lowStockThreshold || 5,
            isOutOfStock: (stock || 0) === 0,
            discountType: discountType || null,
            discountValue: discountValue || null,
            discountExpiresAt: discountExpiresAt || null,
            isDiscountActive: isDiscountActive || false
        });

        if (stock && stock > 0) {
            const { addStock } = require('../utils/stock');
            await addStock(product.id, storeId, stock, 'Initial stock on product creation');
        }

        res.json(product);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('Captured SequelizeUniqueConstraintError in addProduct:', JSON.stringify(error.errors));
            return res.status(400).json({ error: 'Product with this barcode already exists in your store' });
        }
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { id } = req.params;
        const {
            name, price,
            discountType, discountValue, discountExpiresAt, isDiscountActive
        } = req.body;

        const product = await Product.findOne({ where: { id, storeId } });
        if (!product) return res.status(404).json({ error: 'Product not found in your store' });

        const newPrice = price !== undefined ? price : product.price;
        if (discountType && !['PERCENTAGE', 'FLAT'].includes(discountType)) {
            return res.status(400).json({ error: 'discountType must be PERCENTAGE or FLAT' });
        }
        if (discountType === 'PERCENTAGE' && discountValue > 100) {
            return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' });
        }
        if (discountType === 'FLAT' && discountValue >= newPrice) {
            return res.status(400).json({ error: 'Flat discount cannot exceed product price' });
        }

        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        if (discountType !== undefined) product.discountType = discountType;
        if (discountValue !== undefined) product.discountValue = discountValue;
        if (discountExpiresAt !== undefined) product.discountExpiresAt = discountExpiresAt;
        if (isDiscountActive !== undefined) product.isDiscountActive = isDiscountActive;

        await product.save();

        const { calculateDiscountedPrice } = require('../utils/discount');
        res.json({ ...product.toJSON(), currentPricing: calculateDiscountedPrice(product) });
    } catch (error) {
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { id } = req.params;

        const deleted = await Product.destroy({ where: { id, storeId } });
        if (!deleted) return res.status(404).json({ error: 'Product not found in your store' });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

exports.toggleDiscount = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { id } = req.params;

        const product = await Product.findOne({ where: { id, storeId } });
        if (!product) return res.status(404).json({ error: 'Product not found in your store' });

        if (!product.discountType || !product.discountValue) {
            return res.status(400).json({ error: 'No discount configured on this product' });
        }

        product.isDiscountActive = !product.isDiscountActive;
        await product.save();

        const { calculateDiscountedPrice } = require('../utils/discount');
        res.json({
            message: `Discount ${product.isDiscountActive ? 'activated' : 'deactivated'}`,
            isDiscountActive: product.isDiscountActive,
            currentPricing: calculateDiscountedPrice(product)
        });
    } catch (error) {
        next(error);
    }
};

exports.scanProduct = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { barcode } = req.body;

        if (!barcode) return res.status(400).json({ error: 'Barcode required' });

        const existing = await Product.findOne({ where: { barcode, storeId } });

        if (existing) {
            const { calculateDiscountedPrice } = require('../utils/discount');
            const { isLowStock } = require('../utils/stock');
            return res.json({
                exists: true,
                product: {
                    ...existing.toJSON(),
                    currentPricing: calculateDiscountedPrice(existing),
                    isLowStock: isLowStock(existing)
                }
            });
        }

        return res.json({
            exists: false,
            barcode,
            message: 'New product. Please provide name, price, and quantity to add to inventory.'
        });
    } catch (error) {
        next(error);
    }
};

exports.receiveStock = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { id } = req.params;
        const { quantity, note } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const { addStock, isLowStock } = require('../utils/stock');
        const product = await addStock(parseInt(id), storeId, quantity, note);

        res.json({
            message: `Added ${quantity} units to stock`,
            product: {
                ...product.toJSON(),
                isLowStock: isLowStock(product)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.adjustStock = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { id } = req.params;
        const { quantity, note } = req.body;

        if (quantity === undefined || quantity === 0) {
            return res.status(400).json({ error: 'Quantity required and cannot be 0' });
        }

        const { adjustStock, isLowStock } = require('../utils/stock');
        const product = await adjustStock(parseInt(id), storeId, quantity, note);

        res.json({
            message: `Stock adjusted by ${quantity > 0 ? '+' : ''}${quantity} units`,
            product: {
                ...product.toJSON(),
                isLowStock: isLowStock(product)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getStockHistory = async (req, res, next) => {
    try {
        const storeId = req.storeId;
        const { id } = req.params;
        const { StockLog } = require('../models');

        const product = await Product.findOne({ where: { id, storeId } });
        if (!product) return res.status(404).json({ error: 'Product not found in your store' });

        const logs = await StockLog.findAll({
            where: { productId: id, storeId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({
            product: { id: product.id, name: product.name, currentStock: product.stock },
            history: logs
        });
    } catch (error) {
        next(error);
    }
};
