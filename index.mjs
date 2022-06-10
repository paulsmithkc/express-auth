import authMiddleware from './middleware/auth';
import isLoggedIn from './middleware/isLoggedIn';
import hasAnyRole from './middleware/hasAnyRole';
import hasRole from './middleware/hasRole';
import hasPermission from './middleware/hasPermission';
import fetchRoles from './lib/fetchRoles';
import mergePermissions from './lib/mergePermissions';

export default {
  authMiddleware,
  isLoggedIn,
  hasAnyRole,
  hasRole,
  hasPermission,
  fetchRoles,
  mergePermissions,
};
