const path = require('path');

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const buildFileUrl = (req, filePath) => {
  if (!filePath) return '';
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      avatarUrl: buildFileUrl(req, user.avatar)
    }
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;

  if (req.file) {
    updateData.avatar = path.join('uploads', 'avatars', req.file.filename);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      ...user.toObject(),
      avatarUrl: buildFileUrl(req, user.avatar)
    }
  });
});

module.exports = {
  getMe,
  updateProfile
};
