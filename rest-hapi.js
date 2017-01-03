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
    modelGenerator = require('./utilities/model-generator'),
    defaultConfig = require('./config');

let modelsGenerated = false;
let globalModels = {};

module.exports = {
    config: defaultConfig,
    register: register,
    generateModels: generateModels,
    logger: {},
    logUtil: logUtil
};

function register(server, options, next) {

    let config = defaultConfig;

    extend(true, config, module.exports.config);

    let rootLogger = logging.getLogger(chalk.gray("api"));

    rootLogger.logLevel = config.loglevel;

    var logger = logUtil.bindHelper(rootLogger, 'appInit()');

    module.exports.logger = logger;

    let mongoose = require('./components/mongoose-init')(options.mongoose, logger, config);

    logUtil.logActionStart(logger, "Initializing Server");

    let promise = {};

    if (modelsGenerated) {
        promise = Q.when(globalModels);
    }
    else {
        promise = modelGenerator(mongoose, logger, config);
    }

    promise
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

/**
 * Allows the user to pre-generate the models before the routes in case the models are needed
 * in other plugins (ex: auth plugin might require user model)
 * @param mongoose
 * @returns {*}
 */
function generateModels(mongoose) {
    modelsGenerated = true;

    let config = defaultConfig;

    extend(true, config, module.exports.config);

    let rootLogger = logging.getLogger(chalk.gray("app"));

    rootLogger.logLevel = config.loglevel;

    var logger = logUtil.bindHelper(rootLogger, 'appInit()');

    return modelGenerator(mongoose, logger, config)
        .then(function(models) {
            globalModels = models;
            return models;
        });
}


register.attributes = {
    name: 'rest-hapi',
    version: '1.0.0'
};