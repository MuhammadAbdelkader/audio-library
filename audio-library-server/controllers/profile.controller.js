const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'name email profilePicture')
      .populate('following', 'name email profilePicture');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        followers: user.followers,
        following: user.following,
        profileHistory: user.profileHistory.slice(-10) // Last 10 changes
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);
    
    const updates = {};
    const history = [];

    if (name && name !== user.name) {
      history.push({
        field: 'name',
        oldValue: user.name,
        newValue: name
      });
      updates.name = name;
    }

    // Handle profile picture update
    if (req.files && req.files.profilePic) {
      // Delete old profile picture
      if (user.profilePicture) {
        try {
          fs.unlinkSync(user.profilePicture);
        } catch (err) {
          console.log('Error deleting old profile picture:', err.message);
        }
      }

      history.push({
        field: 'profilePicture',
        oldValue: user.profilePicture || 'None',
        newValue: req.files.profilePic[0].path
      });
      updates.profilePicture = req.files.profilePic[0].path;
    }

    // Add history entries
    if (history.length > 0) {
      updates.$push = { profileHistory: { $each: history } };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      const error = new Error('You cannot follow yourself');
      error.statusCode = 400;
      return next(error);
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if already following
    if (req.user.following.includes(userId)) {
      const error = new Error('Already following this user');
      error.statusCode = 400;
      return next(error);
    }

    // Add to following and followers lists
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { followers: req.user._id }
    });

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Remove from following and followers lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: req.user._id }
    });

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getFollowingFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    
    const Audio = require('../models/Audio');
    const audios = await Audio.find({
      user: { $in: user.following },
      isPrivate: false
    })
    .populate('user', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json({
      success: true,
      audios,
      pagination: {
        page,
        limit,
        total: await Audio.countDocuments({
          user: { $in: user.following },
          isPrivate: false
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowingFeed
};
