const { Store, Product, User } = require('./models');
const db = require('./config/database');

const seed = async () => {
    try {
        await db.authenticate();
        console.log('Database connected');

        // Sync with force to recreate tables
        await db.sync({ force: true });
        console.log('Tables created');

        // Create Store
        const store = await Store.create({
            name: 'SuperMart Indiranagar',
            location: '100ft Road, Indiranagar, Bangalore',
            upiId: 'supermart@upi'
        });
        console.log(`Store Created: ${store.name} (ID: ${store.id})`);

        // Create Products
        const products = [
            { barcode: '8901030776566', name: 'Coke Zero 300ml', price: 40.0 },
            { barcode: '8901725181222', name: 'Lays Classic Salted', price: 20.0 },
            { barcode: '8901063092686', name: 'Britannia Good Day', price: 30.0 },
            { barcode: '8901058847844', name: 'Maggi 2-Minute Noodles', price: 14.0 },
            { barcode: '123456', name: 'Test Product', price: 100.0 }
        ];

        for (const p of products) {
            await Product.create({ ...p, storeId: store.id });
        }
        console.log(`${products.length} products seeded.`);

        // Create Test User
        const user = await User.create({
            phone: '9999999999',
            trustScore: 100
        });
        console.log(`Test User Created: ${user.phone}`);

        console.log('✓ Seed completed successfully');

        // Don't close connection - let it stay open for a moment
        setTimeout(async () => {
            await db.close();
            process.exit(0);
        }, 2000);

    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
