var Joi = require('joi');
var _ = require('lodash');
var assert = require('assert');
var joiMongooseHelper = require('./joi-mongoose-helper');
var queryHelper = require('./query-helper');
var validationHelper = require("./validation-helper");
var chalk = require('chalk');

//TODO: remove "options"?

module.exports = function (logger, mongoose, server) {
  var logger = logger.bind(chalk.gray('rest-helper-factory'));

  var HandlerHelper = require('./handler-helper-factory')(mongoose, server);

  var headersValidation = Joi.object({
    'authorization': Joi.string().required()
  }).options({allowUnknown: true});

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
      validationHelper.validateModel(model, Log);
      var modelMethods = model.schema.methods;
      var collectionName = modelMethods.collectionDisplayName || model.modelName;
      var Log = logger.bind(chalk.gray(collectionName));

      options = options || {};

      if (modelMethods.routeOptions.allowRead !== false) {
        this.generateListEndpoint(server, model, options, Log);
        this.generateFindEndpoint(server, model, options, Log);
      }

      if (modelMethods.routeOptions.allowCreate !== false) {
        this.generateCreateEndpoint(server, model, options, Log);
      }

      if (modelMethods.routeOptions.allowUpdate !== false) {
        this.generateUpdateEndpoint(server, model, options, Log);
      }

      if (modelMethods.routeOptions.allowDelete !== false) {
        this.generateDeleteEndpoint(server, model, options, Log);
      }

      if (modelMethods.routeOptions.associations) {
        for (var associationName in modelMethods.routeOptions.associations) {
          var association = modelMethods.routeOptions.associations[associationName];

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

      if(modelMethods.routeOptions && modelMethods.routeOptions.extraEndpoints){
        for(var extraEndpointIndex in modelMethods.routeOptions.extraEndpoints){
          var extraEndpointFunction = modelMethods.routeOptions.extraEndpoints[extraEndpointIndex];

          extraEndpointFunction(server, model, options, Log);
        }
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
      var modelMethods = model.schema.methods;
      var collectionName = modelMethods.collectionDisplayName || model.modelName;
      Log = Log.bind("List");
      options = options || {};

      Log.note("Generating List endpoint for " + collectionName);

      var resourceAliasForRoute;

      if (modelMethods.routeOptions) {
        resourceAliasForRoute = modelMethods.routeOptions.alias || model.modelName;
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

      var associations = modelMethods.routeOptions ? modelMethods.routeOptions.associations : null;
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
          auth: "token",
          description: 'Get a list of ' + collectionName + 's',
          tags: ['api', collectionName],
          cors: true,
          validate: {
            query: queryValidation,
            // query: Joi.any(),
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
            schema: Joi.array().items(readModel)
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
      var modelMethods = model.schema.methods;
      var collectionName = modelMethods.collectionDisplayName || model.modelName;
      Log = Log.bind("Find");
      Log.note("Generating Find endpoint for " + collectionName);

      var resourceAliasForRoute;

      if (modelMethods.routeOptions) {
        resourceAliasForRoute = modelMethods.routeOptions.alias || model.modelName;
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

      if (modelMethods.routeOptions && modelMethods.routeOptions.associations) {
        queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
        .description('A set of complex object properties to populate. Valid values include ' + Object.keys({test:{}}));
      }

      var readModel = modelMethods.readModel || joiMongooseHelper.generateJoiReadModel(model, Log);

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute + '/{_id}',
        config: {
          handler: handler,
          auth: "token",
          description: 'Get a specific ' + collectionName,
          tags: ['api', collectionName],
          cors: true,
          validate: {
            query: queryValidation,
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
            schema: readModel
            // schema: Joi.any()
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
      var modelMethods = model.schema.methods;
      var collectionName = modelMethods.collectionDisplayName || model.modelName;
      Log = Log.bind("Create");
      Log.note("Generating Create endpoint for " + collectionName);

      options = options || {};

      var resourceAliasForRoute;

      if (modelMethods.routeOptions) {
        resourceAliasForRoute = modelMethods.routeOptions.alias || model.modelName;
      } else {
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
          auth: "token",
          cors: true,
          description: 'Create a new ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            payload: createModel,
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
            schema: readModel
            // schema: Joi.any()
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
      var modelMethods = model.schema.methods;
      var collectionName = modelMethods.collectionDisplayName || model.modelName;
      Log = Log.bind("Delete");
      Log.note("Generating Delete endpoint for " + collectionName);

      options = options || {};

      var resourceAliasForRoute;

      if (modelMethods.routeOptions) {
        resourceAliasForRoute = modelMethods.routeOptions.alias || model.modelName;
      } else {
        resourceAliasForRoute = model.modelName;
      }

      var handler = HandlerHelper.generateDeleteHandler(model, options, Log);

      server.route({
        method: 'DELETE',
        path: '/' + resourceAliasForRoute + "/{_id}",
        config: {
          handler: handler,
          auth: "token",
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
      var modelMethods = model.schema.methods;
      var collectionName = modelMethods.collectionDisplayName || model.modelName;
      Log = Log.bind("Update");
      Log.note("Generating Update endpoint for " + collectionName);

      options = options || {};

      var resourceAliasForRoute;

      if (modelMethods.routeOptions) {
        resourceAliasForRoute = modelMethods.routeOptions.alias || model.modelName;
      } else {
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
          auth: "token",
          cors: true,
          description: 'Update a ' + collectionName,
          tags: ['api', collectionName],
          validate: {
            params: {
              _id: Joi.objectId().required()
            },
            payload: updateModel,
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
            schema: readModel
            // Joi.any();
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
      var ownerMethods = ownerModel.schema.methods;

      assert(ownerMethods.routeOptions, "routeOptions must exist");
      assert(ownerMethods.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerMethods.collectionDisplayName || ownerModel.modelName;

      Log = Log.bind("AddOne");
      Log.note("Generating addOne association endpoint for " + ownerModelName + " -> " + associationName);

      options = options || {};

      var ownerAlias = ownerMethods.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var handler = HandlerHelper.generateAssociationAddOneHandler(ownerModel, association, options, Log);

      var payloadValidation = null;

      //EXPL: A payload is only relevant if a through model is defined
      if (association.include.through) {
        payloadValidation = joiMongooseHelper.generateJoiAssociationModel(association.include.through, Log).allow(null);
      }

      server.route({
        method: 'PUT',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + "/{childId}",
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Add a single ' + associationName + ' to a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required(),
              childId: Joi.objectId().required()
            },
            payload: payloadValidation,
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
      var ownerMethods = ownerModel.schema.methods;

      assert(ownerMethods.routeOptions, "routeOptions must exist");
      assert(ownerMethods.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerMethods.collectionDisplayName || ownerModel.modelName;

      Log = Log.bind("RemoveOne");
      Log.note("Generating removeOne association endpoint for " + ownerModelName + " -> " + associationName);

      options = options || {};

      var ownerAlias = ownerMethods.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var handler = HandlerHelper.generateAssociationRemoveOneHandler(ownerModel, association, options, Log);

      server.route({
        method: 'DELETE',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + "/{childId}",
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Remove a single ' + associationName + ' from a ' + ownerModelName,
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
      var ownerMethods = ownerModel.schema.methods;

      assert(ownerMethods.routeOptions, "routeOptions must exist");
      assert(ownerMethods.routeOptions.associations, "model associations must exist");
      assert(association, "association input must exist");

      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerMethods.collectionDisplayName || ownerModel.modelName;

      Log = Log.bind("AddMany");
      Log.note("Generating addMany association endpoint for " + ownerModelName + " -> " + associationName);

      options = options || {};

      var ownerAlias = ownerMethods.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var handler = HandlerHelper.generateAssociationAddManyHandler(ownerModel, association, options, Log);

      var payloadValidation;

      if (association.include && association.include.through) {
        payloadValidation = joiMongooseHelper.generateJoiAssociationModel(association.include.through, Log);
        payloadValidation = payloadValidation.keys({
          childId: Joi.objectId()
        });
        payloadValidation = Joi.array().items(payloadValidation).required();
      } else {
        payloadValidation = Joi.array().items(Joi.objectId()).required();
      }

      server.route({
        method: 'POST',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Sets multiple ' + associationName + 's for a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.objectId().required()
            },
            payload: payloadValidation,
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

    generateAssociationGetAllEndpoint: function (server, ownerModel, association, options, Log) {
      var ownerMethods = ownerModel.schema.methods;
      var associationName = association.include.as || association.include.model.modelName;
      var ownerModelName = ownerMethods.collectionDisplayName || ownerModel.modelName;
      Log = Log.bind("GetAll");
      Log.note("Generating list association endpoint for " + ownerModelName + " -> " + associationName);

      assert(ownerMethods.routeOptions);
      assert(ownerMethods.routeOptions.associations);

      assert(association);

      options = options || {};

      var ownerAlias = ownerMethods.routeOptions.alias || ownerModel.modelName;
      var childAlias = association.alias || association.include.model.modelName;

      var childModel = association.include.model;
      var childModelName = childModel.collectionDisplayName || childModel.modelName;

      var handler = options.handler ? options.handler : HandlerHelper.generateAssociationGetAllHandler(ownerModel, association, options, Log);

      var queryValidation = {
        $skip: Joi.number().integer().min(0).optional()
        .description('The number of records to skip in the database. This is typically used in pagination.'),
        $limit: Joi.number().integer().min(0).optional()
        .description('The maximum number of records to return. This is typically used in pagination.')
      };

      var queryableFields = queryHelper.getQueryableFields(childModel, Log);

      if (queryableFields) {
        queryValidation.$select = Joi.string().optional()//TODO: make enumerated array.
        .description('A list of basic fields to be included in each resource. Valid values include: ' + childModel.queryableFields);
        // queryValidation.$term = Joi.string().optional()
        //   .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + childModel.queryableFields);
        // queryValidation.$searchFields = Joi.string().optional()//TODO: make enumerated array.
        //   .description('A set of fields to apply the \"$term\" search parameter to. If this parameter is not included, the \"$term\" search parameter is applied to all searchable fields. Valid values include: ' + childModel.queryableFields);
        queryValidation.$sort = Joi.string().optional()//TODO: make enumerated array.
        .description('A set of sort fields. Prepending \'+\' to the field name indicates it should be sorted ascending, while \'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value).');
        queryValidation.$where = Joi.any().optional()
        .description('An optional field for raw mongoose queries.');

        _.each(queryableFields, function (fieldName) {
          queryValidation[fieldName] = Joi.string().optional();
        })
      }

      if (childModel.routeOptions && childModel.routeOptions.associations) {
        queryValidation.$embed = Joi.string().optional()//TODO: make enumerated array.
        .description('A set of complex object properties to populate. Valid values include ' + Object.keys(childModel.routeOptions.associations));
      }

      server.route({
        method: 'GET',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: "token",
          description: 'Gets all of the ' + childModelName + ' for a ' + ownerModelName,
          tags: ['api', childModelName, ownerModelName],
          validate: {
            query: queryValidation,
            params: {
              ownerId: Joi.string().required()//TODO: validate for ObjectId
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
            // schema: Joi.array().items(childModel.readModel ? childModel.readModel : Joi.object().unknown().optional())
            schema: Joi.any()
          }
        }
      });
    },
  }
};
