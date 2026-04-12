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
    },
    shopId: {
        type: Sequelize.STRING,
        unique: true
    },
    passwordHash: {
        type: Sequelize.STRING
    },
    planTier: {
        type: Sequelize.ENUM('Starter', 'Growth', 'Enterprise'),
        defaultValue: 'Starter'
    },
    planExpiresAt: {
        type: Sequelize.DATE
    },
    gracePeriodEndsAt: {
        type: Sequelize.DATE
    },
    isLocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    ownerName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    ownerPhone: {
        type: Sequelize.STRING,
        allowNull: true
    },
    ownerEmail: {
        type: Sequelize.STRING,
        allowNull: true
    },
    shopAddress: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

const Product = db.define('product', {
    barcode: {
        type: Sequelize.STRING,
        allowNull: false
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
    },
    discountType: {
        type: Sequelize.ENUM('PERCENTAGE', 'FLAT'),
        allowNull: true,
        defaultValue: null
    },
    discountValue: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null
    },
    discountExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
    },
    isDiscountActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
    },
    isOutOfStock: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['barcode', 'storeId']
        }
    ]
});

const StockLog = db.define('stock_log', {
    productId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    storeId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.ENUM('RECEIVED', 'SOLD', 'ADJUSTED', 'RETURNED'),
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    stockBefore: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    stockAfter: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    note: {
        type: Sequelize.STRING,
        allowNull: true
    },
    sessionId: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    },
    finalPriceSnapshot: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
    },
    discountApplied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    discountType: {
        type: Sequelize.ENUM('PERCENTAGE', 'FLAT'),
        allowNull: true
    },
    discountValue: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    savings: {
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

CartItem.belongsTo(Product);
Product.hasMany(CartItem);

CartItem.belongsTo(Session);
Session.hasMany(CartItem);

Product.hasMany(StockLog);
StockLog.belongsTo(Product);

Store.hasMany(StockLog);
StockLog.belongsTo(Store);

module.exports = { User, Store, Product, Session, CartItem, StockLog };
