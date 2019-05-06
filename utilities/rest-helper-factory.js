'use strict'

let Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
let _ = require('lodash')
let assert = require('assert')
let joiMongooseHelper = require('./joi-mongoose-helper')
let validationHelper = require('./validation-helper')
let authHelper = require('./auth-helper')
let chalk = require('chalk')
let config = require('../config')
let restHapiPolicies = require('./policy-generator')

// TODO: remove "options"?
// TODO: change model "alias" to "routeAlias" (or remove the option)

module.exports = function(logger, mongoose, server) {
  let HandlerHelper = require('./handler-helper-factory')()

  let headersValidation

  if (config.authStrategy) {
    headersValidation = Joi.object({
      authorization: Joi.string().required()
    }).options({ allowUnknown: true })
  } else {
    headersValidation = Joi.object().options({ allowUnknown: true })
  }

  return {
    defaultHeadersValidation: headersValidation,

    /**
     * Generates the restful API endpoints for a single model.
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: options object.
     */
    generateRoutes: function(server, model, options) {
      // TODO: generate multiple DELETE routes at /RESOURCE and at
      // TODO: /RESOURCE/{ownerId}/ASSOCIATION that take a list of Id's as a payload
      try {
        validationHelper.validateModel(model, logger)

        let collectionName = model.collectionDisplayName || model.modelName

        let Log = logger.bind(chalk.blue(collectionName))

        options = options || {}

        if (model.routeOptions.allowRead !== false) {
          this.generateListEndpoint(server, model, options, Log)
          this.generateFindEndpoint(server, model, options, Log)
        }

        if (model.routeOptions.allowCreate !== false) {
          this.generateCreateEndpoint(server, model, options, Log)
        }

        if (model.routeOptions.allowUpdate !== false) {
          this.generateUpdateEndpoint(server, model, options, Log)
        }

        if (model.routeOptions.allowDelete !== false) {
          this.generateDeleteOneEndpoint(server, model, options, Log)
          this.generateDeleteManyEndpoint(server, model, options, Log)
        }

        if (model.routeOptions.associations) {
          for (let associationName in model.routeOptions.associations) {
            let association = model.routeOptions.associations[associationName]

            if (
              association.type === 'MANY_MANY' ||
              association.type === 'ONE_MANY' ||
              association.type === '_MANY'
            ) {
              if (association.allowAdd !== false) {
                this.generateAssociationAddOneEndpoint(
                  server,
                  model,
                  association,
                  options,
                  Log
                )
                this.generateAssociationAddManyEndpoint(
                  server,
                  model,
                  association,
                  options,
                  Log
                )
              }
              if (association.allowRemove !== false) {
                this.generateAssociationRemoveOneEndpoint(
                  server,
                  model,
                  association,
                  options,
                  Log
                )
                this.generateAssociationRemoveManyEndpoint(
                  server,
                  model,
                  association,
                  options,
                  Log
                )
              }

              if (association.allowRead !== false) {
                this.generateAssociationGetAllEndpoint(
                  server,
                  model,
                  association,
                  options,
                  Log
                )
              }
            }
          }
        }

        if (model.routeOptions && model.routeOptions.extraEndpoints) {
          for (let extraEndpointIndex in model.routeOptions.extraEndpoints) {
            let extraEndpointFunction =
              model.routeOptions.extraEndpoints[extraEndpointIndex]

            extraEndpointFunction(server, model, options, Log)
          }
        }
      } catch (error) {
        logger.error('Error:', error)
        throw error
      }
    },

    /**
     * Creates an endpoint for GET /RESOURCE.
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateListEndpoint: function(server, model, options, logger) {
      // This line must come first
      validationHelper.validateModel(model, logger)
      const Log = logger.bind(chalk.yellow('List'))

      let collectionName = model.collectionDisplayName || model.modelName
      options = options || {}

      if (config.logRoutes) {
        Log.note('Generating List endpoint for ' + collectionName)
      }

      let resourceAliasForRoute

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName
      } else {
        resourceAliasForRoute = model.modelName
      }

      let handler = HandlerHelper.generateListHandler(model, options, Log)

      let queryModel = joiMongooseHelper.generateJoiListQueryModel(model, Log)

      let readModel = joiMongooseHelper.generateJoiReadModel(model, Log)

      if (!config.enableResponseValidation) {
        let label = readModel._flags.label
        readModel = Joi.alternatives()
          .try(readModel, Joi.any())
          .label(label)
      }

      let auth = false
      let listHeadersValidation = Object.assign(headersValidation, {})

      if (config.authStrategy && model.routeOptions.readAuth !== false) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(model, 'read', Log)

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug('Scope for GET/' + resourceAliasForRoute + ':', scope)
          }
        }
      } else {
        listHeadersValidation = null
      }

      let policies = []

      if (model.routeOptions.policies && config.enablePolicies) {
        policies = model.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.readPolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(model, Log))
        policies.push(restHapiPolicies.enforceDocumentScopePost(model, Log))
      }

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: auth,
          description: 'Get a list of ' + collectionName + 's',
          tags: ['api', collectionName],
          cors: config.cors,
          validate: {
            query: queryModel,
            headers: listHeadersValidation
          },
          plugins: {
            model: model,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 200,
                  message: 'The resource(s) was/were found successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            failAction: config.enableResponseFail ? 'error' : 'log',
            schema: Joi.alternatives()
              .try(
                Joi.object({
                  docs: Joi.array()
                    .items(readModel)
                    .label(collectionName + 'ArrayModel'),
                  pages: Joi.any(),
                  items: Joi.any()
                }),
                Joi.number()
              )
              .label(collectionName + 'ListModel')
          }
        }
      })
    },

    /**
     * Creates an endpoint for GET /RESOURCE/{_id}
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateFindEndpoint: function(server, model, options, logger) {
      // This line must come first
      validationHelper.validateModel(model, logger)
      const Log = logger.bind(chalk.yellow('Find'))

      let collectionName = model.collectionDisplayName || model.modelName
      if (config.logRoutes) {
        Log.note('Generating Find endpoint for ' + collectionName)
      }

      let resourceAliasForRoute

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName
      } else {
        resourceAliasForRoute = model.modelName
      }

      let handler = HandlerHelper.generateFindHandler(model, options, Log)

      let queryModel = joiMongooseHelper.generateJoiFindQueryModel(model, Log)

      let readModel =
        model.readModel || joiMongooseHelper.generateJoiReadModel(model, Log)

      if (!config.enableResponseValidation) {
        let label = readModel._flags.label
        readModel = Joi.alternatives()
          .try(readModel, Joi.any())
          .label(label)
      }

      let auth = false
      let findHeadersValidation = Object.assign(headersValidation, {})

      if (config.authStrategy && model.routeOptions.readAuth !== false) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(model, 'read', Log)

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for GET/' + resourceAliasForRoute + '/{_id}' + ':',
              scope
            )
          }
        }
      } else {
        findHeadersValidation = null
      }

      let policies = []

      if (model.routeOptions.policies && config.enablePolicies) {
        policies = model.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.readPolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(model, Log))
        policies.push(restHapiPolicies.enforceDocumentScopePost(model, Log))
      }

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute + '/{_id}',
        config: {
          handler: handler,
          auth: auth,
          description: 'Get a specific ' + collectionName,
          tags: ['api', collectionName],
          cors: config.cors,
          validate: {
            query: queryModel,
            params: {
              _id: Joi.objectId().required()
            },
            headers: findHeadersValidation
          },
          plugins: {
            model: model,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 200,
                  message: 'The resource(s) was/were found successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            failAction: config.enableResponseFail ? 'error' : 'log',
            schema: readModel
          }
        }
      })
    },

    /**
     * Creates an endpoint for POST /RESOURCE
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateCreateEndpoint: function(server, model, options, logger) {
      // This line must come first
      validationHelper.validateModel(model, logger)
      const Log = logger.bind(chalk.yellow('Create'))

      let collectionName = model.collectionDisplayName || model.modelName
      if (config.logRoutes) {
        Log.note('Generating Create endpoint for ' + collectionName)
      }

      options = options || {}

      let resourceAliasForRoute

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName
      } else {
        resourceAliasForRoute = model.modelName
      }

      let handler = HandlerHelper.generateCreateHandler(model, options, Log)

      let createModel = joiMongooseHelper.generateJoiCreateModel(model, Log)

      if (!config.enablePayloadValidation) {
        let label = createModel._flags.label
        createModel = Joi.alternatives()
          .try(createModel, Joi.any())
          .label(label)
      }

      // EXPL: support bulk creates
      createModel = Joi.alternatives().try(
        Joi.array().items(createModel),
        createModel
      )

      let readModel = joiMongooseHelper.generateJoiReadModel(model, Log)
      let label = readModel._flags.label

      readModel = Joi.alternatives()
        .try(Joi.array().items(readModel), readModel)
        .label(label)

      if (!config.enableResponseValidation) {
        readModel = Joi.alternatives()
          .try(readModel, Joi.any())
          .label(label)
      }

      let auth = false
      let createHeadersValidation = Object.assign(headersValidation, {})

      if (config.authStrategy && model.routeOptions.createAuth !== false) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(model, 'create', Log)

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug('Scope for POST/' + resourceAliasForRoute + ':', scope)
          }
        }
      } else {
        createHeadersValidation = null
      }

      let policies = []

      if (model.routeOptions.policies && config.enablePolicies) {
        policies = model.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.createPolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        let authorizeDocumentCreator =
          model.routeOptions.authorizeDocumentCreator === undefined
            ? config.authorizeDocumentCreator
            : model.routeOptions.authorizeDocumentCreator
        let authorizeDocumentCreatorToRead =
          model.routeOptions.authorizeDocumentCreatorToRead === undefined
            ? config.authorizeDocumentCreatorToRead
            : model.routeOptions.authorizeDocumentCreatorToRead
        let authorizeDocumentCreatorToUpdate =
          model.routeOptions.authorizeDocumentCreatorToUpdate === undefined
            ? config.authorizeDocumentCreatorToUpdate
            : model.routeOptions.authorizeDocumentCreatorToUpdate
        let authorizeDocumentCreatorToDelete =
          model.routeOptions.authorizeDocumentCreatorToDelete === undefined
            ? config.authorizeDocumentCreatorToDelete
            : model.routeOptions.authorizeDocumentCreatorToDelete
        let authorizeDocumentCreatorToAssociate =
          model.routeOptions.authorizeDocumentCreatorToAssociate === undefined
            ? config.authorizeDocumentCreatorToAssociate
            : model.routeOptions.authorizeDocumentCreatorToAssociate

        if (authorizeDocumentCreator) {
          policies.push(restHapiPolicies.authorizeDocumentCreator(model, Log))
        }
        if (authorizeDocumentCreatorToRead) {
          policies.push(
            restHapiPolicies.authorizeDocumentCreatorToRead(model, Log)
          )
        }
        if (authorizeDocumentCreatorToUpdate) {
          policies.push(
            restHapiPolicies.authorizeDocumentCreatorToUpdate(model, Log)
          )
        }
        if (authorizeDocumentCreatorToDelete) {
          policies.push(
            restHapiPolicies.authorizeDocumentCreatorToDelete(model, Log)
          )
        }
        if (authorizeDocumentCreatorToAssociate) {
          policies.push(
            restHapiPolicies.authorizeDocumentCreatorToAssociate(model, Log)
          )
        }

        if (model.routeOptions.documentScope) {
          policies.push(restHapiPolicies.addDocumentScope(model, Log))
        }
      }

      if (config.enableCreatedBy) {
        policies.push(restHapiPolicies.addCreatedBy(model, Log))
      }

      if (config.enableDuplicateFields) {
        policies.push(
          restHapiPolicies.populateDuplicateFields(model, mongoose, Log)
        )
      }

      if (config.enableAuditLog) {
        policies.push(restHapiPolicies.logCreate(mongoose, model, Log))
      }

      server.route({
        method: 'POST',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description: 'Create one or more new ' + collectionName + 's',
          tags: ['api', collectionName],
          validate: {
            payload: createModel,
            headers: createHeadersValidation
          },
          plugins: {
            model: model,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 201,
                  message: 'The resource was created successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            failAction: config.enableResponseFail ? 'error' : 'log',
            schema: readModel
          }
        }
      })
    },

    /**
     * Creates an endpoint for DELETE /RESOURCE/{_id}
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateDeleteOneEndpoint: function(server, model, options, logger) {
      // This line must come first
      validationHelper.validateModel(model, logger)
      const Log = logger.bind(chalk.yellow('DeleteOne'))

      let collectionName = model.collectionDisplayName || model.modelName
      if (config.logRoutes) {
        Log.note('Generating Delete One endpoint for ' + collectionName)
      }

      options = options || {}

      let resourceAliasForRoute

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName
      } else {
        resourceAliasForRoute = model.modelName
      }

      let handler = HandlerHelper.generateDeleteHandler(model, options, Log)

      let payloadModel = null
      if (config.enableSoftDelete) {
        payloadModel = Joi.object({ hardDelete: Joi.bool() }).allow(null)

        if (!config.enablePayloadValidation) {
          payloadModel = Joi.alternatives().try(payloadModel, Joi.any())
        }
      }

      let auth = false
      let deleteOneHeadersValidation = Object.assign(headersValidation, {})

      if (config.authStrategy && model.routeOptions.deleteAuth !== false) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(model, 'delete', Log)

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for DELETE/' + resourceAliasForRoute + '/{_id}' + ':',
              scope
            )
          }
        }
      } else {
        deleteOneHeadersValidation = null
      }

      let policies = []

      if (model.routeOptions.policies && config.enablePolicies) {
        policies = model.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.deletePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(model, Log))
        policies.push(restHapiPolicies.enforceDocumentScopePost(model, Log))
      }

      if (config.enableDeletedBy && config.enableSoftDelete) {
        policies.push(restHapiPolicies.addDeletedBy(model, Log))
      }

      if (config.enableAuditLog) {
        policies.push(restHapiPolicies.logDelete(mongoose, model, Log))
      }

      server.route({
        method: 'DELETE',
        path: '/' + resourceAliasForRoute + '/{_id}',
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description: 'Delete a ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            params: {
              _id: Joi.objectId().required()
            },
            payload: payloadModel,
            headers: deleteOneHeadersValidation
          },
          plugins: {
            model: model,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 200,
                  message: 'The resource was deleted successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            // TODO: add a response schema if needed
            // failAction: config.enableResponseFail ? 'error' : 'log',
            // schema: model.readModel ? model.readModel : Joi.object().unknown().optional()
          }
        }
      })
    },

    /**
     * Creates an endpoint for DELETE /RESOURCE/
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    // TODO: handle partial deletes (return list of ids that failed/were not found)
    generateDeleteManyEndpoint: function(server, model, options, logger) {
      // This line must come first
      validationHelper.validateModel(model, logger)
      const Log = logger.bind(chalk.yellow('DeleteMany'))

      let collectionName = model.collectionDisplayName || model.modelName
      if (config.logRoutes) {
        Log.note('Generating Delete Many endpoint for ' + collectionName)
      }

      options = options || {}

      let resourceAliasForRoute

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName
      } else {
        resourceAliasForRoute = model.modelName
      }

      let handler = HandlerHelper.generateDeleteHandler(model, options, Log)

      let payloadModel = null
      if (config.enableSoftDelete) {
        payloadModel = Joi.alternatives().try(
          Joi.array().items(
            Joi.object({
              _id: Joi.objectId(),
              hardDelete: Joi.bool().default(false)
            })
          ),
          Joi.array().items(Joi.objectId())
        )
      } else {
        payloadModel = Joi.array().items(Joi.objectId())
      }

      if (!config.enablePayloadValidation) {
        payloadModel = Joi.alternatives().try(payloadModel, Joi.any())
      }

      let auth = false
      let deleteManyHeadersValidation = Object.assign(headersValidation, {})

      if (config.authStrategy && model.routeOptions.deleteAuth !== false) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(model, 'delete', Log)

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug('Scope for DELETE/' + resourceAliasForRoute + ':', scope)
          }
        }
      } else {
        deleteManyHeadersValidation = null
      }

      let policies = []

      if (model.routeOptions.policies && config.enablePolicies) {
        policies = model.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.deletePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(model, Log))
        policies.push(restHapiPolicies.enforceDocumentScopePost(model, Log))
      }

      if (config.enableDeletedBy && config.enableSoftDelete) {
        policies.push(restHapiPolicies.addDeletedBy(model, Log))
      }

      if (config.enableAuditLog) {
        policies.push(restHapiPolicies.logDelete(mongoose, model, Log))
      }

      server.route({
        method: 'DELETE',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description: 'Delete multiple ' + collectionName + 's',
          tags: ['api', collectionName],
          validate: {
            payload: payloadModel,
            headers: deleteManyHeadersValidation
          },
          plugins: {
            model: model,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 200,
                  message: 'The resource was deleted successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            // TODO: add a response schema if needed
            // failAction: config.enableResponseFail ? 'error' : 'log',
            // schema: model.readModel ? model.readModel : Joi.object().unknown().optional()
          }
        }
      })
    },

    /**
     * Creates an endpoint for PUT /RESOURCE/{_id}
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateUpdateEndpoint: function(server, model, options, logger) {
      // This line must come first
      validationHelper.validateModel(model, logger)
      const Log = logger.bind(chalk.yellow('Update'))

      let collectionName = model.collectionDisplayName || model.modelName
      if (config.logRoutes) {
        Log.note('Generating Update endpoint for ' + collectionName)
      }

      options = options || {}

      let resourceAliasForRoute

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName
      } else {
        resourceAliasForRoute = model.modelName
      }

      let handler = HandlerHelper.generateUpdateHandler(model, options, Log)

      let updateModel = joiMongooseHelper.generateJoiUpdateModel(model, Log)

      if (!config.enablePayloadValidation) {
        let label = updateModel._flags.label
        updateModel = Joi.alternatives()
          .try(updateModel, Joi.any())
          .label(label)
      }

      let readModel = joiMongooseHelper.generateJoiReadModel(model, Log)

      if (!config.enableResponseValidation) {
        let label = readModel._flags.label
        readModel = Joi.alternatives()
          .try(readModel, Joi.any())
          .label(label)
      }

      let auth = false
      let updateHeadersValidation = Object.assign(headersValidation, {})

      if (config.authStrategy && model.routeOptions.updateAuth !== false) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(model, 'update', Log)

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for PUT/' + resourceAliasForRoute + '/{_id}' + ':',
              scope
            )
          }
        }
      } else {
        updateHeadersValidation = null
      }

      let policies = []

      if (model.routeOptions.policies && config.enablePolicies) {
        policies = model.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.updatePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(model, Log))
        policies.push(restHapiPolicies.enforceDocumentScopePost(model, Log))
      }

      if (config.enableUpdatedBy) {
        policies.push(restHapiPolicies.addUpdatedBy(model, Log))
      }

      if (config.enableDuplicateFields) {
        policies.push(
          restHapiPolicies.populateDuplicateFields(model, mongoose, Log)
        )
        if (config.trackDuplicatedFields) {
          policies.push(
            restHapiPolicies.trackDuplicatedFields(model, mongoose, Log)
          )
        }
      }

      if (config.enableAuditLog) {
        policies.push(restHapiPolicies.logUpdate(mongoose, model, Log))
      }

      server.route({
        method: 'PUT',
        path: '/' + resourceAliasForRoute + '/{_id}',
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description: 'Update a ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            params: {
              _id: Joi.objectId().required()
            },
            payload: updateModel,
            headers: updateHeadersValidation
          },
          plugins: {
            model: model,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 200,
                  message: 'The resource was updated successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            failAction: config.enableResponseFail ? 'error' : 'log',
            schema: readModel
          }
        }
      })
    },

    /**
     * Creates an endpoint for PUT /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateAssociationAddOneEndpoint: function(
      server,
      ownerModel,
      association,
      options,
      logger
    ) {
      // This line must come first
      validationHelper.validateModel(ownerModel, logger)
      const Log = logger.bind(chalk.yellow('AddOne'))

      assert(
        ownerModel.routeOptions.associations,
        'model associations must exist'
      )
      assert(association, 'association input must exist')

      let associationName =
        association.include.as || association.include.model.modelName
      let ownerModelName =
        ownerModel.collectionDisplayName || ownerModel.modelName
      let childModel = association.include.model

      let childModelName =
        childModel.collectionDisplayName || childModel.modelName

      if (config.logRoutes) {
        Log.note(
          'Generating addOne association endpoint for ' +
            ownerModelName +
            ' -> ' +
            associationName
        )
      }

      options = options || {}

      let ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
      let childAlias = association.alias || association.include.model.modelName

      let handler = HandlerHelper.generateAssociationAddOneHandler(
        ownerModel,
        association,
        options,
        Log
      )

      let payloadValidation = null

      // EXPL: A payload is only relevant if a through model is defined
      if (association.include.through) {
        payloadValidation = joiMongooseHelper.generateJoiCreateModel(
          association.include.through,
          Log
        )
        payloadValidation._inner.children = payloadValidation._inner.children.filter(
          function(key) {
            return key.key !== ownerModelName && key.key !== childModelName
          }
        )

        if (!config.enablePayloadValidation) {
          let label = payloadValidation._flags.label
          payloadValidation = Joi.alternatives()
            .try(payloadValidation, Joi.any())
            .label(label)
        }
      }

      let auth = false
      let addOneHeadersValidation = Object.assign(headersValidation, {})

      if (ownerModel.routeOptions.associateAuth === false) {
        Log.warning(
          '"associateAuth" property is deprecated, please use "addAuth" instead.'
        )
      }

      if (
        config.authStrategy &&
        ownerModel.routeOptions.associateAuth !== false &&
        association.addAuth !== false
      ) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(
          ownerModel,
          'associate',
          Log
        )
        let addScope =
          'add' +
          ownerModelName[0].toUpperCase() +
          ownerModelName.slice(1) +
          associationName[0].toUpperCase() +
          associationName.slice(1) +
          'Scope'
        scope = scope.concat(
          authHelper.generateScopeForEndpoint(ownerModel, addScope, Log)
        )

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for PUT/' +
                ownerAlias +
                '/{ownerId}/' +
                childAlias +
                '/{childId}' +
                ':',
              scope
            )
          }
        }
      } else {
        addOneHeadersValidation = null
      }

      let policies = []

      if (ownerModel.routeOptions.policies) {
        policies = ownerModel.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.associatePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(ownerModel, Log))
        policies.push(
          restHapiPolicies.enforceDocumentScopePost(ownerModel, Log)
        )
      }

      if (config.enableAuditLog) {
        policies.push(
          restHapiPolicies.logAdd(
            mongoose,
            ownerModel,
            childModel,
            association.type,
            Log
          )
        )
      }

      server.route({
        method: 'PUT',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + '/{childId}',
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description:
            'Add a single ' +
            childModelName +
            ' to a ' +
            ownerModelName +
            "'s list of " +
            associationName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required(),
              childId: Joi.objectId().required()
            },
            payload: payloadValidation,
            headers: addOneHeadersValidation
          },
          plugins: {
            ownerModel: ownerModel,
            association: association,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 204,
                  message: 'The association was added successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            // failAction: config.enableResponseFail ? 'error' : 'log',
          } // TODO: verify what response schema is needed here
        }
      })
    },

    /**
     * Creates an endpoint for DELETE /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateAssociationRemoveOneEndpoint: function(
      server,
      ownerModel,
      association,
      options,
      logger
    ) {
      // This line must come first
      validationHelper.validateModel(ownerModel, logger)
      const Log = logger.bind(chalk.yellow('RemoveOne'))

      assert(
        ownerModel.routeOptions.associations,
        'model associations must exist'
      )
      assert(association, 'association input must exist')

      let associationName =
        association.include.as || association.include.model.modelName
      let ownerModelName =
        ownerModel.collectionDisplayName || ownerModel.modelName
      let childModel = association.include.model

      let childModelName =
        childModel.collectionDisplayName || childModel.modelName

      if (config.logRoutes) {
        Log.note(
          'Generating removeOne association endpoint for ' +
            ownerModelName +
            ' -> ' +
            associationName
        )
      }

      options = options || {}

      let ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
      let childAlias = association.alias || association.include.model.modelName

      let handler = HandlerHelper.generateAssociationRemoveOneHandler(
        ownerModel,
        association,
        options,
        Log
      )

      let auth = false
      let removeOneHeadersValidation = Object.assign(headersValidation, {})

      if (ownerModel.routeOptions.associateAuth === false) {
        Log.warning(
          '"associateAuth" property is deprecated, please use "removeAuth" instead.'
        )
      }

      if (
        config.authStrategy &&
        ownerModel.routeOptions.associateAuth !== false &&
        association.removeAuth !== false
      ) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(
          ownerModel,
          'associate',
          Log
        )
        let removeScope =
          'remove' +
          ownerModelName[0].toUpperCase() +
          ownerModelName.slice(1) +
          associationName[0].toUpperCase() +
          associationName.slice(1) +
          'Scope'
        scope = scope.concat(
          authHelper.generateScopeForEndpoint(ownerModel, removeScope, Log)
        )

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for DELETE/' +
                ownerAlias +
                '/{ownerId}/' +
                childAlias +
                '/{childId}' +
                ':',
              scope
            )
          }
        }
      } else {
        removeOneHeadersValidation = null
      }

      let policies = []

      if (ownerModel.routeOptions.policies) {
        policies = ownerModel.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.associatePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(ownerModel, Log))
        policies.push(
          restHapiPolicies.enforceDocumentScopePost(ownerModel, Log)
        )
      }

      if (config.enableAuditLog) {
        policies.push(
          restHapiPolicies.logRemove(
            mongoose,
            ownerModel,
            childModel,
            association.type,
            Log
          )
        )
      }

      server.route({
        method: 'DELETE',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + '/{childId}',
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description:
            'Remove a single ' +
            childModelName +
            ' from a ' +
            ownerModelName +
            "'s list of " +
            associationName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required(),
              childId: Joi.objectId().required()
            },
            headers: removeOneHeadersValidation
          },
          plugins: {
            ownerModel: ownerModel,
            association: association,
            'hapi-swagger': {
              responseMessages: [
                {
                  code: 204,
                  message: 'The association was deleted successfully.'
                },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            // failAction: config.enableResponseFail ? 'error' : 'log',
          }
        }
      })
    },

    /**
     * Creates an endpoint for POST /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateAssociationAddManyEndpoint: function(
      server,
      ownerModel,
      association,
      options,
      logger
    ) {
      // This line must come first
      validationHelper.validateModel(ownerModel, logger)
      const Log = logger.bind(chalk.yellow('AddMany'))

      assert(
        ownerModel.routeOptions.associations,
        'model associations must exist'
      )
      assert(association, 'association input must exist')

      let associationName =
        association.include.as || association.include.model.modelName
      let ownerModelName =
        ownerModel.collectionDisplayName || ownerModel.modelName
      let childModel = association.include.model

      let childModelName =
        childModel.collectionDisplayName || childModel.modelName

      if (config.logRoutes) {
        Log.note(
          'Generating addMany association endpoint for ' +
            ownerModelName +
            ' -> ' +
            associationName
        )
      }

      options = options || {}

      let ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
      let childAlias = association.alias || association.include.model.modelName

      let handler = HandlerHelper.generateAssociationAddManyHandler(
        ownerModel,
        association,
        options,
        Log
      )

      let payloadValidation
      let label = ''

      if (association.include && association.include.through) {
        payloadValidation = joiMongooseHelper.generateJoiCreateModel(
          association.include.through,
          Log
        )
        payloadValidation._inner.children = payloadValidation._inner.children.filter(
          function(key) {
            return key.key !== ownerModelName && key.key !== childModelName
          }
        )
        label = payloadValidation._flags.label + '_many'
        payloadValidation = payloadValidation.keys({
          childId: Joi.objectId().description(
            'the ' + childModelName + "'s _id"
          )
        })
        payloadValidation = Joi.array().items(payloadValidation)

        payloadValidation = Joi.alternatives()
          .try(payloadValidation, Joi.array().items(Joi.objectId()))
          .label(label || 'blank')
          .required()
      } else {
        payloadValidation = Joi.array()
          .items(Joi.objectId())
          .required()
      }

      if (!config.enablePayloadValidation) {
        label = payloadValidation._flags.label
        payloadValidation = Joi.alternatives()
          .try(payloadValidation, Joi.any())
          .label(label || 'blank')
      }

      let auth = false
      let addManyHeadersValidation = Object.assign(headersValidation, {})

      if (ownerModel.routeOptions.associateAuth === false) {
        Log.warning(
          '"associateAuth" property is deprecated, please use "addAuth" instead.'
        )
      }

      if (
        config.authStrategy &&
        ownerModel.routeOptions.associateAuth !== false &&
        association.addAuth !== false
      ) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(
          ownerModel,
          'associate',
          Log
        )
        let addScope =
          'add' +
          ownerModelName[0].toUpperCase() +
          ownerModelName.slice(1) +
          associationName[0].toUpperCase() +
          associationName.slice(1) +
          'Scope'
        scope = scope.concat(
          authHelper.generateScopeForEndpoint(ownerModel, addScope, Log)
        )

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for POST/' + ownerAlias + '/{ownerId}/' + childAlias + ':',
              scope
            )
          }
        }
      } else {
        addManyHeadersValidation = null
      }

      let policies = []

      if (ownerModel.routeOptions.policies) {
        policies = ownerModel.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.associatePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(ownerModel, Log))
        policies.push(
          restHapiPolicies.enforceDocumentScopePost(ownerModel, Log)
        )
      }

      if (config.enableAuditLog) {
        policies.push(
          restHapiPolicies.logAdd(
            mongoose,
            ownerModel,
            childModel,
            association.type,
            Log
          )
        )
      }

      server.route({
        method: 'POST',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description:
            'Add multiple ' +
            childModelName +
            's to a ' +
            ownerModelName +
            "'s list of " +
            associationName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required()
            },
            payload: payloadValidation,
            headers: addManyHeadersValidation
          },
          plugins: {
            ownerModel: ownerModel,
            association: association,
            'hapi-swagger': {
              responseMessages: [
                { code: 204, message: 'The association was set successfully.' },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            // failAction: config.enableResponseFail ? 'error' : 'log',
          }
        }
      })
    },

    /**
     * Creates an endpoint for DELETE /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateAssociationRemoveManyEndpoint: function(
      server,
      ownerModel,
      association,
      options,
      logger
    ) {
      // This line must come first
      validationHelper.validateModel(ownerModel, logger)
      const Log = logger.bind(chalk.yellow('RemoveMany'))

      assert(
        ownerModel.routeOptions.associations,
        'model associations must exist'
      )
      assert(association, 'association input must exist')

      let associationName =
        association.include.as || association.include.model.modelName
      let ownerModelName =
        ownerModel.collectionDisplayName || ownerModel.modelName
      let childModel = association.include.model

      let childModelName =
        childModel.collectionDisplayName || childModel.modelName

      if (config.logRoutes) {
        Log.note(
          'Generating removeMany association endpoint for ' +
            ownerModelName +
            ' -> ' +
            associationName
        )
      }

      options = options || {}

      let ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
      let childAlias = association.alias || association.include.model.modelName

      let handler = HandlerHelper.generateAssociationRemoveManyHandler(
        ownerModel,
        association,
        options,
        Log
      )

      let payloadValidation = Joi.array()
        .items(Joi.objectId())
        .required()

      payloadValidation = config.enablePayloadValidation
        ? payloadValidation
        : Joi.any()
      payloadValidation = payloadValidation.description(
        'An array of _ids to remove.'
      )

      let auth = false
      let removeManyHeadersValidation = Object.assign(headersValidation, {})

      if (ownerModel.routeOptions.associateAuth === false) {
        Log.warning(
          '"associateAuth" property is deprecated, please use "removeAuth" instead.'
        )
      }

      if (
        config.authStrategy &&
        ownerModel.routeOptions.associateAuth !== false &&
        association.removeAuth !== false
      ) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(
          ownerModel,
          'associate',
          Log
        )
        let removeScope =
          'remove' +
          ownerModelName[0].toUpperCase() +
          ownerModelName.slice(1) +
          associationName[0].toUpperCase() +
          associationName.slice(1) +
          'Scope'
        scope = scope.concat(
          authHelper.generateScopeForEndpoint(ownerModel, removeScope, Log)
        )

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for DELETE/' +
                ownerAlias +
                '/{ownerId}/' +
                childAlias +
                ':',
              scope
            )
          }
        }
      } else {
        removeManyHeadersValidation = null
      }

      let policies = []

      if (ownerModel.routeOptions.policies) {
        policies = ownerModel.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.associatePolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(ownerModel, Log))
        policies.push(
          restHapiPolicies.enforceDocumentScopePost(ownerModel, Log)
        )
      }

      if (config.enableAuditLog) {
        policies.push(
          restHapiPolicies.logRemove(
            mongoose,
            ownerModel,
            childModel,
            association.type,
            Log
          )
        )
      }

      server.route({
        method: 'DELETE',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description:
            'Remove multiple ' +
            childModelName +
            's from a ' +
            ownerModelName +
            "'s list of " +
            associationName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required()
            },
            payload: payloadValidation,
            headers: removeManyHeadersValidation
          },
          plugins: {
            ownerModel: ownerModel,
            association: association,
            'hapi-swagger': {
              responseMessages: [
                { code: 204, message: 'The association was set successfully.' },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            // failAction: config.enableResponseFail ? 'error' : 'log',
          }
        }
      })
    },

    /**
     * Creates an endpoint for GET /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     */
    generateAssociationGetAllEndpoint: function(
      server,
      ownerModel,
      association,
      options,
      logger
    ) {
      // This line must come first
      validationHelper.validateModel(ownerModel, logger)
      const Log = logger.bind(chalk.yellow('GetAll'))

      assert(
        ownerModel.routeOptions.associations,
        'model associations must exist'
      )
      assert(association, 'association input must exist')

      let associationName =
        association.include.as || association.include.model.modelName
      let ownerModelName =
        ownerModel.collectionDisplayName || ownerModel.modelName

      if (config.logRoutes) {
        Log.note(
          'Generating list association endpoint for ' +
            ownerModelName +
            ' -> ' +
            associationName
        )
      }

      options = options || {}

      let ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
      let childAlias = association.alias || association.include.model.modelName

      let childModel = association.include.model

      let handler = HandlerHelper.generateAssociationGetAllHandler(
        ownerModel,
        association,
        options,
        Log
      )

      let queryModel = joiMongooseHelper.generateJoiListQueryModel(
        childModel,
        Log
      )

      let readModel = joiMongooseHelper.generateJoiReadModel(childModel, Log)

      if (association.linkingModel) {
        let associationModel = {}
        associationModel[
          association.linkingModel
        ] = joiMongooseHelper.generateJoiReadModel(
          association.include.through,
          Log
        )
        readModel = readModel.keys(associationModel)
      }

      readModel = readModel.label(
        ownerModelName + '_' + associationName + 'ReadModel'
      )

      if (!config.enableResponseValidation) {
        let label = readModel._flags.label
        readModel = Joi.alternatives()
          .try(readModel, Joi.any())
          .label(label)
      }

      let auth = false
      let getAllHeadersValidation = Object.assign(headersValidation, {})

      if (ownerModel.routeOptions.associateAuth === false) {
        Log.warning(
          '"routeOptions.readAuth" property is deprecated for associations, please use "association.readAuth" instead.'
        )
      }

      if (
        config.authStrategy &&
        ownerModel.routeOptions.readAuth !== false &&
        association.readAuth !== false
      ) {
        auth = {
          strategy: config.authStrategy
        }

        let scope = authHelper.generateScopeForEndpoint(ownerModel, 'read', Log)
        let getScope =
          'get' +
          ownerModelName[0].toUpperCase() +
          ownerModelName.slice(1) +
          associationName[0].toUpperCase() +
          associationName.slice(1) +
          'Scope'
        scope = scope.concat(
          authHelper.generateScopeForEndpoint(ownerModel, getScope, Log)
        )

        if (!_.isEmpty(scope)) {
          auth.scope = scope
          if (config.logScopes) {
            Log.debug(
              'Scope for GET/' + ownerAlias + '/{ownerId}/' + childAlias + ':',
              scope
            )
          }
        }
      } else {
        getAllHeadersValidation = null
      }

      let policies = []

      if (ownerModel.routeOptions.policies) {
        policies = ownerModel.routeOptions.policies
        policies = (policies.rootPolicies || []).concat(
          policies.readPolicies || []
        )
      }

      if (config.enableDocumentScopes && auth) {
        policies.push(restHapiPolicies.enforceDocumentScopePre(ownerModel, Log))
        policies.push(
          restHapiPolicies.enforceDocumentScopePost(ownerModel, Log)
        )
      }

      server.route({
        method: 'GET',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: auth,
          cors: config.cors,
          description:
            'Get all of the ' + associationName + ' for a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            query: queryModel,
            params: {
              ownerId: Joi.objectId().required()
            },
            headers: getAllHeadersValidation
          },
          plugins: {
            ownerModel: ownerModel,
            association: association,
            'hapi-swagger': {
              responseMessages: [
                { code: 200, message: 'The association was set successfully.' },
                { code: 400, message: 'The request was malformed.' },
                {
                  code: 401,
                  message:
                    'The authentication header was missing/malformed, or the token has expired.'
                },
                {
                  code: 404,
                  message: 'There was no resource found with that ID.'
                },
                { code: 500, message: 'There was an unknown error.' },
                {
                  code: 503,
                  message: 'There was a problem with the database.'
                }
              ]
            },
            policies: policies
          },
          response: {
            failAction: config.enableResponseFail ? 'error' : 'log',
            schema: Joi.alternatives()
              .try(
                Joi.object({
                  docs: Joi.array()
                    .items(readModel)
                    .label(
                      ownerModelName + '_' + associationName + 'ArrayModel'
                    ),
                  pages: Joi.any(),
                  items: Joi.any()
                }),
                Joi.number()
              )
              .label(ownerModelName + '_' + associationName + 'ListModel')
          }
        }
      })
    }
  }
}
