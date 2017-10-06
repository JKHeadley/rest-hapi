'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};


internals.authorizeDocumentCreator = function(model, Log) {

  const authorizeDocumentCreatorForModel = function authorizeDocumentCreatorForModel(request, reply, next) {
    Log = Log.bind("authorizeDocumentCreator");

    try {
      let userId = request.auth.credentials.user._id || request.auth.credentials.userId;

      if (!userId) {
        Log.error("User _id not found in auth credentials.");
        return next(Boom.badRequest("User _id not found in auth credentials."), false);
      }

      if (_.isArray(request.payload)) {
        request.payload.forEach(function(document) {
          document.scope = document.scope || { scope: [] };
          document.scope.scope.push("user-" + request.auth.credentials.user._id)
        })
      }
      else {
        request.payload.scope = request.payload.scope || { scope: [] };
        request.payload.scope.scope.push("user-" + request.auth.credentials.user._id)
      }

      return next(null, true);
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(Boom.badImplementation(err), false);
    }
  };

  authorizeDocumentCreatorForModel.applyPoint = 'onPreHandler';

  return authorizeDocumentCreatorForModel;
};

internals.authorizeDocumentCreator.applyPoint = 'onPreHandler';



module.exports = {
  authorizeDocumentCreator : internals.authorizeDocumentCreator
};

