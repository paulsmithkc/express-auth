/**
 * Merge the user's permission table with the permission tables of all their assigned roles.
 * @param {Object} user the user entity
 * @param {Array} roles array of role entities that the user is a member of
 * @returns {Object} combined permission table
 */
function mergePermissions(user, roles) {
  const permissions = {};

  if (user && user.permissions) {
    for (const permission in user.permissions) {
      if (user.permissions[permission] === true) {
        permissions[permission] = true;
      }
    }
  }

  if (roles) {
    for (const role of roles) {
      if (role && role.permissions) {
        for (const permission in role.permissions) {
          if (role.permissions[permission] === true) {
            permissions[permission] = true;
          }
        }
      }
    }
  }

  return permissions;
}

module.exports = mergePermissions;
