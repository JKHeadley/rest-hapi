var Joi = require('joi');
var _ = require('lodash');
var assert = require('assert');
var joiSequelizeHelper = require('./joi-sequelize-helper')();
var queryHelper = require('./query-helper');
var chalk = require('chalk');

module.exports = function (logger, Sequelize, server) {
  var logger = logger.bind(chalk.gray('rest-helper-factory'));

  var HandlerHelper = require('./handler-helper-factory')(Sequelize, server);

  var headersValidation = Joi.object({
    'authorization': Joi.string().required()
  }).options({allowUnknown: true});

  return {
    defaultHeadersValidation: headersValidation,
    generateRoutes: function (server, model, options) {
      var tableName = model.tableDisplayName || model.getTableName();
      var Log = logger.bind(chalk.gray(tableName));

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

          if (association.type == "MANY") {
            if (association.allowAddOne !== false) {
              this.generateAssociationAddOneEndpoint(server, model, association, options, Log);
            }

            if (association.allowRemoveOne !== false) {
              this.generateAssociationRemoveOneEndpoint(server, model, association, options, Log);
            }

            if (association.allowSetAll !== false) {
              this.generateAssociationSetAllEndpoint(server, model, association, options, Log);
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
    },
    generateListEndpoint: function (server, model, options, Log) {
      var tableName = model.tableDisplayName || model.getTableName();
      Log = Log.bind("List");
      options = options || {};

      Log.note("Generating List endpoint for " + tableName);

      var resourceAliasForRoute;

      if (options.resourceAliasForRoute) {//DEPRECATED
        resourceAliasForRoute = options && options.resourceAliasForRoute ? options.resourceAliasForRoute : model.getTableName();
      } else if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.getTableName();
      } else {
        resourceAliasForRoute = model.getTableName();
      }

      var handler = HandlerHelper.generateListHandler(model, options, Log);//HACK: this resultProcessor should be passed in from the user route generator.

      var queryValidation = {
        offset: Joi.number().integer().min(0).optional()
          .description('The number of records to skip in the database. This is typically used in pagination.'),
        limit: Joi.number().integer().min(0).optional()
          .description('The maximum number of records to return. This is typically used in pagination.')
      };

      var queryableFields = model.queryableFields || queryHelper.getQueryableFields(model, Log);

      if (queryableFields) {
        queryValidation.fields = Joi.string().optional()//TODO: make enumerated array.
          .description('A list of basic fields to be included in each resource. Valid values include: ' + queryableFields);
        queryValidation.term = Joi.string().optional()
          .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + queryableFields);
        queryValidation.searchFields = Joi.string().optional()//TODO: make enumerated array.
          .description('A set of fields to apply the \"term\" search parameter to. If this parameter is not included, the \"term\" search parameter is applied to all searchable fields. Valid values include: ' + queryableFields);
        queryValidation.sort = Joi.string().optional()//TODO: make enumerated array.
          .description('A set of sort fields. Prepending \'+\' to the field name indicates it should be sorted ascending, while \'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value).');


        _.each(queryableFields, function (fieldName) {
          queryValidation[fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
          queryValidation["min-" + fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
          queryValidation["max-" + fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
          queryValidation["not-" + fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
          queryValidation["or-" + fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
        })
      }

      if (model.routeOptions && model.routeOptions.associations) {
        queryValidation.embed = Joi.string().optional()//TODO: make enumerated array.
          .description('A set of complex object properties to populate. Valid values include ' + Object.keys(model.routeOptions.associations));
      }

      var readModel = model.readModel || joiSequelizeHelper.generateJoiReadModel(model);

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: "token",
          description: 'Get a list of ' + tableName,
          tags: ['api', tableName],
          validate: {
            query: queryValidation,
            headers: Joi.object({
              'authorization': Joi.string().required()
            }).options({allowUnknown: true})
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
            schema: Joi.array().items(readModel || Joi.object().unknown().optional())
          }
        }
      });
    },
    generateFindEndpoint: function (server, model, options, Log) {
      var tableName = model.tableDisplayName || model.getTableName();
      Log = Log.bind("Find");
      Log.note("Generating Find endpoint for " + tableName);

      var resourceAliasForRoute;

      if (options.resourceAliasForRoute) {//DEPRECATED
        resourceAliasForRoute = options && options.resourceAliasForRoute ? options.resourceAliasForRoute : model.getTableName();
      } else if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.getTableName();
      } else {
        resourceAliasForRoute = model.getTableName();
      }

      var handler = HandlerHelper.generateFindHandler(model, options, Log);

      var queryValidation = {};

      var queryableFields = model.queryableFields || queryHelper.getQueryableFields(model, Log);

      if (queryableFields) {
        queryValidation.fields = Joi.string().optional()//TODO: make enumerated array.
          .description('A list of basic fields to be included in each resource. Valid values include: ' + queryableFields);
      }

      if (model.routeOptions && model.routeOptions.associations) {
        queryValidation.embed = Joi.string().optional()//TODO: make enumerated array.
          .description('A set of complex object properties to populate. Valid values include ' + Object.keys(model.routeOptions.associations));
      }

      var readModel = model.readModel || joiSequelizeHelper.generateJoiReadModel(model);

      server.route({
        method: 'GET',
        path: '/' + resourceAliasForRoute + '/{id}',
        config: {
          handler: handler,
          auth: "token",
          description: 'Get a specific ' + tableName,
          tags: ['api', tableName],
          cors: true,
          validate: {
            query: queryValidation,
            params: {
              id: Joi.string().guid().required()
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
            schema: readModel || Joi.object().unknown().optional()
          }
        }
      });
    },
    generateCreateEndpoint: function (server, model, options, Log) {
      var tableName = model.tableDisplayName || model.getTableName();
      Log = Log.bind("Create");
      Log.note("Generating Create endpoint for " + tableName);

      options = options || {};

      var resourceAliasForRoute;

      if (options.resourceAliasForRoute) {//DEPRECATED
        resourceAliasForRoute = options && options.resourceAliasForRoute ? options.resourceAliasForRoute : model.getTableName();
      } else if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.getTableName();
      } else {
        resourceAliasForRoute = model.getTableName();
      }

      var handler = HandlerHelper.generateCreateHandler(model, options, Log);

      var createModel = model.createModel || joiSequelizeHelper.generateJoiCreateModel(model);

      var readModel = model.readModel || joiSequelizeHelper.generateJoiReadModel(model);

      server.route({
        method: 'POST',
        path: '/' + resourceAliasForRoute,
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Create a new ' + tableName,
          tags: ['api', tableName],
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
            schema: readModel || Joi.object().unknown().optional()
          }
        }
      });
    },
    generateDeleteEndpoint: function (server, model, options, Log) {
      var tableName = model.tableDisplayName || model.getTableName();
      Log = Log.bind("Delete");
      Log.note("Generating Delete endpoint for " + tableName);

      options = options || {};

      var resourceAliasForRoute;

      if (options.resourceAliasForRoute) {//DEPRECATED
        resourceAliasForRoute = options && options.resourceAliasForRoute ? options.resourceAliasForRoute : model.getTableName();
      } else if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.getTableName();
      } else {
        resourceAliasForRoute = model.getTableName();
      }

      var handler = HandlerHelper.generateDeleteHandler(model, options, Log);

      server.route({
        method: 'DELETE',
        path: '/' + resourceAliasForRoute + "/{id}",
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Create a new ' + tableName,
          tags: ['api', tableName],
          validate: {
            params: {
              id: Joi.string().guid().required()
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
            //schema: model.readModel ? model.readModel : Joi.object().unknown().optional()
          }
        }
      });
    },
    generateUpdateEndpoint: function (server, model, options, Log) {
      var tableName = model.tableDisplayName || model.getTableName();
      Log = Log.bind("Update");
      Log.note("Generating Update endpoint for " + tableName);

      options = options || {};

      var resourceAliasForRoute;

      if (options.resourceAliasForRoute) {//DEPRECATED
        resourceAliasForRoute = options && options.resourceAliasForRoute ? options.resourceAliasForRoute : model.getTableName();
      } else if (model.routeOptions) {
        resourceAliasForRoute = model.routeOptions.alias || model.getTableName();
      } else {
        resourceAliasForRoute = model.getTableName();
      }

      var handler = HandlerHelper.generateUpdateHandler(model, options, Log);

      var updateModel = model.updateModel || joiSequelizeHelper.generateJoiUpdateModel(model);

      server.route({
        method: 'PUT',
        path: '/' + resourceAliasForRoute + '/{id}',
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Update a ' + tableName,
          tags: ['api', tableName],
          validate: {
            params: {
              id: Joi.string().guid().required()
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
            //schema: model.readModel ? model.readModel : Joi.object().unknown().optional()
          }
        }
      });
    },
    generateAssociationAddOneEndpoint: function (server, ownerModel, association, options, Log) {
      var associationName = association.include.as || association.include.model.getTableName();
      var ownerModelName = ownerModel.tableDisplayName || ownerModel.getTableName();
      Log = Log.bind("AddOne");
      Log.note("Generating addOne association endpoint for " + ownerModelName + " -> " + associationName);

      assert(ownerModel.routeOptions);
      assert(ownerModel.routeOptions.associations);

      assert(association);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.getTableName();
      var childAlias = association.alias || association.include.model.getTableName();

      var handler = options.handler ? options.handler : HandlerHelper.generateAssociationAddOneHandler(ownerModel, association, options, Log);

      var payloadValidation;

      if (association.include && association.include.through) {
        payloadValidation = joiSequelizeHelper.generateJoiUpdateModel(association.include.through).allow(null);
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
              ownerId: Joi.string().guid().required(),
              childId: Joi.string().guid().required()
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
          response: {}
        }
      });
    },
    generateAssociationRemoveOneEndpoint: function (server, ownerModel, association, options, Log) {
      var associationName = association.include.as || association.include.model.getTableName();
      var ownerModelName = ownerModel.tableDisplayName || ownerModel.getTableName();
      Log = Log.bind("RemoveOne");
      Log.note("Generating removeOne association endpoint for " + ownerModelName + " -> " + associationName);

      assert(ownerModel.routeOptions);
      assert(ownerModel.routeOptions.associations);

      assert(association);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.getTableName();
      var childAlias = association.alias || association.include.model.getTableName();

      var handler = options.handler ? options.handler : HandlerHelper.generateAssociationRemoveOneHandler(ownerModel, association, options, Log);

      server.route({
        method: 'DELETE',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias + "/{childId}",
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Removes a single ' + associationName + ' from a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.string().guid().required(),
              childId: Joi.string().guid().required()
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
    generateAssociationSetAllEndpoint: function (server, ownerModel, association, options, Log) {
      var associationName = association.include.as || association.include.model.getTableName();
      var ownerModelName = ownerModel.tableDisplayName || ownerModel.getTableName();
      Log = Log.bind("SetAll");
      Log.note("Generating setMany association endpoint for " + ownerModelName + " -> " + associationName);

      assert(ownerModel.routeOptions);
      assert(ownerModel.routeOptions.associations);

      assert(association);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.getTableName();
      var childAlias = association.alias || association.include.model.getTableName();

      var handler = options.handler ? options.handler : HandlerHelper.generateAssociationSetAllHandler(ownerModel, association, options, Log);

      var payloadValidation;
      
      if (association.include && association.include.through) {
        payloadValidation = joiSequelizeHelper.generateJoiUpdateModel(association.include.through);
        payloadValidation = payloadValidation.keys({
          childId: Joi.string().guid()
        });
        payloadValidation = Joi.array().items(payloadValidation).required();
      } else {
        payloadValidation = Joi.array().items(Joi.string().guid());
      }

      server.route({
        method: 'POST',
        path: '/' + ownerAlias + '/{ownerId}/' + childAlias,
        config: {
          handler: handler,
          auth: "token",
          cors: true,
          description: 'Sets all of the ' + associationName + ' for a ' + ownerModelName,
          tags: ['api', associationName, ownerModelName],
          validate: {
            params: {
              ownerId: Joi.string().guid().required()
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
      var associationName = association.include.as || association.include.model.getTableName();
      var ownerModelName = ownerModel.tableDisplayName || ownerModel.getTableName();
      Log = Log.bind("GetAll");
      Log.note("Generating list association endpoint for " + ownerModelName + " -> " + associationName);

      assert(ownerModel.routeOptions);
      assert(ownerModel.routeOptions.associations);

      assert(association);

      options = options || {};

      var ownerAlias = ownerModel.routeOptions.alias || ownerModel.getTableName();
      var childAlias = association.alias || association.include.model.getTableName();

      var childModel = association.include.model;
      var childModelName = childModel.tableDisplayName || childModel.getTableName();

      var handler = options.handler ? options.handler : HandlerHelper.generateAssociationGetAllHandler(ownerModel, association, options, Log);

      var queryValidation = {
        offset: Joi.number().integer().min(0).optional()
          .description('The number of records to skip in the database. This is typically used in pagination.'),
        limit: Joi.number().integer().min(0).optional()
          .description('The maximum number of records to return. This is typically used in pagination.')
      };

      var queryableFields = childModel.queryableFields || queryHelper.getQueryableFields(childModel, Log);

      if (queryableFields) {
        queryValidation.fields = Joi.string().optional()//TODO: make enumerated array.
          .description('A list of basic fields to be included in each resource. Valid values include: ' + childModel.queryableFields);
        queryValidation.term = Joi.string().optional()
          .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + childModel.queryableFields);
        queryValidation.searchFields = Joi.string().optional()//TODO: make enumerated array.
          .description('A set of fields to apply the \"term\" search parameter to. If this parameter is not included, the \"term\" search parameter is applied to all searchable fields. Valid values include: ' + childModel.queryableFields);
        queryValidation.sort = Joi.string().optional()//TODO: make enumerated array.
          .description('A set of sort fields. Prepending \'+\' to the field name indicates it should be sorted ascending, while \'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value).');

        _.each(queryableFields, function (fieldName) {
          queryValidation[fieldName] = Joi.string().optional()
          queryValidation["not-" + fieldName] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));
        })
      }

      if (childModel.routeOptions && childModel.routeOptions.associations) {
        queryValidation.embed = Joi.string().optional()//TODO: make enumerated array.
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
              ownerId: Joi.string().guid().required()
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
            schema: Joi.array().items(childModel.readModel ? childModel.readModel : Joi.object().unknown().optional())
          }
        }
      });
    },
  }
};
