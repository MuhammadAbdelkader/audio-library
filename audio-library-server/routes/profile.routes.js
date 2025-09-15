const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowingFeed
} = require('../controllers/profile.controller');
const { updateProfileValidators, validate, objectIdValidator } = require('../middlewares/validators');

// All profile routes require authentication
router.use(authMiddleware);

// Get profile
router.get('/', getProfile);

// Update profile with optional profile picture
router.put('/',
  upload.fields([{ name: 'profilePic', maxCount: 1 }]),
  updateProfileValidators,
  validate,
  updateProfile
);

// Follow user
router.post('/follow/:userId',
  [objectIdValidator],
  validate,
  followUser
);

// Unfollow user
router.delete('/follow/:userId',
  [objectIdValidator],
  validate,
  unfollowUser
);

// Get following feed
router.get('/feed',
  getFollowingFeed
);

module.exports = router;