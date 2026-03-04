const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const createStorage = (folder) => {
  const destinationPath = path.join(__dirname, '..', '..', 'uploads', folder);
  ensureDir(destinationPath);

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destinationPath),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
  });
};

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage: createStorage('avatars'),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const postImageUpload = multer({
  storage: createStorage('posts'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  avatarUpload,
  postImageUpload
};
