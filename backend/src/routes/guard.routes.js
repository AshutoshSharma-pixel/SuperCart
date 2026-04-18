const router = require('express').Router();
const guardAuth = require('../middleware/guardAuth');
const storeAuth = require('../middleware/storeAuth');
const {
    guardLogin,
    verifyExit,
    getGuardProfile,
    createGuard,
    listGuards,
    deleteGuard
} = require('../controllers/guard.controller');

// Public
router.post('/login', guardLogin);

// Guard-authenticated
router.post('/verify-exit', guardAuth, verifyExit);
router.get('/profile', guardAuth, getGuardProfile);

// Store-owner-authenticated (manage guards)
router.post('/create', storeAuth, createGuard);
router.get('/', storeAuth, listGuards);
router.delete('/:id', storeAuth, deleteGuard);

module.exports = router;
