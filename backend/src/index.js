const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

// Database Connection
db.authenticate()
    .then(() => {
        console.log('Database connected...');
        // NOTE: db.sync() removed to prevent data loss on restart
        // Run seed.js manually to populate database
        app.listen(PORT, console.log(`Server started on port ${PORT}`));
    })
    .catch(err => console.log('Error: ' + err));
