'use strict'

const Boom = require('boom')
const _ = require('lodash')

const internals = {}

/**
 * Policy to append any document scopes defined in the routeOptions to any existing scope.
 * @param model
 * @param logger
 * @returns {addDocumentScopeForModel}
 */
internals.addDocumentScope = function(model, logger) {
  const addDocumentScopeForModel = function addDocumentScopeForModel(
    request,
    h
  ) {
    const Log = logger.bind('addDocumentScope')
    try {
      let scope = model.routeOptions.documentScope

      if (scope) {
        for (let scopeType in scope) {
          if (_.isArray(request.payload)) {
            request.payload.forEach(function(document) {
              document.scope = document.scope || {}
              document.scope[scopeType] = document.scope[scopeType] || []
              document.scope[scopeType] = document.scope[scopeType].concat(
                scope[scopeType]
              )
            })
          } else {
            request.payload.scope = request.payload.scope || {}
            request.payload.scope[scopeType] =
              request.payload.scope[scopeType] || []
            request.payload.scope[scopeType] = request.payload.scope[
              scopeType
            ].concat(scope[scopeType])
          }
        }
      }

      return h.continue
    } catch (err) {
      Log.error('ERROR:', err)
      throw Boom.badImplementation(err)
    }
  }

  addDocumentScopeForModel.applyPoint = 'onPreHandler'

  return addDocumentScopeForModel
}

internals.addDocumentScope.applyPoint = 'onPreHandler'

module.exports = {
  addDocumentScope: internals.addDocumentScope
}
