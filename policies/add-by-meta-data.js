'use strict'

const Boom = require('boom')
const _ = require('lodash')
const config = require('../config')

const internals = {}

/**
 * Policy to add the creating user's _id to the document's "createdBy" property.
 * @param model
 * @param logger
 * @returns {addCreatedByForModel}
 */
internals.addCreatedBy = function(model, logger) {
  const addCreatedByForModel = function addCreatedByForModel(request, h) {
    const Log = logger.bind('addCreatedBy')

    return internals.addMeta('create', request, h, Log)
  }

  addCreatedByForModel.applyPoint = 'onPreHandler'
  return addCreatedByForModel
}
internals.addCreatedBy.applyPoint = 'onPreHandler'

/**
 * Policy to add the updating user's _id to the document's "updatedBy" property.
 * @param model
 * @param logger
 * @returns {addUpdatedByForModel}
 */
internals.addUpdatedBy = function(model, logger) {
  const addUpdatedByForModel = function addUpdatedByForModel(request, h) {
    const Log = logger.bind('addUpdatedBy')

    return internals.addMeta('update', request, h, Log)
  }

  addUpdatedByForModel.applyPoint = 'onPreHandler'
  return addUpdatedByForModel
}
internals.addUpdatedBy.applyPoint = 'onPreHandler'

/**
 * Policy to add the deleting user's _id to the document's "deletedBy" property.
 * @param model
 * @param logger
 * @returns {addDeletedByForModel}
 */
internals.addDeletedBy = function(model, logger) {
  const addDeletedByForModel = function addDeletedByForModel(request, h) {
    const Log = logger.bind('addDeletedBy')

    if (_.isArray(request.payload)) {
      request.payload = request.payload.map(function(data) {
        if (_.isString(data)) {
          return { _id: data, hardDelete: false }
        } else {
          return data
        }
      })
    }

    return internals.addMeta('delete', request, h, Log)
  }

  addDeletedByForModel.applyPoint = 'onPreHandler'
  return addDeletedByForModel
}
internals.addDeletedBy.applyPoint = 'onPreHandler'

/**
 * Internal function to add the user's _id to a document's relevant meta property.
 * @param action
 * @param request
 * @param h
 * @param logger
 * @returns {*}
 */
internals.addMeta = function(action, request, h, logger) {
  const Log = logger.bind()

  try {
    let metaType = ''
    switch (action) {
      case 'create':
        metaType = 'createdBy'
        break
      case 'update':
        metaType = 'updatedBy'
        break
      case 'delete':
        metaType = 'deletedBy'
        break
      default:
        throw new Error('Invalid action.')
    }

    let userId = _.get(request.auth.credentials, config.userIdKey)

    if (!userId) {
      let message =
        'User _id not found in auth credentials. Please specify the user _id path in "config.userIdKey"'
      Log.error(message)
      throw Boom.badRequest(message)
    }

    if (_.isArray(request.payload)) {
      request.payload.forEach(function(document) {
        document[metaType] = userId
      })
    } else {
      request.payload = request.payload || {}
      request.payload[metaType] = userId
    }

    return h.continue
  } catch (err) {
    if (err.isBoom) {
      throw err
    } else {
      Log.error(err)
      throw Boom.badImplementation(err)
    }
  }
}

module.exports = {
  addCreatedBy: internals.addCreatedBy,
  addUpdatedBy: internals.addUpdatedBy,
  addDeletedBy: internals.addDeletedBy
}
