module.exports = {
  auth: require('./middleware/auth'),
  isLoggedIn: require('./middleware/isLoggedIn'),
  hasAnyRole: require('./middleware/hasAnyRole'),
  hasRole: require('./middleware/hasRole'),
  hasPermission: require('./middleware/hasPermission'),
  mergePermissions: require('./lib/mergePermissions'),
};
