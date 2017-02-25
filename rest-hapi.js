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
    handlerHelper = require('./utilities/handler-helper'),
    modelGenerator = require('./utilities/model-generator'),
    apiGenerator = require('./utilities/api-generator'),
    defaultConfig = require('./config');

let modelsGenerated = false;
let globalModels = {};

module.exports = {
    config: defaultConfig,
    register: register,
    generateModels: generateModels,
    list: handlerHelper.list,
    find: handlerHelper.find,
    create: handlerHelper.create,
    update: handlerHelper.update,
    deleteOne: handlerHelper.deleteOne,
    deleteMany: handlerHelper.deleteMany,
    addOne: handlerHelper.addOne,
    removeOne: handlerHelper.removeOne,
    addMany: handlerHelper.addMany,
    getAll: handlerHelper.getAll,
    logger: {},
    getLogger: getLogger,
    logUtil: logUtil
};

function register(server, options, next) {

    let config = defaultConfig;

    extend(true, config, module.exports.config);

    var logger = getLogger("api");

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
                documentationPath: '/',
                info: {
                    title: config.appTitle,
                    version: config.version
                },
                expanded: config.docExpansion
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

                    apiGenerator(server, mongoose, logger, config)
                        .then(function() {
                            next();
                        })
                        .catch(function(error) {
                            logger.error(error);
                            next(error);
                        })

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

    var logger = getLogger("models");

    module.exports.logger = logger;

    return modelGenerator(mongoose, logger, config)
        .then(function(models) {
            globalModels = models;
            return models;
        });
}

function getLogger(label) {
    let config = defaultConfig;

    extend(true, config, module.exports.config);

    let rootLogger = logging.getLogger(chalk.gray(label));

    rootLogger.logLevel = config.loglevel;

    return rootLogger;
}


register.attributes = {
    name: 'rest-hapi',
    version: '1.0.0'
};