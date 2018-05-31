'use strict'

const Boom = require('boom')
const _ = require('lodash')

const internals = {}

/**
 * Policy to populate duplicate fields when an association is created or updated.
 * @param model
 * @param logger
 * @returns {populateDuplicateFields}
 */
internals.populateDuplicateFields = function(model, mongoose, logger) {
  const populateDuplicateFieldsForModel = async function addDocumentScopeForModel(
    request,
    h
  ) {
    const Log = logger.bind('populateDuplicateFields')
    try {
      let payload = request.payload
      if (!_.isArray(request.payload)) {
        payload = [request.payload]
      }

      const associations = model.schema.statics.routeOptions.associations
      if (associations) {
        let promises = []
        for (const key in associations) {
          const association = associations[key]
          const duplicate = association.duplicate
          for (let doc of payload) {
            if (
              duplicate &&
              (association.type === 'MANY_ONE' ||
                association.type === 'ONE_ONE') &&
              doc[key]
            ) {
              const childModel = mongoose.model(association.model)

              let promise = childModel
                .findOne({ _id: doc[key] })
                .then(function(result) {
                  const docsToUpdate = payload.filter(function(docToFind) {
                    return docToFind[key] === result._id.toString()
                  })
                  // EXPL: Populate each duplicated field for this association.
                  // NOTE: We are updating the original payload
                  for (let prop of duplicate) {
                    for (let docToUpdate of docsToUpdate) {
                      docToUpdate[prop.as] = result[prop.field]
                    }
                  }
                })
              promises.push(promise)
            }
          }
        }

        await Promise.all(promises)
        return h.continue
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

  populateDuplicateFieldsForModel.applyPoint = 'onPreHandler'

  return populateDuplicateFieldsForModel
}

internals.populateDuplicateFields.applyPoint = 'onPreHandler'

module.exports = {
  populateDuplicateFields: internals.populateDuplicateFields
}
