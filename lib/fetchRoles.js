/**
 * Fetch all of the user's roles from the data source.
 * Code assumes that the user has a "role" field which specifies their role(s).
 * The user object may be in any of the following states:
 *
 * User has no role:
 * {
 *   ...userData,
 *   role: null
 * }
 *
 * User has a role:
 * {
 *   ...userData,
 *   role: "admin"
 * }
 *
 * User has an array of roles:
 * {
 *   ...userData,
 *   role: ["admin", "manager"]
 * }
 *
 * User has a map of roles:
 * {
 *   ...userData,
 *   role: {
 *     admin: true,
 *     manager: true,
 *     editor: false,
 *   }
 * }
 *
 * @param {Object} user the user entity (should have a "role" field)
 * @param {Function} fetchRole function to retrieve role entities by name
 * @returns {Promise<Array<Role>>} a promise for the array of role entities.
 */
function fetchRoles(user, fetchRole) {
  if (!user || !user.role) {
    return Promise.resolve([]);
  } else if (typeof user.role === 'string') {
    return Promise.resolve(fetchRole(user.role)).then((r) => [r]);
  } else if (Array.isArray(user.role)) {
    return Promise.all(user.role.map((role) => fetchRole(role)));
  } else if (typeof user.role === 'object') {
    return Promise.all(
      Object.keys(user.role)
        .filter((r) => user.role[r] === true)
        .map((r) => fetchRole(r))
    );
  } else {
    return Promise.reject(new Error('user.role is not a valid type.'));
  }
}

module.exports = fetchRoles;
