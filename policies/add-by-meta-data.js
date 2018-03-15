'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};

/**
 * Policy to add the creating user's _id to the document's "createdBy" property.
 * @param model
 * @param Log
 * @returns {addCreatedByForModel}
 */
internals.addCreatedBy = function(model, Log) {

  const addCreatedByForModel = function addCreatedByForModel(request, reply, next) {
    Log = Log.bind("addCreatedBy");

    return internals.addMeta('create', request, reply, next, Log);
  };

  addCreatedByForModel.applyPoint = 'onPreHandler';
  return addCreatedByForModel;
};
internals.addCreatedBy.applyPoint = 'onPreHandler';

/**
* Policy to add the updating user's _id to the document's "updatedBy" property.
* @param model
* @param Log
* @returns {addUpdatedByForModel}
*/
internals.addUpdatedBy = function(model, Log) {

  const addUpdatedByForModel = function addUpdatedByForModel(request, reply, next) {
    Log = Log.bind("addUpdatedBy");

    return internals.addMeta('update', request, reply, next, Log);
  };

  addUpdatedByForModel.applyPoint = 'onPreHandler';
  return addUpdatedByForModel;
};
internals.addUpdatedBy.applyPoint = 'onPreHandler';


/**
 * Policy to add the deleting user's _id to the document's "deletedBy" property.
 * @param model
 * @param Log
 * @returns {addDeletedByForModel}
 */
internals.addDeletedBy = function(model, Log) {

  const addDeletedByForModel = function addDeletedByForModel(request, reply, next) {
    Log = Log.bind("addDeletedBy");

    if (_.isArray(request.payload)) {
      request.payload = request.payload.map(function(data) {
        if (_.isString(data)) {
          return { _id: data, hardDelete: false }
        }
        else {
          return data;
        }
      })
    }

    return internals.addMeta('delete', request, reply, next, Log);
  };

  addDeletedByForModel.applyPoint = 'onPreHandler';
  return addDeletedByForModel;
};
internals.addDeletedBy.applyPoint = 'onPreHandler';

/**
 * Internal function to add the user's _id to a document's relevant meta property.
 * @param action
 * @param request
 * @param reply
 * @param next
 * @param Log
 * @returns {*}
 */
internals.addMeta = function(action, request, reply, next, Log) {

  try {
    let metaType = "";
    switch (action) {
      case "create":
        metaType = "createdBy";
        break;
      case "update":
        metaType = "updatedBy";
        break;
      case "delete":
        metaType = "deletedBy";
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
        document[metaType] = userId
      })
    }
    else {
      request.payload = request.payload || {};
      request.payload[metaType] = userId
    }

    return next(null, true);
  }
  catch (err) {
    Log.error("ERROR:", err);
    return next(Boom.badImplementation(err), false);
  }
  
};

module.exports = {
  addCreatedBy : internals.addCreatedBy,
  addUpdatedBy : internals.addUpdatedBy,
  addDeletedBy : internals.addDeletedBy
};

