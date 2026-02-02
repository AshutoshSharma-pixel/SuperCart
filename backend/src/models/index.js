const Sequelize = require('sequelize');
const db = require('../config/database');

const User = db.define('user', {
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    trustScore: {
        type: Sequelize.INTEGER,
        defaultValue: 100
    },
    isFlagged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

const Store = db.define('store', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    location: {
        type: Sequelize.STRING
    },
    upiId: {
        type: Sequelize.STRING
    }
});

const Product = db.define('product', {
    barcode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    storeId: {
        type: Sequelize.INTEGER,
        references: {
            model: Store,
            key: 'id'
        }
    }
});

const Session = db.define('session', {
    status: {
        type: Sequelize.ENUM('ACTIVE', 'PAID', 'USED', 'EXPIRED', 'FLAGGED'),
        defaultValue: 'ACTIVE'
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
    },
    expiresAt: {
        type: Sequelize.DATE,
        allowNull: true
    },
    exitToken: {
        type: Sequelize.TEXT
    }
});

const CartItem = db.define('cart_item', {
    quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    priceSnapshot: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
    }
});

// Associations
User.hasMany(Session);
Session.belongsTo(User);

Store.hasMany(Product);
Product.belongsTo(Store);

Store.hasMany(Session);
Session.belongsTo(Store);

Session.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Session, { through: CartItem });

module.exports = { User, Store, Product, Session, CartItem };
