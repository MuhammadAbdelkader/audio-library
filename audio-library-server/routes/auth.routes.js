const express = require('express');
const router = express.Router();
const upload = require('../config/multer')
const { register, login } = require('../controllers/auth.controller');
const { registerValidators, loginValidators, validate } = require('../middlewares/validators');

// Register with optional profile picture
router.post('/register', 
  upload.fields([{ name: 'profilePic', maxCount: 1 }]),
  registerValidators,
  validate,
  register
);

// Login
router.post('/login', 
  loginValidators,
  validate,
  login
);

module.exports = router;
