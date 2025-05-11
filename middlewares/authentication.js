// middlewares/authentication.js
const { validateToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    // Safeguard in case cookie-parser is not mounted
    if (!req.cookies) return next();

    const token = req.cookies[cookieName];
    if (!token) return next();

    try {
      const payload = validateToken(token);
      req.user = payload;                // e.g. { _id, email, role, ... }
      // console.log(req.user);
    } catch (err) {
      // invalid token → ignore
    }
    return next();
  };
}

module.exports = { checkForAuthenticationCookie };
