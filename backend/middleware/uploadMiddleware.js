const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Simple helper to create folder if it handles
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const createUpload = (folderName = '') => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = path.join('uploads/', folderName);
      ensureFolderExists(dest);
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
  });
};

// Default generic upload
const uploadInstance = createUpload();

// Attach createUpload to the instance for named access if needed
uploadInstance.createUpload = createUpload;

module.exports = uploadInstance;
