'use strict';

const _ = require('lodash'),
    extend = require('extend'),
    Inert = require('inert'),
    Vision = require('vision'),
    HS = require('hapi-swagger'),
    MH = require('mrhorse'),
    logging = require('loggin'),
    logUtil = require('./utilities/log-util'),
    chalk = require('chalk'),
    Q = require("q"),
    fs = require("fs"),
    restHelperFactory = require('./utilities/rest-helper-factory'),
    handlerHelper = require('./utilities/handler-helper'),
    joiHelper = require('./utilities/joi-mongoose-helper'),
    testHelper = require('./utilities/test-helper'),
    errorHelper = require('./utilities/error-helper'),
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
    removeMany: handlerHelper.removeMany,
    getAll: handlerHelper.getAll,
    logger: {},
    getLogger: getLogger,
    logUtil: logUtil,
    joiHelper: joiHelper,
    testHelper: testHelper,
    errorHelper: errorHelper
};

function register(server, options, next) {

    let config = defaultConfig;

    extend(true, config, module.exports.config);

    var logger = getLogger("api");

    module.exports.logger = logger;

    //EXPL: add the logger object to the request object for access later
    server.ext('onRequest', function (request, reply) {

        request.logger = logger;

        return reply.continue();
    });

    let mongoose = require('./components/mongoose-init')(options.mongoose, logger, config);

    logUtil.logActionStart(logger, "Initializing Server");

    let promise = {};

    if (modelsGenerated) {
        promise = Q.when(globalModels);
    }
    else {
        promise = modelGenerator(mongoose, logger, config);
    }

    let models = {};

    promise
        .then(function(result) {
            models = result;

            //EXPL: setup hapi-swagger plugin
            //region Hapi-Swagger Plugin
            let swaggerOptions = {
                documentationPath: '/',
                info: {
                    title: config.appTitle,
                    version: config.version
                },
                expanded: config.docExpansion,
                reuseDefinitions: false
            };

            let HapiSwagger = {
                register: HS,
                options: swaggerOptions
            };
            //endregion

            return server.register([
                Inert,
                Vision,
                HapiSwagger,
            ])
        })
        .then(function () {

            //EXPL: setup mrhorse policy plugin
            //region Mrhorse Plugin
            let policyPath = "";
            let Mrhorse = null;

            if (config.enablePolicies) {
                if (config.absolutePolicyPath === true) {
                    policyPath = config.policyPath;
                }
                else {
                    policyPath = __dirname.replace('node_modules/rest-hapi', config.policyPath);
                }

            }
            else {
                policyPath = __dirname + '/policies'
            }

            Mrhorse = {
                register: MH,
                options: {
                    policyDirectory: policyPath
                }
            };
            //endregion

            if (Mrhorse) {
                return server.register([
                    Mrhorse
                ])
                    .then(function(result) {
                        if (config.enablePolicies) {
                            server.plugins.mrhorse.loadPolicies(server, {
                                policyDirectory: __dirname + '/policies'
                            }, function(err) {
                                if (err) {
                                    logger.error("ERROR:", err);
                                }
                            });
                        }
                    });
            }
            else {
                return null;
            }
        })
        .catch(function (error) {
            if (error.message.includes('no such file')) {
                logger.error("The policies directory provided does not exist. " +
                    "Try setting the 'policyPath' property of the config file.");
            }
            else {
                throw error;
            }
        })
        .then(function() {
            const restHelper = restHelperFactory(logger, mongoose, server);

            for (let modelKey in models) {//EXPL: generate endpoints for all of the models
                let model = models[modelKey];
                restHelper.generateRoutes(server, model, {models: models})
            }

            return apiGenerator(server, mongoose, logger, config)
        })
        .then(function() {
            next();
        })
        .catch(function (error) {
            logger.error(error);
            return next(error);
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