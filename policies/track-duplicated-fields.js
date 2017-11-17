'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');
const Q = require('q');

const internals = {};

/**
 * Policy to update any duplicate fields when the original field changes.
 * @param model
 * @param Log
 * @returns {trackDuplicatedFields}
 */
internals.trackDuplicatedFields = function(model, mongoose, Log) {

  const trackDuplicatedFieldsForModel = function addDocumentScopeForModel(request, reply, next) {
    Log = Log.bind("trackDuplicatedFields");
    try {
      if (_.isError(request.response)) {
        return next(null, true);
      }
      return internals.trackFields(model, mongoose, request.payload, request.response.source, Log)
          .then(function(result) {
            return next(null, true);
          })

    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(Boom.badImplementation(err), false);
    }
  };

  trackDuplicatedFieldsForModel.applyPoint = 'onPostHandler';

  return trackDuplicatedFieldsForModel;
};

internals.trackDuplicatedFields.applyPoint = 'onPostHandler';

/**
 * Recursively updates all the duplicate fields.
 * @param model
 * @param mongoose
 * @param payload
 * @param result
 * @param Log
 * @returns {*}
 */
internals.trackFields = function(model, mongoose, payload, result, Log) {
    let promises = [];
    for (const key in payload) {
      const field = model.schema.obj[key];
      //EXPL: Check each field that was updated. If the field has been duplicated, update each duplicate
      // field to match the new value.
      if (field && field.duplicated) {
        field.duplicated.forEach(function(duplicate) {
          const childModel = mongoose.model(duplicate.model);
          const newProp = {};
          newProp[duplicate.as] = result[key];
          const query = {};
          query[duplicate.association] = result._id;

          promises.push(internals.findAndUpdate(mongoose, childModel, query, newProp, Log));
        })
      }
    }

    return Q.all(promises);
};

/**
 * Find the documents with duplicate fields and update.
 * @param mongoose
 * @param childModel
 * @param query
 * @param newProp
 * @param Log
 */
internals.findAndUpdate = function (mongoose, childModel, query, newProp, Log) {
  return childModel.find(query)
      .then(function (result) {
        let promises = [];

        result.forEach(function (doc) {
          promises.push(internals.updateField(mongoose, childModel, doc._id, newProp, Log));
        });

        return Q.all(promises);
      });
};

/**
 * Update a duplicate field for a single doc, then call 'trackDuplicateFields' in case any other docs are duplicating
 * the duplicate field.
 * @param mongoose
 * @param childModel
 * @param _id
 * @param newProp
 * @param Log
 */
internals.updateField = function (mongoose, childModel, _id, newProp, Log) {
  return childModel.findByIdAndUpdate(_id, newProp, { new: true })
      .then(function (result) {
        return internals.trackFields(childModel, mongoose, newProp, result, Log)
      });
};

module.exports = {
  trackDuplicatedFields : internals.trackDuplicatedFields
};

