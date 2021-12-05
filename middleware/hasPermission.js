const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');
const newError = require('../lib/newError.js');

/**
 * Check if the user has at least one of the listed permissions.
 * @returns {RequestHandler} middleware
 */
function hasPermission(...allowedPermissions) {
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
      const authPermissions = req.auth.permissions;
      if (allowedPermissions.length > 0) {
        // check that the user has any of the listed permissions
        for (const permission of allowedPermissions) {
          if (authPermissions[permission] === true) {
            debug(`user has permission: ${permission}`);
            return next();
          }
        }
        // user does not have any of the listed permissions
        const error = newError(403, `You do not have any of these permissions: ${allowedPermissions.join(', ')}`);
        debug(error.message);
        return next(error);
      } else {
        // check if the user has any permissions
        for (const permission in authPermissions) {
          if (authPermissions[permission] === true) {
            debug(`user has permission: ${permission}`);
            return next();
          }
        }
        // user does not have any permissions
        const error = newError(403, 'You do not have any permissions!');
        debug(error.message);
        return next(error);
      }
    }
  };
}

module.exports = hasPermission;
