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

## authMiddleware

### global installation

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

The **cookieName** will be used to parse the token from a cookie, when no "Authorization" is provided. Note that you will need to install a cookie parser beforehand to parse the cookies. (Example shown below.)

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
      httpOnly: parseInt(config.get('auth.cookie.httpOnly')),
      secure: parseInt(config.get('auth.cookie.secure')),
    }
  )
);
```

### usage in routes

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

The **isLoggedIn** middleware will check that the user is logged in, and send a 