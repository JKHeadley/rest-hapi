var assert = require('assert');
var Boom = require('boom');
var Q = require('q');
var extend = require('util')._extend;
var QueryHelper = require('./query-helper');

//TODO: consolidate eventLog functionality

//TODO-DONE: make returns more consistent/return all reply's

//TODO: make sure pre and post is supported for appropriate endpoints

//TODO: handle errors/status responses appropriately

//TODO: include option to set all default fields to NULL so they exist and are returned with queries

//TODO: possibly refactor/remove routeOptions

//TODO: apply .lean() before any exec() to speed up execution time when returning data

//TODO: possibly execute .toJSON() on all return data to reduce data size

//TODO: fix X-Total-Count headers

//TODO: update hapi version

//TODO: look into using glue

var mongoose, server;
module.exports = function (_mongoose, _server) {

  mongoose = _mongoose;
  server = _server;

  return {

    /**
     * Handles incoming GET requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateListHandler: generateListHandler,

    /**
     * Handles incoming GET requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateFindHandler: generateFindHandler,

    /**
     * Handles incoming POST requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateCreateHandler: generateCreateHandler,

    /**
     * Handles incoming DELETE requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateDeleteHandler: generateDeleteHandler,

    /**
     * Handles incoming UPDATE requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateUpdateHandler: generateUpdateHandler,

    /**
     * Handles incoming PUT requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationAddOneHandler: generateAssociationAddOneHandler,

    /**
     * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationRemoveOneHandler: generateAssociationRemoveOneHandler,

    /**
     * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationAddManyHandler: generateAssociationAddManyHandler,

    /**
     * Handles incoming GET requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationGetAllHandler: generateAssociationGetAllHandler
  };

};

/**
 * Handles incoming GET requests to /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateListHandler(model, options, Log) {
  options = options || {};

  return function (request, reply) {
    try {
      Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));



      var mongooseQuery = model.find();
      mongooseQuery = QueryHelper.createMongooseQuery(model, request.query, mongooseQuery, Log);
      return mongooseQuery.exec().then(function (result) {

        var promise = {};
        if (model.routeOptions && model.routeOptions.list && model.routeOptions.list.post) {
          promise = model.routeOptions.list.post(request, result, Log);
        }
        else {
          promise = Q.when(result);
        }

        return promise.then(function (result) {
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

          if (!request.noReply) {//EXPL: return the result without calling reply
            return reply(result).header('X-Total-Count', result.length).code(200);
          }
          else {
            return result;
          }
        })
        .catch(function (error) {
          Log.error("error: ", error);
          return reply(Boom.badRequest("There was a postprocessing error.", error));
        })
      })
      .catch(function (error) {
        Log.error("error: ", error);
        return reply(Boom.serverTimeout("There was an error accessing the database.", error));
      });
    }
    catch(error) {
      Log.error("error: ", error);
      return reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming GET requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateFindHandler(model, options, Log) {
  options = options || {};

  return function (request, reply) {
    try {
      Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));



      var mongooseQuery = model.findOne({ '_id': request.params._id });
      mongooseQuery = QueryHelper.createMongooseQuery(model, request.query, mongooseQuery, Log);
      return mongooseQuery.exec().then(function (result) {
        if (result) {

          var promise = {};
          if (model.routeOptions && model.routeOptions.find && model.routeOptions.find.post) {
            promise = model.routeOptions.find.post(request, result, Log);
          } else {
            promise = Q.when(result);
          }

          return promise.then(function(data) {
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

            return reply(result).code(200);
          })
          .catch(function (error) {
            Log.error("error: ", error);
            return reply(Boom.badRequest("There was a postprocessing error.", error));
          });
        }
        else {
          return reply(Boom.notFound("There was no data found with that id.", request.params._id));
        }
      })
      .catch(function (error) {
        Log.error("error: ", error);
        return reply(Boom.serverTimeout("There was an error accessing the database.", error));
      });
    }
    catch(error) {
      Log.error("error: ", error);
      return reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming POST requests to /RESOURCE
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateCreateHandler(model, options, Log) {
  options = options || {};

  return function (request, reply) {
    try {
      Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));



      var promise =  {};
      if (model.routeOptions && model.routeOptions.create && model.routeOptions.create.pre){
        promise = model.routeOptions.create.pre(request, Log);
      }
      else {
        promise = Q.when(request);
      }

      return promise.then(function (request) {

        return model.create(request.payload).then(function (data) {

          //EXPL: rather than returning the raw "create" data, we filter the data through a separate query
          var attributes = QueryHelper.createAttributesFilter(request.query, model, Log);

          return model.findOne({ '_id': data._id }, attributes).then(function(result) {
            result = result.toJSON();

            //TODO: include eventLogs

            if (model.routeOptions && model.routeOptions.create && model.routeOptions.create.post) {
              promise = model.routeOptions.create.post(request, result, Log);
            }
            else {
              promise = Q.when(result);
            }

            return promise.then(function (result) {
              result._id = result._id.toString();//TODO: handle this with preware
              return reply(result).code(201);
            })
            .catch(function (error) {
              Log.error("error: ", error);
              return reply(Boom.badRequest("There was a postprocessing error creating the resource", error));
            });
          })
        })
        .catch(function (error) {
          Log.error("error: ", error);
          return reply(Boom.serverTimeout("There was an error creating the resource", error));
        });
      })
      .catch(function (error) {
        Log.error("error: ", error);
        return reply(Boom.badRequest("There was a preprocessing error creating the resource", error));
      });
    }
    catch(error) {
      Log.error(error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming DELETE requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateDeleteHandler(model, options, Log) {
  options = options || {};

  return function (request, reply) {
    try {
      Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));



      var promise = {};
      if (model.routeOptions && model.routeOptions.delete && model.routeOptions.delete.pre) {
        promise = model.routeOptions.delete.pre(request, Log);
      }
      else {
        promise = Q.when();
      }

      return promise.then(function () {
        //TODO: implement option for soft delete
        return model.findByIdAndRemove(request.params._id).then(function (deleted) {//TODO: clean up associations/set rules for ON DELETE CASCADE/etc.
          if (deleted) {
            //TODO: add eventLogs

            var promise = {};
            if (model.routeOptions && model.routeOptions.delete && model.routeOptions.delete.post) {
              promise = model.routeOptions.delete.post(request, deleted, Log);
            }
            else {
              promise = Q.when();
            }

            return promise.then(function () {
              return reply().code(204);
            })
            .catch(function (error) {
              Log.error("error: ", error);
              return reply(Boom.badRequest("There was a postprocessing error deleting the resource", error));
            });
          }
          else {
            return reply(Boom.notFound("No resource was found with that id."));
          }
        });
      })
      .catch(function (error) {
        Log.error("error: ", error);
        return reply(Boom.badRequest("There was a preprocessing error deleting the resource", error));
      });
    }
    catch(error) {
      Log.error("error: ", error);
      return reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming UPDATE requests to /RESOURCE/{_id}
 * @param model: A mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateUpdateHandler(model, options, Log) {
  options = options || {};

  return function (request, reply) {
    try {
      Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));



      var promise =  {};
      if (model.routeOptions && model.routeOptions.update && model.routeOptions.update.pre){
        promise = model.routeOptions.update.pre(request, Log);
      }
      else {
        promise = Q.when(request);
      }

      return promise.then(function (request) {

        //TODO: support eventLogs and log all property updates in one document rather than one document per property update
        model.findByIdAndUpdate(request.params._id, request.payload).then(function (result) {
          if (result) {
            //TODO: log all updated/added associations
            var attributes = QueryHelper.createAttributesFilter(request.query, model, Log);

            return model.findOne({'_id': result._id}, attributes).then(function (result) {
              result = result.toJSON();

              if (model.routeOptions && model.routeOptions.update && model.routeOptions.update.post) {
                promise = model.routeOptions.update.post(request, result, Log);
              }
              else {
                promise = Q.when(result);
              }

              return promise.then(function (result) {
                result._id = result._id.toString();//TODO: handle this with preware
                return reply(result).code(200);
              })
              .catch(function (error) {
                Log.error("error: ", error);
                return reply(Boom.badRequest("There was a postprocessing error updating the resource", error));
              });
            })
          }
          else {
            return reply(Boom.notFound("No resource was found with that id."));
          }
        })
        .catch(function (error) {
          Log.error("error: ", error);
          return reply(Boom.serverTimeout("There was an error updating the resource", error));
        });
      })
      .catch(function (error) {
        Log.error("error: ", error);
        return reply(Boom.badRequest("There was a preprocessing error updating the resource", error));
      });
    }
    catch(error) {
      Log.error("error: ", error);
      return reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming PUT requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddOneHandler(ownerModel, association, options, Log) {
  var associationName = association.include.as;
  var childModel = association.include.model;
  var addMethodName = association.addMethodName || "add" + associationName[0].toUpperCase() + associationName.slice(1, -1);

  return function (request, reply) {
    try {
      Log.log(addMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      ownerModel.findOne({ '_id': request.params.ownerId }).then(function (ownerObject) {
        if (ownerObject) {
          if (!request.payload) {
            request.payload = {};
          }
          request.payload.childId = request.params.childId;
          request.payload = [request.payload];
          setAssociation(request, server, ownerModel, ownerObject, childModel, request.params.childId, associationName, options, Log).then(function(result) {
            reply().code(204);
          })
          .catch(function (error) {
            Log.error("error: ", error);
            reply(Boom.gatewayTimeout("There was a database error while setting the association.", error));
          });
        }
        else {
          reply(Boom.notFound("No owner resource was found with that id: " + request.params.ownerId));
        }
      })
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE/{childId}
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationRemoveOneHandler(ownerModel, association, options, Log) {
  var associationName = association.include.as;
  var childModel = association.include.model;
  var removeMethodName = association.removeMethodName || "remove" + associationName[0].toUpperCase() + associationName.slice(1, -1);

  return function (request, reply) {
    try {
      Log.log(removeMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      ownerModel.findOne({ '_id': request.params.ownerId }).then(function (ownerObject) {
        if (ownerObject) {
          removeAssociation(request, server, ownerModel, ownerObject, childModel, request.params.childId, associationName, options, Log).then(function(result) {
            reply().code(204);
          })
          .catch(function (error) {
            Log.error("error: ", error);
            reply(Boom.gatewayTimeout("There was a database error while removing the association.", error));
          });
        }
        else {
          reply(Boom.notFound("No owner resource was found with that id: " + request.params.ownerId));
        }
      })
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddManyHandler(ownerModel, association, options, Log) {
  var associationName = association.include.as;
  var childModel = association.include.model;
  var setMethodName = "set" + associationName[0].toUpperCase() + associationName.slice(1);

  return function (request, reply) {
    try {
      Log.log(setMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      ownerModel.findOne({ '_id': request.params.ownerId }).then(function (ownerObject) {
        if (ownerObject) {
          var childIds = [];
          if (typeof request.payload[0] === 'string' || request.payload[0] instanceof String) {//EXPL: the payload is an array of Ids
            childIds = request.payload;
          }
          else {//EXPL: the payload contains extra fields
            childIds = request.payload.map(function(object) {
              return object.childId;
            });
          }

          var promise_chain = Q.when();

          childIds.forEach(function(childId) {
            var promise_link = function() {
              var deferred = Q.defer();
              setAssociation(request, server, ownerModel, ownerObject, childModel, childId, associationName, options, Log).then(function(result) {
                deferred.resolve(result);
              })
              .catch(function (error) {
                Log.error("error: ", error);
                return reply(Boom.gatewayTimeout("There was a database error while setting the associations.", error));
              });
              return deferred.promise;
            };

            promise_chain = promise_chain.then(promise_link);
          });

          promise_chain.then(function() {
            return reply().code(204);
          })
          .catch(function (error) {
            Log.error("error: ", error);
            return reply(Boom.gatewayTimeout("There was a database error while setting the associations.", error));
          });
        }
        else {
          return reply(Boom.notFound("No owner resource was found with that id: " + request.params.ownerId));
        }
      })
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming GET requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationGetAllHandler(ownerModel, association, options, Log) {
  var associationName = association.include.as;
  var childModel = association.include.model;
  var getAllMethodName = association.getAllMethodName || "get" + associationName[0].toUpperCase() + associationName.slice(1);

  return function (request, reply) {
    try {
      Log.log(getAllMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      var foreignField = ownerModel.routeOptions.associations[associationName].foreignField;

      var ownerRequest = { query: {} };
      ownerRequest.query.$embed = associationName;
      ownerRequest.query.populateSelect = "_id";
      if (foreignField) {
        ownerRequest.query.populateSelect = ownerRequest.query.populateSelect + "," + foreignField;
      }

      //EXPL: In order to allow for fully querying against the association data, we first embed the
      //associations to get a list of _ids and extra fields. We then leverage generateListHandler
      //to perform the full query.  Finally the extra fields (if they exist) are added to the final result
      var mongooseQuery = ownerModel.findOne({ '_id': request.params.ownerId });
      mongooseQuery = QueryHelper.createMongooseQuery(ownerModel, ownerRequest.query, mongooseQuery, Log);
      mongooseQuery.exec().then(function (result) {
        result = result[associationName];
        var childIds = [];
        if (association.type === "MANY_MANY") {
          childIds = result.map(function(object) {
            return object[association.model]._id;
          });
          request.noReply = true;
        }
        else {
          childIds = result.map(function(object) {
            return object._id;
          });
        }

        request.query.$where = extend({'_id': { $in: childIds }}, request.query.$where);

        var promise = generateListHandler(childModel, options, Log)(request, reply);

        if (request.noReply && association.linkingModel) {//EXPL: we have to manually insert the extra fields into the result
          var extraFieldData = result;
          return promise.then(function(result) {
            result.forEach(function(object) {
              var data = extraFieldData.find(function(data) {
                return data[association.model]._id.toString() === object._id
              });
              var fields = data.toJSON();
              delete fields._id;
              delete fields[association.model];
              object[association.linkingModel] = fields;
            });

            return reply(result).header('X-Total-Count', result.length).code(200);
          })
        }
        else if (request.noReply) {
          return promise.then(function(result) {
            return reply(result).header('X-Total-Count', result.length).code(200);
          });
        }
      });
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Create an association instance between two resources
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
 */
function setAssociation(request, server, ownerModel, ownerObject, childModel, childId, associationName, options, Log) {
  var deferred = Q.defer();

  var payload = request.payload;

  childModel.findOne({ '_id': childId }).then(function (childObject) {
    if (childObject) {
      var promise = {};
      var association = ownerModel.routeOptions.associations[associationName];
      var extraFields = false;
      if (association.type === "ONE_MANY") {//EXPL: one-many associations are virtual, so only update the child reference
        childObject[association.foreignField] = ownerObject._id;
        promise = childObject.save();
      }
      else if (association.type === "MANY_MANY") {
        if (typeof request.payload[0] === 'string' || request.payload[0] instanceof String) {//EXPL: the payload is an array of Ids. No extra fields
          payload = {};

          extraFields = false;
        }
        else {
          payload = payload.filter(function(object) {//EXPL: the payload contains extra fields
            return object.childId === childObject._id.toString();
          });

          payload = payload[0];
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
        var childAssociationName = childAssociation.include.as;

        if (!childObject[childAssociationName]) {
          throw childAssociationName + " association does not exist.";
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

        promise = Q.all(ownerObject.save(), childObject.save());
      }
      else {
        deferred.reject("Association type incorrectly defined.");
        return deferred.promise;
      }

      promise.then(function() {
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
      deferred.reject("Child object not found.");
    }
  })
  .catch(function (error) {
    Log.error("error: ", error);
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
 */
function removeAssociation(request, server, ownerModel, ownerObject, childModel, childId, associationName, options, Log) {
  var deferred = Q.defer();




  childModel.findOne({ '_id': childId }).then(function (childObject) {
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

        promise = Q.all(ownerObject.save(), childObject.save());
      }
      else {
        deferred.reject("Association type incorrectly defined.");
        return deferred.promise;
      }

      promise.then(function(result) {
        //TODO: add eventLogs
        deferred.resolve();
      })
      .catch(function (error) {
        Log.error(error);
        deferred.reject(error);
      });
    }
    else {
      deferred.reject("Child object not found.");
    }
  })
  .catch(function (error) {
    Log.error(error);
    deferred.reject(error);
  });

  return deferred.promise;
}
