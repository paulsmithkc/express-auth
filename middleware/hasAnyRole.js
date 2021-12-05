const debug = require('debug')('express:middleware:auth');
const { RequestHandler } = require('express');
const newError = require('../lib/newError.js');

/**
 * Check if the user has at least one role.
 * @returns {RequestHandler} middleware
 */
function hasAnyRole() {
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
      if (typeof authRole === 'string') {
        // user has a single role
        debug(`user has role: ${role}`);
        return next();
      } else if (Array.isArray(authRole)) {
        // check if the array of roles contains any values
        for (const role of authRole) {
          if (role) {
            debug(`user has role: ${role}`);
            return next();
          }
        }
      } else if (typeof authRole === 'object') {
        // check if the object includes any true keys
        for (const role in authRole) {
          if (authRole[role] === true) {
            debug(`user has role: ${role}`);
            return next();
          }
        }
      }

      // user does not have any roles
      const error = newError(403, 'You have not been assigned a role!');
      debug(error.message);
      return next(error);
    }
  };
}

module.exports = hasAnyRole;
