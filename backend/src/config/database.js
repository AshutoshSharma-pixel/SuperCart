const Sequelize = require('sequelize');

const dbName = process.env.NODE_ENV === 'test' ? 'supercart_test' : process.env.DB_NAME;
console.log('--- DATABASE CONNECTION INITIALIZED ---');
console.log('NODE_ENV:', process.env.NODE_ENV, '| DB_NAME:', process.env.DB_NAME, '| USED_DB:', dbName);

module.exports = new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' ? console.log : false,
});
