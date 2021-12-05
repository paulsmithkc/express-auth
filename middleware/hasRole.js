const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');
const newError = require('../lib/newError.js');

/**
 * Check if the user has one of the allowed roles.
 * @returns {RequestHandler} middleware
 */
function hasRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      const error = newError(401, 'You are not logged in!');
      debug(error.message);
      return next(error);
    } else if (!req.auth.role) {
      const error = newError(403, 'You have not been assigned a role!');
      debug(error.message);
      return next(error);
    } else {
      const authRole = req.auth.role;
      const authRoleMap = {};
      if (typeof authRole === 'string') {
        authRoleMap[authRole] = true;
      } else if (Array.isArray(authRole)) {
        for (const role of authRole) {
          if (role) {
            authRoleMap[role] = true;
          }
        }
      } else if (typeof authRole === 'object') {
        for (const role in authRole) {
          if (authRole[role] === true) {
            authRoleMap[role] = true;
          }
        }
      }

      if (allowedRoles.length > 0) {
        // check if the user has any of the allowed roles
        for (const role of allowedRoles) {
          if (authRoleMap[role] === true) {
            debug(`user has role: ${role}`);
            return next();
          }
        }
        // user is not in any of the allowed groups
        const error = newError(403, `You do not have any of these roles: ${allowedRoles.join(', ')}`);
        debug(error.message);
        return next(error);
      } else {
        // check if the user has any roles
        for (const role in authRoleMap) {
          if (authRoleMap[role] === true) {
            debug(`user has role: ${role}`);
            return next();
          }
        }
        // user does not have any roles
        const error = newError(403, 'You have not been assigned a role!');
        debug(error.message);
        return next(error);
      }
    }
  };
}

module.exports = hasRole;
