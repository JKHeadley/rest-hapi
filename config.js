/**
 * config.local.js - Configuration settings for the local environment
 */
var config = {};
config.server = {};
config.mongo = {};

/**
 * Your app name goes here
 */
config.app = "rest-hapi-app";

config.modelDirectory = 'models';

/**
 * Running the local environment
 */
config.apiVersion = "local";

/**
 * Server settings:
 * - config.server.port = 8124; (default)
 */
config.server.port = 8124;

/**
 * Mongo settings
 * - config.mongo.URI = 'mongodb://localhost/rest_hapi'; (local db, default)
 */
config.mongo.URI = 'mongodb://localhost/rest_hapi';

/**
 * Authentication options:
 * - false (no authentication, default)
 * - "token" (token authentication)
 * - "jwt" (token authentication)
 * @type {boolean}
 */
config.auth = false;

/**
 * Validation options:
 * default: true
 * NOTE: It is useful to disable query validation while testing with the hapi-swagger-docs
 *       as long as you open the docs with validation enabled first
 * @type {boolean}
 */
config.enableQueryValidation = true;
config.enablePayloadValidation = true;
config.enableResponseValidation = true;

/**
 * Log level options:
 * - INTERNAL use it for logging calls and other internal stuff
 * - DEBUG recommended to use it for debugging applications
 * - NOTE development verbose information (default)
 * - INFO minor information
 * - LOG significant messages
 * - WARNING really important stuff
 * - ERROR application business logic error condition
 * - FATAL system error condition
 */
config.loglevel = "DEBUG";

module.exports = config;