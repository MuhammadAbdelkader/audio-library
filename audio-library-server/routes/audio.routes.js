const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  uploadAudio,
  getPublicAudios,
  getMyAudios,
  streamAudio,
  updateAudio,
  deleteAudio,
  likeAudio,
  addComment,
  deleteComment
} = require('../controllers/audio.controller');
const {
  audioUploadValidators,
  audioUpdateValidators,
  commentValidators,
  searchValidators,
  objectIdValidator,
  validate
} = require('../middlewares/validators');

// Public routes
router.get('/',
  searchValidators,
  validate,
  getPublicAudios
);

// All other routes require authentication
router.use(authMiddleware);

// Upload audio with cover image
router.post('/',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  audioUploadValidators,
  validate,
  uploadAudio
);

// Get user's own audios
router.get('/mine',
  searchValidators,
  validate,
  getMyAudios
);

// Stream audio file
router.get('/stream/:id',
  [objectIdValidator],
  validate,
  streamAudio
);

// Update audio
router.put('/:id',
  upload.fields([{ name: 'cover', maxCount: 1 }]),
  [objectIdValidator, ...audioUpdateValidators],
  validate,
  updateAudio
);

// Delete audio
router.delete('/:id',
  [objectIdValidator],
  validate,
  deleteAudio
);

// Like/Unlike audio
router.post('/:id/like',
  [objectIdValidator],
  validate,
  likeAudio
);

// Add comment
router.post('/:id/comments',
  [objectIdValidator, ...commentValidators],
  validate,
  addComment
);

// Delete comment
router.delete('/:id/comments/:commentId',
  [objectIdValidator],
  validate,
  deleteComment
);

module.exports = router;