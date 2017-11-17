'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');
const Q = require('q');

const internals = {};

/**
 * Policy to populate duplicate fields when an association is created or updated.
 * @param model
 * @param Log
 * @returns {populateDuplicateFields}
 */
internals.populateDuplicateFields = function(model, mongoose, Log) {

  const populateDuplicateFieldsForModel = function addDocumentScopeForModel(request, reply, next) {
    Log = Log.bind("populateDuplicateFields");
    try {
      let payload = request.payload;
      if (!_.isArray(request.payload)) {
        payload = [request.payload]
      }

      const associations = model.schema.statics.routeOptions.associations;
      if (associations) {
        let promises = [];
        for (const key in associations) {
            const association = associations[key];
            const duplicate = association.duplicate;
            payload.forEach(function (doc) {
                if (duplicate && (association.type === 'MANY_ONE' || association.type === 'ONE_ONE') && doc[key]) {
                    const childModel = mongoose.model(association.model);

                    const deferred = Q.defer();
                    childModel.findOne({'_id': doc[key]})
                        .then(function (result) {
                            const docsToUpdate = payload.filter(function (docToFind) {
                                return docToFind[key] === result._id.toString();
                            })
                            //EXPL: Populate each duplicated field for this association.
                            //NOTE: We are updating the original payload
                            duplicate.forEach(function (prop) {
                                docsToUpdate.forEach(function (docToUpdate) {
                                    docToUpdate[prop.as] = result[prop.field];
                                });
                            });

                            deferred.resolve();
                        });
                    promises.push(deferred.promise);
                }
            })
        }


        return Q.all(promises)
            .then(function (result) {
              return next(null, true);
            })
            .catch(function (err) {
              Log.error("ERROR:", err);
              return next(Boom.badImplementation(err), false);
            })
      }
      return next(null, true);
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(Boom.badImplementation(err), false);
    }
  };

  populateDuplicateFieldsForModel.applyPoint = 'onPreHandler';

  return populateDuplicateFieldsForModel;
};

internals.populateDuplicateFields.applyPoint = 'onPreHandler';

module.exports = {
  populateDuplicateFields : internals.populateDuplicateFields
};

