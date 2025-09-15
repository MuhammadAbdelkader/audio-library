const Audio = require('../models/audio.model');
const User = require('../models/user.model');
const fs = require('fs');

const getAllAudios = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const audios = await Audio.find()
      .populate('user', 'name email profilePicture role')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Audio.countDocuments();

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

const deleteAnyAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    if (!audio) {
      const error = new Error('Audio not found');
      error.statusCode = 404;
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
      message: 'Audio deleted successfully by admin'
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    // Get audio counts for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const audioCount = await Audio.countDocuments({ user: user._id });
      return {
        ...user.toObject(),
        audioCount
      };
    }));

    res.json({
      success: true,
      users: usersWithStats,
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

const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAudios = await Audio.countDocuments();
    const totalPlays = await Audio.aggregate([
      { $group: { _id: null, total: { $sum: '$playCount' } } }
    ]);

    const genreStats = await Audio.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topAudios = await Audio.find()
      .populate('user', 'name')
      .sort({ playCount: -1 })
      .limit(10)
      .select('title playCount likes user');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAudios,
        totalPlays: totalPlays[0]?.total || 0,
        genreStats,
        topAudios
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAudios,
  deleteAnyAudio,
  getAllUsers,
  getStats
};
