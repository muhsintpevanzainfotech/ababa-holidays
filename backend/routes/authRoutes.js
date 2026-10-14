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

const vendorUploadFields = [
  { name: 'avatar', maxCount: 1 },
  { name: 'coverBanner', maxCount: 1 },
  { name: 'coverBannerFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'idCardFile', maxCount: 1 },
  { name: 'tinUpload', maxCount: 1 },
  { name: 'tinFile', maxCount: 1 },
  { name: 'panUpload', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'gstUpload', maxCount: 1 },
  { name: 'gstFile', maxCount: 1 },
  { name: 'bankUpload', maxCount: 1 },
  { name: 'bankFile', maxCount: 1 },
  { name: 'passbookUpload', maxCount: 1 },
  { name: 'passbookFile', maxCount: 1 },
  { name: 'tradeLicenseUpload', maxCount: 1 },
  { name: 'tradeLicenseFile', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'logoFile', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'logoS', maxCount: 1 },
  { name: 'logoM', maxCount: 1 },
  { name: 'logoL', maxCount: 1 }
];

router.post('/register', upload.fields(vendorUploadFields), register);
router.post('/verify-otp', upload.none(), verifyOTP);
router.post('/login', upload.none(), login);
router.post('/refresh-token', upload.none(), refreshAccessToken);
router.post('/google-login', upload.none(), googleLogin);
router.post('/forgotpassword', upload.none(), forgotPassword);
router.put('/resetpassword', upload.none(), resetPassword);
router.post('/logout', protect, logout);

module.exports = router;