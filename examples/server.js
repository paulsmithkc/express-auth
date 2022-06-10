require('dotenv').config({ path: './examples/.env' });

const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('config');
const jwt = require('jsonwebtoken');
const debug = require('debug')('app:server');
const {
  authMiddleware,
  isLoggedIn,
  hasAnyRole,
  hasRole,
  hasPermission,
  fetchRoles,
  mergePermissions,
} = require('../index.js');

// create application
const app = express();

// install global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authMiddleware(config.get('auth.secret')));

// data
const users = [
  { _id: 1, email: 'guest@example.com', password: 'P@ssw0rd' },
  { _id: 2, email: 'user@example.com', password: 'P@ssw0rd', role: 'User' },
  { _id: 3, email: 'mod@example.com', password: 'P@ssw0rd', role: 'Moderator' },
  { _id: 4, email: 'admin@example.com', password: 'P@ssw0rd', role: 'Admin' },
  { _id: 5, email: 'admin-array@example.com', password: 'P@ssw0rd', role: ['Admin', 'Moderator'] },
  { _id: 6, email: 'admin-map@example.com', password: 'P@ssw0rd', role: { Admin: true, Moderator: true } },
];
const roles = [
  { _id: 1, name: 'Admin', permissions: { viewData: true, admin: true } },
  { _id: 2, name: 'Moderator', permissions: { viewData: true, mod: true } },
  { _id: 2, name: 'User', permissions: { viewData: true } },
];
const findUserByEmail = async (email) => users.find((x) => x.email === email);
const findRoleByName = async (name) => roles.find((x) => x.name === name);

// login route
app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    // check credentials
    if (user && user.password == password) {
      // issue a new jwt token
      const roles = await fetchRoles(user, findRoleByName);
      const permissions = mergePermissions(user, roles);
      const authPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
        permissions,
      };
      const authSecret = config.get('auth.secret');
      const authToken = jwt.sign(authPayload, authSecret, { expiresIn: config.get('auth.expiresIn') });
      // send response
      return res.status(200).json({ success: 'Credentials Accepted!', authPayload, authToken });
    } else {
      // invalid credentials
      return res.status(400).json({ error: 'Invalid Credentials!' });
    }
  } catch (err) {
    next(err);
  }
});

// authorization example routes
app.get('/auth/anonymous', (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/isLoggedIn', isLoggedIn(), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasAnyRole', hasAnyRole(), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasRole/Admin', hasRole('Admin'), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasRole/Moderator', hasRole('Moderator'), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasRole/AdminOrModerator', hasRole('Admin', 'Moderator'), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasPermission/viewData', hasPermission('viewData'), (req, res) =>
  res.json({ message: 'Access Granted!' })
);
app.get('/auth/hasPermission/mod', hasPermission('mod'), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasPermission/admin', hasPermission('admin'), (req, res) => res.json({ message: 'Access Granted!' }));
app.get('/auth/hasPermission/adminOrMod', hasPermission('admin', 'mod'), (req, res) =>
  res.json({ message: 'Access Granted!' })
);

// error handlers
app.use((req, res, next) => {
  return res.status(404).json({ error: req.originalUrl + ' not found!' });
});
app.use((err, req, res, next) => {
  debug(err);
  return res.status(err.status || 500).json({ error: err.message || 'Unhandled Error!' });
});

// start application
const hostname = config.get('http.host');
const port = config.get('http.port');
app.listen(port, () => {
  debug(`Listening at http://${hostname}:${port}`);
});
