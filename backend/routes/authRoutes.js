const express = require('express');
const {
  register,
  verifyOTP,
  login,
  refreshAccessToken,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', upload.none(), register);
router.post('/verify-otp', upload.none(), verifyOTP);
router.post('/login', upload.none(), login);
router.post('/refresh-token', upload.none(), refreshAccessToken);
router.post('/google-login', upload.none(), googleLogin);
router.post('/forgotpassword', upload.none(), forgotPassword);
router.put('/resetpassword', upload.none(), resetPassword);
router.post('/logout', protect, logout);

module.exports = router;