const express = require('express');
const { loginUser } = require('./userController');

const router = express.Router();

router.post('/login', loginUser); 

module.exports = router;
