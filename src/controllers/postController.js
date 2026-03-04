const path = require('path');
const mongoose = require('mongoose');

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const pickPostFields = require('../utils/pickPostFields');

const buildFileUrl = (req, filePath) => {
  if (!filePath) return '';
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  const payload = pickPostFields(req.body);
  if (req.file) {
    payload.image = path.join('uploads', 'posts', req.file.filename);
  }

  const post = await Post.create({
    ...payload,
    author: req.user._id
  });

  const populatedPost = await Post.findById(post._id).populate('author', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post: {
      ...populatedPost.toObject(),
      imageUrl: buildFileUrl(req, populatedPost.image)
    }
  });
});

const getPosts = asyncHandler(async (req, res) => {
  const {
    author,
    tag,
    q,
    sort = 'latest',
    fromDate,
    toDate,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  if (author) {
    if (mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    } else {
      const matchedAuthor = await User.findOne({ name: { $regex: author, $options: 'i' } });
      if (matchedAuthor) {
        query.author = matchedAuthor._id;
      } else {
        query.author = null;
      }
    }
  }

  if (tag) {
    query.tags = { $in: String(tag).split(',').map((item) => item.trim()) };
  }

  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  const sortMap = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likesCount: -1, createdAt: -1 },
    discussed: { commentsCount: -1, createdAt: -1 }
  };

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name email avatar')
      .sort(sortMap[sort] || sortMap.latest)
      .skip(skip)
      .limit(safeLimit),
    Post.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit)
    },
    posts: posts.map((post) => ({
      ...post.toObject(),
      imageUrl: buildFileUrl(req, post.image)
    }))
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email avatar');

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    post: {
      ...post.toObject(),
      imageUrl: buildFileUrl(req, post.image)
    },
    comments
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (String(post.author) !== String(req.user._id)) {
    throw new AppError('You are not allowed to update this post', 403);
  }

  const payload = pickPostFields(req.body);
  if (req.file) {
    payload.image = path.join('uploads', 'posts', req.file.filename);
  }

  Object.assign(post, payload);
  await post.save();

  const updatedPost = await Post.findById(post._id).populate('author', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    post: {
      ...updatedPost.toObject(),
      imageUrl: buildFileUrl(req, updatedPost.image)
    }
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (String(post.author) !== String(req.user._id)) {
    throw new AppError('You are not allowed to delete this post', 403);
  }

  await Promise.all([
    Post.findByIdAndDelete(post._id),
    Comment.deleteMany({ post: post._id })
  ]);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const userId = req.user._id;
  const existingLikeIndex = post.likes.findIndex((id) => String(id) === String(userId));

  if (existingLikeIndex >= 0) {
    post.likes.splice(existingLikeIndex, 1);
  } else {
    post.likes.push(userId);
  }

  post.likesCount = post.likes.length;
  await post.save();

  res.status(200).json({
    success: true,
    message: existingLikeIndex >= 0 ? 'Like removed' : 'Post liked',
    likesCount: post.likesCount,
    liked: existingLikeIndex < 0
  });
});

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike
};
