'use strict'

const extend = require('extend')
const _ = require('lodash')
const path = require('path')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Mrhorse = require('mrhorse')
const logging = require('loggin')
const logUtil = require('./utilities/log-util')
const chalk = require('chalk')
const restHelperFactory = require('./utilities/rest-helper-factory')
const handlerHelper = require('./utilities/handler-helper')
const joiHelper = require('./utilities/joi-mongoose-helper')
const testHelper = require('./utilities/test-helper')
const modelGenerator = require('./utilities/model-generator')
const apiGenerator = require('./utilities/api-generator')
const defaultConfig = require('./config')
const globals = require('./globals')

const internals = {
  modelsGenerated: false,
  globalModels: {}
}

module.exports = {
  plugin: {
    name: 'rest-hapi',
    version: '1.0.0',
    register
  },
  config: defaultConfig,
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
  testHelper: testHelper
}

async function register(server, options) {
  let config = defaultConfig

  // Overwrite the default config with config set by the user
  extend(true, config, options.config)
  module.exports.config = config

  let Log = getLogger('api')

  module.exports.logger = Log

  // Add the logger object to the request object for access later
  server.ext('onRequest', (request, h) => {
    request.logger = Log

    return h.continue
  })

  const mongoose = mongooseInit(options.mongoose, Log, config)

  logUtil.logActionStart(Log, 'Initializing Server')

  let models

  if (internals.modelsGenerated) {
    // Models generated previously
    models = internals.globalModels
  } else {
    try {
      models = await modelGenerator(mongoose, Log, config)
    } catch (err) {
      if (err.message.includes('no such file')) {
        Log.error(
          'The policies directory provided does not exist. ' +
            "Try setting the 'policyPath' property of the config file."
        )
      } else {
        throw err
      }
    }
  }

  if (!config.disableSwagger) {
    await registerHapiSwagger(server, Log, config)
  }

  await registerMrHorse(server, Log, config)

  await generateRoutes(server, mongoose, models, Log, config)
}

/**
 * Allows the user to pre-generate the models before the routes in case the models are needed
 * in other plugins (ex: auth plugin might require user model)
 * @param mongoose
 * @returns {*}
 */
function generateModels(mongoose) {
  internals.modelsGenerated = true

  let config = defaultConfig

  extend(true, config, module.exports.config)

  let Log = getLogger('models')

  module.exports.logger = Log

  return modelGenerator(mongoose, Log, config).then(function(models) {
    internals.globalModels = models
    return models
  })
}

/**
 * Get a new Log object with a root label.
 * @param label: The root label for the Log.
 * @returns {*}
 */
function getLogger(label) {
  let config = defaultConfig

  extend(true, config, module.exports.config)

  let rootLogger = logging.getLogger(chalk.gray(label))

  rootLogger.logLevel = config.loglevel

  return rootLogger
}

/**
 * Connect mongoose and add to globals.
 * @param mongoose
 * @param logger
 * @param config
 * @returns {*}
 */
function mongooseInit(mongoose, logger, config) {
  const Log = logger.bind('mongoose-init')

  mongoose.Promise = Promise

  logUtil.logActionStart(
    Log,
    'Connecting to Database',
    _.omit(config.mongo, ['pass'])
  )

  mongoose.connect(config.mongo.URI)

  globals.mongoose = mongoose

  Log.log('mongoose connected')

  return mongoose
}

/**
 * Register and configure the mrhorse plugin.
 * @param server
 * @param logger
 * @param config
 * @returns {Promise<void>}
 */
async function registerMrHorse(server, logger, config) {
  const Log = logger.bind('register-MrHorse')

  let policyPath = ''

  if (config.enablePolicies) {
    if (config.absolutePolicyPath === true) {
      policyPath = config.policyPath
    } else {
      policyPath = __dirname.replace(
        'node_modules/rest-hapi',
        config.policyPath
      )
    }
  } else {
    policyPath = path.join(__dirname, '/policies')
  }
  await server.register([
    {
      plugin: Mrhorse,
      options: {
        policyDirectory: policyPath
      }
    }
  ])

  if (config.enablePolicies) {
    await server.plugins.mrhorse.loadPolicies(server, {
      policyDirectory: path.join(__dirname, '/policies')
    })
  }

  Log.info('MrHorse plugin registered')
}

/**
 * Register and configure the hapi-swagger plugin.
 * @param server
 * @param logger
 * @param config
 * @returns {Promise<void>}
 */
async function registerHapiSwagger(server, logger, config) {
  const Log = logger.bind('register-hapi-swagger')

  let swaggerOptions = {
    documentationPath: '/',
    host: config.swaggerHost,
    expanded: config.docExpansion,
    swaggerUI: config.enableSwaggerUI,
    documentationPage: config.enableSwaggerUI,
    schemes: config.enableSwaggerHttps ? ['https'] : ['http']
  }

  // if swagger config is defined, use that
  if (config.swaggerOptions) {
    swaggerOptions = { ...swaggerOptions, ...config.swaggerOptions }
  }

  // override some options for safety
  if (!swaggerOptions.info) {
    swaggerOptions.info = {}
  }

  swaggerOptions.info.title = config.appTitle
  swaggerOptions.info.version = config.version
  swaggerOptions.reuseDefinitions = false

  await server.register([
    Inert,
    Vision,
    { plugin: HapiSwagger, options: swaggerOptions }
  ])

  Log.info('hapi-swagger plugin registered')
}

function generateRoutes(server, mongoose, models, logger, config) {
  const Log = logger.bind()

  const restHelper = restHelperFactory(logger, mongoose, server)

  for (let modelKey in models) {
    // Generate endpoints for all of the models
    let model = models[modelKey]
    restHelper.generateRoutes(server, model, { models: models })
  }

  // Generate custom endpoints
  return apiGenerator(server, mongoose, Log, config)
}
