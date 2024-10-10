const express = require('express');
const { registerUser, loginUser, getProtectedData } = require('./userController');
const { authenticateJWT } = require('./authMiddleware');

const router = express.Router();

router.post('/users', registerUser);
router.post('/login', loginUser);

router.get('/protected', authenticateJWT, getProtectedData);

module.exports = router;
