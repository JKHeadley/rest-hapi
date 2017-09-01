'use strict';

var QueryHelper = require('./query-helper');
var Q = require('q');
var errorHelper = require('./error-helper');
var extend = require('util')._extend;
var config = require('../config');
var _ = require('lodash');

//TODO: add a "clean" method that clears out all soft-deleted docs
//TODO: add an optional TTL config setting that determines how long soft-deleted docs remain in the system
//TODO: possibly remove "MANY_ONE" association and make it implied
//TODO: possibly remove "ONE_ONE" association and make it implied

module.exports = {

  /**
   * List function exposed as a mongoose wrapper.
   * @param model: A mongoose model.
   * @param query: rest-hapi query parameters to be converted to a mongoose query.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model documents or the count of the query results.
   */
  list: _list,

  /**
   * Finds a list of model documents.
   * @param model: A mongoose model.
   * @param request: The Hapi request object, or a container for the wrapper query.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model documents or the count of the query results.
   * @private
   */
  listHandler: _listHandler,

  /**
   * Find function exposed as a mongoose wrapper.
   * @param model: A mongoose model.
   * @param query: rest-hapi query parameters to be converted to a mongoose query.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model documents or the count of the query results.
   */
  find: _find,

  /**
   * Finds a model document
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param request: The Hapi request object, or a container for the wrapper query.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document.
   */
  findHandler: _findHandler,

  /**
   * Create function exposed as a mongoose wrapper.
   * @param model: A mongoose model.
   * @param payload: Data used to create the model document/s.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document/s.
   */
  create: _create,

  /**
   * Creates one or more model documents.
   * @param model: A mongoose model.
   * @param request: The Hapi request object, or a container for the wrapper payload.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document/s.
   */
  createHandler: _createHandler,

  /**
   * Update function exposed as a mongoose wrapper.
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param payload: Data used to update the model document.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document.
   */
  update: _update,

  /**
   * Updates a model document.
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param request: The Hapi request object, or a container for the wrapper payload.
   * @param Log: A logging object.
   * @returns {object} A promise for the resulting model document.
   */
  updateHandler: _updateHandler,

  /**
   * Delete function exposed as a mongoose wrapper.
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param hardDelete: Flag used to determine a soft or hard delete.
   * @param Log: A logging object.
   * @returns {object} A promise returning true if the delete succeeds.
   */
  deleteOne: _deleteOne,

  /**
   * Deletes a model document
   * @param model: A mongoose model.
   * @param _id: The document id.
   * @param hardDelete: Flag used to determine a soft or hard delete.
   * @param request: The Hapi request object.
   * @param Log: A logging object.
   * @returns {object} A promise returning true if the delete succeeds.
   */
  deleteOneHandler: _deleteOneHandler,

  /**
   * DeleteMany function exposed as a mongoose wrapper.
   * @param model: A mongoose model.
   * @param payload: Either an array of ids or an array of objects containing an id and a "hardDelete" flag.
   * @param Log: A logging object.
   * @returns {object} A promise returning true if the delete succeeds.
   */
  deleteMany: _deleteMany,

  /**
   * Deletes multiple documents.
   * @param model: A mongoose model.
   * @param request: The Hapi request object, or a container for the wrapper payload.
   * @param Log: A logging object.
   * @returns {object} A promise returning true if the delete succeeds.
   */
  deleteManyHandler: _deleteManyHandler,

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
   */
  addOne: _addOne,

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
   */
  addOneHandler: _addOneHandler,

  /**
   * RemoveOne function exposed as a mongoose wrapper.
   * @param ownerModel: The model that is being removed from.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being removed.
   * @param childId: The id of the child document.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param Log: A logging object
   * @returns {object} A promise returning true if the remove succeeds.
   */
  removeOne: _removeOne,

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
   */
  removeOneHandler: _removeOneHandler,

  /**
   * AddMany function exposed as a mongoose wrapper.
   * @param ownerModel: The model that is being added to.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being added.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param payload: Either a list of id's or a list of id's along with extra linking-model fields.
   * @param Log: A logging object
   * @returns {object} A promise returning true if the add succeeds.
   */
  addMany: _addMany,

  /**
   * Adds multiple associations to a document.
   * @param ownerModel: The model that is being added to.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being added.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param request: The Hapi request object, or a container for the wrapper payload.
   * @param Log: A logging object
   * @returns {object} A promise returning true if the add succeeds.
   */
  addManyHandler: _addManyHandler,

  /**
   * RemoveMany function exposed as a mongoose wrapper.
   * @param ownerModel: The model that is being removed from.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being removed.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param payload: A list of ids
   * @param Log: A logging object
   * @returns {object} A promise returning true if the remove succeeds.
   */
  removeMany: _removeMany,

  /**
   * Removes multiple associations from a document
   * @param ownerModel: The model that is being removed from.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being removed.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param request: The Hapi request object, or a container for the wrapper payload.
   * @param Log: A logging object
   * @returns {object} A promise returning true if the remove succeeds.
   */
  removeManyHandler: _removeManyHandler,

  /**
   * GetAll function exposed as a mongoose wrapper.
   * @param ownerModel: The model that is being added to.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being added.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param query: rest-hapi query parameters to be converted to a mongoose query.
   * @param Log: A logging object
   * @returns {object} A promise for the resulting model documents or the count of the query results.
   */
  getAll: _getAll,

  /**
   * Get all of the associations for a document
   * @param ownerModel: The model that is being added to.
   * @param ownerId: The id of the owner document.
   * @param childModel: The model that is being added.
   * @param associationName: The name of the association from the ownerModel's perspective.
   * @param request: The Hapi request object, or a container for the wrapper query.
   * @param Log: A logging object
   * @returns {object} A promise for the resulting model documents or the count of the query results.
   */
  getAllHandler: _getAllHandler

};


/**
 * List function exposed as a mongoose wrapper.
 * @param model: A mongoose model.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 * @private
 */
function _list(model, query, Log) {
  let request = { query: query };
  return _listHandler(model, request, Log);
}
/**
 * Finds a list of model documents.
 * @param model: A mongoose model.
 * @param request: The Hapi request object, or a container for the wrapper query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 * @private
 */
function _listHandler(model, request, Log) {
  let query = extend({}, request.query);
  let logError = false;
  try {
    var promise = {};
    if (model.routeOptions && model.routeOptions.list && model.routeOptions.list.pre) {
      promise = model.routeOptions.list.pre(query, request, Log);
    }
    else {
      promise = Q.when(query);
    }

    return promise
        .then(function (query){
          var mongooseQuery = {};
          var count = "";
          var flatten = false;
          if (query.$flatten) {
            flatten = true;
          }
          delete query.$flatten;
          if (query.$count) {
            mongooseQuery = model.count();
            mongooseQuery = QueryHelper.createMongooseQuery(model, query, mongooseQuery, Log).lean();
            return mongooseQuery.exec()
                .then(function(result) {
                  Log.log("Result: %s", JSON.stringify(result));
                  return result;
                })
          }

          mongooseQuery = model.find();
          mongooseQuery = QueryHelper.createMongooseQuery(model, query, mongooseQuery, Log).lean();
          return mongooseQuery.count()
              .then(function (result) {
                count = result;
                mongooseQuery = QueryHelper.paginate(query, mongooseQuery, Log);
                return mongooseQuery.exec('find')
              })
              .then(function (result) {

                var promise = {};
                if (model.routeOptions && model.routeOptions.list && model.routeOptions.list.post) {
                  promise = model.routeOptions.list.post(request, result, Log);
                }
                else {
                  promise = Q.when(result);
                }

                return promise
                    .then(function (result) {
                      result = result.map(function (data) {
                        var result = data;
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
                            if (association.type === "MANY_MANY" && flatten === true) {//EXPL: remove additional fields and return a flattened array
                              if (result[associationKey]) {
                                result[associationKey] = result[associationKey].map(function(object) {
                                  object = object[association.model];
                                  return object;
                                })
                              }
                            }
                          }
                        }

                        if (config.enableSoftDelete && config.filterDeletedEmbeds) {//EXPL: remove soft deleted documents from populated properties
                          filterDeletedEmbeds(result, {}, "", 0, Log);
                        }

                        if (result._id) {
                          result._id = result._id.toString();//EXPL: _id must be a string to pass validation
                        }

                        Log.log("Result: %s", JSON.stringify(result));
                        return result
                      });


                      const pages = {
                        current: query.$page || 1,
                        prev: 0,
                        hasPrev: false,
                        next: 0,
                        hasNext: false,
                        total: 0
                      };
                      const items = {
                        limit: query.$limit,
                        begin: (((query.$page || 1) * query.$limit) - query.$limit) + 1,
                        end: (query.$page || 1) * query.$limit,
                        total: count
                      };

                      pages.total = Math.ceil(count / query.$limit);
                      pages.next = pages.current + 1;
                      pages.hasNext = pages.next <= pages.total;
                      pages.prev = pages.current - 1;
                      pages.hasPrev = pages.prev !== 0;
                      if (items.begin > items.total) {
                        items.begin = items.total;
                      }
                      if (items.end > items.total) {
                        items.end = items.total;
                      }

                      return { docs: result, pages: pages, items: items };
                    })
                    .catch(function (error) {
                      const message = "There was a postprocessing error.";
                      if (!logError) {
                        Log.error(message);
                        logError = true;
                        delete error.type;
                      }
                      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                    })
              })
              .catch(function (error) {
                const message = "There was an error accessing the database.";
                if (!logError) {
                  Log.error(message);
                  logError = true;
                  delete error.type;
                }
                errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
              });
        })
        .catch(function (error) {
          const message = "There was a preprocessing error.";
          if (!logError) {
            Log.error(message);
            logError = true;
            delete error.type;
          }
          errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
        });
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
  let request = { query: query };
  return _findHandler(model, _id, request, Log);
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
function _findHandler(model, _id, request, Log) {
  let query = extend({}, request.query);
  let logError = false;
  try {
    var flatten = false;
    if (query.$flatten) {
      flatten = true;
    }
    delete query.$flatten;
    var mongooseQuery = model.findOne({ '_id': _id });
    mongooseQuery = QueryHelper.createMongooseQuery(model, query, mongooseQuery, Log).lean();
    return mongooseQuery.exec()
        .then(function (result) {
          if (result) {
            var promise = {};
            if (model.routeOptions && model.routeOptions.find && model.routeOptions.find.post) {
              promise = model.routeOptions.find.post(request, result, Log);
            } else {
              promise = Q.when(result);
            }

            return promise
                .then(function(data) {
                  if (model.routeOptions) {
                    var associations = model.routeOptions.associations;
                    for (var associationKey in associations) {
                      var association = associations[associationKey];
                      if (association.type === "ONE_MANY" && data[associationKey]) {//EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
                        result[associationKey] = data[associationKey];
                      }
                      if (association.type === "MANY_MANY" && flatten === true) {//EXPL: remove additional fields and return a flattened array
                        if (result[associationKey]) {
                          result[associationKey] = result[associationKey].map(function(object) {
                            object = object[association.model];
                            return object;
                          })
                        }
                      }
                    }
                  }

                  if (config.enableSoftDelete && config.filterDeletedEmbeds) {//EXPL: remove soft deleted documents from populated properties
                    filterDeletedEmbeds(result, {}, "", 0, Log);
                  }

                  if (result._id) {//TODO: handle this with mongoose/global preware
                    result._id = result._id.toString();//EXPL: _id must be a string to pass validation
                  }

                  Log.log("Result: %s", JSON.stringify(result));

                  return result;
                })
                .catch(function (error) {
                  const message = "There was a postprocessing error.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                    delete error.type;
                  }
                  errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                });
          }
          else {
            const message = "No resource was found with that id.";
            if (!logError) {
              Log.error(message);
              logError = true;
            }
            errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
          }
        })
        .catch(function (error) {
          const message = "There was an error accessing the database.";
          if (!logError) {
            Log.error(message);
            logError = true;
            delete error.type;
          }
          errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
        });
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
  let request = { payload: payload };
  return _createHandler(model, request, Log);
}
//TODO: make sure errors are catching in correct order
/**
 * Creates one or more model documents.
 * @param model: A mongoose model.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document/s.
 * @private
 */
function _createHandler(model, request, Log) {
  let payload = null;

  let logError = false;
  try {
    var isArray = true;
    if (!_.isArray(request.payload)) {
      payload = [extend({}, request.payload)];
      isArray = false;
    }
    else {
      payload = extend([], request.payload);
    }

    var promises =  [];
    if (model.routeOptions && model.routeOptions.create && model.routeOptions.create.pre){
      payload.forEach(function(document) {
        promises.push(model.routeOptions.create.pre(document, request, Log));
      });
    }
    else {
      promises = Q.when(payload);
    }

    return Q.all(promises)
        .then(function (payload) {
          if (config.enableCreatedAt) {
            payload.forEach(function(item) {
              item.createdAt = new Date();
              item.updatedAt = new Date();
            });
          }

          return model.create(payload)
              .then(function (data) {

                //EXPL: rather than returning the raw "create" data, we filter the data through a separate query
                var attributes = QueryHelper.createAttributesFilter({}, model, Log);

                data = data.map(function(item) {
                  return item._id;
                });

                return model.find().where({'_id': { $in: data } }).select(attributes).lean().exec()
                    .then(function(result) {

                      //TODO: include eventLogs

                      var promises = [];
                      if (model.routeOptions && model.routeOptions.create && model.routeOptions.create.post) {
                        result.forEach(function(document) {
                          promises.push(model.routeOptions.create.post(document, request, result, Log));
                        });
                      }
                      else {
                        promises = Q.when(result);
                      }

                      return Q.all(promises)
                          .then(function (result) {
                            if (isArray) {
                              return result;
                            }
                            else {
                              return result[0];
                            }
                          })
                          .catch(function (error) {
                            const message = "There was a postprocessing error creating the resource.";
                            if (!logError) {
                              Log.error(message);
                              logError = true;
                              delete error.type;
                            }
                            errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                          });
                    })
              })
              .catch(function (error) {
                const message = "There was an error creating the resource.";
                if (!logError) {
                  Log.error(message);
                  logError = true;
                  delete error.type;
                }
                errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
              });
        })
        .catch(function (error) {
          const message = "There was a preprocessing error creating the resource.";
          if (!logError) {
            Log.error(message);
            logError = true;
            delete error.type;
          }
          errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
        });
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
  let request = { payload: payload };
  return _updateHandler(model, _id, request, Log);
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
function _updateHandler(model, _id, request, Log) {
  let payload = extend({}, request.payload);
  let logError = false;
  try {
    var promise =  {};
    if (model.routeOptions && model.routeOptions.update && model.routeOptions.update.pre){
      promise = model.routeOptions.update.pre(_id, request, Log);
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

                  return model.findOne({'_id': result._id}, attributes).lean()
                      .then(function (result) {

                        if (model.routeOptions && model.routeOptions.update && model.routeOptions.update.post) {
                          promise = model.routeOptions.update.post(request, result, Log);
                        }
                        else {
                          promise = Q.when(result);
                        }

                        return promise
                            .then(function (result) {
                              return result;
                            })
                            .catch(function (error) {
                              const message = "There was a postprocessing error updating the resource.";
                              if (!logError) {
                                Log.error(message);
                                logError = true;
                                delete error.type;
                              }
                              errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                            });
                      })
                }
                else {
                  const message = "No resource was found with that id.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                  }
                  errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
                }
              })
              .catch(function (error) {
                const message = "There was an error updating the resource.";
                if (!logError) {
                  Log.error(message);
                  logError = true;
                  delete error.type;
                }
                errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
              });
        })
        .catch(function (error) {
          const message = "There was a preprocessing error updating the resource.";
          if (!logError) {
            Log.error(message);
            logError = true;
            delete error.type;
          }
          errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
        });
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
  return _deleteOneHandler(model, _id, hardDelete, {}, Log);
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
//TODO: only update "deleteAt" the first time a document is deleted
function _deleteOneHandler(model, _id, hardDelete, request, Log) {
  let logError = false;
  try {
    var promise = {};
    if (model.routeOptions && model.routeOptions.delete && model.routeOptions.delete.pre) {
      promise = model.routeOptions.delete.pre(_id, hardDelete, request, Log);
    }
    else {
      promise = Q.when();
    }

    return promise
        .then(function () {
          if (config.enableSoftDelete && !hardDelete) {
            promise = model.findByIdAndUpdate(_id, { isDeleted: true, deletedAt: new Date() }, {new: true});
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
                    promise = model.routeOptions.delete.post(hardDelete, deleted, request, Log);
                  }
                  else {
                    promise = Q.when();
                  }

                  return promise
                      .then(function () {
                        return true;
                      })
                      .catch(function (error) {
                        const message = "There was a postprocessing error deleting the resource.";
                        if (!logError) {
                          Log.error(message);
                          logError = true;
                          delete error.type;
                        }
                        errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
                      });
                }
                else {
                  const message = "No resource was found with that id.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                  }
                  errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
                }
              })
              .catch(function (error) {
                const message = "There was an error deleting the resource.";
                if (!logError) {
                  Log.error(message);
                  logError = true;
                  delete error.type;
                }
                errorHelper.handleError(error, message, errorHelper.types.SERVER_TIMEOUT, Log);
              });
        })
        .catch(function (error) {
          const message = "There was a preprocessing error deleting the resource.";
          if (!logError) {
            Log.error(message);
            logError = true;
            delete error.type;
          }
          errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
        });
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
  let request = { payload: payload };
  return _deleteManyHandler(model, request, Log);
}
/**
 * Deletes multiple documents.
 * @param model: A mongoose model.
 * @param request: The Hapi request object, or a container for the wrapper payload.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 * @private
 */
//TODO: prevent Q.all from catching first error and returning early. Catch individual errors and return a list
//TODO(cont) of ids that failed
function _deleteManyHandler(model, request, Log) {
  let payload = extend([], request.payload);
  try {
    let promises = [];
    payload.forEach(function(arg) {
      if (_.isString(arg)) {
        promises.push(_deleteOneHandler(model, arg, false, request, Log));
      }
      else {
        promises.push(_deleteOneHandler(model, arg._id, arg.hardDelete, request, Log));
      }
    });

    return Q.all(promises)
        .then(function(result) {
          return true;
        })
        .catch(function(error) {
          throw error;
        })
  }

  catch(error) {
    const message = "There was an error processing the request.";
    Log.error(message);
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
function _addOne(ownerModel, ownerId, childModel, childId, associationName, payload, Log) {
  let request = { payload: payload };
  return _addOneHandler(ownerModel, ownerId, childModel, childId, associationName, request, Log);
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
function _addOneHandler(ownerModel, ownerId, childModel, childId, associationName, request, Log) {
  let payload = extend({}, request.payload);
  let logError = false;
  try {
    return ownerModel.findOne({ '_id': ownerId })
        .then(function (ownerObject) {
          if (ownerObject) {
            if (!payload) {
              payload = {};
            }
            payload.childId = childId;
            payload = [payload];
            return _setAssociation(ownerModel, ownerObject, childModel, childId, associationName, payload, Log)
                .then(function() {
                  return true;
                })
                .catch(function (error) {
                  const message = "There was a database error while setting the association.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                    delete error.type;
                  }
                  errorHelper.handleError(error, message, errorHelper.types.GATEWAY_TIMEOUT, Log);
                });
          }
          else {
            const message = "No owner resource was found with that id.";
            if (!logError) {
              Log.error(message);
              logError = true;
            }
            errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
          }
        })
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
function _removeOne(ownerModel, ownerId, childModel, childId, associationName, Log) {
  return _removeOneHandler(ownerModel, ownerId, childModel, childId, associationName, {}, Log)
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
function _removeOneHandler(ownerModel, ownerId, childModel, childId, associationName, request, Log) {
  let logError = false;
  try {
    return ownerModel.findOne({ '_id': ownerId })
        .then(function (ownerObject) {
          if (ownerObject) {
            _removeAssociation(ownerModel, ownerObject, childModel, childId, associationName, Log)
                .then(function() {
                  return true;
                })
                .catch(function (error) {
                  const message = "There was a database error while removing the association.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                    delete error.type;
                  }
                  errorHelper.handleError(error, message, errorHelper.types.GATEWAY_TIMEOUT, Log);
                });
          }
          else {
            const message = "No owner resource was found with that id.";
            if (!logError) {
              Log.error(message);
              logError = true;
            }
            errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
          }
        })
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
function _addMany(ownerModel, ownerId, childModel, associationName, payload, Log) {
  let request = { payload: payload };
  return _addManyHandler(ownerModel, ownerId, childModel, associationName, request, Log)
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
function _addManyHandler(ownerModel, ownerId, childModel, associationName, request, Log) {
  let payload = extend([], request.payload);
  let logError = false;
  try {
    return ownerModel.findOne({ '_id': ownerId })
        .then(function (ownerObject) {
          if (ownerObject) {
            var childIds = [];
            //EXPL: the payload is an array of Ids
            if (typeof payload[0] === 'string' || payload[0] instanceof String || payload[0]._bsontype === "ObjectID") {
              childIds = payload;
            }
            else {//EXPL: the payload contains extra fields
              childIds = payload.map(function(object) {
                return object.childId;
              });
            }

            var promise_chain = Q.when();

            childIds.forEach(function(childId) {
              var promise_link = function() {
                var deferred = Q.defer();
                _setAssociation(ownerModel, ownerObject, childModel, childId, associationName, payload, Log)
                    .then(function(result) {
                      deferred.resolve(result);
                    })
                    .catch(function (error) {
                      deferred.reject(error);
                    });
                return deferred.promise;
              };

              promise_chain = promise_chain
                  .then(promise_link)
                  .catch(function(error) {
                    throw error;
                  });
            });

            return promise_chain
                .then(function() {
                  return true;
                })
                .catch(function (error) {
                  const message = "There was an internal error while setting the associations.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                    delete error.type;
                  }
                  errorHelper.handleError(error, message, errorHelper.types.GATEWAY_TIMEOUT, Log);
                });
          }
          else {
            const message = "No owner resource was found with that id.";
            if (!logError) {
              Log.error(message);
              logError = true;
            }
            errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
          }
        })
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
function _removeMany(ownerModel, ownerId, childModel, associationName, payload, Log) {
  let request = { payload: payload };
  return _removeManyHandler(ownerModel, ownerId, childModel, associationName, request, Log);
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
function _removeManyHandler(ownerModel, ownerId, childModel, associationName, request, Log) {
  let payload = extend([], request.payload);
  let logError = false;
  try {
    return ownerModel.findOne({ '_id': ownerId })
        .then(function (ownerObject) {
          if (ownerObject) {
            var childIds = payload;

            var promise_chain = Q.when();

            childIds.forEach(function(childId) {
              var promise_link = function() {
                var deferred = Q.defer();
                _removeAssociation(ownerModel, ownerObject, childModel, childId, associationName, Log)
                    .then(function(result) {
                      deferred.resolve(result);
                    })
                    .catch(function (error) {
                      deferred.reject(error);
                    });
                return deferred.promise;
              };

              promise_chain = promise_chain
                  .then(promise_link)
                  .catch(function(error) {
                    throw error;
                  });
            });

            return promise_chain
                .then(function() {
                  return true;
                })
                .catch(function (error) {
                  const message = "There was an internal error while removing the associations.";
                  if (!logError) {
                    Log.error(message);
                    logError = true;
                    delete error.type;
                  }
                  errorHelper.handleError(error, message, errorHelper.types.GATEWAY_TIMEOUT, Log);
                });
          }
          else {
            const message = "No owner resource was found with that id.";
            if (!logError) {
              Log.error(message);
              logError = true;
            }
            errorHelper.handleError(message, message, errorHelper.types.NOT_FOUND, Log);
          }
        })
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!logError) {
      Log.error(message);
      logError = true;
      delete error.type;
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
  let request = { query: query };
  return _getAllHandler(ownerModel, ownerId, childModel, associationName, request, Log)
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
function _getAllHandler(ownerModel, ownerId, childModel, associationName, request, Log) {
  try {
    let query = request.query;

    var association = ownerModel.routeOptions.associations[associationName];
    var foreignField = association.foreignField;

    var ownerRequest = { query: {} };
    ownerRequest.query.$embed = associationName;
    ownerRequest.query.populateSelect = "_id";
    if (foreignField) {
      ownerRequest.query.populateSelect = ownerRequest.query.populateSelect + "," + foreignField;
    }

    //EXPL: In order to allow for fully querying against the association data, we first embed the
    //associations to get a list of _ids and extra fields. We then leverage _list
    //to perform the full query.  Finally the extra fields (if they exist) are added to the final result
    var mongooseQuery = ownerModel.findOne({ '_id': ownerId });
    mongooseQuery = QueryHelper.createMongooseQuery(ownerModel, ownerRequest.query, mongooseQuery, Log);
    return mongooseQuery.exec()
        .then(function (result) {
          if (!result) {
            throw new Error("owner object not found")
          }
          result = result[associationName];
          var childIds = [];
          var many_many = false;
          if (association.type === "MANY_MANY") {
            childIds = result.map(function(object) {
              return object[association.model]._id;
            });
            many_many = true;
          }
          else {
            childIds = result.map(function(object) {
              return object._id;
            });
          }

          if (query._id) {
            if (!_.isArray(query._id)) {
              query._id = [query._id];
            }
            childIds = childIds.filter(function(id) {
              return query._id.indexOf(id.toString()) > -1
            });
            delete query._id
          }
          query.$where = extend({'_id': { $in: childIds }}, query.$where);

          request.query = query;

          var promise = _listHandler(childModel, request, Log);

          if (many_many && association.linkingModel) {//EXPL: we have to manually insert the extra fields into the result
            var extraFieldData = result;
            return promise
                .then(function(result) {
                  if (_.isArray(result.docs)) {
                    result.docs.forEach(function(object) {
                      var data = extraFieldData.find(function(data) {
                        return data[association.model]._id.toString() === object._id
                      });
                      if (!data) {
                        throw new Error("child object not found")
                      }
                      var fields = data.toJSON();
                      delete fields._id;
                      delete fields[association.model];
                      object[association.linkingModel] = fields;
                    });
                  }

                  return result;
                })
          }
          else {
            return promise
                .then(function(result) {
                  return result;
                })
          }
        })
        .catch(function (error) {
          const message = "There was an error processing the request.";
          if (!error.type) {
            Log.error(message);
          }
          errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log);
        });
  }
  catch(error) {
    const message = "There was an error processing the request.";
    if (!error.type) {
      Log.error(message);
    }
    try {
      errorHelper.handleError(error, message, errorHelper.types.BAD_REQUEST, Log)
    }
    catch(error) {
      return Q.reject(error);
    }
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
function _setAssociation(ownerModel, ownerObject, childModel, childId, associationName, payload, Log) {
  var deferred = Q.defer();

  childModel.findOne({ '_id': childId })
      .then(function (childObject) {
        if (childObject) {
          var promise = {};
          var association = ownerModel.routeOptions.associations[associationName];
          var extraFields = false;
          if (association.type === "ONE_MANY") {//EXPL: one-many associations are virtual, so only update the child reference
            childObject[association.foreignField] = ownerObject._id;
            promise = childObject.save();
          }
          else if (association.type === "MANY_MANY") {
            //EXPL: the payload is an array of Ids. No extra fields
            if (typeof payload[0] === 'string' || payload[0] instanceof String || payload[0]._bsontype === "ObjectID") {
              payload = {};

              extraFields = false;
            }
            else {
              payload = payload.filter(function(object) {//EXPL: the payload contains extra fields
                return object.childId === childObject._id.toString();
              });

              payload = payload[0];

              payload = extend({}, payload);//EXPL: break the reference to the original payload

              delete payload.childId;

              extraFields = true;
            }
            payload[childModel.modelName] = childObject._id;

            var duplicate = ownerObject[associationName].filter(function (associationObject) {
              return associationObject[childModel.modelName].toString() === childId;
            });
            duplicate = duplicate[0];

            var duplicateIndex = ownerObject[associationName].indexOf(duplicate);

            if (duplicateIndex < 0) {//EXPL: if the association doesn't already exist, create it, otherwise update the extra fields
              ownerObject[associationName].push(payload);
            }
            else if (extraFields) {//EXPL: only update if there are extra fields TODO: reference MANY_MANY bug where updating association that's just an id (i.e. no extra fields) causes an error and reference this as the fix
              payload._id = ownerObject[associationName][duplicateIndex]._id;//EXPL: retain the association instance id for consistency
              ownerObject[associationName][duplicateIndex] = payload;
            }

            payload = extend({}, payload);//EXPL: break the reference to the original payload
            delete payload._id;

            delete payload[childModel.modelName];
            payload[ownerModel.modelName] = ownerObject._id;
            var childAssociation = {};
            var childAssociations = childModel.routeOptions.associations;
            for (var childAssociationKey in childAssociations) {
              var association = childAssociations[childAssociationKey];
              if (association.model === ownerModel.modelName && association.type === "MANY_MANY") {//TODO: Add issue referencing a conflict when a model has two associations of the same model and one is a MANY_MANY, and reference this change as the fix
                childAssociation = association;
              }
            }

            if (!childAssociation.include) {
              throw new Error("Missing association between " + ownerModel.modelName + " and " + childModel.modelName + ".");
            }

            var childAssociationName = childAssociation.include.as;

            if (!childObject[childAssociationName]) {
              throw new Error(childAssociationName + " association does not exist.");
            }

            duplicate = childObject[childAssociationName].filter(function (associationObject) {
              return associationObject[ownerModel.modelName].toString() === ownerObject._id.toString();
            });
            duplicate = duplicate[0];

            duplicateIndex = childObject[childAssociationName].indexOf(duplicate);

            if (duplicateIndex < 0) {//EXPL: if the association doesn't already exist, create it, otherwise update the extra fields
              childObject[childAssociationName].push(payload);
            }
            else {
              payload._id = childObject[childAssociationName][duplicateIndex]._id;//EXPL: retain the association instance id for consistency
              childObject[childAssociationName][duplicateIndex] = payload;
            }

            promise = Q.all([ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject), childModel.findByIdAndUpdate(childObject._id, childObject)]);
          }
          else if (association.type === "_MANY") {

            var duplicate = ownerObject[associationName].filter(function (_childId) {
              return _childId.toString() === childId;
            });
            duplicate = duplicate[0];

            var duplicateIndex = ownerObject[associationName].indexOf(duplicate);

            if (duplicateIndex < 0) {//EXPL: if the association doesn't already exist, create it
              ownerObject[associationName].push(childId);
            }

            promise = Q.all([ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject)]);
          }
          else {
            deferred.reject(new Error("Association type incorrectly defined."));
            return deferred.promise;
          }

          promise
              .then(function() {
                //TODO: add eventLogs
                //TODO: allow eventLogs to log/support association extra fields
                deferred.resolve();
              })
              .catch(function (error) {
                Log.error(error);
                deferred.reject(error);
              });
        }
        else {
          deferred.reject(new Error("Child object not found."));
        }
      })
      .catch(function (error) {
        Log.error(error);
        deferred.reject(error);
      });

  return deferred.promise;
}


/**
 * Remove an association instance between two resources
 * @param request
 * @param server
 * @param ownerModel
 * @param ownerObject
 * @param childModel
 * @param childId
 * @param associationName
 * @param options
 * @param Log
 * @returns {*|promise}
 * @private
 */
function _removeAssociation(ownerModel, ownerObject, childModel, childId, associationName, Log) {
  var deferred = Q.defer();

  childModel.findOne({ '_id': childId })
      .then(function (childObject) {
        if (childObject) {
          var promise = {};
          var association = ownerModel.routeOptions.associations[associationName];
          var associationType = association.type;
          if (associationType === "ONE_MANY") {//EXPL: one-many associations are virtual, so only update the child reference
            // childObject[association.foreignField] = null; //TODO: set reference to null instead of deleting it?
            childObject[association.foreignField] = undefined;
            promise = childObject.save()
          }
          else if (associationType === "MANY_MANY") {//EXPL: remove references from both models

            //EXPL: remove the associated child from the owner
            var deleteChild = ownerObject[associationName].filter(function(child) {
              return child[childModel.modelName].toString() === childObject._id.toString();
            });
            deleteChild = deleteChild[0];

            var index = ownerObject[associationName].indexOf(deleteChild);
            if (index > -1) {
              ownerObject[associationName].splice(index, 1);
            }

            //EXPL: get the child association name
            var childAssociation = {};
            var childAssociations = childModel.routeOptions.associations;
            for (var childAssociationKey in childAssociations) {
              var association = childAssociations[childAssociationKey];
              if (association.model === ownerModel.modelName) {
                childAssociation = association;
              }
            }
            var childAssociationName = childAssociation.include.as;

            //EXPL: remove the associated owner from the child
            var deleteOwner = childObject[childAssociationName].filter(function(owner) {
              return owner[ownerModel.modelName].toString() === ownerObject._id.toString();
            });
            deleteOwner = deleteOwner[0];

            index = childObject[childAssociationName].indexOf(deleteOwner);
            if (index > -1) {
              childObject[childAssociationName].splice(index, 1);
            }

            promise = Q.all([ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject), childModel.findByIdAndUpdate(childObject._id, childObject)]);
          }
          else if (associationType === "_MANY") {//EXPL: remove reference from owner model

            //EXPL: remove the associated child from the owner
            var deleteChild = ownerObject[associationName].filter(function(childId) {
              return childId.toString() === childObject._id.toString();
            });
            deleteChild = deleteChild[0];

            var index = ownerObject[associationName].indexOf(deleteChild);
            if (index > -1) {
              ownerObject[associationName].splice(index, 1);
            }

            promise = Q.all([ownerModel.findByIdAndUpdate(ownerObject._id, ownerObject)]);
          }
          else {
            deferred.reject(new Error("Association type incorrectly defined."));
            return deferred.promise;
          }

          promise
              .then(function() {
                //TODO: add eventLogs
                deferred.resolve();
              })
              .catch(function (error) {
                Log.error(error);
                deferred.reject(error);
              });
        }
        else {
          deferred.reject(new Error("Child object not found."));
        }
      })
      .catch(function (error) {
        Log.error(error);
        deferred.reject(error);
      });

  return deferred.promise;
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
      var keep = filterDeletedEmbeds(obj, result, parentkey, depth + 1, Log);
      // Log.log("KEEP:", keep);
      return keep;
    });
    // Log.log("UPDATED:", parentkey);
    // Log.note("AFTER:", result);
    parent[parentkey] = result;
  }
  else {
    for (var key in result) {
      // Log.debug("KEY:", key);
      // Log.debug("VALUE:", result[key]);
      if (_.isArray(result[key])) {
        // Log.log("JUMPING IN ARRAY");
        filterDeletedEmbeds(result[key], result, key, depth + 1, Log);
      }
      else if (_.isObject(result[key]) && result[key]._id) {
        // Log.log("JUMPING IN OBJECT");
        var keep = filterDeletedEmbeds(result[key], result, key, depth + 1, Log);
        if (!keep) {
          return false;
        }
      }
      else if (key === 'isDeleted' && result[key] === true && depth > 0) {
        // Log.log("DELETED", depth);
        return false;
      }
    }
    // Log.log("JUMPING OUT");
    return true;
  }
}
