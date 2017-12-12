'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};

/**
 * Policy to log create actions.
 * @param model
 * @param Log
 * @returns {logCreateForModel}
 */
internals.logCreate = function(mongoose, model, Log) {

  const logCreateForModel = function logCreateForModel(request, reply, next) {
    try {
      Log = Log.bind("logCreate");
      const AuditLog = mongoose.model('auditLog');

      const ipAddress = request.info.remoteAddress;
      let userId = _.get(request.auth.credentials, config.userIdKey);
      let documents = request.response.source;
      if (documents) {
        if (_.isArray(documents)) {
          documents = documents.map(function (doc) {
            return doc._id
          })
        }
        else {
          documents = [documents._id]
        }
      }


      return AuditLog.create({
        method: "POST",
        action: "Create",
        endpoint: request.path,
        user: userId || null,
        collectionName: model.collectionName,
        childCollectionName: null,
        associationType: null,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode: request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output ? request.response.output.payload.message : null,
        ipAddress
      })
          .then(function (result) {
            next(null, true);
          })
          .catch(function (err) {
            Log.error('ERROR:', err);
            next(null, true);
          })
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  logCreateForModel.applyPoint = 'onPostHandler';
  return logCreateForModel;
};
internals.logCreate.applyPoint = 'onPostHandler';


/**
 * Policy to log update actions.
 * @param model
 * @param Log
 * @returns {logUpdateForModel}
 */
internals.logUpdate = function(mongoose, model, Log) {

  const logUpdateForModel = function logUpdateForModel(request, reply, next) {
    try {
      Log = Log.bind("logUpdate");
      const AuditLog = mongoose.model('auditLog');

      const ipAddress = request.info.remoteAddress;
      let userId = _.get(request.auth.credentials, config.userIdKey);
      let documents = [request.params._id];

      return AuditLog.create({
        method: "PUT",
        action: "Update",
        endpoint: request.path,
        user: userId || null,
        collectionName: model.collectionName,
        childCollectionName: null,
        associationType: null,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode: request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output ? request.response.output.payload.message : null,
        ipAddress
      })
          .then(function (result) {
            next(null, true);
          })
          .catch(function (err) {
            Log.error('ERROR:', err);
            next(null, true);
          })
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  logUpdateForModel.applyPoint = 'onPostHandler';
  return logUpdateForModel;
};
internals.logUpdate.applyPoint = 'onPostHandler';

module.exports = {
  logUpdate : internals.logUpdate
};

/**
 * Policy to log delete actions.
 * @param model
 * @param Log
 * @returns {logDeleteForModel}
 */
internals.logDelete = function(mongoose, model, Log) {

  const logDeleteForModel = function logDeleteForModel(request, reply, next) {
    try {
      Log = Log.bind("logDelete");
      const AuditLog = mongoose.model('auditLog');

      const ipAddress = request.info.remoteAddress;
      let userId = _.get(request.auth.credentials, config.userIdKey);
      let documents = request.params._id || request.payload;
      if (_.isArray(documents) && documents[0]._id) {
        documents = documents.map(function (doc) {
          return doc._id
        })
      }
      else if (!_.isArray(documents)) {
        documents = [documents]
      }

      return AuditLog.create({
        method: "DELETE",
        action: "Delete",
        endpoint: request.path,
        user: userId || null,
        collectionName: model.collectionName,
        childCollectionName: null,
        associationType: null,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode: request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output ? request.response.output.payload.message : null,
        ipAddress
      })
          .then(function (result) {
            next(null, true);
          })
          .catch(function (err) {
            Log.error('ERROR:', err);
            next(null, true);
          })
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  logDeleteForModel.applyPoint = 'onPostHandler';
  return logDeleteForModel;
};
internals.logDelete.applyPoint = 'onPostHandler';

module.exports = {
  logDelete : internals.logDelete
};

/**
 * Policy to log add actions.
 * @param model
 * @param Log
 * @returns {logAddForModel}
 */
internals.logAdd = function(mongoose, ownerModel, childModel, associationType, Log) {

  const logAddForModel = function logAddForModel(request, reply, next) {
    try {
      Log = Log.bind("logAdd");
      const AuditLog = mongoose.model('auditLog');

      const ipAddress = request.info.remoteAddress;
      let userId = _.get(request.auth.credentials, config.userIdKey);
      let documents = [request.params.ownerId];

      if (request.params.childId) {
        documents.push(request.params.childId);
      }
      else {
        request.payload.forEach(function(child) {
          if (child.childId) {
            documents.push(child.childId)
          }
          else {
            documents.push(child)
          }
        })
      }

      let method = 'POST';

      if (request.method === 'put') {
        method = 'PUT';
      }

      return AuditLog.create({
        method: method,
        action: "Add",
        endpoint: request.path,
        user: userId || null,
        collectionName: ownerModel.collectionName,
        childCollectionName: childModel.collectionName,
        associationType: associationType,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode: request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output ? request.response.output.payload.message : null,
        ipAddress
      })
          .then(function (result) {
            next(null, true);
          })
          .catch(function (err) {
            Log.error('ERROR:', err);
            next(null, true);
          })
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  logAddForModel.applyPoint = 'onPostHandler';
  return logAddForModel;
};
internals.logAdd.applyPoint = 'onPostHandler';

/**
 * Policy to log remove actions.
 * @param model
 * @param Log
 * @returns {logRemoveForModel}
 */
internals.logRemove = function(mongoose, ownerModel, childModel, associationType, Log) {

  const logRemoveForModel = function logRemoveForModel(request, reply, next) {
    try {
      Log = Log.bind("logRemove");
      const AuditLog = mongoose.model('auditLog');

      const ipAddress = request.info.remoteAddress;
      let userId = _.get(request.auth.credentials, config.userIdKey);
      let documents = [request.params.ownerId];

      if (request.params.childId) {
        documents.push(request.params.childId);
      }
      else {
        documents = documents.concat(request.payload)
      }

      return AuditLog.create({
        method: 'DELETE',
        action: "Remove",
        endpoint: request.path,
        user: userId || null,
        collectionName: ownerModel.collectionName,
        childCollectionName: childModel.collectionName,
        associationType: associationType,
        documents: documents || null,
        payload: _.isEmpty(request.payload) ? null : request.payload,
        params: _.isEmpty(request.params) ? null : request.params,
        result: request.response.source || null,
        isError: _.isError(request.response),
        statusCode: request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output ? request.response.output.payload.message : null,
        ipAddress
      })
          .then(function (result) {
            next(null, true);
          })
          .catch(function (err) {
            Log.error('ERROR:', err);
            next(null, true);
          })
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(null, true);
    }

  };

  logRemoveForModel.applyPoint = 'onPostHandler';
  return logRemoveForModel;
};
internals.logRemove.applyPoint = 'onPostHandler';


module.exports = {
  logCreate : internals.logCreate,
  logUpdate : internals.logUpdate,
  logDelete : internals.logDelete,
  logAdd : internals.logAdd,
  logRemove : internals.logRemove
};

