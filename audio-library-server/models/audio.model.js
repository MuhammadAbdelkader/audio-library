const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
  },
  genre: {
    type: String,
    required: true,
    enum: ['education', 'religion', 'comedy', 'fiction', 'self-help'],
  },
  audioFile: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  playCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Add indexes for better search performance
audioSchema.index({ title: 'text' });
audioSchema.index({ genre: 1 });
audioSchema.index({ user: 1 });
audioSchema.index({ isPrivate: 1 });

module.exports = mongoose.model('Audio', audioSchema);
