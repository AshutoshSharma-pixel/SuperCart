require('dotenv').config();
const { authLimiter, paymentLimiter, generalLimiter } = require('../src/middleware/rateLimiter');

const db = require('../src/config/database');
require('../src/models'); // Ensure models are registered

beforeAll(async () => {
  try {
    await db.authenticate();
    // Truncate all tables to guarantee a clean slate for this test file
    await db.query(`
      TRUNCATE TABLE 
        "users", 
        "stores", 
        "products", 
        "sessions", 
        "cart_items" 
      RESTART IDENTITY CASCADE;
    `);
  } catch (err) {
    console.error('Test DB Truncate Error:', err);
    throw err;
  }
});

beforeEach(() => {
  // Reset rate limiters before each test so they don't leak across files
  if (authLimiter.resetKey) {
    authLimiter.resetKey('::ffff:127.0.0.1');
    paymentLimiter.resetKey('::ffff:127.0.0.1');
    generalLimiter.resetKey('::ffff:127.0.0.1');
  }
});

afterAll(async () => {
  await db.close();
});
