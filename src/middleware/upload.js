const multer = require("multer");
const path = require("path");

// Use memory storage (files are stored in memory as Buffer)
const storage = multer.memoryStorage();

// Allowed extensions
const allowedExtensions = [".jpg", ".jpeg", ".png", ".svg", ".webp"];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // normalize extension
    if (!allowedExtensions.includes(ext)) {
      cb(new Error(`File type '${ext}' is not supported`), false);
      return;
    }
    cb(null, true);
  },
});

module.exports = upload;
