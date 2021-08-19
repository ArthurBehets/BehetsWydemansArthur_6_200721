const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
// routes calling user controllers
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;