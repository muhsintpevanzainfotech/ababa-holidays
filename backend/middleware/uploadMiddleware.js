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
      // Subfolder based on vendor name or generic 'unnamed'
      // Try to get name from body (creation/registration) or user object (updates)
      const rawName = req.body.name || req.user?.name || 'unnamed';
      const sanitizedName = rawName.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      
      const dest = path.join('uploads/', folderName, sanitizedName);
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
    limits: { 
      fileSize: 50 * 1024 * 1024, // 50MB for files
      fieldSize: 100 * 1024 * 1024 // 100MB for fields (fixes LIMIT_FIELD_VALUE error)
    } 
  });
};

// Default generic upload
const uploadInstance = createUpload();

// Attach createUpload to the instance for named access if needed
uploadInstance.createUpload = createUpload;

module.exports = uploadInstance;
