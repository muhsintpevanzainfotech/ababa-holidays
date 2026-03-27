const fs = require('fs');
const path = require('path');

/**
 * Delete a file from the server
 * @param {string} filePath - Path to the file to delete
 */
const deleteFile = (filePath) => {
  if (!filePath) return;

  const absolutePath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(process.cwd(), filePath);

  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
      console.log(`Successfully deleted file: ${absolutePath}`);
    } catch (err) {
      console.error(`Error deleting file ${absolutePath}:`, err);
    }
  } else {
    console.warn(`File not found for deletion: ${absolutePath}`);
  }
};

module.exports = { deleteFile };
