var assert = require('assert');
var validationHelper = require("./validation-helper");
var mongoose = require('mongoose');
var QueryHelper = require('./query-helper');
var Q = require('q');
var errorHelper = require('./error-helper');
var config = require('../config');

//TODO: support "allowNull"
//TODO: add ".default()" to paths that have a default value

module.exports = {
  /**
   * Finds a list of model documents
   * @param model: A mongoose model.
   * @param query: query parameters to be converted to a mongoose query.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model documents.
   */
  list: function (model, query, Log) {
    try {
      var mongooseQuery = model.find();
      mongooseQuery = QueryHelper.createMongooseQuery(model, query, mongooseQuery, Log);
      return mongooseQuery.exec()
          .then(function (result) {

            var promise = {};
            if (model.routeOptions && model.routeOptions.list && model.routeOptions.list.post) {
              promise = model.routeOptions.list.post(query, result, Log);
            }
            else {
              promise = Q.when(result);
            }

            return promise
                .then(function (result) {
                  result = result.map(function (data) {
                    var result = data.toJSON();
                    if (model.routeOptions) {
                      var associations = model.routeOptions.associations;
                      for (var associationKey in associations) {
                        var association = associations[associationKey];
                        if (association.type === "ONE_MANY" && data[associationKey]) {//EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
                          if (data[associationKey].toJSON) {//TODO: look into .toJSON and see why it appears sometimes and not other times
                            result[associationKey] = data[associationKey].toJSON();
                          }
                          else {
                            result[associationKey] = data[associationKey];
                          }
                        }
                      }
                    }

                    if (result._id) {
                      result._id = result._id.toString();//EXPL: _id must be a string to pass validation
                    }

                    Log.log("Result: %s", JSON.stringify(result));
                    return result;
                  });

                  return result;
                })
                .catch(function (error) {
                  const message = "There was a postprocessing error.";
                  errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                })
          })
          .catch(function (error) {
            const message = "There was an error accessing the database.";
            errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
          });
    }
    catch(error) {
      const message = "There was an error processing the request.";
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
    }
  },

  /**
   * Finds a model document
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param query: query parameters to be converted to a mongoose query.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document.
   */
  find: function (model, _id, query, Log) {
    try {
      var mongooseQuery = model.findOne({ '_id': _id });
      mongooseQuery = QueryHelper.createMongooseQuery(model, query, mongooseQuery, Log);
      return mongooseQuery.exec()
          .then(function (result) {
            if (result) {
              var promise = {};
              if (model.routeOptions && model.routeOptions.find && model.routeOptions.find.post) {
                promise = model.routeOptions.find.post(query, result, Log);
              } else {
                promise = Q.when(result);
              }

              return promise
                  .then(function(data) {
                    var result = data.toJSON();
                    if (model.routeOptions) {
                      var associations = model.routeOptions.associations;
                      for (var associationKey in associations) {
                        var association = associations[associationKey];
                        if (association.type === "ONE_MANY" && data[associationKey]) {//EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
                          result[associationKey] = data[associationKey];
                        }
                      }
                    }

                    if (result._id) {//TODO: handle this with mongoose/global preware
                      result._id = result._id.toString();//EXPL: _id must be a string to pass validation
                    }

                    Log.log("Result: %s", JSON.stringify(result));

                    return result;
                  })
                  .catch(function (error) {
                    const message = "There was a postprocessing error.";
                    errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                  });
            }
            else {
              const message = "No resource was found with that id.";
              errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
            }
          })
          .catch(function (error) {
            const message = "There was an error accessing the database.";
            errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
          });
    }
    catch(error) {
      const message = "There was an error processing the request.";
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
    }

  },

  /**
   * Creates a model document
   * @param model: A mongoose model.
   * @param payload: Data used to create the model document.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document.
   */
  create: function (model, payload, Log) {
    try {
      var promise =  {};
      if (model.routeOptions && model.routeOptions.create && model.routeOptions.create.pre){
        promise = model.routeOptions.create.pre(payload, Log);
      }
      else {
        promise = Q.when(payload);
      }

      return promise
          .then(function (payload) {

            if (config.enableCreatedAt) {
              payload.createdAt = new Date();
              payload.updatedAt = new Date();
            }

            return model.create(payload)
                .then(function (data) {

                  //EXPL: rather than returning the raw "create" data, we filter the data through a separate query
                  var attributes = QueryHelper.createAttributesFilter({}, model, Log);

                  return model.findOne({ '_id': data._id }, attributes)
                      .then(function(result) {
                        result = result.toJSON();

                        //TODO: include eventLogs

                        if (model.routeOptions && model.routeOptions.create && model.routeOptions.create.post) {
                          promise = model.routeOptions.create.post(payload, result, Log);
                        }
                        else {
                          promise = Q.when(result);
                        }

                        return promise
                            .then(function (result) {
                              result._id = result._id.toString();//TODO: handle this with preware
                              return result;
                            })
                            .catch(function (error) {
                              const message = "There was a postprocessing error creating the resource.";
                              errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                            });
                      })
                })
                .catch(function (error) {
                  const message = "There was an error creating the resource.";
                  errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
                });
          })
          .catch(function (error) {
            const message = "There was a preprocessing error creating the resource.";
            errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
          });
    }
    catch(error) {
      const message = "There was an error processing the request.";
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
    }
  },

  /**
   * Updates a model document
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param payload: Data used to update the model document.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document.
   */
  update: function (model, _id, payload, Log) {
    try {
      var promise =  {};
      if (model.routeOptions && model.routeOptions.update && model.routeOptions.update.pre){
        promise = model.routeOptions.update.pre(_id, payload, Log);
      }
      else {
        promise = Q.when(payload);
      }

      return promise
          .then(function (payload) {

            if (config.enableUpdatedAt) {
              payload.updatedAt = new Date();
            }

            //TODO: support eventLogs and log all property updates in one document rather than one document per property update
            return model.findByIdAndUpdate(_id, payload)
                .then(function (result) {
                  if (result) {
                    //TODO: log all updated/added associations
                    var attributes = QueryHelper.createAttributesFilter({}, model, Log);

                    return model.findOne({'_id': result._id}, attributes)
                        .then(function (result) {
                          result = result.toJSON();

                          if (model.routeOptions && model.routeOptions.update && model.routeOptions.update.post) {
                            promise = model.routeOptions.update.post(payload, result, Log);
                          }
                          else {
                            promise = Q.when(result);
                          }

                          return promise
                              .then(function (result) {
                                result._id = result._id.toString();//TODO: handle this with preware
                                return result;
                              })
                              .catch(function (error) {
                                const message = "There was a postprocessing error updating the resource.";
                                errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                              });
                        })
                  }
                  else {
                    const message = "No resource was found with that id.";
                    errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
                  }
                })
                .catch(function (error) {
                  const message = "There was an error updating the resource.";
                  errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
                });
          })
          .catch(function (error) {
            const message = "There was a preprocessing error updating the resource.";
            errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
          });
    }
    catch(error) {
      const message = "There was an error processing the request.";
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
    }
  },

  /**
   * Deletes a model document
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param payload: Data used to determine a soft or hard delete.
   * @param Log: A logging object.
   * @returns {object} A promise returning true if the delete succeeds.
   */
  delete: function (model, _id, payload, Log) {
    try {
      var promise = {};
      if (model.routeOptions && model.routeOptions.delete && model.routeOptions.delete.pre) {
        promise = model.routeOptions.delete.pre(payload, Log);
      }
      else {
        promise = Q.when();
      }

      return promise
          .then(function () {

            if (config.enableSoftDelete && !(payload && payload.hardDelete)) {
              promise = model.findByIdAndUpdate(_id, { isDeleted: true, deletedAt: new Date() });
            }
            else {
              promise = model.findByIdAndRemove(_id);
            }
            return promise
                .then(function (deleted) {//TODO: clean up associations/set rules for ON DELETE CASCADE/etc.
                  if (deleted) {
                    //TODO: add eventLogs

                    var promise = {};
                    if (model.routeOptions && model.routeOptions.delete && model.routeOptions.delete.post) {
                      promise = model.routeOptions.delete.post(payload, deleted, Log);
                    }
                    else {
                      promise = Q.when();
                    }

                    return promise
                        .then(function () {
                          return true;
                        })
                        .catch(function (error) {
                          const message = "There was a postprocessing error creating the resource.";
                          errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                        });
                  }
                  else {
                    const message = "No resource was found with that id.";
                    errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
                  }
                })
                .catch(function (error) {
                  const message = "There was an error deleting the resource.";
                  errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
                });
          })
          .catch(function (error) {
            const message = "There was a preprocessing error deleting the resource.";
            errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
          });
    }
    catch(error) {
      const message = "There was an error processing the request.";
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
    }
  },

};