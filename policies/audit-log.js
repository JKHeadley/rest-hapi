'use strict'

const _ = require('lodash')
const config = require('../config')

const internals = {}

/**
 * Policy to log create actions.
 * @param model
 * @param logger
 * @returns {logCreateForModel}
 */
internals.logCreate = function(mongoose, model, logger) {
  const logCreateForModel = async function logCreateForModel(request, h) {
    const Log = logger.bind('logCreate')
    try {
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = request.response.source
      if (documents) {
        if (_.isArray(documents)) {
          documents = documents.map(function(doc) {
            return doc._id
          })
        } else {
          documents = [documents._id]
        }
      }

      await AuditLog.create({
        method: 'POST',
        action: 'Create',
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
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
      return h.continue
    } catch (err) {
      Log.error(err)
      return h.continue
    }
  }

  logCreateForModel.applyPoint = 'onPreResponse'
  return logCreateForModel
}
internals.logCreate.applyPoint = 'onPreResponse'

/**
 * Policy to log update actions.
 * @param model
 * @param logger
 * @returns {logUpdateForModel}
 */
internals.logUpdate = function(mongoose, model, logger) {
  const logUpdateForModel = async function logUpdateForModel(request, h) {
    const Log = logger.bind('logUpdate')
    try {
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = [request.params._id]

      await AuditLog.create({
        method: 'PUT',
        action: 'Update',
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
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
      return h.continue
    } catch (err) {
      Log.error(err)
      return h.continue
    }
  }

  logUpdateForModel.applyPoint = 'onPreResponse'
  return logUpdateForModel
}
internals.logUpdate.applyPoint = 'onPreResponse'

module.exports = {
  logUpdate: internals.logUpdate
}

/**
 * Policy to log delete actions.
 * @param model
 * @param logger
 * @returns {logDeleteForModel}
 */
internals.logDelete = function(mongoose, model, logger) {
  const logDeleteForModel = async function logDeleteForModel(request, h) {
    const Log = logger.bind('logDelete')
    try {
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = request.params._id || request.payload
      if (_.isArray(documents) && documents[0]._id) {
        documents = documents.map(function(doc) {
          return doc._id
        })
      } else if (!_.isArray(documents)) {
        documents = [documents]
      }

      await AuditLog.create({
        method: 'DELETE',
        action: 'Delete',
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
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
      return h.continue
    } catch (err) {
      Log.error(err)
      return h.continue
    }
  }

  logDeleteForModel.applyPoint = 'onPreResponse'
  return logDeleteForModel
}
internals.logDelete.applyPoint = 'onPreResponse'

module.exports = {
  logDelete: internals.logDelete
}

/**
 * Policy to log add actions.
 * @param model
 * @param logger
 * @returns {logAddForModel}
 */
internals.logAdd = function(
  mongoose,
  ownerModel,
  childModel,
  associationType,
  logger
) {
  const logAddForModel = async function logAddForModel(request, h) {
    const Log = logger.bind('logAdd')
    try {
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = [request.params.ownerId]

      if (request.params.childId) {
        documents.push(request.params.childId)
      } else {
        request.payload.forEach(function(child) {
          if (child.childId) {
            documents.push(child.childId)
          } else {
            documents.push(child)
          }
        })
      }

      let method = 'POST'

      if (request.method === 'put') {
        method = 'PUT'
      }

      await AuditLog.create({
        method: method,
        action: 'Add',
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
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
      return h.continue
    } catch (err) {
      Log.error(err)
      return h.continue
    }
  }

  logAddForModel.applyPoint = 'onPreResponse'
  return logAddForModel
}
internals.logAdd.applyPoint = 'onPreResponse'

/**
 * Policy to log remove actions.
 * @param model
 * @param logger
 * @returns {logRemoveForModel}
 */
internals.logRemove = function(
  mongoose,
  ownerModel,
  childModel,
  associationType,
  logger
) {
  const logRemoveForModel = async function logRemoveForModel(request, h) {
    const Log = logger.bind('logRemove')
    try {
      const AuditLog = mongoose.model('auditLog')

      const ipAddress = internals.getIP(request)
      let userId = _.get(request.auth.credentials, config.userIdKey)
      let documents = [request.params.ownerId]

      if (request.params.childId) {
        documents.push(request.params.childId)
      } else {
        documents = documents.concat(request.payload)
      }

      await AuditLog.create({
        method: 'DELETE',
        action: 'Remove',
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
        statusCode:
          request.response.statusCode || request.response.output.statusCode,
        responseMessage: request.response.output
          ? request.response.output.payload.message
          : null,
        ipAddress
      })
      return h.continue
    } catch (err) {
      Log.error(err)
      return h.continue
    }
  }

  logRemoveForModel.applyPoint = 'onPreResponse'
  return logRemoveForModel
}
internals.logRemove.applyPoint = 'onPreResponse'

internals.getIP = function(request) {
  // EXPL: We check the headers first in case the server is behind a reverse proxy.
  // see: https://ypereirareis.github.io/blog/2017/02/15/nginx-real-ip-behind-nginx-reverse-proxy/
  return (
    request.headers['x-real-ip'] ||
    request.headers['x-forwarded-for'] ||
    request.info.remoteAddress
  )
}

module.exports = {
  logCreate: internals.logCreate,
  logUpdate: internals.logUpdate,
  logDelete: internals.logDelete,
  logAdd: internals.logAdd,
  logRemove: internals.logRemove
}
