const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');

/**
 * Check if the user is logged in.
 * @returns {RequestHandler} middleware
 */
function isLoggedIn() {
  return (req, res, next) => {
    if (!req.auth) {
      const error = { status: 401, message: 'You are not logged in!' };
      debug(error.message);
      return next(error);
    } else {
      return next();
    }
  };
}

module.exports = isLoggedIn;
