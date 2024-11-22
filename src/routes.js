const express = require('express');
const { loginUser, createUser, fetchPayroll } = require('./userController');
const { fetchHolidayInfo,askHoliday } = require('./holiday');
const { fetchAccountInfo } = require('./account');
const { fetchArchivedUsers , fetchUsers ,fetchAskedHoliday } = require ('./admin');
const { authenticateJWT } = require('./authMiddleware');
const { benchmark } = require('./benchmark/benchmark');


const router = express.Router();

router.post('/login', loginUser); 
router.post('/register', createUser); 
router.get('/fetchPayroll', authenticateJWT, fetchPayroll); 
router.get('/fetchAskedHoliday', authenticateJWT, fetchAskedHoliday); 
router.get('/fetchHoliday', authenticateJWT, fetchHolidayInfo); 
router.get('/fetchAccountInfo', authenticateJWT, fetchAccountInfo); 
router.get('/fetchArchivedUsers', authenticateJWT, fetchArchivedUsers); 
router.get('/fetchUsers', authenticateJWT, fetchUsers); 
router.post('/askHoliday' , authenticateJWT, askHoliday);
router.post('/benchmark', benchmark);
module.exports = router;
