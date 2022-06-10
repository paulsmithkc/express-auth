# express-auth

Collection of authentication and authorization middleware functions.

## Install

Install this package.

```bash
npm install @merlin4/express-auth
```

Install peer dependencies, if needed.

```bash
npm install express cookie-parser jsonwebtoken config
```

## Table of Contents

- Middleware
  - [authMiddleware](#authmiddleware)
    - [installation](#installation)
    - [configuration](#configuration)
    - [req.auth](#reqauth)
  - [isLoggedIn](#isloggedin-middleware)
  - [hasAnyRole](#hasanyrole-middleware)
  - [hasRole](#hasrole-middleware)
  - [hasPermission](#haspermission-middleware)
- Utility Functions
  - [fetchRoles](#fetchroles-utility-function)
  - [mergePermissions](#mergepermissions-utility-function)

## authMiddleware

### installation

The authentication middleware will parse a Json Web Token (JWT) provided by the client,
via either an "Authorization" header with type "Bearer", or optionally via a cookie.

Install this middleware in your application entry point (index.js/server.js/app.js):

```js
const { authMiddleware } = require('@merlin4/express-auth');
app.use(
  authMiddleware('my super secret key', 'authToken', {
    httpOnly: true,
    maxAge: 1000 * 60 * 15,
  })
);
```

### configuration

The constructor for this middleware accepts 3 arguments:

1. **secret** the secret used to sign the JWT token (required)
2. **cookieName** the name of the cookie that holds the token (optional)
3. **cookieOptions** the options to use for refreshing the token (optional)

The **secret** is required to verify the token. This middleware will throw an exception on startup, if it not provided.

The **cookieName** will be used to parse the token from a cookie, when no "Authorization" header is provided. Note that you will need to install a cookie parser beforehand to parse the cookies. (Example shown below.)

```js
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('@merlin4/express-auth');
app.use(cookieParser());
app.use(authMiddleware('my super secret key', 'authToken'));
```

If **cookieName** is not provided, then this middleware will ignore cookies and a cookie parser is not required.

If **cookieOptions** are also provided, then the auth cookie will be refreshed on every request, using the provided options. For security it is recommended that you provide the following options:

- `maxAge`, will set an expiration time in milliseconds for the auth cookie.
- `httpOnly: true`, will prevent the cookie from being read by front-end javascript code.
- `secure: true`, will prevent the cookie from being sent over HTTP.

See the [res.cookie()](https://expressjs.com/en/4x/api.html#res.cookie) for a full list of the available options.

If **cookieName** or **cookieOptions** are not provided, then the cookie will not be automatically refreshed.

We recommend using the [config](https://www.npmjs.com/package/config) package to help set these options.

```js
const config = require('config');
const cookieParser = require('cookie-parser');
const { authMiddleware } = require('@merlin4/express-auth');
app.use(cookieParser());
app.use(
  authMiddleware(
    config.get('auth.secret'), 
    config.get('auth.cookie.name'), 
    {
      maxAge: parseInt(config.get('auth.cookie.maxAge')),
      httpOnly: config.get('auth.cookie.httpOnly'),
      secure: config.get('auth.cookie.secure'),
    }
  )
);
```

### req.auth

Once the middleware is installed and configured in the application. A new field will be accessible on the **Request** object to your other routes.

```js
app.get('/api/auth/me', (req, res) => {
  const auth = req.auth;
  // If a valid auth token is provided, then req.auth will be the token's payload.
  // Otherwise req.auth, will be be undefined.
  // ...
});
```

## isLoggedIn middleware

*Requires **authMiddleware** to be installed first.*

The **isLoggedIn** middleware checks that the user is logged in. It will send a 401 error if the user is not authenticated.

**Example:** Allow **authenticated users** to access the route.
```js
const { isLoggedIn } = require('@merlin4/express-auth');

app.get('/api/auth/me', isLoggedIn(), (req, res) => {
  const auth = req.auth;
  // ...
});
```

## hasAnyRole middleware

*Requires **authMiddleware** to be installed first.*

The **hasAnyRole** middleware checks that the user is logged in and has at least one role. It will send a 401 error if the user is not authenticated. It will send a 403 error if the user has no roles.

**Example:** Allow users with **any role** to access the route.
```js
const { hasAnyRole } = require('@merlin4/express-auth');

app.get('/api/auth/me', hasAnyRole(), (req, res) => {
  const auth = req.auth;
  const authRole = req.auth.role;
  // ...
});
```

## hasRole middleware

*Requires **authMiddleware** to be installed first.*

The **hasRole** middleware checks that the user is logged in and has one of the allowed roles. It will send a 401 error if the user is not authenticated. It will send a 403 error if the user does not have one of the allowed roles.

**Example:** Allow **admins** to access this route.
```js
const { hasRole } = require('@merlin4/express-auth');

app.get('/api/admin', hasRole('admin'), (req, res) => {
  const auth = req.auth;
  const authRole = req.auth.role;
  // ...
});
```

**Example:** Allow users with either the **admin or moderator** role to access this route.
```js
const { hasRole } = require('@merlin4/express-auth');

app.get('/api/mod', hasRole('admin', 'moderator'), (req, res) => {
  const auth = req.auth;
  const authRole = req.auth.role;
  // ...
});
```

## hasPermission middleware

*Requires **authMiddleware** to be installed first.*

The **hasPermission** middleware checks the user has at least one of the listed permissions. It will send a 401 error if the user is not authenticated. It will send a 403 error if the user does not have one of the listed permissions.

**Example:** Allow users with the **manageUsers** permission to access this route.
```js
const { hasRole } = require('@merlin4/express-auth');

app.get('/api/user/list', hasPermission('manageUsers'), (req, res) => {
  const auth = req.auth;
  const permissions = req.auth.permissions;
  // ...
});
```

**Example:** Allow users with either the **viewUsers or editUsers** permission to access this route.
```js
const { hasRole } = require('@merlin4/express-auth');

app.get('/api/user/list', hasPermission('viewUsers', 'editUsers'), (req, res) => {
  const auth = req.auth;
  const permissions = req.auth.permissions;
  // ...
});
```

## fetchRoles utility function

The **fetchRoles** function will read the assigned roles from a user document and fetch all of roles from a data source, in parallel.

**Example:** Fetch the user from the database, and then fetch all of the assigned roles.
```js
const { fetchRoles } = require('@merlin4/express-auth');
const user = await db.findUserById(userId);
const roles = await fetchRoles(user, role => db.findRoleByName(role));
```

This function assumes that the user has a **"role"** field which specifies their role(s). 
The user object may be in any of the following states:

User has **no role:**
```js
{ ...userData, role: null }
```

User has **a role:**
```js
{ ...userData, role: "admin" }
```
User has **an array of roles:**
```js
{ ...userData, role: ["admin", "manager"] }
```

User has **a map of roles:**
```js
{ ...userData, role: { admin: true, manager: true, editor: false } }
```

All of the above data structures are supported by **fetchRoles**

## mergePermissions utility function

The **mergePermissions** function will merge the permissions of the user and their assigned roles into a combined permissions map.

**Example:** Fetch the user from the database, fetch all of the assigned roles, and then merge all of the permission maps.
```js
const { fetchRoles, mergePermissions } = require('@merlin4/express-auth');
const user = await db.findUserById(userId);
const roles = await fetchRoles(user, role => db.findRoleByName(role));
const permissions = mergePermissions(user, roles);
```

This will read any user specific permissions from the user document, such as:

```js
{ ...userData, permissions: { canLogin: true } }
```

It will also read any permissions granted by a role, such as:
```js
[
  { name: 'Technical Manager', permissions: { manageUsers: true } },
  { name: 'Product Manager', permissions: { manageProducts: true } }
}
```

The combined permissions map would be as follows, for the data above:
```js
{
  canLogin: true,
  manageUsers: true,
  manageProducts: true
}
```
