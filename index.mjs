import authMiddleware from './middleware/auth.js';
import isLoggedIn from './middleware/isLoggedIn.js';
import hasAnyRole from './middleware/hasAnyRole.js';
import hasRole from './middleware/hasRole.js';
import hasPermission from './middleware/hasPermission.js';
import fetchRoles from './lib/fetchRoles.js';
import mergePermissions from './lib/mergePermissions.js';

export {
  authMiddleware,
  isLoggedIn,
  hasAnyRole,
  hasRole,
  hasPermission,
  fetchRoles,
  mergePermissions,
};
