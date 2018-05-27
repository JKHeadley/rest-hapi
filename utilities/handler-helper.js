'use strict'

let Boom = require('boom')
let QueryHelper = require('./query-helper')
let JoiMongooseHelper = require('./joi-mongoose-helper')
let config = require('../config')
let _ = require('lodash')

// TODO: add a "clean" method that clears out all soft-deleted docs
// TODO: add an optional TTL config setting that determines how long soft-deleted docs remain in the system
// TODO: possibly remove "MANY_ONE" association and make it implied
// TODO: possibly remove "ONE_ONE" association and make it implied

module.exports = {
  list: _list,

  listHandler: _listHandler,

  find: _find,

  findHandler: _findHandler,

  create: _create,

  createHandler: _createHandler,

  update: _update,

  updateHandler: _updateHandler,

  deleteOne: _deleteOne,

  deleteOneHandler: _deleteOneHandler,

  deleteMany: _deleteMany,

  deleteManyHandler: _deleteManyHandler,

  addOne: _addOne,

  addOneHandler: _addOneHandler,

  removeOne: _removeOne,

  removeOneHandler: _removeOneHandler,

  addMany: _addMany,

  addManyHandler: _addManyHandler,

  removeMany: _removeMany,

  removeManyHandler: _removeManyHandler,

  getAll: _getAll,

  getAllHandler: _getAllHandler
}

/**
 * List function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 * @private
 */
function _list(model, query, Log) {
  let request = { query: query }
  return _listHandler(model, request, Log)
}
/**
 * Finds a list of model documents.
 * @param model: A mongoose model.
 * @param request: The Hapi request object, or a container for the wrapper query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 * @private
 */
async function _listHandler(model, request, Log) {
  try {
    let query = Object.assign({}, request.query)
    try {
      if (
        model.routeOptions &&
        model.routeOptions.list &&
        model.routeOptions.list.pre
      ) {
        query = await model.routeOptions.list.pre(query, request, Log)
      }
    } catch (err) {
      handleError(err, 'There was a preprocessing error.', Boom.badRequest, Log)
    }

    let mongooseQuery = {}
    let flatten = false
    if (query.$flatten) {
      flatten = true
    }
    delete query.$flatten
    if (query.$count) {
      mongooseQuery = model.count()
      mongooseQuery = QueryHelper.createMongooseQuery(
        model,
        query,
        mongooseQuery,
        Log
      ).lean()
      let result = await mongooseQuery.exec()
      Log.log('Result: %s', JSON.stringify(result))
      return result
    }

    mongooseQuery = model.find()
    mongooseQuery = QueryHelper.createMongooseQuery(
      model,
      query,
      mongooseQuery,
      Log
    ).lean()
    let count = await mongooseQuery.count()
    mongooseQuery = QueryHelper.paginate(query, mongooseQuery, Log)
    let result = await mongooseQuery.exec('find')

    try {
      if (
        model.routeOptions &&
        model.routeOptions.list &&
        model.routeOptions.list.post
      ) {
        result = await model.routeOptions.list.post(request, result, Log)
      }
    } catch (err) {
      handleError(
        err,
        'There was a postprocessing error.',
        Boom.badRequest,
        Log
      )
    }

    result = result.map(data => {
      let result = data
      if (model.routeOptions) {
        let associations = model.routeOptions.associations
        for (let associationKey in associations) {
          let association = associations[associationKey]
          if (association.type === 'ONE_MANY' && data[associationKey]) {
            // EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
            if (data[associationKey].toJSON) {
              // TODO: look into .toJSON and see why it appears sometimes and not other times
              result[associationKey] = data[associationKey].toJSON()
            } else {
              result[associationKey] = data[associationKey]
            }
          }
          if (association.type === 'MANY_MANY' && flatten === true) {
            // EXPL: remove additional fields and return a flattened array
            if (result[associationKey]) {
              result[associationKey] = result[associationKey].map(object => {
                object = object[association.model]
                return object
              })
            }
          }
        }
      }

      if (config.enableSoftDelete && config.filterDeletedEmbeds) {
        // EXPL: remove soft deleted documents from populated properties
        filterDeletedEmbeds(result, {}, '', 0, Log)
      }

      Log.log('Result: %s', JSON.stringify(result))
      return result
    })

    const pages = {
      current: query.$page || 1,
      prev: 0,
      hasPrev: false,
      next: 0,
      hasNext: false,
      total: 0
    }
    const items = {
      limit: query.$limit,
      begin: (query.$page || 1) * query.$limit - query.$limit + 1,
      end: (query.$page || 1) * query.$limit,
      total: count
    }

    pages.total = Math.ceil(count / query.$limit)
    pages.next = pages.current + 1
    pages.hasNext = pages.next <= pages.total
    pages.prev = pages.current - 1
    pages.hasPrev = pages.prev !== 0
    if (items.begin > items.total) {
      items.begin = items.total
    }
    if (items.end > items.total) {
      items.end = items.total
    }

    return { docs: result, pages: pages, items: items }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * Find function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 * @private
 */
function _find(model, _id, query, Log) {
  let request = { params: { _id: _id }, query: query }
  return _findHandler(model, _id, request, Log)
}
/**
 * Finds a model document.
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param request: The Hapi request object, or a container for the wrapper query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 * @private
 */
async function _findHandler(model, _id, request, Log) {
  try {
    let query = Object.assign({}, request.query)
    try {
      if (
        model.routeOptions &&
        model.routeOptions.find &&
        model.routeOptions.find.pre
      ) {
        query = await model.routeOptions.find.pre(_id, query, request, Log)
      }
    } catch (err) {
      handleError(err, 'There was a preprocessing error.', Boom.badRequest, Log)
    }

    let flatten = false
    if (query.$flatten) {
      flatten = true
    }
    delete query.$flatten
    let mongooseQuery = model.findOne({ _id: _id })
    mongooseQuery = QueryHelper.createMongooseQuery(
      model,
      query,
      mongooseQuery,
      Log
    ).lean()
    let result = await mongooseQuery.exec()
    if (result) {
      let data = result
      try {
        if (
          model.routeOptions &&
          model.routeOptions.find &&
          model.routeOptions.find.post
        ) {
          data = await model.routeOptions.find.post(request, result, Log)
        }
      } catch (err) {
        handleError(
          err,
          'There was a postprocessing error.',
          Boom.badRequest,
          Log
        )
      }
      if (model.routeOptions) {
        let associations = model.routeOptions.associations
        for (let associationKey in associations) {
          let association = associations[associationKey]
          if (association.type === 'ONE_MANY' && data[associationKey]) {
            // EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
            result[associationKey] = data[associationKey]
          }
          if (association.type === 'MANY_MANY' && flatten === true) {
            // EXPL: remove additional fields and return a flattened array
            if (result[associationKey]) {
              result[associationKey] = result[associationKey].map(object => {
                object = object[association.model]
                return object
              })
            }
          }
        }
      }

      if (config.enableSoftDelete && config.filterDeletedEmbeds) {
        // EXPL: remove soft deleted documents from populated properties
        filterDeletedEmbeds(result, {}, '', 0, Log)
      }

      Log.log('Result: %s', JSON.stringify(result))

      return result
    } else {
      throw Boom.notFound('No resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * Create function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param payload: Data used to create the model document/s.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document/s.
 * @private
 */
function _create(model, payload, Log) {
  let request = { payload: payload }
  return _createHandler(model, request, Log)
}
// TODO: make sure errors are catching in correct order
/**
 * Creates one or more model documents.
 * @param model: A mongoose model.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document/s.
 * @private
 */
async function _createHandler(model, request, Log) {
  let payload = null

  try {
    // EXPL: make a copy of the payload so that request.payload remains unchanged
    let isArray = true
    if (!_.isArray(request.payload)) {
      payload = [Object.assign({}, request.payload)]
      isArray = false
    } else {
      payload = request.payload.map(item => {
        return _.isObject(item) ? _.assignIn({}, item) : item
      })
    }

    try {
      if (
        model.routeOptions &&
        model.routeOptions.create &&
        model.routeOptions.create.pre
      ) {
        for (let document of payload) {
          await model.routeOptions.create.pre(document, request, Log)
        }
      }
    } catch (err) {
      handleError(
        err,
        'There was a preprocessing error creating the resource.',
        Boom.badRequest,
        Log
      )
    }

    if (config.enableCreatedAt) {
      for (let document of payload) {
        document.createdAt = new Date()
      }
    }

    let data
    try {
      data = await model.create(payload)
    } catch (err) {
      Log.error(err)
      if (err.code === 11000) {
        throw Boom.conflict('There was a duplicate key error.')
      } else {
        throw Boom.badImplementation(
          'There was an error creating the resource.'
        )
      }
    }

    // EXPL: rather than returning the raw "create" data, we filter the data through a separate query
    let attributes = QueryHelper.createAttributesFilter({}, model, Log)

    data = data.map(item => {
      return item._id
    })

    let result = await model
      .find()
      .where({ _id: { $in: data } })
      .select(attributes)
      .lean()
      .exec()

    try {
      if (
        model.routeOptions &&
        model.routeOptions.create &&
        model.routeOptions.create.post
      ) {
        for (let document of result) {
          await model.routeOptions.create.post(document, request, result, Log)
        }
      }
    } catch (err) {
      handleError(
        err,
        'There was a postprocessing error creating the resource.',
        Boom.badRequest,
        Log
      )
    }

    if (isArray) {
      return result
    } else {
      return result[0]
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * Update function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param payload: Data used to update the model document.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 * @private
 */
function _update(model, _id, payload, Log) {
  let request = { params: { _id: _id }, payload: payload }
  return _updateHandler(model, _id, request, Log)
}
/**
 * Updates a model document.
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 * @private
 */
async function _updateHandler(model, _id, request, Log) {
  let payload = Object.assign({}, request.payload)
  try {
    try {
      if (
        model.routeOptions &&
        model.routeOptions.update &&
        model.routeOptions.update.pre
      ) {
        payload = await model.routeOptions.update.pre(
          _id,
          payload,
          request,
          Log
        )
      }
    } catch (err) {
      handleError(
        err,
        'There was a preprocessing error updating the resource.',
        Boom.badRequest,
        Log
      )
    }

    if (config.enableUpdatedAt) {
      payload.updatedAt = new Date()
    }
    let result
    try {
      result = await model.findByIdAndUpdate(_id, payload, {
        runValidators: config.enableMongooseRunValidators
      })
    } catch (err) {
      Log.error(err)
      if (err.code === 11000) {
        throw Boom.conflict('There was a duplicate key error.')
      } else {
        throw Boom.badImplementation(
          'There was an error updating the resource.'
        )
      }
    }
    if (result) {
      let attributes = QueryHelper.createAttributesFilter({}, model, Log)

      result = await model.findOne({ _id: result._id }, attributes).lean()

      try {
        if (
          model.routeOptions &&
          model.routeOptions.update &&
          model.routeOptions.update.post
        ) {
          result = await model.routeOptions.update.post(request, result, Log)
        }
      } catch (err) {
        handleError(
          err,
          'There was a postprocessing error updating the resource.',
          Boom.badRequest,
          Log
        )
      }
      return result
    } else {
      throw Boom.notFound('No resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * DeleteOne function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param hardDelete: Flag used to determine a soft or hard delete.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 * @private
 */
function _deleteOne(model, _id, hardDelete, Log) {
  let request = { params: { _id: _id } }
  return _deleteOneHandler(model, _id, hardDelete, request, Log)
}
/**
 * Deletes a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param hardDelete: Flag used to determine a soft or hard delete.
 * @param request: The Hapi request object.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 * @private
 */
// TODO: only update "deleteAt" the first time a document is deleted
async function _deleteOneHandler(model, _id, hardDelete, request, Log) {
  try {
    try {
      if (
        model.routeOptions &&
        model.routeOptions.delete &&
        model.routeOptions.delete.pre
      ) {
        await model.routeOptions.delete.pre(_id, hardDelete, request, Log)
      }
    } catch (err) {
      handleError(
        err,
        'There was a preprocessing error deleting the resource.',
        Boom.badRequest,
        Log
      )
    }
    let deleted

    try {
      if (config.enableSoftDelete && !hardDelete) {
        let payload = { isDeleted: true }
        if (config.enableDeletedAt) {
          payload.deletedAt = new Date()
        }
        if (config.enableDeletedBy && config.enableSoftDelete) {
          let deletedBy =
            request.payload.deletedBy || request.payload[0].deletedBy
          if (deletedBy) {
            payload.deletedBy = deletedBy
          }
        }
        deleted = await model.findByIdAndUpdate(_id, payload, {
          new: true,
          runValidators: config.enableMongooseRunValidators
        })
      } else {
        deleted = await model.findByIdAndRemove(_id)
      }
    } catch (err) {
      handleError(
        err,
        'There was an error deleting the resource.',
        Boom.badImplementation,
        Log
      )
    }
    // TODO: clean up associations/set rules for ON DELETE CASCADE/etc.
    if (deleted) {
      // TODO: add eventLogs

      try {
        if (
          model.routeOptions &&
          model.routeOptions.delete &&
          model.routeOptions.delete.post
        ) {
          await model.routeOptions.delete.post(
            hardDelete,
            deleted,
            request,
            Log
          )
        }
      } catch (err) {
        handleError(
          err,
          'There was a postprocessing error deleting the resource.',
          Boom.badRequest,
          Log
        )
      }
      return true
    } else {
      throw Boom.notFound('No resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * DeleteMany function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param payload: Either an array of ids or an array of objects containing an id and a "hardDelete" flag.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 * @private
 */
function _deleteMany(model, payload, Log) {
  let request = { payload: payload }
  return _deleteManyHandler(model, request, Log)
}
/**
 * Deletes multiple documents.
 * @param model: A mongoose model.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 * @private
 */
// TODO: prevent Promise.all from catching first error and returning early. Catch individual errors and return a list
// TODO(cont) of ids that failed
async function _deleteManyHandler(model, request, Log) {
  try {
    // EXPL: make a copy of the payload so that request.payload remains unchanged
    let payload = request.payload.map(item => {
      return _.isObject(item) ? _.assignIn({}, item) : item
    })
    let promises = []
    for (let arg of payload) {
      if (JoiMongooseHelper.isObjectId(arg)) {
        promises.push(_deleteOneHandler(model, arg, false, request, Log))
      } else {
        promises.push(
          _deleteOneHandler(model, arg._id, arg.hardDelete, request, Log)
        )
      }
    }

    await Promise.all(promises)
    return true
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * AddOne function exposed as a mongoose wrapper.
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param childId: The id of the child document.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param payload: An object containing an extra linking-model fields.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 * @private
 */
function _addOne(
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  payload,
  Log
) {
  let request = {
    params: { ownerId: ownerId, childId: childId },
    payload: payload
  }
  return _addOneHandler(
    ownerModel,
    ownerId,
    childModel,
    childId,
    associationName,
    request,
    Log
  )
}
/**
 * Adds an association to a document
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param childId: The id of the child document.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 * @private
 */
async function _addOneHandler(
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  request,
  Log
) {
  try {
    let ownerObject = await ownerModel
      .findOne({ _id: ownerId })
      .select(associationName)
    let payload = Object.assign({}, request.payload)
    if (ownerObject) {
      if (!payload) {
        payload = {}
      }
      payload.childId = childId
      payload = [payload]

      try {
        if (
          ownerModel.routeOptions &&
          ownerModel.routeOptions.add &&
          ownerModel.routeOptions.add[associationName] &&
          ownerModel.routeOptions.add[associationName].pre
        ) {
          payload = await ownerModel.routeOptions.add[associationName].pre(
            payload,
            request,
            Log
          )
        }
      } catch (err) {
        handleError(
          err,
          'There was a preprocessing error while setting the association.',
          Boom.badRequest,
          Log
        )
      }

      try {
        await _setAssociation(
          ownerModel,
          ownerObject,
          childModel,
          childId,
          associationName,
          payload,
          Log
        )
      } catch (err) {
        handleError(
          err,
          'There was a database error while setting the association.',
          Boom.badImplementation,
          Log
        )
      }
      return true
    } else {
      throw Boom.notFound('No resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * RemoveOne function exposed as a mongoose wrapper.
 * @param ownerModel: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being removed.
 * @param childId: The id of the child document.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the remove succeeds.
 * @private
 */
function _removeOne(
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  Log
) {
  let request = { params: { ownerId: ownerId, childId: childId } }
  return _removeOneHandler(
    ownerModel,
    ownerId,
    childModel,
    childId,
    associationName,
    request,
    Log
  )
}
/**
 * Removes an association to a document
 * @param ownerModel: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being removed.
 * @param childId: The id of the child document.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param request: The Hapi request object.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the remove succeeds.
 * @private
 */
async function _removeOneHandler(
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  request,
  Log
) {
  try {
    let ownerObject = await ownerModel
      .findOne({ _id: ownerId })
      .select(associationName)
    if (ownerObject) {
      try {
        if (
          ownerModel.routeOptions &&
          ownerModel.routeOptions.remove &&
          ownerModel.routeOptions.remove[associationName] &&
          ownerModel.routeOptions.remove[associationName].pre
        ) {
          await ownerModel.routeOptions.remove[associationName].pre(
            {},
            request,
            Log
          )
        }
      } catch (err) {
        handleError(
          err,
          'There was a preprocessing error while removing the association.',
          Boom.badRequest,
          Log
        )
      }

      try {
        await _removeAssociation(
          ownerModel,
          ownerObject,
          childModel,
          childId,
          associationName,
          Log
        )
      } catch (err) {
        handleError(
          err,
          'There was a database error while removing the association.',
          Boom.badImplementation,
          Log
        )
      }
      return true
    } else {
      throw Boom.notFound('No resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * AddMany function exposed as a mongoose wrapper.
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param payload: Either a list of id's or a list of id's along with extra linking-model fields.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 * @private
 */
function _addMany(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  payload,
  Log
) {
  let request = { params: { ownerId: ownerId }, payload: payload }
  return _addManyHandler(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    request,
    Log
  )
}
/**
 * Adds multiple associations to a document.
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 * @private
 */
async function _addManyHandler(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  request,
  Log
) {
  try {
    // EXPL: make a copy of the payload so that request.payload remains unchanged
    let payload = request.payload.map(item => {
      return _.isObject(item) ? _.assignIn({}, item) : item
    })
    if (_.isEmpty(request.payload)) {
      throw Boom.badRequest('Payload is empty.')
    }

    let ownerObject = await ownerModel
      .findOne({ _id: ownerId })
      .select(associationName)
    if (ownerObject) {
      try {
        if (
          ownerModel.routeOptions &&
          ownerModel.routeOptions.add &&
          ownerModel.routeOptions.add[associationName] &&
          ownerModel.routeOptions.add[associationName].pre
        ) {
          payload = await ownerModel.routeOptions.add[associationName].pre(
            payload,
            request,
            Log
          )
        }
      } catch (err) {
        handleError(
          err,
          'There was a preprocessing error while setting the association.',
          Boom.badRequest,
          Log
        )
      }

      let childIds = []
      // EXPL: the payload is an array of Ids
      if (
        typeof payload[0] === 'string' ||
        payload[0] instanceof String ||
        payload[0]._bsontype === 'ObjectID'
      ) {
        childIds = payload
      } else {
        // EXPL: the payload contains extra fields
        childIds = payload.map(object => {
          return object.childId
        })
      }

      for (let childId of childIds) {
        try {
          await _setAssociation(
            ownerModel,
            ownerObject,
            childModel,
            childId,
            associationName,
            payload,
            Log
          )
        } catch (err) {
          handleError(
            err,
            'There was an internal error while setting the associations.',
            Boom.badImplementation,
            Log
          )
        }
      }
      return true
    } else {
      throw Boom.notFound('No owner resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * RemoveMany function exposed as a mongoose wrapper.
 * @param ownerModel: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being removed.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param payload: A list of ids
 * @param Log: A logging object
 * @returns {object} A promise returning true if the remove succeeds.
 * @private
 */
function _removeMany(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  payload,
  Log
) {
  let request = { params: { ownerId: ownerId }, payload: payload }
  return _removeManyHandler(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    request,
    Log
  )
}
/**
 * Removes multiple associations from a document
 * @param ownerModel: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being removed.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the remove succeeds.
 * @private
 */
async function _removeManyHandler(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  request,
  Log
) {
  try {
    // EXPL: make a copy of the payload so that request.payload remains unchanged
    let payload = request.payload.map(item => {
      return _.isObject(item) ? _.assignIn({}, item) : item
    })
    if (_.isEmpty(request.payload)) {
      throw Boom.badRequest('Payload is empty.')
    }
    let ownerObject = await ownerModel
      .findOne({ _id: ownerId })
      .select(associationName)
    if (ownerObject) {
      try {
        if (
          ownerModel.routeOptions &&
          ownerModel.routeOptions.remove &&
          ownerModel.routeOptions.remove[associationName] &&
          ownerModel.routeOptions.remove[associationName].pre
        ) {
          payload = await ownerModel.routeOptions.remove[associationName].pre(
            payload,
            request,
            Log
          )
        }
      } catch (err) {
        handleError(
          err,
          'There was a preprocessing error while removing the association.',
          Boom.badRequest,
          Log
        )
      }

      for (let childId of payload) {
        try {
          await _removeAssociation(
            ownerModel,
            ownerObject,
            childModel,
            childId,
            associationName,
            Log
          )
        } catch (err) {
          handleError(
            err,
            'There was an internal error while removing the associations.',
            Boom.badImplementation,
            Log
          )
        }
      }
      return true
    } else {
      throw Boom.notFound('No owner resource was found with that id.')
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * GetAll function exposed as a mongoose wrapper.
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 * @private
 */
function _getAll(ownerModel, ownerId, childModel, associationName, query, Log) {
  let request = { params: { ownerId: ownerId }, query: query }
  return _getAllHandler(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    request,
    Log
  )
}
/**
 * Get all of the associations for a document
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param request: The Hapi request object, or a container for the wrapper query.
 * @param Log: A logging object
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 * @private
 */
async function _getAllHandler(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  request,
  Log
) {
  try {
    let query = request.query

    let association = ownerModel.routeOptions.associations[associationName]
    let foreignField = association.foreignField

    let ownerRequest = { query: {} }
    ownerRequest.query.$embed = associationName
    ownerRequest.query.populateSelect = '_id'
    if (foreignField) {
      ownerRequest.query.populateSelect =
        ownerRequest.query.populateSelect + ',' + foreignField
    }

    // EXPL: In order to allow for fully querying against the association data, we first embed the
    // associations to get a list of _ids and extra fields. We then leverage _list
    // to perform the full query.  Finally the extra fields (if they exist) are added to the final result
    let mongooseQuery = ownerModel.findOne({ _id: ownerId })
    mongooseQuery = QueryHelper.createMongooseQuery(
      ownerModel,
      ownerRequest.query,
      mongooseQuery,
      Log
    )
    let result
    try {
      result = await mongooseQuery.exec()
    } catch (err) {
      handleError(
        err,
        'There was an error processing the request.',
        Boom.badRequest,
        Log
      )
    }
    if (!result) {
      throw Boom.notFound('owner object not found')
    }
    result = result[associationName]
    let childIds = []
    let manyMany = false
    if (association.type === 'MANY_MANY') {
      childIds = result.map(object => {
        if (!object[association.model]) {
          throw Boom.badRequest(
            'association object "' + association.model + '" does not exist'
          )
        }
        return object[association.model]._id
      })
      manyMany = true
    } else {
      childIds = result.map(object => {
        return object._id
      })
    }

    // EXPL: since the call to _listHandler is already filtering by _id, we must handle the special case
    // where the user is also filtering by _id
    if (query._id) {
      if (!_.isArray(query._id)) {
        query._id = [query._id]
      }
      childIds = childIds.filter(id => {
        return query._id.find(_id => {
          return _id.toString() === id.toString()
        })
      })
      delete query._id
    }
    if (typeof query.$where === 'string') {
      query.$where = JSON.parse(query.$where)
    }

    // EXPL: also have to handle the special case for '$where._id' queries
    if (query.$where && query.$where._id) {
      query.$where._id = Object.assign({ $in: childIds }, query.$where._id)
    } else {
      query.$where = Object.assign({ _id: { $in: childIds } }, query.$where)
    }

    request.query = query

    let listResult = await _listHandler(childModel, request, Log)

    if (manyMany && association.linkingModel) {
      // EXPL: we have to manually insert the extra fields into the result
      let extraFieldData = result
      if (_.isArray(listResult.docs)) {
        for (let object of listResult.docs) {
          let data = extraFieldData.find(data => {
            return (
              data[association.model]._id.toString() === object._id.toString()
            )
          })
          if (!data) {
            throw Boom.notFound('child object not found')
          }
          let fields = data.toJSON()
          delete fields._id
          delete fields[association.model]
          object[association.linkingModel] = fields
        }
      }

      try {
        if (
          ownerModel.routeOptions &&
          ownerModel.routeOptions.getAll &&
          ownerModel.routeOptions.getAll[associationName] &&
          ownerModel.routeOptions.getAll[associationName].post
        ) {
          listResult.docs = await ownerModel.routeOptions.getAll[
            associationName
          ].post(request, result.docs, Log)
        }
      } catch (err) {
        handleError(
          err,
          'There was a postprocessing error.',
          Boom.badRequest,
          Log
        )
      }

      return listResult
    } else {
      return listResult
    }
  } catch (err) {
    handleError(err, null, null, Log)
  }
}

/**
 * Create an association instance between two resources
 * @param ownerModel
 * @param ownerObject
 * @param childModel
 * @param childId
 * @param associationName
 * @param payload
 * @param Log
 * @returns {*|promise}
 * @private
 */
async function _setAssociation(
  ownerModel,
  ownerObject,
  childModel,
  childId,
  associationName,
  payload,
  Log
) {
  let childObject

  childObject = await childModel.findOne({ _id: childId })
  if (childObject) {
    let association = ownerModel.routeOptions.associations[associationName]
    let extraFields = false
    if (association.type === 'ONE_MANY') {
      // EXPL: one-many associations are virtual, so only update the child reference
      childObject[association.foreignField] = ownerObject._id
      await childObject.save()
    } else if (association.type === 'MANY_MANY') {
      // EXPL: the payload is an array of Ids. No extra fields
      if (
        typeof payload[0] === 'string' ||
        payload[0] instanceof String ||
        payload[0]._bsontype === 'ObjectID'
      ) {
        payload = {}

        extraFields = false
      } else {
        payload = payload.filter(object => {
          // EXPL: the payload contains extra fields
          return object.childId.toString() === childObject._id.toString()
        })

        payload = payload[0]

        payload = Object.assign({}, payload) // EXPL: break the reference to the original payload

        delete payload.childId

        extraFields = true
      }

      // EXPL: if linking models aren't embeded, just upsert the linking model collection
      let embedAssociation =
        association.embedAssociation === undefined
          ? config.embedAssociations
          : association.embedAssociation
      if (!embedAssociation) {
        const linkingModel = association.include.through
        let query = {}
        query[ownerModel.modelName] = ownerObject._id
        query[childModel.modelName] = childObject._id

        payload[ownerModel.modelName] = ownerObject._id
        payload[childModel.modelName] = childObject._id

        await linkingModel.findOneAndUpdate(query, payload, {
          new: true,
          upsert: true,
          runValidators: config.enableMongooseRunValidators
        })
      } else {
        payload[childModel.modelName] = childObject._id

        let duplicate = ownerObject[associationName].filter(
          associationObject => {
            return (
              associationObject[childModel.modelName].toString() ===
              childId.toString()
            )
          }
        )
        duplicate = duplicate[0]

        let duplicateIndex = ownerObject[associationName].indexOf(duplicate)

        if (duplicateIndex < 0) {
          // EXPL: if the association doesn't already exist, create it, otherwise update the extra fields
          ownerObject[associationName].push(payload)
        } else if (extraFields) {
          // EXPL: only update if there are extra fields TODO: reference MANY_MANY bug where updating association that's just an id (i.e. no extra fields) causes an error and reference this as the fix
          payload._id = ownerObject[associationName][duplicateIndex]._id // EXPL: retain the association instance id for consistency
          ownerObject[associationName][duplicateIndex] = payload
        }

        payload = Object.assign({}, payload) // EXPL: break the reference to the original payload
        delete payload._id

        delete payload[childModel.modelName]
        payload[ownerModel.modelName] = ownerObject._id
        let childAssociation = {}
        let childAssociations = childModel.routeOptions.associations
        for (let childAssociationKey in childAssociations) {
          let association = childAssociations[childAssociationKey]
          if (
            association.model === ownerModel.modelName &&
            association.type === 'MANY_MANY'
          ) {
            // TODO: Add issue referencing a conflict when a model has two associations of the same model and one is a MANY_MANY, and reference this change as the fix
            childAssociation = association
          }
        }

        if (!childAssociation.include) {
          throw Boom.badRequest(
            'Missing association between ' +
              ownerModel.modelName +
              ' and ' +
              childModel.modelName +
              '.'
          )
        }

        let childAssociationName = childAssociation.include.as

        if (!childObject[childAssociationName]) {
          throw Boom.badRequest(
            childAssociationName + ' association does not exist.'
          )
        }

        duplicate = childObject[childAssociationName].filter(
          associationObject => {
            return (
              associationObject[ownerModel.modelName].toString() ===
              ownerObject._id.toString()
            )
          }
        )
        duplicate = duplicate[0]

        duplicateIndex = childObject[childAssociationName].indexOf(duplicate)

        if (duplicateIndex < 0) {
          // EXPL: if the association doesn't already exist, create it, otherwise update the extra fields
          childObject[childAssociationName].push(payload)
        } else {
          payload._id = childObject[childAssociationName][duplicateIndex]._id // EXPL: retain the association instance id for consistency
          childObject[childAssociationName][duplicateIndex] = payload
        }

        await Promise.all([
          ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject, {
            runValidators: config.enableMongooseRunValidators
          }),
          childModel.findByIdAndUpdate(childObject._id, childObject, {
            runValidators: config.enableMongooseRunValidators
          })
        ])
      }
    } else if (association.type === '_MANY') {
      let duplicate = ownerObject[associationName].filter(_childId => {
        return _childId.toString() === childId.toString()
      })
      duplicate = duplicate[0]

      let duplicateIndex = ownerObject[associationName].indexOf(duplicate)

      if (duplicateIndex < 0) {
        // EXPL: if the association doesn't already exist, create it
        ownerObject[associationName].push(childId)
      }

      await Promise.all([
        ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject, {
          runValidators: config.enableMongooseRunValidators
        })
      ])
    } else {
      throw Boom.badRequest('Association type incorrectly defined.')
    }
  } else {
    throw Boom.notFound('Child object not found.')
  }
}

/**
 * Remove an association instance between two resources
 * @param ownerModel
 * @param ownerObject
 * @param childModel
 * @param childId
 * @param associationName
 * @param Log
 * @returns {*|promise}
 * @private
 */
async function _removeAssociation(
  ownerModel,
  ownerObject,
  childModel,
  childId,
  associationName,
  Log
) {
  let childObject = await childModel.findOne({ _id: childId })
  if (childObject) {
    let association = ownerModel.routeOptions.associations[associationName]
    let associationType = association.type
    if (associationType === 'ONE_MANY') {
      // EXPL: one-many associations are virtual, so only update the child reference
      // childObject[association.foreignField] = null; //TODO: set reference to null instead of deleting it?
      // EXPL: only delete the reference if the ids match
      if (
        childObject[association.foreignField] &&
        childObject[association.foreignField].toString() ===
          ownerObject._id.toString()
      ) {
        childObject[association.foreignField] = undefined
      }
      await childObject.save()
    } else if (associationType === 'MANY_MANY') {
      // EXPL: remove references from both models

      // EXPL: if linking models aren't embeded, just upsert the linking model collection
      let embedAssociation =
        association.embedAssociation === undefined
          ? config.embedAssociations
          : association.embedAssociation
      if (!embedAssociation) {
        const linkingModel = association.include.through
        let query = {}
        query[ownerModel.modelName] = ownerObject._id
        query[childModel.modelName] = childObject._id

        await linkingModel.findOneAndRemove(query)
      } else {
        // EXPL: remove the associated child from the owner
        let deleteChild = ownerObject[associationName].filter(child => {
          return (
            child[childModel.modelName].toString() ===
            childObject._id.toString()
          )
        })
        deleteChild = deleteChild[0]

        let index = ownerObject[associationName].indexOf(deleteChild)
        if (index > -1) {
          ownerObject[associationName].splice(index, 1)
        }

        // EXPL: get the child association name
        let childAssociation = {}
        let childAssociations = childModel.routeOptions.associations
        for (let childAssociationKey in childAssociations) {
          let association = childAssociations[childAssociationKey]
          if (association.model === ownerModel.modelName) {
            childAssociation = association
          }
        }
        let childAssociationName = childAssociation.include.as

        // EXPL: remove the associated owner from the child
        let deleteOwner = childObject[childAssociationName].filter(owner => {
          return (
            owner[ownerModel.modelName].toString() ===
            ownerObject._id.toString()
          )
        })
        deleteOwner = deleteOwner[0]

        index = childObject[childAssociationName].indexOf(deleteOwner)
        if (index > -1) {
          childObject[childAssociationName].splice(index, 1)
        }

        await Promise.all([
          ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject, {
            runValidators: config.enableMongooseRunValidators
          }),
          childModel.findByIdAndUpdate(childObject._id, childObject, {
            runValidators: config.enableMongooseRunValidators
          })
        ])
      }
    } else if (associationType === '_MANY') {
      // EXPL: remove reference from owner model

      // EXPL: remove the associated child from the owner
      let deleteChild = ownerObject[associationName].filter(childId => {
        return childId.toString() === childObject._id.toString()
      })
      deleteChild = deleteChild[0]

      let index = ownerObject[associationName].indexOf(deleteChild)
      if (index > -1) {
        ownerObject[associationName].splice(index, 1)
      }

      await Promise.all([
        ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject, {
          runValidators: config.enableMongooseRunValidators
        })
      ])
    } else {
      throw Boom.badRequest('Association type incorrectly defined.')
    }
  } else {
    throw Boom.notFound('Child object not found.')
  }
}

/**
 * This function is called after embedded associations have been populated so that any associations
 * that have been soft deleted are removed.
 * @param result: the object that is being inspected
 * @param parent: the parent of the result object
 * @param parentkey: the parents key for the result object
 * @param depth: the current recursion depth
 * @param Log: a logging object
 * @returns {boolean}: returns false if the result object should be removed from the parent
 * @private
 */
function filterDeletedEmbeds(result, parent, parentkey, depth, Log) {
  if (_.isArray(result)) {
    result = result.filter(function(obj) {
      let keep = filterDeletedEmbeds(obj, result, parentkey, depth + 1, Log)
      // Log.log("KEEP:", keep);
      return keep
    })
    // Log.log("UPDATED:", parentkey);
    // Log.note("AFTER:", result);
    parent[parentkey] = result
  } else {
    for (let key in result) {
      // Log.debug("KEY:", key);
      // Log.debug("VALUE:", result[key]);
      if (_.isArray(result[key])) {
        // Log.log("JUMPING IN ARRAY");
        filterDeletedEmbeds(result[key], result, key, depth + 1, Log)
      } else if (_.isObject(result[key]) && result[key]._id) {
        // Log.log("JUMPING IN OBJECT");
        let keep = filterDeletedEmbeds(result[key], result, key, depth + 1, Log)
        if (!keep) {
          return false
        }
      } else if (key === 'isDeleted' && result[key] === true && depth > 0) {
        // Log.log("DELETED", depth);
        return false
      }
    }
    // Log.log("JUMPING OUT");
    return true
  }
}

function handleError(err, message, boomFunction, Log) {
  message = message || 'There was an error processing the request.'
  boomFunction = boomFunction || Boom.badImplementation
  if (!err.isBoom) {
    Log.error(err)
    throw boomFunction(message)
  } else {
    throw err
  }
}
