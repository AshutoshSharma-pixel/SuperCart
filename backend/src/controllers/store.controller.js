const { Store } = require('../models');

exports.getStore = async (req, res) => {
    try {
        const { id } = req.params;

        // In real world, this ID comes from a decoded QR token
        const store = await Store.findByPk(id);

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json(store);
    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createStore = async (req, res) => { // For Admin/Dev use
    try {
        const { name, location, upiId } = req.body;
        const store = await Store.create({ name, location, upiId });
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
