const { RequestHandler } = require('express');

/**
 * Check if the user has at least one role.
 * @returns {RequestHandler} middleware
 */
function hasAnyRole() {
  return (req, res, next) => {
    if (!req.auth) {
      return next({ status: 401, message: 'You are not logged in!' });
    } else if (!req.auth.role) {
      return next({
        status: 403,
        message: 'You have not been assigned a role!',
      });
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
      return next({
        status: 403,
        message: 'You have not been assigned a role!',
      });
    }
  };
}

module.exports = hasAnyRole;
