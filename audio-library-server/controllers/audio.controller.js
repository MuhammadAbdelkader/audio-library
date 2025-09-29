const Audio = require('../models/audio.model');
const fs = require('fs');
const path = require('path');

const uploadAudio = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audio) {
      const error = new Error('Audio file is required');
      error.statusCode = 400;
      return next(error);
    }

    const { title, genre, isPrivate } = req.body;
    
    const audioData = {
      title,
      genre,
      audioFile: req.files.audio[0].path,
      user: req.user._id,
      isPrivate: isPrivate === 'true'
    };

    if (req.files.cover) {
      audioData.coverImage = req.files.cover[0].path;
    }

    const audio = await Audio.create(audioData);
    await audio.populate('user', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Audio uploaded successfully',
      audio
    });
  } catch (error) {
    next(error);
  }
};

const getPublicAudios = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, genre } = req.query;

    // Build search query
    let query = { isPrivate: false };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (genre) {
      query.genre = genre;
    }

    const audios = await Audio.find(query)
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Audio.countDocuments(query);

    res.json({
      success: true,
      audios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMyAudios = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find({ user: req.user._id })
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Audio.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      audios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const streamAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (audio.isPrivate && !audio.user.equals(req.user._id) && req.user.role !== 'admin') {
      const error = new Error('Access denied to private audio');
      error.statusCode = 403;
      return next(error);
    }

    const audioPath = path.resolve(audio.audioFile);
    
    if (!fs.existsSync(audioPath)) {
      const error = new Error('Audio file not found on disk');
      error.statusCode = 404;
      return next(error);
    }

    // Increment play count
    await Audio.findByIdAndUpdate(req.params.id, {
      $inc: { playCount: 1 }
    });

    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Streaming with range support
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(audioPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Full file streaming
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(audioPath).pipe(res);
    }
  } catch (error) {
    next(error);
  }
};

const updateAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check ownership
    if (!audio.user.equals(req.user._id) && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      return next(error);
    }

    const { title, genre, isPrivate } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (genre) updates.genre = genre;
    if (isPrivate !== undefined) updates.isPrivate = isPrivate === 'true';

    // Handle cover image update
    if (req.files && req.files.cover) {
      // Delete old cover
      if (audio.coverImage) {
        try {
          fs.unlinkSync(audio.coverImage);
        } catch (err) {
          console.log('Error deleting old cover:', err.message);
        }
      }
      updates.coverImage = req.files.cover[0].path;
    }

    const updatedAudio = await Audio.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('user', 'name email profilePicture');

    res.json({
      success: true,
      message: 'Audio updated successfully',
      audio: updatedAudio
    });
  } catch (error) {
    next(error);
  }
};

const deleteAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check ownership
    if (!audio.user.equals(req.user._id) && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      return next(error);
    }

    // Delete files
    try {
      if (audio.audioFile && fs.existsSync(audio.audioFile)) {
        fs.unlinkSync(audio.audioFile);
      }
      if (audio.coverImage && fs.existsSync(audio.coverImage)) {
        fs.unlinkSync(audio.coverImage);
      }
    } catch (err) {
      console.log('Error deleting files:', err.message);
    }

    await Audio.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Audio deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const likeAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      return next(error);
    }

    const hasLiked = audio.likes.includes(req.user._id);
    
    if (hasLiked) {
      // Unlike
      audio.likes.pull(req.user._id);
    } else {
      // Like
      audio.likes.push(req.user._id);
    }

    await audio.save();

    res.json({
      success: true,
      message: hasLiked ? 'Audio unliked' : 'Audio liked',
      likesCount: audio.likes.length
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if audio is private and user has access
    if (audio.isPrivate && !audio.user.equals(req.user._id) && req.user.role !== 'admin') {
      const error = new Error('Access denied to private audio');
      error.statusCode = 403;
      return next(error);
    }

    const comment = {
      user: req.user._id,
      text
    };

    audio.comments.push(comment);
    await audio.save();

    // Populate the new comment
    await audio.populate('comments.user', 'name profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: audio.comments[audio.comments.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
      return next(error);
    }

    const comment = audio.comments.id(commentId);
    if (!comment) {
      const error = new Error('Comment not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user owns the comment or is admin
    if (!comment.user.equals(req.user._id) && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      return next(error);
    }

    audio.comments.id(commentId).deleteOne();
    await audio.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAudio,
  getPublicAudios,
  getMyAudios,
  streamAudio,
  updateAudio,
  deleteAudio,
  likeAudio,
  addComment,
  deleteComment
};
