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
    joiHelper: joiHelper
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


            //EXPL: setup mrhorse policy plugin
            //region Mrhorse Plugin
            let policyPath = "";
            let Mrhorse = {};

            if (config.enablePolicies) {
                if (config.absolutePolicyPath === true) {
                    policyPath = config.policyPath;
                }
                else {
                    policyPath = __dirname + '/../../../' + config.policyPath;
                }

                let pathExists = true;
                try {
                    fs.accessSync(policyPath);
                } catch (e) {
                    pathExists = false;
                    logger.error("Policy path does not exist.")
                }

                if (pathExists) {
                    Mrhorse = {
                        register: MH,
                        options: {
                            policyDirectory: policyPath
                        }
                    }
                }
            }
            //endregion

            server.register([
                    Inert,
                    Vision,
                    HapiSwagger,
                    Mrhorse
                ],
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