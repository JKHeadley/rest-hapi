'use strict'

const Boom = require('boom')
const _ = require('lodash')
const config = require('../config')

const internals = {}

/**
 * Policy to authorize a document's creator to perform any action on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorForModel}
 */
internals.authorizeDocumentCreator = function(model, Log) {
  const authorizeDocumentCreatorForModel = function authorizeDocumentCreatorForModel(
    request,
    h
  ) {
    Log = Log.bind('authorizeDocumentCreator')

    return internals.addScope('root', request, h, Log)
  }

  authorizeDocumentCreatorForModel.applyPoint = 'onPreHandler'
  return authorizeDocumentCreatorForModel
}
internals.authorizeDocumentCreator.applyPoint = 'onPreHandler'

/**
 * Policy to authorize a document's creator to perform read actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToReadForModel}
 */
internals.authorizeDocumentCreatorToRead = function(model, Log) {
  const authorizeDocumentCreatorToReadForModel = function authorizeDocumentCreatorToReadForModel(
    request,
    h
  ) {
    Log = Log.bind('authorizeDocumentCreatorToRead')

    return internals.addScope('read', request, h, Log)
  }

  authorizeDocumentCreatorToReadForModel.applyPoint = 'onPreHandler'
  return authorizeDocumentCreatorToReadForModel
}
internals.authorizeDocumentCreatorToRead.applyPoint = 'onPreHandler'

/**
 * Policy to authorize a document's creator to perform update actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToUpdateForModel}
 */
internals.authorizeDocumentCreatorToUpdate = function(model, Log) {
  const authorizeDocumentCreatorToUpdateForModel = function authorizeDocumentCreatorToUpdateForModel(
    request,
    h
  ) {
    Log = Log.bind('authorizeDocumentCreatorToUpdate')

    return internals.addScope('update', request, h, Log)
  }

  authorizeDocumentCreatorToUpdateForModel.applyPoint = 'onPreHandler'
  return authorizeDocumentCreatorToUpdateForModel
}
internals.authorizeDocumentCreatorToUpdate.applyPoint = 'onPreHandler'

/**
 * Policy to authorize a document's creator to perform delete actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToDeleteForModel}
 */
internals.authorizeDocumentCreatorToDelete = function(model, Log) {
  const authorizeDocumentCreatorToDeleteForModel = function authorizeDocumentCreatorToDeleteForModel(
    request,
    h
  ) {
    Log = Log.bind('authorizeDocumentCreatorToDelete')

    return internals.addScope('delete', request, h, Log)
  }

  authorizeDocumentCreatorToDeleteForModel.applyPoint = 'onPreHandler'
  return authorizeDocumentCreatorToDeleteForModel
}
internals.authorizeDocumentCreatorToDelete.applyPoint = 'onPreHandler'

/**
 * Policy to authorize a document's creator to perform associate actions on the document.
 * @param model
 * @param Log
 * @returns {authorizeDocumentCreatorToAssociateForModel}
 */
internals.authorizeDocumentCreatorToAssociate = function(model, Log) {
  const authorizeDocumentCreatorToAssociateForModel = function authorizeDocumentCreatorToAssociateForModel(
    request,
    h
  ) {
    Log = Log.bind('authorizeDocumentCreatorToAssociate')

    return internals.addScope('associate', request, h, Log)
  }

  authorizeDocumentCreatorToAssociateForModel.applyPoint = 'onPreHandler'
  return authorizeDocumentCreatorToAssociateForModel
}
internals.authorizeDocumentCreatorToAssociate.applyPoint = 'onPreHandler'

/**
 * Internal function to add the creating user's _id to a document's relevant action scope.
 * @param action
 * @param request
 * @param h
 * @param Log
 * @returns {*}
 */
internals.addScope = function(action, request, h, Log) {
  try {
    let scopeType = ''
    switch (action) {
      case 'root':
        scopeType = 'rootScope'
        break
      case 'read':
        scopeType = 'readScope'
        break
      case 'update':
        scopeType = 'updateScope'
        break
      case 'delete':
        scopeType = 'deleteScope'
        break
      case 'associate':
        scopeType = 'associateScope'
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
        let scope = {}
        scope[scopeType] = []

        document.scope = document.scope || scope
        document.scope[scopeType] = document.scope[scopeType] || []
        document.scope[scopeType].push('user-' + userId)
      })
    } else {
      let scope = {}
      scope[scopeType] = []

      request.payload.scope = request.payload.scope || scope
      request.payload.scope[scopeType] = request.payload.scope[scopeType] || []
      request.payload.scope[scopeType].push('user-' + userId)
    }

    return h.continue
  } catch (err) {
    if (err.isBoom) {
      throw err
    } else {
      Log.error('ERROR:', err)
      throw Boom.badImplementation(err)
    }
  }
}

module.exports = {
  authorizeDocumentCreator: internals.authorizeDocumentCreator,
  authorizeDocumentCreatorToRead: internals.authorizeDocumentCreatorToRead,
  authorizeDocumentCreatorToUpdate: internals.authorizeDocumentCreatorToUpdate,
  authorizeDocumentCreatorToDelete: internals.authorizeDocumentCreatorToDelete,
  authorizeDocumentCreatorToAssociate:
    internals.authorizeDocumentCreatorToAssociate
}
