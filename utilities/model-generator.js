'use strict'

let modelHelper = require('./model-helper')
let authHelper = require('./auth-helper')
let fs = require('fs')
let path = require('path')

/**
 * This module reads in all the model files and generates the corresponding mongoose models.
 * @param mongoose
 * @param logger
 * @param config
 * @returns {*|promise}
 */
module.exports = function(mongoose, logger, config) {
  const Log = logger.bind('model-generator')

  let models = {}
  let schemas = {}
  let modelPath = ''

  if (config.absoluteModelPath === true) {
    modelPath = config.modelPath
  } else {
    modelPath = path.join(__dirname, '/../../../', config.modelPath)
  }

  return new Promise((resolve, reject) => {
    fs.readdir(modelPath, (err, files) => {
      if (err) {
        if (err.message.includes('no such file')) {
          Log.error(err)
          reject(
            new Error(
              'The model directory provided is either empty or does not exist. ' +
                "Try setting the 'modelPath' property of the config file."
            )
          )
        } else {
          reject(err)
        }
        return
      }

      for (let file of files) {
        // EXPL: Import all the model schemas
        let ext = path.extname(file)
        if (ext === '.js') {
          let modelName = path.basename(file, '.js')
          let schema = require(modelPath + '/' + modelName)(mongoose)

          // EXPL: Add text index if enabled
          if (config.enableTextSearch) {
            schema.index({ '$**': 'text' })
          }
          schemas[schema.statics.collectionName] = schema
        }
      }

      if (config.enableAuditLog) {
        let schema = require('../models/audit-log.model')(mongoose)
        schemas[schema.statics.collectionName] = schema
      }

      let extendedSchemas = {}

      for (let schemaKey in schemas) {
        let schema = schemas[schemaKey]
        extendedSchemas[schemaKey] = modelHelper.extendSchemaAssociations(
          schema,
          mongoose,
          modelPath
        )
      }

      for (let schemaKey in extendedSchemas) {
        let schema = extendedSchemas[schemaKey]
        extendedSchemas[schemaKey] = modelHelper.addDuplicateFields(
          schema,
          schemas
        )
      }

      for (let schemaKey in extendedSchemas) {
        // EXPL: Create models with final schemas
        let schema = extendedSchemas[schemaKey]
        models[schemaKey] = modelHelper.createModel(schema, mongoose)
      }

      for (let modelKey in models) {
        // EXPL: Populate internal model associations
        let model = models[modelKey]
        modelHelper.associateModels(model.schema, models)
      }

      for (let modelKey in models) {
        // EXPL: Generate scopes if enabled
        if (config.generateRouteScopes) {
          let model = models[modelKey]
          authHelper.generateScopeForModel(model, logger)
        }
      }

      resolve(models)
    })
  })
}
