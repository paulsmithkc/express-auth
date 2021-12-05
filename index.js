module.exports = {
  authMiddleware: require('./middleware/auth'),
  isLoggedIn: require('./middleware/isLoggedIn'),
  hasAnyRole: require('./middleware/hasAnyRole'),
  hasRole: require('./middleware/hasRole'),
  hasPermission: require('./middleware/hasPermission'),
  fetchRoles: require('./lib/fetchRoles'),
  mergePermissions: require('./lib/mergePermissions'),
};
