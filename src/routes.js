const express = require('express');
const { loginUser, createUser } = require('./userController');
const { generatePayrollForAllUsers} = require('./utils');

const router = express.Router();

router.post('/login', loginUser); 
router.post('/register', createUser); 
router.get('/payroll', generatePayrollForAllUsers);

module.exports = router;
