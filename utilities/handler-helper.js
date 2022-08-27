'use strict'

const Boom = require('@hapi/boom')
const QueryHelper = require('./query-helper')
const JoiMongooseHelper = require('./joi-mongoose-helper')
const config = require('../config')
const _ = require('lodash')

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
 * Finds a list of model documents.
 * @param  {...any} args
 * **Positional:**
 * - function list(model, query, Log)
 *
 * **Named:**
 * - function list({
 *      model,
 *      query,
 *      Log = RestHapi.getLogger('list'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - query: rest-hapi query parameters to be converted to a mongoose query.
 * - Log: A logging object.
 * - restCall: If 'true', then will call GET /model
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 */
function _list(...args) {
  if (args.length > 1) {
    return _listV1(...args)
  } else {
    return _listV2(...args)
  }
}

function _listV1(model, query, Log) {
  model = getModel(model)
  const request = { query: query }
  return _listHandler(model, request, Log)
}

async function _listV2({ model, query, Log, restCall = false, credentials }) {
  model = getModel(model)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('list')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const request = {
      method: 'Get',
      url: `/${model.routeOptions.alias || model.modelName}`,
      query,
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _listV1(model, query, Log)
  }
}

/**
 * Finds a list of model documents.
 * @param model {object | string}: A mongoose model.
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
    const { $embed } = query
    if (query.$count) {
      mongooseQuery = model.countDocuments()
      mongooseQuery = QueryHelper.createMongooseQuery(
        model,
        query,
        mongooseQuery,
        Log
      ).lean()
      const result = await mongooseQuery.exec()
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
    const filter = mongooseQuery.getFilter()
    const count = await model.countDocuments(filter)
    mongooseQuery = QueryHelper.paginate(query, mongooseQuery, Log)
    let result = await mongooseQuery.exec()

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
      const result = data
      if (model.routeOptions) {
        const associations = model.routeOptions.associations
        for (const associationKey in associations) {
          const association = associations[associationKey]
          if (association.type === 'ONE_MANY' && data[associationKey]) {
            // EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
            if (data[associationKey].toJSON) {
              // TODO: look into .toJSON and see why it appears sometimes and not other times
              result[associationKey] = data[associationKey].toJSON()
            } else {
              result[associationKey] = data[associationKey]
            }
          }

          if (config.enableSoftDelete && config.filterDeletedEmbeds) {
            // EXPL: remove soft deleted documents from populated properties
            filterDeletedEmbeds(result, {}, '', 0, Log)
          }

          if (flatten && $embed) {
            flattenEmbeds(result, associations, $embed)
          }
        }
      }

      if (config.logListResult) {
        Log.info('Result: %s', JSON.stringify(result))
      }

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
 * Finds a model document.
 * @param  {...any} args
 * **Positional:**
 * - function find(model, _id, query, Log)
 *
 * **Named:**
 * - function find({
 *      model,
 *      _id,
 *      query,
 *      Log = RestHapi.getLogger('find'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - query: rest-hapi query parameters to be converted to a mongoose query.
 * - Log: A logging object.
 * - restCall: If 'true', then will call GET /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _find(...args) {
  if (args.length > 1) {
    return _findV1(...args)
  } else {
    return _findV2(...args)
  }
}

function _findV1(model, _id, query, Log) {
  model = getModel(model)
  const request = { params: { _id: _id }, query: query }
  return _findHandler(model, _id, request, Log)
}

async function _findV2({
  model,
  _id,
  query,
  Log,
  restCall = false,
  credentials
}) {
  model = getModel(model)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('find')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const request = {
      method: 'Get',
      url: `/${model.routeOptions.alias || model.modelName}/${_id}`,
      params: { _id },
      query,
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _findV1(model, _id, query, Log)
  }
}

/**
 * Finds a model document.
 * @param model {object | string}: A mongoose model.
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
    const { $embed } = query
    let mongooseQuery = model.findOne({ _id: _id })
    mongooseQuery = QueryHelper.createMongooseQuery(
      model,
      query,
      mongooseQuery,
      Log
    ).lean()
    const result = await mongooseQuery.exec()
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
        const associations = model.routeOptions.associations
        for (const associationKey in associations) {
          const association = associations[associationKey]
          if (association.type === 'ONE_MANY' && data[associationKey]) {
            // EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
            result[associationKey] = data[associationKey]
          }
        }

        if (config.enableSoftDelete && config.filterDeletedEmbeds) {
          // EXPL: remove soft deleted documents from populated properties
          filterDeletedEmbeds(result, {}, '', 0, Log)
        }

        if (flatten && $embed) {
          flattenEmbeds(result, associations, $embed)
        }
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
 * Creates one or more model documents.
 * @param  {...any} args
 * **Positional:**
 * - function create(model, payload, Log)
 *
 * **Named:**
 * - function create({
 *      model,
 *      payload,
 *      Log = RestHapi.getLogger('create'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - payload: Data used to create the model document/s.
 * - Log: A logging object.
 * - restCall: If 'true', then will call POST /model
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _create(...args) {
  if (args.length > 1) {
    return _createV1(...args)
  } else {
    return _createV2(...args)
  }
}

function _createV1(model, payload, Log) {
  model = getModel(model)
  const request = { payload: payload }
  return _createHandler(model, request, Log)
}

async function _createV2({
  model,
  payload,
  Log,
  restCall = false,
  credentials
}) {
  model = getModel(model)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('create')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const request = {
      method: 'Post',
      url: `/${model.routeOptions.alias || model.modelName}`,
      payload,
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _createV1(model, payload, Log)
  }
}

// TODO: make sure errors are catching in correct order
/**
 * Creates one or more model documents.
 * @param model {object | string}: A mongoose model.
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
        for (const document of payload) {
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
      for (const document of payload) {
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
    const attributes = QueryHelper.createAttributesFilter({}, model, Log)

    data = data.map(item => {
      return item._id
    })

    const result = await model
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
        for (const document of result) {
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
 * Updates a model document.
 * @param  {...any} args
 * **Positional:**
 * - function update(model, _id, payload, Log)
 *
 * **Named:**
 * - function update({
 *      model,
 *      _id,
 *      payload,
 *      Log = RestHapi.getLogger('update'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - payload: Data used to update the model document.
 * - Log: A logging object.
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _update(...args) {
  if (args.length > 1) {
    return _updateV1(...args)
  } else {
    return _updateV2(...args)
  }
}

function _updateV1(model, _id, payload, Log) {
  model = getModel(model)
  const request = { params: { _id: _id }, payload: payload }
  return _updateHandler(model, _id, request, Log)
}

async function _updateV2({
  model,
  _id,
  payload,
  Log,
  restCall = false,
  credentials
}) {
  model = getModel(model)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('update')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const request = {
      method: 'Put',
      url: `/${model.routeOptions.alias || model.modelName}/${_id}`,
      params: { _id },
      payload,
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _updateV1(model, _id, payload, Log)
  }
}

/**
 * Updates a model document.
 * @param model {object | string}: A mongoose model.
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
      const attributes = QueryHelper.createAttributesFilter({}, model, Log)

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
 * Deletes a model document.
 * @param  {...any} args
 * **Positional:**
 * - function deleteOne(model, _id, hardDelete = false, Log)
 *
 * **Named:**
 * - function deleteOne({
 *      model,
 *      _id,
 *      hardDelete = false,
 *      Log = RestHapi.getLogger('deleteOne'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - hardDelete: Flag used to determine a soft or hard delete.
 * - Log: A logging object.
 * - restCall: If 'true', then will call DELETE /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _deleteOne(...args) {
  if (args.length > 1) {
    return _deleteOneV1(...args)
  } else {
    return _deleteOneV2(...args)
  }
}

function _deleteOneV1(model, _id, hardDelete, Log) {
  model = getModel(model)
  const request = { params: { _id: _id } }
  return _deleteOneHandler(model, _id, hardDelete, request, Log)
}

async function _deleteOneV2({
  model,
  _id,
  hardDelete = false,
  Log,
  restCall = false,
  credentials
}) {
  model = getModel(model)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('deleteOne')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const request = {
      method: 'Delete',
      url: `/${model.routeOptions.alias || model.modelName}/${_id}`,
      params: { _id },
      payload: { hardDelete },
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _deleteOneV1(model, _id, hardDelete, Log)
  }
}

/**
 * Deletes a model document
 * @param model {object | string}: A mongoose model.
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
        const payload = { isDeleted: true }
        if (config.enableDeletedAt) {
          payload.deletedAt = new Date()
        }
        if (config.enableDeletedBy && config.enableSoftDelete) {
          const deletedBy =
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
 * Deletes multiple documents.
 * @param  {...any} args
 * **Positional:**
 * - function deleteMany(model, payload, Log)
 *
 * **Named:**
 * - function deleteMany({
 *      model,
 *      payload,
 *      Log = RestHapi.getLogger('delete'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - payload: Either an array of ids or an array of objects containing an id and a "hardDelete" flag.
 * - Log: A logging object.
 * - restCall: If 'true', then will call DELETE /model
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _deleteMany(...args) {
  if (args.length > 1) {
    return _deleteManyV1(...args)
  } else {
    return _deleteManyV2(...args)
  }
}

function _deleteManyV1(model, payload, Log) {
  model = getModel(model)
  const request = { payload: payload }
  return _deleteManyHandler(model, request, Log)
}

async function _deleteManyV2({
  model,
  payload,
  Log,
  restCall = false,
  credentials
}) {
  model = getModel(model)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('deleteMany')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const request = {
      method: 'Delete',
      url: `/${model.routeOptions.alias || model.modelName}`,
      payload,
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _deleteManyV1(model, payload, Log)
  }
}

/**
 * Deletes multiple documents.
 * @param model {object | string}: A mongoose model.
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
    const payload = request.payload.map(item => {
      return _.isObject(item) ? _.assignIn({}, item) : item
    })
    const promises = []
    for (const arg of payload) {
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
 * Adds an association to a document
 * @param  {...any} args
 * **Positional:**
 * - function addOne(
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      childId,
 *      associationName,
 *      payload,
 *      Log
 *   )
 *
 * **Named:**
 * - function addOne({
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      childId,
 *      associationName,
 *      payload = {},
 *      Log = RestHapi.getLogger('addOne'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - ownerModel {object | string}: The model that is being added to.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being added.
 * - childId: The id of the child document.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: An object containing an extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call PUT /ownerModel/{ownerId}/childModel/{childId}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _addOne(...args) {
  if (args.length > 1) {
    return _addOneV1(...args)
  } else {
    return _addOneV2(...args)
  }
}

function _addOneV1(
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  payload,
  Log
) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const request = {
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

async function _addOneV2({
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  payload = {},
  Log,
  restCall = false,
  credentials
}) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('addOne')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const association = ownerModel.routeOptions.associations[associationName]
    const ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
    const childAlias = association.alias || association.include.model.modelName

    const request = {
      method: 'Put',
      url: `/${ownerAlias}/${ownerId}/${childAlias}/${childId}`,
      payload,
      params: { ownerId, childId },
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _addOneV1(
      ownerModel,
      ownerId,
      childModel,
      childId,
      associationName,
      payload,
      Log
    )
  }
}

/**
 * Adds an association to a document
 * @param ownerModel {object | string}: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel {object | string}: The model that is being added.
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
    const ownerObject = await ownerModel
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
 * Removes an association to a document
 * @param  {...any} args
 * **Positional:**
 * - function removeOne(
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      childId,
 *      associationName,
 *      payload,
 *      Log
 *   )
 *
 * **Named:**
 * - function removeOne({
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      childId,
 *      associationName,
 *      payload = {},
 *      Log = RestHapi.getLogger('removeOne'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - ownerModel {object | string}: The model that is being removed from.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being removed.
 * - childId: The id of the child document.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: An object containing an extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call DELETE /ownerModel/{ownerId}/childModel/{childId}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _removeOne(...args) {
  if (args.length > 1) {
    return _removeOneV1(...args)
  } else {
    return _removeOneV2(...args)
  }
}

function _removeOneV1(
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  payload,
  Log
) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const request = {
    params: { ownerId: ownerId, childId: childId },
    payload: payload
  }
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

async function _removeOneV2({
  ownerModel,
  ownerId,
  childModel,
  childId,
  associationName,
  payload = {},
  Log,
  restCall = false,
  credentials
}) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('removeOne')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const association = ownerModel.routeOptions.associations[associationName]
    const ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
    const childAlias = association.alias || association.include.model.modelName

    const request = {
      method: 'Delete',
      url: `/${ownerAlias}/${ownerId}/${childAlias}/${childId}`,
      payload,
      params: { ownerId, childId },
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _removeOneV1(
      ownerModel,
      ownerId,
      childModel,
      childId,
      associationName,
      payload,
      Log
    )
  }
}
/**
 * Removes an association to a document
 * @param ownerModel {object | string}: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel {object | string}: The model that is being removed.
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
    const ownerObject = await ownerModel
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
 * Adds multiple associations to a document.
 * @param  {...any} args
 * **Positional:**
 * - function addMany(
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      associationName,
 *      payload,
 *      Log
 *   )
 *
 * **Named:**
 * - function addMany({
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      associationName,
 *      payload = {},
 *      Log = RestHapi.getLogger('addMany'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - ownerModel {object | string}: The model that is being added to.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being added.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: Either a list of id's or a list of id's along with extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call POST /ownerModel/{ownerId}/childModel
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _addMany(...args) {
  if (args.length > 1) {
    return _addManyV1(...args)
  } else {
    return _addManyV2(...args)
  }
}

function _addManyV1(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  payload,
  Log
) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const request = { params: { ownerId: ownerId }, payload: payload }
  return _addManyHandler(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    request,
    Log
  )
}

async function _addManyV2({
  ownerModel,
  ownerId,
  childModel,
  associationName,
  payload = {},
  Log,
  restCall = false,
  credentials
}) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('addMany')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const association = ownerModel.routeOptions.associations[associationName]
    const ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
    const childAlias = association.alias || association.include.model.modelName

    const request = {
      method: 'Post',
      url: `/${ownerAlias}/${ownerId}/${childAlias}`,
      payload,
      params: { ownerId },
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _addManyV1(
      ownerModel,
      ownerId,
      childModel,
      associationName,
      payload,
      Log
    )
  }
}

/**
 * Adds multiple associations to a document.
 * @param ownerModel {object | string}: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel {object | string}: The model that is being added.
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

    const ownerObject = await ownerModel
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

      for (const childId of childIds) {
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
 * Removes multiple associations from a document
 * @param  {...any} args
 * **Positional:**
 * - function removeMany(
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      associationName,
 *      payload,
 *      Log
 *   )
 *
 * **Named:**
 * - function removeMany({
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      associationName,
 *      payload = {},
 *      Log = RestHapi.getLogger('removeMany'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - ownerModel {object | string}: The model that is being added from.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being removed.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: Either a list of id's or a list of id's along with extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call DELETE /ownerModel/{ownerId}/childModel
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _removeMany(...args) {
  if (args.length > 1) {
    return _removeManyV1(...args)
  } else {
    return _removeManyV2(...args)
  }
}

function _removeManyV1(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  payload,
  Log
) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const request = { params: { ownerId: ownerId }, payload: payload }
  return _removeManyHandler(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    request,
    Log
  )
}

async function _removeManyV2({
  ownerModel,
  ownerId,
  childModel,
  associationName,
  payload = {},
  Log,
  restCall = false,
  credentials
}) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('removeMany')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const association = ownerModel.routeOptions.associations[associationName]
    const ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
    const childAlias = association.alias || association.include.model.modelName

    const request = {
      method: 'Delete',
      url: `/${ownerAlias}/${ownerId}/${childAlias}`,
      payload,
      params: { ownerId },
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _removeManyV1(
      ownerModel,
      ownerId,
      childModel,
      associationName,
      payload,
      Log
    )
  }
}

/**
 * Removes multiple associations from a document
 * @param ownerModel {object | string}: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel {object | string}: The model that is being removed.
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
    const ownerObject = await ownerModel
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

      for (const childId of payload) {
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
 * Get all of the associations for a document
 * @param  {...any} args
 * **Positional:**
 * - function getAll(
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      associationName,
 *      query,
 *      Log
 *   )
 *
 * **Named:**
 * - function getAll({
 *      ownerModel,
 *      ownerId,
 *      childModel,
 *      associationName,
 *      query,
 *      Log = RestHapi.getLogger('getAll'),
 *      restCall = false,
 *      credentials
 *   })
 *
 * **Params:**
 * - ownerModel {object | string}: The model that is being added to.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being added.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - query: rest-hapi query parameters to be converted to a mongoose query.
 * - Log: A logging object
 * - restCall: If 'true', then will call GET /ownerModel/{ownerId}/childModel
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
function _getAll(...args) {
  if (args.length > 1) {
    return _getAllV1(...args)
  } else {
    return _getAllV2(...args)
  }
}

function _getAllV1(
  ownerModel,
  ownerId,
  childModel,
  associationName,
  query,
  Log
) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const request = { params: { ownerId: ownerId }, query }
  return _getAllHandler(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    request,
    Log
  )
}

async function _getAllV2({
  ownerModel,
  ownerId,
  childModel,
  associationName,
  query,
  Log,
  restCall = false,
  credentials
}) {
  ownerModel = getModel(ownerModel)
  childModel = getModel(childModel)
  const RestHapi = require('../rest-hapi')
  Log = Log || RestHapi.getLogger('getAll')

  if (restCall) {
    assertServer()
    credentials = defaultCreds(credentials)

    const association = ownerModel.routeOptions.associations[associationName]
    const ownerAlias = ownerModel.routeOptions.alias || ownerModel.modelName
    const childAlias = association.alias || association.include.model.modelName

    const request = {
      method: 'Get',
      url: `/${ownerAlias}/${ownerId}/${childAlias}`,
      query,
      params: { ownerId },
      credentials,
      headers: { authorization: 'Bearer' }
    }

    const injectOptions = RestHapi.testHelper.mockInjection(request)
    const { result } = await RestHapi.server.inject(injectOptions)
    return result
  } else {
    return _getAllV1(
      ownerModel,
      ownerId,
      childModel,
      associationName,
      query,
      Log
    )
  }
}

/**
 * Get all of the associations for a document
 * @param ownerModel {object | string}: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel {object | string}: The model that is being added.
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
    const query = request.query

    const association = ownerModel.routeOptions.associations[associationName]
    const foreignField = association.foreignField

    const ownerRequest = { query: {} }
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

    const listResult = await _listHandler(childModel, request, Log)

    if (manyMany && association.linkingModel) {
      // EXPL: we have to manually insert the extra fields into the result
      const extraFieldData = result
      if (_.isArray(listResult.docs)) {
        for (const object of listResult.docs) {
          const data = extraFieldData.find(data => {
            return (
              data[association.model]._id.toString() === object._id.toString()
            )
          })
          if (!data) {
            throw Boom.notFound('child object not found')
          }
          const fields = data.toJSON()
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
  const childObject = await childModel.findOne({ _id: childId })
  if (childObject) {
    const association = ownerModel.routeOptions.associations[associationName]
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
      const embedAssociation =
        association.embedAssociation === undefined
          ? config.embedAssociations
          : association.embedAssociation
      if (!embedAssociation) {
        const linkingModel = association.include.through
        const query = {}
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
        const childAssociations = childModel.routeOptions.associations
        for (const childAssociationKey in childAssociations) {
          const association = childAssociations[childAssociationKey]
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

        const childAssociationName = childAssociation.include.as

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

      const duplicateIndex = ownerObject[associationName].indexOf(duplicate)

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
  const childObject = await childModel.findOne({ _id: childId })
  if (childObject) {
    const association = ownerModel.routeOptions.associations[associationName]
    const associationType = association.type
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
      const embedAssociation =
        association.embedAssociation === undefined
          ? config.embedAssociations
          : association.embedAssociation
      if (!embedAssociation) {
        const linkingModel = association.include.through
        const query = {}
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
        const childAssociations = childModel.routeOptions.associations
        for (const childAssociationKey in childAssociations) {
          const association = childAssociations[childAssociationKey]
          if (association.model === ownerModel.modelName) {
            childAssociation = association
          }
        }
        const childAssociationName = childAssociation.include.as

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

      const index = ownerObject[associationName].indexOf(deleteChild)
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
      const keep = filterDeletedEmbeds(obj, result, parentkey, depth + 1, Log)
      // Log.log("KEEP:", keep);
      return keep
    })
    // Log.log("UPDATED:", parentkey);
    // Log.note("AFTER:", result);
    parent[parentkey] = result
  } else {
    for (const key in result) {
      // Log.debug("KEY:", key);
      // Log.debug("VALUE:", result[key]);
      if (_.isArray(result[key])) {
        // Log.log("JUMPING IN ARRAY");
        filterDeletedEmbeds(result[key], result, key, depth + 1, Log)
      } else if (_.isObject(result[key]) && result[key]._id) {
        // Log.log("JUMPING IN OBJECT");
        const keep = filterDeletedEmbeds(
          result[key],
          result,
          key,
          depth + 1,
          Log
        )
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

/**
 * Remove additional fields from embedded associations. Flattens recursively.
 * @param {*} result
 * @param {*} associations
 * @param {*} $embed
 */
function flattenEmbeds(result, associations, $embed) {
  if (!Array.isArray($embed)) {
    $embed = $embed.split(',')
  }
  $embed.forEach(function(embedString) {
    const embeds = embedString.split('.')
    const currentEmbed = embeds[0]
    const association = associations[currentEmbed]

    if (result[currentEmbed] && Array.isArray(result[currentEmbed])) {
      result[currentEmbed] = result[currentEmbed].map(object => {
        if (object[association.model]) {
          object = object[association.model]
        }
        return object
      })

      const remainingEmbeds = [...embeds]
      remainingEmbeds.shift()

      if (!_.isEmpty(remainingEmbeds)) {
        const nextModel = getModel(association.model)
        result[currentEmbed].forEach(function(nextResult) {
          flattenEmbeds(
            nextResult,
            nextModel.routeOptions.associations,
            remainingEmbeds
          )
        })
      }
    }
  })
}

/**
 * Helper function for "restCall === true" calls
 * @param {*} credentials
 */
function defaultCreds(credentials) {
  return credentials || { scope: ['root'] }
}

function assertServer() {
  const RestHapi = require('../rest-hapi')
  if (_.isEmpty(RestHapi.server)) {
    const error = new Error(
      'No server found. You must register rest-hapi with a hapi server before using `restCall = true`.'
    )
    error.type = 'no-server'
    throw error
  }
}

function getModel(model) {
  const RestHapi = require('../rest-hapi')
  if (typeof model === 'string') {
    return RestHapi.models[model]
  } else {
    return model
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
