const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');
// routes calling sauce controllers. Middleware auth for the token verification and multer to manage the files
router.get('/', auth, sauceCtrl.getAll); 
router.get('/:id', auth, sauceCtrl.getOne);
router.post('/', auth, multer, sauceCtrl.create);
router.put('/:id', auth, multer, sauceCtrl.modify);
router.delete('/:id', auth, multer, sauceCtrl.delete);
router.post('/:id/like', auth, sauceCtrl.like);

module.exports = router;