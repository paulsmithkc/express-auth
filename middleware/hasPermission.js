const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');
const newError = require('../lib/newError.js');

/**
 * Check if the user has all of the listed permissions.
 * @returns {RequestHandler} middleware
 */
function hasPermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.auth) {
      const error = newError(401, 'You are not logged in!');
      debug(error.message);
      return next(error);
    } else if (!req.auth.permissions) {
      const error = newError(403, 'You do not have any permissions!');
      debug(error.message);
      return next(error);
    } else {
      // check that the user has all required permissions
      for (const permission of requiredPermissions) {
        if (!req.auth.permissions[permission]) {
          const error = newError(403, `You do not have permission ${permission}!`);
          debug(error.message);
          return next(error);
        }
      }
      // user has all required permissions
      return next();
    }
  };
}

module.exports = hasPermission;
