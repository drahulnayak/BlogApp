// services/authentication.js
const JWT = require('jsonwebtoken');
const secret = '$uperMan@123';

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role
  };
  return JWT.sign(payload, secret, { expiresIn: '2h' });
}

function validateToken(token) {
  return JWT.verify(token, secret);
}

module.exports = { createTokenForUser, validateToken };
