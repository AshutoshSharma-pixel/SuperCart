const db = require('./config/database');
const models = require('./models');

const syncDatabase = async () => {
    try {
        await db.authenticate();
        console.log('Database connected...');

        // Sync all models
        // force: true will drop the table if it already exists
        // alter: true will check what is the current state of the table in the database
        // and then perform the necessary changes in the table to make it match the model
        await db.sync({ alter: true });

        console.log('Database synced successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error syncing database:', err);
        process.exit(1);
    }
};

syncDatabase();
