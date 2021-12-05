const debug = require('debug')('express:middleware:auth');
const jwt = require('jsonwebtoken');
const { RequestHandler, Request, Response } = require('express');

/**
 * Parse the auth header.
 * @param {string} authHeader 
 * @param {string} authSecret
 * @returns {any} token payload
 */
function parseAuthHeader(authHeader, authSecret) {
  if (authHeader) {
    const space = authHeader.indexOf(' ');
    if (space > 0) {
      const authType = authHeader.substring(0, space);
      const authToken = authHeader.substring(space + 1).trim();
      if (authType === 'Bearer') {
        try {
          return jwt.verify(authToken, authSecret);
        } catch (err) {
          debug('invalid token:', err.message);
        }
      } else {
        debug('unsupported auth type:', authType);
      }
    }
  }
}

/**
 * Parse the auth cookie.
 * @param {string} authCookie 
 * @param {string} authSecret 
 * @returns {any} token payload
 */
function parseAuthCookie(authCookie, authSecret) {
  try {
    return jwt.verify(authCookie, authSecret);
  } catch (err) {
    debug('invalid token:', err.message);
  }
}

/**
 * Parse auth token from either the auth header or a cookie.
 * @param {Request} req
 * @param {Response} res
 * @param {string} authSecret
 * @param {string} cookieName
 * @param {object} cookieOptions
 * @returns {any} token payload
 */
function handleAuth(req, res, authSecret, cookieName, cookieOptions) {
  if (req.headers) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader) {
      return parseAuthHeader(authHeader, authSecret);
    }
  }
  if (cookieName && req.cookies) {
    const authCookie = req.cookies[cookieName];
    if (authCookie) {
      const auth = parseAuthCookie(authCookie, authSecret);
      if (cookieOptions && auth) {
        // refresh auth cookie
        res.cookie(cookieName, authCookie, cookieOptions);
      }
      return auth;
    }
  }
}

/**
 * Construct an authentication middleware, with the provided options.
 * @param {string} secret the secret used to sign the JWT token (required)
 * @param {string} cookieName the name of the cookie that holds the token (optional)
 * @param {object} cookieOptions the options to use for refreshing the token (optional)
 * @returns {RequestHandler} authentication middleware
 */
function auth(secret, cookieName = null, cookieOptions = null) {
  if (!secret) {
    throw new Error('secret is required.');
  }

  return (req, res, next) => {
    const auth = handleAuth(req, res, secret, cookieName, cookieOptions);
    if (auth) {
      req.auth = auth;
    }
    return next();
  };
}

module.exports = auth;
