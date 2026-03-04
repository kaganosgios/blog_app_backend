const express = require('express');
const { getMe, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { avatarUpload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/me', protect, getMe);
router.put('/me', protect, avatarUpload.single('avatar'), updateProfile);

module.exports = router;
