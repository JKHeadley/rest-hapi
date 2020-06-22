'use strict'

const modelHelper = require('./model-helper')
const authHelper = require('./auth-helper')
const fs = require('fs')
const path = require('path')

/**
 * This module reads in all the model files and generates the corresponding mongoose models.
 * @param mongoose
 * @param logger
 * @param config
 * @returns {*|promise}
 */
module.exports = function(mongoose, logger, config) {
  const Log = logger.bind('model-generator')

  const models = {}
  const schemas = {}
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

      for (const file of files) {
        // EXPL: Import all the model schemas
        const ext = path.extname(file)
        if (ext === '.js') {
          const modelName = path.basename(file, '.js')
          const schema = require(modelPath + '/' + modelName).default(mongoose)

          // EXPL: Add text index if enabled
          if (config.enableTextSearch) {
            schema.index({ '$**': 'text' })
          }
          schemas[schema.statics.collectionName] = schema
        }
      }

      if (config.enableAuditLog) {
        const schema = require('../models/audit-log.model')(mongoose)
        schemas[schema.statics.collectionName] = schema
      }

      const extendedSchemas = {}

      for (const schemaKey in schemas) {
        const schema = schemas[schemaKey]
        extendedSchemas[schemaKey] = modelHelper.extendSchemaAssociations(
          schema,
          mongoose,
          modelPath
        )
      }

      for (const schemaKey in extendedSchemas) {
        const schema = extendedSchemas[schemaKey]
        extendedSchemas[schemaKey] = modelHelper.addDuplicateFields(
          schema,
          schemas
        )
      }

      for (const schemaKey in extendedSchemas) {
        // EXPL: Create models with final schemas
        const schema = extendedSchemas[schemaKey]
        models[schemaKey] = modelHelper.createModel(schema, mongoose)
      }

      for (const modelKey in models) {
        // EXPL: Populate internal model associations
        const model = models[modelKey]
        modelHelper.associateModels(model.schema, models)
      }

      for (const modelKey in models) {
        // EXPL: Generate scopes if enabled
        if (config.generateRouteScopes) {
          const model = models[modelKey]
          authHelper.generateScopeForModel(model, logger)
        }
      }

      resolve(models)
    })
  })
}
