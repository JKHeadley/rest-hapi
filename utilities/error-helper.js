'use strict;'
var Boom = require('boom');

module.exports = {

  /**
   * Error response types.
   */
  types: {
    BAD_REQUEST: 1,
    SERVER_TIMEOUT: 2,
    NOT_FOUND: 3,
  },

  /**
   * Creates a rest-hapi error with a message and a type or throws if error is already a rest-hapi error.
   * @param error: The system error/rest-hapi error.
   * @param type: The response type.
   */
  handleError: function(error, message, type, Log) {
    try {
      if (error.type) {
        throw error;
      }
      else {
        Log.error("error: ", error);
        message = message || error;
        throw { message: message, type: type };
      }
    }
    catch(error) {
      Log.error("error:", error);
      return error;
    }
  },

  /**
   * Processes errors based on their response type
   * @param error: A rest-hapi error.
   * @returns {object} A Boom response.
   */
  formatResponse: function(error, Log) {
    try {
      var response = {};
      switch (error.type) {
        case this.types.SERVER_TIMEOUT:
          response = Boom.serverTimeout(error.message);
          break;
        case this.types.NOT_FOUND:
          response = Boom.notFound(error.message);
          break;
        case this.types.BAD_REQUEST:
          response = Boom.badRequest(error.message);
          break;
        default:
          response = Boom.badRequest(error.message);
      }
      return response;
    }
    catch(error) {
      Log.error("error:", error);
      return error;
    }
  }
};
