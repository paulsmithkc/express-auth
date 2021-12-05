/**
 * Construct an error object with a status code.
 * @param {number} status status code
 * @param {string} message error message
 * @returns {Error} the error object
 */
function newError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = newError;
