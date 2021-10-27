const { RequestHandler } = require('express');

/**
 * Check if the user is logged in.
 * @returns {RequestHandler} middleware
 */
function isLoggedIn() {
  return (req, res, next) => {
    if (!req.auth) {
      return next({ status: 401, message: 'You are not logged in!' });
    } else {
      return next();
    }
  };
}

module.exports = isLoggedIn;
