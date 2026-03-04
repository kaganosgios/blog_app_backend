const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike
} = require('../controllers/postController');
const { addComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');
const { postImageUpload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, postImageUpload.single('image'), createPost);
router.put('/:id', protect, postImageUpload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:postId/comments', protect, addComment);

module.exports = router;
