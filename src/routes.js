const express = require('express');
const { loginUser, createUser,fetchPayroll } = require('./userController');
const { generatePayrollForAllUsers} = require('./payrollController');
const { authenticateJWT } = require('./authMiddleware');

const router = express.Router();

router.post('/login', loginUser); 
router.post('/register', createUser); 

router.post('/payroll', generatePayrollForAllUsers);
router.get('/fetchPayroll', authenticateJWT, fetchPayroll);  
module.exports = router;
