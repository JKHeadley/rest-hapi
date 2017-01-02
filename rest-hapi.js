'use strict';

const _ = require('lodash'),
    extend = require('extend'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-swagger'),
    logging = require('loggin'),
    logUtil = require('./utilities/log-util'),
    chalk = require('chalk'),
    Q = require("q"),
    restHelperFactory = require('./utilities/rest-helper-factory'),
    generateModels = require('./utilities/model-generator'),
    defaultConfig = require('./config');

module.exports = {
    config: {},
    register: register,
};

function register(server, options, next) {

    let config = defaultConfig;

    extend(true, config, module.exports.config);

    let rootLogger = logging.getLogger(chalk.gray("app"));

    rootLogger.logLevel = config.loglevel;

    var logger = logUtil.bindHelper(rootLogger, 'appInit()');

    let mongoose = require('./components/mongoose-init')(logger, config);

    logUtil.logActionStart(logger, "Initializing Server");

    generateModels(mongoose, logger, config)
        .then(function(models) {

            let swaggerOptions = {
                apiVersion: '1.0',
                documentationPath: '/'
            };

            server.register([
                    Inert,
                    Vision,
                    {
                        register: HapiSwagger,
                        options: swaggerOptions
                    }],
                function (err) {
                    if (err) {
                        logger.error(err);
                        return next(err);
                    }

                    const restHelper = restHelperFactory(logger, mongoose, server);

                    for (let modelKey in models) {//EXPL: generate endpoints for all of the models
                        let model = models[modelKey];
                        restHelper.generateRoutes(server, model, {models:models})
                    }

                    next();
                });
        })
        .catch(function(error) {
            logger.error(error);
            next(error);
        })
}

register.attributes = {
    name: 'rest-hapi',
    version: '1.0.0'
};