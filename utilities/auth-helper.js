'use strict'

const _ = require('lodash')

module.exports = {
  /**
   * Generates the proper scope for an endpoint based on the model routeOptions
   * @param model: A mongoose model
   * @param type: The scope CRUD type. Valid values are 'create', 'read', 'update', 'delete', and 'associate'.
   * @param logger: A logging object
   * @returns {Array}: A list of authorization scopes for the endpoint.
   */
  generateScopeForEndpoint: function(model, type, logger) {
    let routeScope = model.routeOptions.routeScope || {}
    let rootScope = routeScope.rootScope
    let scope = []

    let additionalScope = null

    switch (type) {
      case 'create':
        additionalScope = routeScope.createScope
        break
      case 'read':
        additionalScope = routeScope.readScope
        break
      case 'update':
        additionalScope = routeScope.updateScope
        break
      case 'delete':
        additionalScope = routeScope.deleteScope
        break
      case 'associate':
        additionalScope = routeScope.associateScope
        break
      default:
        if (routeScope[type]) {
          scope = routeScope[type]
          if (!_.isArray(scope)) {
            scope = [scope]
          }
        }
        return scope
    }

    if (rootScope && _.isArray(rootScope)) {
      scope = scope.concat(rootScope)
    } else if (rootScope) {
      scope.push(rootScope)
    }

    if (additionalScope && _.isArray(additionalScope)) {
      scope = scope.concat(additionalScope)
    } else if (additionalScope) {
      scope.push(additionalScope)
    }

    return scope
  },

  generateScopeForModel: function(model, logger) {
    const modelName =
      model.collectionName[0].toUpperCase() + model.collectionName.slice(1)

    let routeScope = model.routeOptions.routeScope || {}
    if (!routeScope.rootScope) {
      delete routeScope.rootScope
    }

    const scope = {}

    scope.rootScope = [
      'root',
      model.collectionName,
      '!-root',
      '!-' + model.collectionName
    ]
    scope.createScope = [
      'create',
      'create' + modelName,
      '!-create',
      '!-create' + modelName
    ]
    scope.readScope = [
      'read',
      'read' + modelName,
      '!-read',
      '!-read' + modelName
    ]
    scope.updateScope = [
      'update',
      'update' + modelName,
      '!-update',
      '!-update' + modelName
    ]
    scope.deleteScope = [
      'delete',
      'delete' + modelName,
      '!-delete',
      '!-delete' + modelName
    ]
    scope.associateScope = [
      'associate',
      'associate' + modelName,
      '!-associate',
      '!-associate' + modelName
    ]

    const associations = model.routeOptions.associations

    for (const key in associations) {
      const associationName = key[0].toUpperCase() + key.slice(1)
      scope['add' + modelName + associationName + 'Scope'] = [
        'add' + modelName + associationName,
        '!-add' + modelName + associationName
      ]
      scope['remove' + modelName + associationName + 'Scope'] = [
        'remove' + modelName + associationName,
        '!-remove' + modelName + associationName
      ]
      scope['get' + modelName + associationName + 'Scope'] = [
        'get' + modelName + associationName,
        '!-get' + modelName + associationName
      ]
    }

    // Merge any existing scope fields with the generated scope
    for (const key in routeScope) {
      if (scope[key]) {
        if (!_.isArray(scope[key])) {
          scope[key] = [scope[key]]
        }
        if (routeScope[key] && _.isArray(routeScope[key])) {
          scope[key] = scope[key].concat(routeScope[key])
        } else {
          scope[key].push(routeScope[key])
        }
      }
    }

    model.routeOptions.routeScope = scope
  }
}
