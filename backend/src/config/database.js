const Sequelize = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  dialect: 'postgres',
  logging: isProduction ? false : console.log,
};

if (isProduction) {
  config.host = process.env.DB_HOST;
  config.dialectOptions = {
    socketPath: process.env.DB_HOST
  };
} else {
  config.host = process.env.DB_HOST || 'localhost';
}

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  config
);
