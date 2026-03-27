const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Long-lived refresh token
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
