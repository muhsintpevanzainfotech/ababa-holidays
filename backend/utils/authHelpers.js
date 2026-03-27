const crypto = require('crypto');

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashOTP = (otp) =>
  crypto.createHash('sha256').update(otp.toString()).digest('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token.toString()).digest('hex');

module.exports = {
  generateOTP,
  hashOTP,
  hashToken
};
