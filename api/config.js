var config = {};
config.server = {};
config.mongo = {};

config.app = "rest_hapi";

config.apiVersion = "local";

// server
config.server.port = 8124;

// mongo
config.mongo.URI =  'mongodb://localhost/rest_hapi';

// options

//Type of authentication (set to false for no authentication)
// config.auth = "token";
config.auth = false;

module.exports = config;