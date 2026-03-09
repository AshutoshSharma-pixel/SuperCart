require('dotenv').config({ override: false });
const app = require('./app');
const db = require('./config/database');
const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await db.authenticate();
    console.log('Database connected...');
    
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error: ' + err);
    process.exit(1);
  }
}

start();
