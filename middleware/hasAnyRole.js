const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');

/**
 * Check if the user has at least one role.
 * @returns {RequestHandler} middleware
 */
function hasAnyRole() {
  return (req, res, next) => {
    if (!req.auth) {
      const error = { status: 401, message: 'You are not logged in!' };
      debug(error.message);
      return next(error);
    } else if (!req.auth.role) {
      const error = {
        status: 403,
        message: 'You have not been assigned a role!',
      };
      debug(error.message);
      return next(error);
    } else if (typeof req.auth.role === 'string') {
      return next();
    } else {
      // check if the array of roles contains any values
      const authRoles = req.auth.role;
      if (Array.isArray(authRoles)) {
        for (const role of authRoles) {
          if (role) {
            return next();
          }
        }
      }
      // array contains no values
      const error = {
        status: 403,
        message: 'You have not been assigned a role!',
      };
      debug(error.message);
      return next(error);
    }
  };
}

module.exports = hasAnyRole;
