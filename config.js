/**
 * config.js - Configuration settings for the generated API
 */
var config = {};
config.server = {};
config.mongo = {};

/**
 * Your app title goes here.
 * @type {string}
 */
config.appTitle = "rest-hapi API";

/**
 * Your app version goes here.
 * @type {string}
 */
config.version = '1.0.0';

/**
 * Flag signifying whether the absolute path to the models directory is provided
 * @type {boolean}
 */
config.absoluteModelPath = false;

/**
 * Path to the models directory (default 'models')
 * @type {string}
 */
config.modelPath = 'models';

/**
 * Server settings:
 * - config.server.port = 8124; (default)
 */
config.server.port = 8124;

config.server.routes = {
    cors: {
        additionalHeaders: ['X-Total-Count'],
        additionalExposedHeaders: ['X-Total-Count']
    }
};

config.server.connection = {
    port: config.server.port,
    routes: config.server.routes
};

/**
 * Mongo settings
 * - config.mongo.URI = 'mongodb://localhost/rest_hapi'; (local db, default)
 */
config.mongo.URI = 'mongodb://localhost/rest_hapi';

/**
 * Authentication strategy to be used for all generated endpoints.
 * Set to false for no authentication (default).
 * @type {boolean/string}
 */
config.auth = false;

/**
 * MetaData options:
 * default: true
 * @type {boolean}
 */
config.enableCreatedAt = true;
config.enableUpdatedAt = true;
config.enableSoftDelete = true;

/**
 * Validation options:
 * default: true
 * @type {boolean}
 */
config.enableQueryValidation = true;
config.enablePayloadValidation = true;
config.enableResponseValidation = true;

/**
 * Flag specifying whether to text index all string fields for all models to enable text search.
 * WARNING: enabling this adds overhead to add inserts and updates, as well as added storage requirements.
 * Default is false.
 * @type {boolean}
 */
config.enableTextSearch = false;

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