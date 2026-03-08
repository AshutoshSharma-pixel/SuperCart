require('dotenv').config();
process.env.NODE_ENV = 'test';

const db = require('../src/config/database');
require('../src/models');

async function syncDB() {
    try {
        await db.authenticate();
        console.log('Test DB Authenticated.');
        await db.sync({ force: true, logging: console.log });
        console.log('Test DB Synced.');
    } catch (error) {
        console.error('SYNC ERROR:', error);
    } finally {
        await db.close();
    }
}

syncDB();
