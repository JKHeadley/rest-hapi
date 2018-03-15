'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};

/**
 * Policy to append any document scopes defined in the routeOptions to any existing scope.
 * @param model
 * @param Log
 * @returns {addDocumentScopeForModel}
 */
internals.addDocumentScope = function(model, Log) {

  const addDocumentScopeForModel = function addDocumentScopeForModel(request, reply, next) {
    Log = Log.bind("addDocumentScope");
    try {
      let scope = model.routeOptions.documentScope;

      if (scope) {
        for (let scopeType in scope) {
          if (_.isArray(request.payload)) {
            request.payload.forEach(function(document) {
              document.scope = document.scope || {};
              document.scope[scopeType] = document.scope[scopeType] || [];
              document.scope[scopeType] = document.scope[scopeType].concat(scope[scopeType])
            })
          }
          else {
            request.payload.scope = request.payload.scope || {};
            request.payload.scope[scopeType] = request.payload.scope[scopeType] || [];
            request.payload.scope[scopeType] = request.payload.scope[scopeType].concat(scope[scopeType])
          }
        }
      }

      return next(null, true);
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(Boom.badImplementation(err), false);
    }
  };

  addDocumentScopeForModel.applyPoint = 'onPreHandler';

  return addDocumentScopeForModel;
};

internals.addDocumentScope.applyPoint = 'onPreHandler';

module.exports = {
  addDocumentScope : internals.addDocumentScope
};

