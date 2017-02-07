'use strict';

const _ = require('lodash');

module.exports = {
  /**
   * Generates the proper scope for an endpoint based on the model routeOptions
   * @param model: A mongoose model
   * @param type: The scope CRUD type. Valid values are 'create', 'read', 'update', 'delete', and 'associate'.
   * @param Log: A logging object
   * @returns {Array}: A list of authorization scopes for the endpoint.
   */
  generateScope: function(model, type, Log) {
    var scope = [];

    var generalScope = model.routeOptions.scope;

    var additionalScope = null;

    switch (type) {
      case 'create':
        additionalScope = model.routeOptions.createScope;
        break;
      case 'read':
        additionalScope = model.routeOptions.readScope;
        break;
      case 'update':
        additionalScope = model.routeOptions.updateScope;
        break;
      case 'delete':
        additionalScope = model.routeOptions.deleteScope;
        break;
      case 'associate':
        additionalScope = model.routeOptions.associateScope;
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
  }
};
