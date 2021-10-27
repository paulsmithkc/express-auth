const { RequestHandler } = require('express');

/**
 * Check if the user has all of the listed permissions.
 * @returns {RequestHandler} middleware
 */
function hasPermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.auth) {
      return next({ status: 401, message: 'You are not logged in!' });
    } else if (!req.auth.permissions) {
      return next({ status: 403, message: 'You do not have any permissions!' });
    } else {
      // check that the user has all required permissions
      for (const permission of requiredPermissions) {
        if (!req.auth.permissions[permission]) {
          return next({
            status: 403,
            message: `You do not have permission ${permission}!`,
          });
        }
      }
      // user has all required permissions
      return next();
    }
  };
}

module.exports = hasPermission;
