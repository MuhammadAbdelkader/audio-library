const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const {
  getAllAudios,
  deleteAnyAudio,
  getAllUsers,
  getStats
} = require('../controllers/admin.controller');
const { objectIdValidator, validate } = require('../middlewares/validators');

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Get all audios
router.get('/audios', getAllAudios);

// Delete any audio
router.delete('/audio/:id',
  [objectIdValidator],
  validate,
  deleteAnyAudio
);

// Get all users
router.get('/users', getAllUsers);

// Get system statistics
router.get('/stats', getStats);

module.exports = router;
