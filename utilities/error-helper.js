'use strict';

var Boom = require('boom');

module.exports = {

  /**
   * Error response types.
   */
  types: {
    BAD_REQUEST: "Bad Request",
    BAD_IMPLEMENTATION: "Bad Implementation",
    NOT_FOUND: "Not Found",
    GATEWAY_TIMEOUT: "Gateway Timeout",
    CONFLICT: "Conflict"
  },

  /**
   * Creates a rest-hapi error with a message and a type or throws if error is already a rest-hapi error.
   * @param error: The system error/rest-hapi error.
   * @param type: The response type.
   */
  handleError: function(error, message, type, Log) {
    if (error.type) {
      throw error;
    }
    else {
      Log.error(error);
      message = message || error;
      throw { message: message, type: type };
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
      if (error.type) {
        switch (error.type) {
          case this.types.BAD_IMPLEMENTATION:
            response = Boom.badImplementation(error.message);
            break;
          case this.types.GATEWAY_TIMEOUT:
            response = Boom.gatewayTimeout(error.message);
            break;
          case this.types.NOT_FOUND:
            response = Boom.notFound(error.message);
            break;
          case this.types.BAD_REQUEST:
            response = Boom.badRequest(error.message);
            break;
          case this.types.CONFLICT:
            response = Boom.conflict(error.message);
            break;
          default:
            response = Boom.badRequest(error.message);
        }
      }
      else if (error.isBoom) {
        response = error
      }
      else {
        response = Boom.badImplementation('An error occurred.')
      }
      return response;
    }
    catch(error) {
      Log.error(error);
      return error;
    }
  }
};
