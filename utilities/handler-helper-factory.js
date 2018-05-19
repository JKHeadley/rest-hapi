'use strict'

let Boom = require('boom')
let Q = require('q')
let extend = require('util')._extend
let handlerHelper = require('./handler-helper')
let errorHelper = require('./error-helper')
let config = require('../config')

// TODO: add bulk delete/delete many

// TODO: consolidate eventLog functionality

// TODO-DONE: make returns more consistent/return all reply's

// TODO: make sure pre and post is supported for appropriate endpoints

// TODO: handle errors/status responses appropriately

// TODO: include option to set all default fields to NULL so they exist and are returned with queries

// TODO: possibly refactor/remove routeOptions

// TODO: apply .lean() before any exec() to speed up execution time when returning data

// TODO: possibly execute .toJSON() on all return data to reduce data size

// TODO-DONE: update hapi version

// TODO: look into using glue

// TODO: abstract mongoose logic into CRUD utility methods that can be called directly with rest-hapi plugin
// TODO:(cont) This will allow users to CRUD data in extra endpoints using rest-hapi functions.

let mongoose, server
module.exports = function(_mongoose, _server) {
  mongoose = _mongoose
  server = _server

  return {
    /**
     * Handles incoming GET requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateListHandler: generateListHandler,

    /**
     * Handles incoming GET requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateFindHandler: generateFindHandler,

    /**
     * Handles incoming POST requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateCreateHandler: generateCreateHandler,

    /**
     * Handles incoming DELETE requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateDeleteHandler: generateDeleteHandler,

    /**
     * Handles incoming UPDATE requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateUpdateHandler: generateUpdateHandler,

    /**
     * Handles incoming PUT requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationAddOneHandler: generateAssociationAddOneHandler,

    /**
     * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationRemoveOneHandler: generateAssociationRemoveOneHandler,

    /**
     * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationAddManyHandler: generateAssociationAddManyHandler,

    /**
     * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationRemoveManyHandler: generateAssociationRemoveManyHandler,

    /**
     * Handles incoming GET requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationGetAllHandler: generateAssociationGetAllHandler
  }
}

/**
 * Handles incoming GET requests to /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateListHandler(model, options, Log) {
  options = options || {}

  return function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .listHandler(model, request, Log)
        .then(function(result) {
          const pageData = result.pageData
          delete result.pageData
          return h.response(result).code(200)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming GET requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateFindHandler(model, options, Log) {
  options = options || {}

  return function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .findHandler(model, request.params._id, request, Log)
        .then(function(result) {
          return h.response(result).code(200)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming POST requests to /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateCreateHandler(model, options, Log) {
  options = options || {}

  return function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .createHandler(model, request, Log)
        .then(function(result) {
          return h.response(result).code(201)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error(error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming UPDATE requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateUpdateHandler(model, options, Log) {
  options = options || {}

  return function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .updateHandler(model, request.params._id, request, Log)
        .then(function(result) {
          return h.response(result).code(200)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming DELETE requests to /RESOURCE/{_id} or /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateDeleteHandler(model, options, Log) {
  options = options || {}

  return function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      let promise = {}
      if (request.params._id) {
        let hardDelete = request.payload ? request.payload.hardDelete : false
        promise = handlerHelper.deleteOneHandler(
          model,
          request.params._id,
          hardDelete,
          request,
          Log
        )
      } else {
        promise = handlerHelper.deleteManyHandler(model, request, Log)
      }

      return promise
        .then(function(result) {
          return h.response().code(204)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming PUT requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddOneHandler(
  ownerModel,
  association,
  options,
  Log
) {
  let associationName = association.include.as
  let childModel = association.include.model
  let addMethodName =
    'addOne' + associationName[0].toUpperCase() + associationName.slice(1, -1)

  return function(request, h) {
    try {
      Log.log(
        addMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .addOneHandler(
          ownerModel,
          request.params.ownerId,
          childModel,
          request.params.childId,
          associationName,
          request,
          Log
        )
        .then(function(result) {
          return h.response().code(204)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationRemoveOneHandler(
  ownerModel,
  association,
  options,
  Log
) {
  let associationName = association.include.as
  let childModel = association.include.model
  let removeMethodName =
    'removeOne' +
    associationName[0].toUpperCase() +
    associationName.slice(1, -1)

  return function(request, h) {
    try {
      Log.log(
        removeMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .removeOneHandler(
          ownerModel,
          request.params.ownerId,
          childModel,
          request.params.childId,
          associationName,
          request,
          Log
        )
        .then(function(result) {
          return h.response().code(204)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddManyHandler(
  ownerModel,
  association,
  options,
  Log
) {
  let associationName = association.include.as
  let childModel = association.include.model
  let addMethodName =
    'addMany' + associationName[0].toUpperCase() + associationName.slice(1)

  return function(request, h) {
    try {
      Log.log(
        addMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .addManyHandler(
          ownerModel,
          request.params.ownerId,
          childModel,
          associationName,
          request,
          Log
        )
        .then(function(result) {
          return h.response().code(204)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

// TODO: need to make sure removeMany calls are sequential, otherwise errors occur
/**
 * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationRemoveManyHandler(
  ownerModel,
  association,
  options,
  Log
) {
  let associationName = association.include.as
  let childModel = association.include.model
  let removeMethodName =
    'removeMany' + associationName[0].toUpperCase() + associationName.slice(1)

  return function(request, h) {
    try {
      Log.log(
        removeMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .removeManyHandler(
          ownerModel,
          request.params.ownerId,
          childModel,
          associationName,
          request,
          Log
        )
        .then(function(result) {
          Log.debug('result:', result)
          return h.response().code(204)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}

/**
 * Handles incoming GET requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationGetAllHandler(
  ownerModel,
  association,
  options,
  Log
) {
  let associationName = association.include.as
  let childModel = association.include.model
  let getAllMethodName =
    association.getAllMethodName ||
    'get' + associationName[0].toUpperCase() + associationName.slice(1)

  return function(request, h) {
    try {
      Log.log(
        getAllMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      return handlerHelper
        .getAllHandler(
          ownerModel,
          request.params.ownerId,
          childModel,
          associationName,
          request,
          Log
        )
        .then(function(result) {
          return h.response(result).code(200)
        })
        .catch(function(error) {
          let response = errorHelper.formatResponse(error, Log)
          return response
        })
    } catch (error) {
      Log.error('error: ', error)
      throw Boom.badRequest('There was an error processing the request.', error)
    }
  }
}
