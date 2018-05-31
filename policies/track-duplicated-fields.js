'use strict'

const Boom = require('boom')
const _ = require('lodash')

const internals = {}

/**
 * Policy to update any duplicate fields when the original field changes.
 * @param model
 * @param logger
 * @returns {trackDuplicatedFields}
 */
internals.trackDuplicatedFields = function(model, mongoose, logger) {
  const trackDuplicatedFieldsForModel = async function addDocumentScopeForModel(
    request,
    h
  ) {
    const Log = logger.bind('trackDuplicatedFields')
    try {
      if (_.isError(request.response)) {
        return h.continue
      }
      await internals.trackFields(
        model,
        mongoose,
        request.payload,
        request.response.source,
        Log
      )
      return h.continue
    } catch (err) {
      Log.error(err)
      throw Boom.badImplementation(err)
    }
  }

  trackDuplicatedFieldsForModel.applyPoint = 'onPostHandler'

  return trackDuplicatedFieldsForModel
}

internals.trackDuplicatedFields.applyPoint = 'onPostHandler'

/**
 * Recursively updates all the duplicate fields.
 * @param model
 * @param mongoose
 * @param payload
 * @param result
 * @param logger
 * @returns {*}
 */
internals.trackFields = function(model, mongoose, payload, result, logger) {
  const Log = logger.bind('trackFields')
  let promises = []
  for (const key in payload) {
    const field = model.schema.obj[key]
    // EXPL: Check each field that was updated. If the field has been duplicated, update each duplicate
    // field to match the new value.
    if (field && field.duplicated) {
      field.duplicated.forEach(function(duplicate) {
        const childModel = mongoose.model(duplicate.model)
        const newProp = {}
        newProp[duplicate.as] = result[key]
        const query = {}
        query[duplicate.association] = result._id

        promises.push(
          internals.findAndUpdate(mongoose, childModel, query, newProp, Log)
        )
      })
    }
  }

  return Promise.all(promises)
}

/**
 * Find the documents with duplicate fields and update.
 * @param mongoose
 * @param childModel
 * @param query
 * @param newProp
 * @param logger
 */
internals.findAndUpdate = async function(
  mongoose,
  childModel,
  query,
  newProp,
  logger
) {
  let result = await childModel.find(query)
  let promises = []

  result.forEach(function(doc) {
    promises.push(
      internals.updateField(mongoose, childModel, doc._id, newProp, logger)
    )
  })

  return Promise.all(promises)
}

/**
 * Update a duplicate field for a single doc, then call 'trackDuplicateFields' in case any other docs are duplicating
 * the duplicate field.
 * @param mongoose
 * @param childModel
 * @param _id
 * @param newProp
 * @param logger
 */
internals.updateField = async function(
  mongoose,
  childModel,
  _id,
  newProp,
  logger
) {
  let result = await childModel.findByIdAndUpdate(_id, newProp, { new: true })
  return internals.trackFields(childModel, mongoose, newProp, result, logger)
}

module.exports = {
  trackDuplicatedFields: internals.trackDuplicatedFields
}
