const express = require('express');
const { loginUser, createUser, fetchPayroll } = require('./userController');
const { fetchHolidayInfo } = require('./holiday');
const { fetchAccountInfo } = require('./account');
const { fetchArchivedUsers , fetchUsers } = require ('./admin');
const { authenticateJWT } = require('./authMiddleware');
const { benchmark } = require('./benchmark/benchmark');


const router = express.Router();

router.post('/login', loginUser); 
router.post('/register', createUser); 
router.get('/fetchPayroll', authenticateJWT, fetchPayroll); 
router.get('/fetchHolidayInfo', authenticateJWT, fetchHolidayInfo); 
router.get('/fetchAccountInfo', authenticateJWT, fetchAccountInfo); 
router.get('/fetchArchivedUsers', authenticateJWT, fetchArchivedUsers); 
router.get('/fetchUsers', authenticateJWT, fetchUsers); 
router.post('/benchmark', benchmark);
module.exports = router;
