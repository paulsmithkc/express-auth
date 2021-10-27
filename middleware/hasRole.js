const { RequestHandler } = require('express');

/**
 * Check if the user has one of the allowed roles.
 * @returns {RequestHandler} middleware
 */
function hasRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return next({ status: 401, message: 'You are not logged in!' });
    } else if (!req.auth.role) {
      return next({
        status: 403,
        message: 'You do not have one of the allowed roles!',
      });
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
      return next({
        status: 403,
        message: 'You do not have one of the allowed roles!',
      });
    }
  };
}

module.exports = hasRole;
