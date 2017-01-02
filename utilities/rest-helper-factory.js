var Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
var _ = require('lodash');
var assert = require('assert');
var joiMongooseHelper = require('./joi-mongoose-helper');
var queryHelper = require('./query-helper');
var validationHelper = require("./validation-helper");
var chalk = require('chalk');
var config = require("../config");

//TODO: remove "options"?
//TODO: allow config var to turn off query validation (helps use swagger docs)

module.exports = function (logger, mongoose, server) {
  var logger = logger.bind(chalk.gray('rest-helper-factory'));

  var HandlerHelper = require('./handler-helper-factory')(mongoose, server);

  var headersValidation;

  if (config.auth) {
    headersValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
  }
  else {
    headersValidation = Joi.object().options({allowUnknown: true});
  }

  return {
    defaultHeadersValidation: headersValidation,

    /**
     * Generates the restful API endpoints for a single model.
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: options object.
     */
    generateRoutes: function (server, model, options) { //TODO: generate multiple DELETE routes at /RESOURCE and at
                                                        //TODO: /RESOURCE/{ownerId}/ASSOCIATION that take a list of Id's as a payload
      try {
        // logger.error("MODEL:", model);
        validationHelper.validateModel(model, logger);


        var collectionName = model.collectionDisplayName || model.modelName;
        var Log = logger.bind(chalk.gray(collectionName));

        options = options || {};

        if (model.routeOptions.allowRead !== false) {
          this.generateListEndpoint(server, model, options, Log);
          this.generateFindEndpoint(server, model, options, Log);
        }

        if (model.routeOptions.allowCreate !== false) {
          this.generateCreateEndpoint(server, model, options, Log);
        }

        if (model.routeOptions.allowUpdate !== false) {
          this.generateUpdateEndpoint(server, model, options, Log);
        }

        if (model.routeOptions.allowDelete !== false) {
          this.generateDeleteEndpoint(server, model, options, Log);
        }

        if (model.routeOptions.associations) {
          for (var associationName in model.routeOptions.associations) {
            var association = model.routeOptions.associations[associationName];

            if (association.type == "MANY_MANY" || association.type == "ONE_MANY") {
              if (association.allowAddOne !== false) {
                this.generateAssociationAddOneEndpoint(server, model, association, options, Log);
              }
              if (association.allowRemoveOne !== false) {
                this.generateAssociationRemoveOneEndpoint(server, model, association, options, Log);
              }

              if (association.allowAddMany !== false) {
                this.generateAssociationAddManyEndpoint(server, model, association, options, Log);
              }

              if (association.allowRead !== false) {
                this.generateAssociationGetAllEndpoint(server, model, association, options, Log);
              }
            }
          }
        }

        if(model.routeOptions && model.routeOptions.extraEndpoints){
          for(var extraEndpointIndex in model.routeOptions.extraEndpoints){
            var extraEndpointFunction = model.routeOptions.extraEndpoints[extraEndpointIndex];

            extraEndpointFunction(server, model, options, Log);
          }
        }
      }
      catch(error) {
        logger.error("Error:", error);
        throw(error);
      }
    },

    /**
     * Creates an endpoint for GET /RESOURCE.
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateListEndpoint: function (server, model, options, Log) {
      validationHelper.validateModel(model, Log);

      var collectionName = model.collectionDisplayName || model.modelName;
      Log = Log.bind("List");
      options = options || {};

      Log.note("Generating List endpoint for " + collectionName);

      var resourceAliasForRoute;

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName;
      }
      else {
        resourceAliasForRoute = model.modelName;
      }

      var handler = HandlerHelper.generateListHandler(model, options, Log);

      var queryValidation = {
        $skip: Joi.number().integer().min(0).optional()
        .description('The number of records to skip in the database. This is typically used in pagination.'),
        $limit: Joi.number().integer().min(0).optional()
        .description('The maximum number of records to return. This is typically used in pagination.')
      };

      var queryableFields = queryHelper.getQueryableFields(model, Log);

      var readableFields = queryHelper.getReadableFields(model, Log);

      var sortableFields = queryHelper.getSortableFields(model, Log);

      if (queryableFields && readableFields) {
        queryValidation.$select = Joi.alternatives().try(Joi.string().valid(readableFields), Joi.array().items(Joi.string().valid(readableFields)))
        .description('A list of basic fields to be included in each resource. Valid values include: ' + readableFields);
        // queryValidation.$term = Joi.string().optional()
        //   .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + queryableFields);
        // queryValidation.$searchFields = Joi.string().optional()//TODO: make enumerated array.
        //   .description('A set of fields to apply the \"$term\" search parameter to. If this parameter is not included, the \"$term\" search parameter is applied to all searchable fields. Valid values include: ' + queryableFields);
        queryValidation.$sort = Joi.alternatives().try(Joi.string().valid(sortableFields), Joi.array().items(Joi.string().valid(sortableFields)))
        .description('A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending ' +
          '\'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value). Listing multiple' +
          'fields prioritizes the sort starting with the first field listed. Valid values include: ' + sortableFields);
        queryValidation.$where = Joi.any().optional()
        .description('An optional field for raw mongoose queries.');

        _.each(queryableFields, function (fieldName) {
          queryValidation[fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
        })
      }

      var associations = model.routeOptions ? model.routeOptions.associations : null;
      if (associations) {
        queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
        .description('A set of complex object properties to populate. Valid values include ' + Object.keys(associations));
      }

      var readModel = joiMongooseHelper.generateJoiReadModel(model, Log);

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: config.auth,
          description: 'Get a list of ' + collectionName + 's',
          tags: ['api', collectionName],
          cors: true,
          validate: {
            query: config.enableQueryValidation ? queryValidation : Joi.any(),
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 200, message: 'The resource(s) was/were found successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {
                  code: 401,
                  message: 'The authentication header was missing/malformed, or the token has expired.'
                },
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {
            schema: config.enableResponseValidation ? Joi.array().items(readModel) : Joi.array().items(Joi.any())
            // schema: Joi.array().items(readModel)
            // schema: Joi.array().items(readModel || Joi.object().unknown().optional())
            // schema: Joi.array().items(Joi.any())//TODO: proper validation
          }
        }
      });
    },

    /**
     * Creates an endpoint for GET /RESOURCE/{_id}
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateFindEndpoint: function (server, model, options, Log) {
      validationHelper.validateModel(model, Log);

      var collectionName = model.collectionDisplayName || model.modelName;
      Log = Log.bind("Find");
      Log.note("Generating Find endpoint for " + collectionName);

      var resourceAliasForRoute;

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName;
      }
      else {
        resourceAliasForRoute = model.modelName;
      }

      var handler = HandlerHelper.generateFindHandler(model, options, Log);

      var queryValidation = {};

      var readableFields = queryHelper.getReadableFields(model, Log);

      if (readableFields) {
        queryValidation.$select = Joi.alternatives().try(Joi.string().valid(readableFields), Joi.array().items(Joi.string().valid(readableFields)))
        .description('A list of basic fields to be included in each resource. Valid values include: ' + readableFields);
      }

      var associations = model.routeOptions ? model.routeOptions.associations : null;
      if (associations) {
        queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
        .description('A set of complex object properties to populate. Valid values include ' + Object.keys(associations));
      }

      var readModel = model.readModel || joiMongooseHelper.generateJoiReadModel(model, Log);

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute + '/{_id}',
        config: {
          handler: handler,
          auth: config.auth,
          description: 'Get a specific ' + collectionName,
          tags: ['api', collectionName],
          cors: true,
          validate: {
            query: config.enableQueryValidation ? queryValidation : Joi.any(),
            params: {
              _id: Joi.objectId().required()
            },
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 200, message: 'The resource(s) was/were found successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {
                  code: 401,
                  message: 'The authentication header was missing/malformed, or the token has expired.'
                },
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {
            schema: config.enableResponseValidation ? readModel : Joi.any()
          }
        }
      });
    },

    /**
     * Creates an endpoint for POST /RESOURCE
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateCreateEndpoint: function (server, model, options, Log) {
      validationHelper.validateModel(model, Log);

      var collectionName = model.collectionDisplayName || model.modelName;
      Log = Log.bind("Create");
      Log.note("Generating Create endpoint for " + collectionName);

      options = options || {};

      var resourceAliasForRoute;

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName;
      }
      else {
        resourceAliasForRoute = model.modelName;
      }

      var handler = HandlerHelper.generateCreateHandler(model, options, Log);

      var createModel = joiMongooseHelper.generateJoiCreateModel(model, Log);

      var readModel = joiMongooseHelper.generateJoiReadModel(model, Log);

      server.route({
        method: 'POST',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Create a new ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            payload: config.enablePayloadValidation ? createModel : Joi.any(),
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 201, message: 'The resource was created successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {
                  code: 401,
                  message: 'The authentication header was missing/malformed, or the token has expired.'
                },
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {
            schema: config.enableResponseValidation ? readModel : Joi.any()
          }
        }
      });
    },

    /**
     * Creates an endpoint for DELETE /RESOURCE/{_id}
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateDeleteEndpoint: function (server, model, options, Log) {
      validationHelper.validateModel(model, Log);

      var collectionName = model.collectionDisplayName || model.modelName;
      Log = Log.bind("Delete");
      Log.note("Generating Delete endpoint for " + collectionName);

      options = options || {};

      var resourceAliasForRoute;

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName;
      }
      else {
        resourceAliasForRoute = model.modelName;
      }

      var handler = HandlerHelper.generateDeleteHandler(model, options, Log);

      server.route({
        method: 'DELETE',
        path: '/' + resourceAliasForRoute + "/{_id}",
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Delete a ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            params: {
              _id: Joi.objectId().required()
            },
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 200, message: 'The resource was deleted successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {
                  code: 401,
                  message: 'The authentication header was missing/malformed, or the token has expired.'
                },
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {
            //TODO: add a response schema if needed
            //schema: model.readModel ? model.readModel : Joi.object().unknown().optional()
          }
        }
      });
    },

    /**
     * Creates an endpoint for PUT /RESOURCE/{_id}
     * @param server: A Hapi server.
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateUpdateEndpoint: function (server, model, options, Log) {
      validationHelper.validateModel(model, Log);

      var collectionName = model.collectionDisplayName || model.modelName;
      Log = Log.bind("Update");
      Log.note("Generating Update endpoint for " + collectionName);

      options = options || {};

      var resourceAliasForRoute;

      if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.modelName;
      }
      else {
        resourceAliasForRoute = model.modelName;
      }

      var handler = HandlerHelper.generateUpdateHandler(model, options, Log);

      var updateModel = joiMongooseHelper.generateJoiUpdateModel(model, Log);

      var readModel = joiMongooseHelper.generateJoiReadModel(model, Log);

      server.route({
        method: 'PUT',
        path: '/' + resourceAliasForRoute + '/{_id}',
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Update a ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            params: {
              _id: Joi.objectId().required()
            },
            payload: config.enablePayloadValidation ? updateModel : Joi.any(),
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 200, message: 'The resource was updated successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {
                  code: 401,
                  message: 'The authentication header was missing/malformed, or the token has expired.'
                },
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {
            schema: config.enableResponseValidation ? readModel : Joi.any()
          }
        }
      });
    },

    /**
     * Creates an endpoint for PUT /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateAssociationAddOneEndpoint: function (server, ownerModel, association, options, Log) {
      validationHelper.validateModel(ownerModel, Log);

      assert(ownerModel.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerModel.collectionDisplayName || ownerModel.modelName;
      var childModel = association.include.model;

      var childModelName = childModel.collectionDisplayName || childModel.modelName;

      Log = Log.bind("AddOne");
      Log.note("Generating addOne association endpoint for " + ownerModelName + " -> " + associationName);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var handler = HandlerHelper.generateAssociationAddOneHandler(ownerModel, association, options, Log);

      var payloadValidation = null;

      //EXPL: A payload is only relevant if a through model is defined
      if (association.include.through) {
        payloadValidation = joiMongooseHelper.generateJoiAssociationModel(association.include.through, Log);
      }

      server.route({
        method: 'PUT',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + "/{childId}",
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Add a single ' + childModelName + ' object to a ' + ownerModelName + '\'s list of ' + associationName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required(),
              childId: Joi.objectId().required()
            },
            payload: config.enablePayloadValidation ? payloadValidation : Joi.any(),
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 204, message: 'The association was added successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {
                  code: 401,
                  message: 'The authentication header was missing/malformed, or the token has expired.'
                },
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {}//TODO: verify what response schema is needed here
        }
      });
    },

    /**
     * Creates an endpoint for DELETE /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateAssociationRemoveOneEndpoint: function (server, ownerModel, association, options, Log) {
      validationHelper.validateModel(ownerModel, Log);

      assert(ownerModel.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerModel.collectionDisplayName || ownerModel.modelName;
      var childModel = association.include.model;

      var childModelName = childModel.collectionDisplayName || childModel.modelName;

      Log = Log.bind("RemoveOne");
      Log.note("Generating removeOne association endpoint for " + ownerModelName + " -> " + associationName);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var handler = HandlerHelper.generateAssociationRemoveOneHandler(ownerModel, association, options, Log);

      server.route({
        method: 'DELETE',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + "/{childId}",
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Remove a single ' + childModelName + ' object from a ' + ownerModelName + '\'s list of ' + associationName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required(),
              childId: Joi.objectId().required()
            },
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 204, message: 'The association was deleted successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {code: 401, message: 'The authentication header was missing/malformed, or the token has expired.'},
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {}
        }
      });
    },

    /**
     * Creates an endpoint for POST /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateAssociationAddManyEndpoint: function (server, ownerModel, association, options, Log) {
      validationHelper.validateModel(ownerModel, Log);

      assert(ownerModel.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerModel.collectionDisplayName || ownerModel.modelName;

      Log = Log.bind("AddMany");
      Log.note("Generating addMany association endpoint for " + ownerModelName + " -> " + associationName);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var handler = HandlerHelper.generateAssociationAddManyHandler(ownerModel, association, options, Log);

      var payloadValidation;

      if (association.include && association.include.through) {
        payloadValidation = joiMongooseHelper.generateJoiAssociationModel(association.include.through, Log);
        payloadValidation = payloadValidation.keys({
          childId: Joi.objectId()
        });
        payloadValidation = Joi.array().items(payloadValidation).required();
      } 
      else {
        payloadValidation = Joi.array().items(Joi.objectId()).required();
      }

      server.route({
        method: 'POST',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Sets multiple ' + associationName + ' for a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required()
            },
            payload: config.enablePayloadValidation ? payloadValidation : Joi.any(),
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 204, message: 'The association was set successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {code: 401, message: 'The authentication header was missing/malformed, or the token has expired.'},
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {}
        }
      })
    },

    /**
     * Creates an endpoint for GET /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param server: A Hapi server.
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     */
    generateAssociationGetAllEndpoint: function (server, ownerModel, association, options, Log) {
      validationHelper.validateModel(ownerModel, Log);

      assert(ownerModel.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerModel.collectionDisplayName || ownerModel.modelName;
      
      Log = Log.bind("GetAll");
      Log.note("Generating list association endpoint for " + ownerModelName + " -> " + associationName);
      
      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var childModel = association.include.model;


      var handler = HandlerHelper.generateAssociationGetAllHandler(ownerModel, association, options, Log);

      var queryValidation = {
        $skip: Joi.number().integer().min(0).optional()
        .description('The number of records to skip in the database. This is typically used in pagination.'),
        $limit: Joi.number().integer().min(0).optional()
        .description('The maximum number of records to return. This is typically used in pagination.')
      };

      var queryableFields = queryHelper.getQueryableFields(childModel, Log);

      var readableFields = queryHelper.getReadableFields(childModel, Log);

      var sortableFields = queryHelper.getSortableFields(childModel, Log);

      if (queryableFields && readableFields) {
        queryValidation.$select = Joi.alternatives().try(Joi.string().valid(readableFields), Joi.array().items(Joi.string().valid(readableFields)))
        .description('A list of basic fields to be included in each resource. Valid values include: ' + readableFields);
        // queryValidation.$term = Joi.string().optional()
        //   .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + queryableFields);
        // queryValidation.$searchFields = Joi.string().optional()//TODO: make enumerated array.
        //   .description('A set of fields to apply the \"$term\" search parameter to. If this parameter is not included, the \"$term\" search parameter is applied to all searchable fields. Valid values include: ' + queryableFields);
        queryValidation.$sort = Joi.alternatives().try(Joi.string().valid(sortableFields), Joi.array().items(Joi.string().valid(sortableFields)))
        .description('A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending ' +
          '\'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value). Listing multiple' +
          'fields prioritizes the sort starting with the first field listed. Valid values include: ' + sortableFields);
        queryValidation.$where = Joi.any().optional()
        .description('An optional field for raw mongoose queries.');

        _.each(queryableFields, function (fieldName) {
          queryValidation[fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
        })
      }

      var associations = childModel.routeOptions ? childModel.routeOptions.associations : null;
      if (associations) {
        queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
        .description('A set of complex object properties to populate. Valid values include ' + Object.keys(associations));
      }

      var readModel = joiMongooseHelper.generateJoiReadModel(childModel, Log);

      server.route({
        method: 'GET',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: config.auth,
          cors: true,
          description: 'Gets all of the ' + associationName + ' for a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            query: config.enableQueryValidation ? queryValidation : Joi.any(),
            params: {
              ownerId: Joi.objectId().required()
            },
            headers: headersValidation
          },
          plugins: {
            'hapi-swagger': {
              responseMessages: [
                {code: 200, message: 'The association was set successfully.'},
                {code: 400, message: 'The request was malformed.'},
                {code: 401, message: 'The authentication header was missing/malformed, or the token has expired.'},
                {code: 404, message: 'There was no resource found with that ID.'},
                {code: 500, message: 'There was an unknown error.'},
                {code: 503, message: 'There was a problem with the database.'}
              ]
            }
          },
          response: {
            schema: config.enableResponseValidation ? Joi.array().items(readModel) : Joi.array().items(Joi.any())
            // schema: Joi.array().items(readModel)
            // schema: Joi.array().items(readModel || Joi.object().unknown().optional())
            // schema: Joi.array().items(Joi.any())//TODO: proper validation
          }
        }
      });
    }
  }
};
