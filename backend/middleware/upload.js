const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB max file size
  fileFilter: fileFilter
});

// Middleware to handle file upload errors
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('image');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse('File too large. Max size is 5MB', 400));
        }
        return next(new ErrorResponse(`Multer error: ${err.message}`, 400));
      } else {
        // An unknown error occurred
        return next(new ErrorResponse(err.message, 400));
      }
    }
    
    // If no file was uploaded and it's required
    if (!req.file && req.fileRequired) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    next();
  });
};

module.exports = {
  handleUpload
}; 