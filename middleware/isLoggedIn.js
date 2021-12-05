const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');
const newError = require('../lib/newError.js');

/**
 * Check if the user is logged in.
 * @returns {RequestHandler} middleware
 */
function isLoggedIn() {
  return (req, res, next) => {
    if (!req.auth) {
      const error = newError(401, 'You are not logged in!');
      debug(error.message);
      return next(error);
    } else {
      return next();
    }
  };
}

module.exports = isLoggedIn;
