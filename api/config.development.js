/**
 * config.local.js - Configuration settings for the local environment
 */
var config = {};
config.server = {};
config.mongo = {};

/**
 * Your app name goes here
 */
config.app = "rest_hapi";

/**
 * Running the local environment
 */
config.apiVersion = "development";

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
 * @type {boolean}
 */
config.auth = false;

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
config.loglevel = "LOG";

module.exports = config;