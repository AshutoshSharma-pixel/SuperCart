const { Product } = require('../models');

exports.getProductByBarcode = async (req, res) => {
    try {
        const { barcode, storeId } = req.query; // Barcode and Store context

        if (!barcode || !storeId) {
            return res.status(400).json({ error: 'Barcode and Store ID required' });
        }

        const product = await Product.findOne({
            where: {
                barcode,
                storeId
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found in this store' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addProduct = async (req, res) => { // For Admin/Dev use
    try {
        const data = req.body;

        // Check if array (Bulk Upload)
        if (Array.isArray(data)) {
            const products = await Product.bulkCreate(data, {
                updateOnDuplicate: ['name', 'price'] // Upsert if barcode exists
            });
            return res.json({ count: products.length, message: 'Bulk upload successful' });
        }

        // Single Create
        const { barcode, name, price, storeId } = data;
        const product = await Product.create({ barcode, name, price, storeId });
        res.json(product);
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
