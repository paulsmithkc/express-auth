const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');

/**
 * Check if the user has one of the allowed roles.
 * @returns {RequestHandler} middleware
 */
function hasRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      const error = { status: 401, message: 'You are not logged in!' };
      debug(error.message);
      return next(error);
    } else if (!req.auth.role) {
      const error = {
        status: 403,
        message: 'You do not have one of the allowed roles!',
      };
      debug(error.message);
      return next(error);
    } else {
      const authRoles = Array.isArray(req.auth.role)
        ? req.auth.role
        : [req.auth.role];

      if (allowedRoles.length > 0) {
        // check if the user has any of the allowed roles
        for (const role of allowedRoles) {
          if (authRoles.includes(role)) {
            return next();
          }
        }
      } else {
        // check if the user has any roles
        for (const role of authRoles) {
          if (role) {
            return next();
          }
        }
      }

      // user is not in any of the allowed groups
      const error = {
        status: 403,
        message: 'You do not have one of the allowed roles!',
      };
      debug(error.message);
      return next(error);
    }
  };
}

module.exports = hasRole;
