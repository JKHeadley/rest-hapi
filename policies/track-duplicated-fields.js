'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');
const Q = require('q');

const internals = {};

/**
 * Policy to update any duplicate fields.
 * @param model
 * @param Log
 * @returns {trackDuplicatedFields}
 */
internals.trackDuplicatedFields = function(model, mongoose, Log) {

  const trackDuplicatedFieldsForModel = function addDocumentScopeForModel(request, reply, next) {
    Log = Log.bind("trackDuplicatedFields");
    try {
      let promises = [];
      for (const key in request.payload) {
        const field = model.schema.obj[key];
        //EXPL: Check each field that was updated. If the field has been duplicated, update each duplicate
        // field to match the new value.
        if (field && field.duplicated) {
          field.duplicated.forEach(function(duplicate) {
            const childModel = mongoose.model(duplicate.model);
            const newProp = {};
            newProp[duplicate.as] = request.response.source[key];
            const query = {};
            query[duplicate.association] = request.response.source._id;
            promises.push(childModel.update(query, newProp, { multi: true }));
          })
        }
      }

      return Q.all(promises)
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

module.exports = {
  trackDuplicatedFields : internals.trackDuplicatedFields
};

