'use strict';

const _ = require('lodash');
var extend = require('util')._extend;

module.exports = {
  /**
   * Generates the proper scope for an endpoint based on the model routeOptions
   * @param model: A mongoose model
   * @param type: The scope CRUD type. Valid values are 'create', 'read', 'update', 'delete', and 'associate'.
   * @param Log: A logging object
   * @returns {Array}: A list of authorization scopes for the endpoint.
   */
  generateScopeForEndpoint: function(model, type, Log) {
    var scope = [];

    if (!model.routeOptions.scope) {
      model.routeOptions.scope = {};
    }
    var generalScope = model.routeOptions.scope.scope;

    var additionalScope = null;

    switch (type) {
      case 'create':
        additionalScope = model.routeOptions.scope.createScope;
        break;
      case 'read':
        additionalScope = model.routeOptions.scope.readScope;
        break;
      case 'update':
        additionalScope = model.routeOptions.scope.updateScope;
        break;
      case 'delete':
        additionalScope = model.routeOptions.scope.deleteScope;
        break;
      case 'associate':
        additionalScope = model.routeOptions.scope.associateScope;
        break;
      default:
        if (model.routeOptions.scope[type]) {
          scope = model.routeOptions.scope[type];
          if (!_.isArray(scope)) {
            scope = [scope];
          }
        }
        return scope;
        break;
    }

    if (generalScope && _.isArray(generalScope)) {
      scope = scope.concat(generalScope);
    }
    else if (generalScope) {
      scope.push(generalScope);
    }

    if (additionalScope && _.isArray(additionalScope)) {
      scope = scope.concat(additionalScope);
    }
    else if (additionalScope) {
      scope.push(additionalScope);
    }

    return scope;
  },

  generateScopeForModel: function(model, Log) {
    const modelName = model.collectionName[0].toUpperCase() + model.collectionName.slice(1);

    const scope = {};
    
    scope.scope = "root";
    scope.createScope = ["create", "create" + modelName];
    scope.readScope = ["read", "read" + modelName];
    scope.updateScope = ["update", "update" + modelName];
    scope.deleteScope = ["delete", "delete" + modelName];
    scope.associateScope = ["associate", "associate" + modelName];

    const associations = model.routeOptions.associations;

    for (const key in associations) {
      const associationName = key[0].toUpperCase() + key.slice(1);
      scope["add" + modelName + associationName + "Scope"] = "add" + modelName + associationName;
      scope["remove" + modelName + associationName + "Scope"] = "remove" + modelName + associationName;
      scope["get" + modelName + associationName + "Scope"] = "get" + modelName + associationName;
    }

    //EXPL: merge any existing scope fields with the generated scope
    for (const key in model.routeOptions.scope) {
      if (scope[key]) {
        if (!_.isArray(scope[key])) {
          scope[key] = [scope[key]];
        }
        if (model.routeOptions.scope[key] && _.isArray(model.routeOptions.scope[key])) {
          scope[key] = scope[key].concat(model.routeOptions.scope[key]);
        }
        else {
          scope[key].push(model.routeOptions.scope[key]);
        }
      }
    }

    model.routeOptions.scope = scope;
  }
};
