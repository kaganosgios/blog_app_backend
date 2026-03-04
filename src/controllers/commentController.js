const Comment = require('../models/Comment');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const addComment = asyncHandler(async (req, res) => {
  const { content, parentComment } = req.body;
  const { postId } = req.params;

  if (!content) {
    throw new AppError('Comment content is required', 400);
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent || String(parent.post) !== String(postId)) {
      throw new AppError('Parent comment is invalid', 400);
    }
  }

  const comment = await Comment.create({
    content,
    parentComment: parentComment || null,
    post: postId,
    author: req.user._id
  });

  post.commentsCount += 1;
  await post.save();

  const populatedComment = await Comment.findById(comment._id).populate('author', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comment: populatedComment
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (String(comment.author) !== String(req.user._id)) {
    throw new AppError('You are not allowed to update this comment', 403);
  }

  if (!req.body.content) {
    throw new AppError('Comment content is required', 400);
  }

  comment.content = req.body.content;
  await comment.save();

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    comment
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (String(comment.author) !== String(req.user._id)) {
    throw new AppError('You are not allowed to delete this comment', 403);
  }

  const deleteResult = await Comment.deleteMany({
    $or: [{ _id: comment._id }, { parentComment: comment._id }]
  });

  await Post.findByIdAndUpdate(comment.post, {
    $inc: { commentsCount: -deleteResult.deletedCount }
  });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

module.exports = {
  addComment,
  updateComment,
  deleteComment
};
