'use strict'

const extend = require('extend')
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

let modelsGenerated = false
let globalModels = {}

const plugin = {
  name: 'rest-hapi',
  version: '1.0.0',
  register
}

module.exports = {
  plugin,
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

  extend(true, config, module.exports.config)

  let logger = getLogger('api')

  module.exports.logger = logger

  // EXPL: add the logger object to the request object for access later
  server.ext('onRequest', (request, h) => {
    request.logger = logger

    return h.continue
  })

  let mongoose = require('./components/mongoose-init')(
    options.mongoose,
    logger,
    config
  )

  logUtil.logActionStart(logger, 'Initializing Server')

  let models

  if (modelsGenerated) {
    models = globalModels
  } else {
    try {
      models = await modelGenerator(mongoose, logger, config)
    } catch (err) {
      if (err.message.includes('no such file')) {
        logger.error(
          'The policies directory provided does not exist. ' +
            "Try setting the 'policyPath' property of the config file."
        )
      } else {
        throw err
      }
    }
  }

  // EXPL: setup hapi-swagger plugin
  // region Hapi-Swagger Plugin
  let swaggerOptions = {
    documentationPath: '/',
    info: {
      title: config.appTitle,
      version: config.version
    },
    expanded: config.docExpansion,
    swaggerUI: config.enableSwaggerUI,
    documentationPage: config.enableSwaggerUI,
    schemes: config.enableSwaggerHttps ? ['https'] : ['http'],
    reuseDefinitions: false
  }
  // endregion

  await server.register([
    Inert,
    Vision,
    { plugin: HapiSwagger, options: swaggerOptions }
  ])

  // EXPL: setup mrhorse policy plugin
  // region Mrhorse Plugin
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

  // endregion

  if (Mrhorse) {
    await server.register([
      {
        plugin: Mrhorse,
        options: {
          policyDirectory: policyPath
        }
      }
    ])

    if (config.enablePolicies) {
      server.plugins.mrhorse.loadPolicies(
        server,
        {
          policyDirectory: path.join(__dirname, '/policies')
        },
        function(err) {
          if (err) {
            logger.error(err)
          }
        }
      )
    }
  } else {
    return null
  }

  const restHelper = restHelperFactory(logger, mongoose, server)

  for (let modelKey in models) {
    // EXPL: generate endpoints for all of the models
    let model = models[modelKey]
    restHelper.generateRoutes(server, model, { models: models })
  }

  return apiGenerator(server, mongoose, logger, config)
}

/**
 * Allows the user to pre-generate the models before the routes in case the models are needed
 * in other plugins (ex: auth plugin might require user model)
 * @param mongoose
 * @returns {*}
 */
function generateModels(mongoose) {
  modelsGenerated = true

  let config = defaultConfig

  extend(true, config, module.exports.config)

  let logger = getLogger('models')

  module.exports.logger = logger

  return modelGenerator(mongoose, logger, config).then(function(models) {
    globalModels = models
    return models
  })
}

function getLogger(label) {
  let config = defaultConfig

  extend(true, config, module.exports.config)

  let rootLogger = logging.getLogger(chalk.gray(label))

  rootLogger.logLevel = config.loglevel

  return rootLogger
}
