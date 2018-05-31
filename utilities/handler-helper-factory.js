'use strict'

let Boom = require('boom')
let handlerHelper = require('./handler-helper')

// TODO: add bulk delete/delete many

// TODO: consolidate eventLog functionality

// TODO-DONE: make returns more consistent/return all reply's

// TODO: make sure pre and post is supported for appropriate endpoints

// TODO: handle errors/status responses appropriately

// TODO: include option to set all default fields to NULL so they exist and are returned with queries

// TODO: possibly refactor/remove routeOptions

// TODO: apply .lean() before any exec() to speed up execution time when returning data

// TODO: possibly execute .toJSON() on all return data to reduce data size

// TODO: look into using glue

// TODO: abstract mongoose logic into CRUD utility methods that can be called directly with rest-hapi plugin
// TODO:(cont) This will allow users to CRUD data in extra endpoints using rest-hapi functions.

module.exports = function() {
  return {
    /**
     * Handles incoming GET requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateListHandler: generateListHandler,

    /**
     * Handles incoming GET requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateFindHandler: generateFindHandler,

    /**
     * Handles incoming POST requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateCreateHandler: generateCreateHandler,

    /**
     * Handles incoming DELETE requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateDeleteHandler: generateDeleteHandler,

    /**
     * Handles incoming UPDATE requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateUpdateHandler: generateUpdateHandler,

    /**
     * Handles incoming PUT requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationAddOneHandler: generateAssociationAddOneHandler,

    /**
     * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationRemoveOneHandler: generateAssociationRemoveOneHandler,

    /**
     * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationAddManyHandler: generateAssociationAddManyHandler,

    /**
     * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationRemoveManyHandler: generateAssociationRemoveManyHandler,

    /**
     * Handles incoming GET requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param logger: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationGetAllHandler: generateAssociationGetAllHandler
  }
}

/**
 * Handles incoming GET requests to /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateListHandler(model, options, logger) {
  const Log = logger.bind()
  options = options || {}

  return async function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      let result = await handlerHelper.listHandler(model, request, Log)
      delete result.pageData
      return h.response(result).code(200)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming GET requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateFindHandler(model, options, logger) {
  const Log = logger.bind()
  options = options || {}

  return async function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      let result = await handlerHelper.findHandler(
        model,
        request.params._id,
        request,
        Log
      )
      return h.response(result).code(200)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming POST requests to /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateCreateHandler(model, options, logger) {
  const Log = logger.bind()
  options = options || {}

  return async function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      let result = await handlerHelper.createHandler(model, request, Log)
      return h.response(result).code(201)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming UPDATE requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateUpdateHandler(model, options, logger) {
  const Log = logger.bind()
  options = options || {}

  return async function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      let result = await handlerHelper.updateHandler(
        model,
        request.params._id,
        request,
        Log
      )
      return h.response(result).code(200)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming DELETE requests to /RESOURCE/{_id} or /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateDeleteHandler(model, options, logger) {
  const Log = logger.bind()
  options = options || {}

  return async function(request, h) {
    try {
      Log.log(
        'params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      if (request.params._id) {
        let hardDelete = request.payload ? request.payload.hardDelete : false
        await handlerHelper.deleteOneHandler(
          model,
          request.params._id,
          hardDelete,
          request,
          Log
        )
      } else {
        await handlerHelper.deleteManyHandler(model, request, Log)
      }

      return h.response().code(204)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming PUT requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddOneHandler(
  ownerModel,
  association,
  options,
  logger
) {
  const Log = logger.bind()
  let associationName = association.include.as
  let childModel = association.include.model
  let addMethodName =
    'addOne' + associationName[0].toUpperCase() + associationName.slice(1, -1)

  return async function(request, h) {
    try {
      Log.log(
        addMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      await handlerHelper.addOneHandler(
        ownerModel,
        request.params.ownerId,
        childModel,
        request.params.childId,
        associationName,
        request,
        Log
      )
      return h.response().code(204)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationRemoveOneHandler(
  ownerModel,
  association,
  options,
  logger
) {
  const Log = logger.bind()
  let associationName = association.include.as
  let childModel = association.include.model
  let removeMethodName =
    'removeOne' +
    associationName[0].toUpperCase() +
    associationName.slice(1, -1)

  return async function(request, h) {
    try {
      Log.log(
        removeMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      await handlerHelper.removeOneHandler(
        ownerModel,
        request.params.ownerId,
        childModel,
        request.params.childId,
        associationName,
        request,
        Log
      )
      return h.response().code(204)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddManyHandler(
  ownerModel,
  association,
  options,
  logger
) {
  const Log = logger.bind()
  let associationName = association.include.as
  let childModel = association.include.model
  let addMethodName =
    'addMany' + associationName[0].toUpperCase() + associationName.slice(1)

  return async function(request, h) {
    try {
      Log.log(
        addMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      await handlerHelper.addManyHandler(
        ownerModel,
        request.params.ownerId,
        childModel,
        associationName,
        request,
        Log
      )
      return h.response().code(204)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

// TODO: need to make sure removeMany calls are sequential, otherwise errors occur
/**
 * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationRemoveManyHandler(
  ownerModel,
  association,
  options,
  logger
) {
  const Log = logger.bind()
  let associationName = association.include.as
  let childModel = association.include.model
  let removeMethodName =
    'removeMany' + associationName[0].toUpperCase() + associationName.slice(1)

  return async function(request, h) {
    try {
      Log.log(
        removeMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      await handlerHelper.removeManyHandler(
        ownerModel,
        request.params.ownerId,
        childModel,
        associationName,
        request,
        Log
      )
      return h.response().code(204)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

/**
 * Handles incoming GET requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param logger: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationGetAllHandler(
  ownerModel,
  association,
  options,
  logger
) {
  const Log = logger.bind()
  let associationName = association.include.as
  let childModel = association.include.model
  let getAllMethodName =
    association.getAllMethodName ||
    'get' + associationName[0].toUpperCase() + associationName.slice(1)

  return async function(request, h) {
    try {
      Log.log(
        getAllMethodName + ' + params(%s), query(%s), payload(%s)',
        JSON.stringify(request.params),
        JSON.stringify(request.query),
        JSON.stringify(request.payload)
      )

      let result = await handlerHelper.getAllHandler(
        ownerModel,
        request.params.ownerId,
        childModel,
        associationName,
        request,
        Log
      )
      return h.response(result).code(200)
    } catch (err) {
      handleError(err, Log)
    }
  }
}

function handleError(err, logger) {
  if (!err.isBoom) {
    logger.error(err)
    throw Boom.badImplementation('There was an error processing the request.')
  } else {
    throw err
  }
}
