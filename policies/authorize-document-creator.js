'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};

/**
 * Policy to authorize a document's creator to perform any action on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorForModel}
 */
internals.authorizeDocumentCreator = function(model, Log) {

  const authorizeDocumentCreatorForModel = function authorizeDocumentCreatorForModel(request, reply, next) {
    Log = Log.bind("authorizeDocumentCreator");

    return internals.addScope('root', request, reply, next, Log);
  };

  authorizeDocumentCreatorForModel.applyPoint = 'onPreHandler';
  return authorizeDocumentCreatorForModel;
};
internals.authorizeDocumentCreator.applyPoint = 'onPreHandler';

/**
 * Policy to authorize a document's creator to perform read actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToReadForModel}
 */
internals.authorizeDocumentCreatorToRead = function(model, Log) {

  const authorizeDocumentCreatorToReadForModel = function authorizeDocumentCreatorToReadForModel(request, reply, next) {
    Log = Log.bind("authorizeDocumentCreatorToRead");

    return internals.addScope('read', request, reply, next, Log);
  };

  authorizeDocumentCreatorToReadForModel.applyPoint = 'onPreHandler';
  return authorizeDocumentCreatorToReadForModel;
};
internals.authorizeDocumentCreatorToRead.applyPoint = 'onPreHandler';

/**
 * Policy to authorize a document's creator to perform update actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToUpdateForModel}
 */
internals.authorizeDocumentCreatorToUpdate = function(model, Log) {

  const authorizeDocumentCreatorToUpdateForModel = function authorizeDocumentCreatorToUpdateForModel(request, reply, next) {
    Log = Log.bind("authorizeDocumentCreatorToUpdate");

    return internals.addScope('update', request, reply, next, Log);
  };

  authorizeDocumentCreatorToUpdateForModel.applyPoint = 'onPreHandler';
  return authorizeDocumentCreatorToUpdateForModel;
};
internals.authorizeDocumentCreatorToUpdate.applyPoint = 'onPreHandler';

/**
 * Policy to authorize a document's creator to perform delete actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToDeleteForModel}
 */
internals.authorizeDocumentCreatorToDelete = function(model, Log) {

  const authorizeDocumentCreatorToDeleteForModel = function authorizeDocumentCreatorToDeleteForModel(request, reply, next) {
    Log = Log.bind("authorizeDocumentCreatorToDelete");

    return internals.addScope('delete', request, reply, next, Log);
  };

  authorizeDocumentCreatorToDeleteForModel.applyPoint = 'onPreHandler';
  return authorizeDocumentCreatorToDeleteForModel;
};
internals.authorizeDocumentCreatorToDelete.applyPoint = 'onPreHandler';

/**
 * Policy to authorize a document's creator to perform associate actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToAssociateForModel}
 */
internals.authorizeDocumentCreatorToAssociate = function(model, Log) {

  const authorizeDocumentCreatorToAssociateForModel = function authorizeDocumentCreatorToAssociateForModel(request, reply, next) {
    Log = Log.bind("authorizeDocumentCreatorToAssociate");

    return internals.addScope('associate', request, reply, next, Log);
  };

  authorizeDocumentCreatorToAssociateForModel.applyPoint = 'onPreHandler';
  return authorizeDocumentCreatorToAssociateForModel;
};
internals.authorizeDocumentCreatorToAssociate.applyPoint = 'onPreHandler';

/**
 * Internal function to add the creating user's _id to a document's relevant action scope.
 * @param action
 * @param request
 * @param reply
 * @param next
 * @param Log
 * @returns {*}
 */
internals.addScope = function(action, request, reply, next, Log) {

  try {
    let scopeType = "";
    switch (action) {
      case "root":
        scopeType = "rootScope";
        break;
      case "read":
        scopeType = "readScope";
        break;
      case "update":
        scopeType = "updateScope";
        break;
      case "delete":
        scopeType = "deleteScope";
        break;
      case "associate":
        scopeType = "associateScope";
        break;
      default:
        throw "Invalid action.";
    }

    let userId = _.get(request.auth.credentials, config.userIdKey);

    if (!userId) {
      let message = 'User _id not found in auth credentials. Please specify the user _id path in "config.userIdKey"';
      Log.error(message);
      return next(Boom.badRequest(message), false);
    }

    if (_.isArray(request.payload)) {
      request.payload.forEach(function(document) {
        let scope = {};
        scope[scopeType] = [];

        document.scope = document.scope || scope;
        document.scope[scopeType] = document.scope[scopeType] || [];
        document.scope[scopeType].push("user-" + userId)
      })
    }
    else {
      let scope = {};
      scope[scopeType] = [];

      request.payload.scope = request.payload.scope || scope;
      request.payload.scope[scopeType] = request.payload.scope[scopeType] || [];
      request.payload.scope[scopeType].push("user-" + userId)
    }

    return next(null, true);
  }
  catch (err) {
    Log.error("ERROR:", err);
    return next(Boom.badImplementation(err), false);
  }
  
};

module.exports = {
  authorizeDocumentCreator : internals.authorizeDocumentCreator,
  authorizeDocumentCreatorToRead : internals.authorizeDocumentCreatorToRead,
  authorizeDocumentCreatorToUpdate : internals.authorizeDocumentCreatorToUpdate,
  authorizeDocumentCreatorToDelete : internals.authorizeDocumentCreatorToDelete,
  authorizeDocumentCreatorToAssociate : internals.authorizeDocumentCreatorToAssociate
};

