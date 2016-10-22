var assert = require('assert');
var Boom = require('boom');
var Q = require('q');
var extend = require('util')._extend;

//TODO: consolidate eventLog functionality

//TODO: make returns more consistent/return all reply's

//TODO: make sure pre and post is supported for appropriate endpoints

//TODO: handle errors/status responses appropriately

//TODO: include option to set all default fields to NULL so they exist and are returned with queries

//TODO: possibly refactor/remove routeOptions

//TODO: apply .lean() before any exec() to speed up execution time when returning data

//TODO: possibly execute .toJSON() on all return data to reduce data size

//TODO: fix X-Total-Count headers
module.exports = function (mongoose, server) {
  var QueryHelper = require('./query-helper');

  return {
    /**
     * Handles incoming GET requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateListHandler: function (model, options, Log) {
      return function (request, reply) {
        try {
          Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          var modelMethods = model.schema.methods;

          var mongooseQuery = model.find();
          mongooseQuery = QueryHelper.createMongooseQuery(model, request.query, mongooseQuery, Log);
          return mongooseQuery.exec().then(function (result) {

            var promise = {};
            if (modelMethods.routeOptions && modelMethods.routeOptions.list && modelMethods.routeOptions.list.post) {
              promise = modelMethods.routeOptions.list.post(request, result, Log);
            }
            else {
              promise = Q.when(result);
            }

            return promise.then(function (result) {
              return reply(result.map(function (data) {
                var result = data.toJSON();
                if (modelMethods.routeOptions) {
                  var associations = modelMethods.routeOptions.associations;
                  for (var associationKey in associations) {
                    var association = associations[associationKey];
                    if (association.type === "ONE_MANY" && data[associationKey]) {//EXPL: we have to manually populate the return value for virtual (e.g. ONE_MANY) associations
                      result[associationKey] = data[associationKey];
                    }
                  }
                }

                if (result._id) {
                  result._id = result._id.toString();//EXPL: _id must be a string to pass validation
                }

                Log.log("Result: %s", JSON.stringify(result));
                return result;
              })).header('X-Total-Count', result.length).code(200);;
            })
            .catch(function (error) {
              Log.error("error: ", JSON.stringify(error));
              return reply(Boom.badRequest("There was a postprocessing error.", error));
            })
          })
          .catch(function (error) {
            Log.error("error: ", JSON.stringify(error));
            return reply(Boom.serverTimeout("There was an error accessing the database.", error));
          });
        }
        catch(error) {
          Log.error("error: ", JSON.stringify(error));
          return reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    /**
     * Handles incoming GET requests to /RESOURCE/{_id}
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateFindHandler: function (model, options, Log) {
      options = options || {};

      return function (request, reply) {
        try {
          Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          var modelMethods = model.schema.methods;

          var mongooseQuery = model.findOne({ '_id': request.params.id });
          mongooseQuery = QueryHelper.createMongooseQuery(model, request.query, mongooseQuery, Log);
          return mongooseQuery.exec().then(function (result) {
            if (result) {

              var promise = {};
              if (modelMethods.routeOptions && modelMethods.routeOptions.find && modelMethods.routeOptions.find.post) {
                promise = modelMethods.routeOptions.find.post(request, result, Log);
              } else {
                promise = Q.when(result);
              }

              return promise.then(function(result) {
                result = result.toJSON();
                if (modelMethods.routeOptions) {
                  var associations = modelMethods.routeOptions.associations;
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
                Log.error("error: ", JSON.stringify(error));
                return reply(Boom.badRequest("There was a postprocessing error.", error));
              });
            }
            else {
              return reply(Boom.notFound("There was no data found with that id.", request.params.id));
            }
          })
          .catch(function (error) {
            Log.error("error: ", JSON.stringify(error));
            return reply(Boom.serverTimeout("There was an error accessing the database.", error));
          });
        }
        catch(error) {
          Log.error("error: ", JSON.stringify(error));
          return reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    /**
     * Handles incoming POST requests to /RESOURCE
     * @param model: A mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateCreateHandler: function (model, options, Log) {
      options = options || {};

      return function (request, reply) {
        try {
          Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          var modelMethods = model.schema.methods;
          // var collectionName = modelMethods.collectionDisplayName || model.modelName;

          var promise =  {};
          if (modelMethods.routeOptions && modelMethods.routeOptions.create && modelMethods.routeOptions.create.pre){
            promise = modelMethods.routeOptions.create.pre(request, Log);
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

                if (modelMethods.routeOptions && modelMethods.routeOptions.create && modelMethods.routeOptions.create.post) {
                  promise = modelMethods.routeOptions.create.post(request, result, Log);
                }
                else {
                  promise = Q.fcall(function () { return result });
                }

                return promise.then(function (result) {
                  result._id = result._id.toString();//TODO: handle this with preware
                  return reply(result).code(201);
                }).
                catch(function (error) {
                  Log.error("error: ", JSON.stringify(error));
                  return reply(Boom.badRequest("There was a postprocessing error creating the resource", error));
                });
              })
            })
            .catch(function (error) {
              Log.error("error: ", JSON.stringify(error));
              return reply(Boom.serverTimeout("There was an error creating the resource", error));
            });
          })
          .catch(function (error) {
            Log.error("error: ", JSON.stringify(error));
            return reply(Boom.badRequest("There was a preprocessing error creating the resource", error));
          });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    generateDeleteHandler: function (model, options, Log) {
      options = options || {};
      var objectData;
      var t;
      return function (request, reply) {
        try {
          Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          var modelMethods = model.schema.methods;
          var collectionName = modelMethods.collectionDisplayName || model.modelName;

          return model.findOne({ '_id': request.params.id }).then(function (result) {
            if (result) {
              var idField = model.idField || "id";
              var nameField = model.nameField || "name";

              var promise =  {};
              if(modelMethods.routeOptions.delete && modelMethods.routeOptions.delete.pre){
                promise = modelMethods.routeOptions.delete.pre(request.params.id, Log);
              } else {
                promise = Q.when();
              }

              return promise.then(function() {
                //TODO: implement option for soft delete
                return model.findByIdAndRemove(request.params.id).then(function (deleted) {//TODO: clean up associations/set rules for ON DELETE CASCADE/etc.
                  if (deleted) {
                    objectData = deleted;
                    //TODO: add eventLogs
                    // return options.models.eventLog.create({
                    //   userId: request.auth.credentials.user.id,
                    //   organizationId: request.auth.credentials.user.organizationId,
                    //   verb: "deleted",
                    //   objectId: objectData[idField] || "unknown",
                    //   objectName: objectData[nameField] || "unknown",
                    //   objectType: model.modelName,
                    //   objectDisplayType: collectionName
                    // }, {transaction: t}).then(function (eventLog) {
                    //   Log.log("Event Log Created: %s", JSON.stringify(eventLog));
                    //   options.models.user.findById(eventLog.userId).then(function (user) {
                    //     eventLog.user = user;
                    //     require('../../api/utilities/refresh-activity-feeds')(request, server, null, options, Log)([eventLog]).then(function(result) {
                    //     }).catch(function(error) {
                    //       Log.error(error);
                    //     });
                    //     require('../../api/utilities/refresh-notifications')(request, server, null, options, Log)([eventLog]).then(function(result) {
                    //     }).catch(function(error) {
                    //       Log.error(error);
                    //     });
                    //   }).catch(function(error) {
                    //     Log.error(error);
                    //   });
                    //
                    //   logImplicitAssociations("unassociated", request, server, options, objectData, model, Log);
                    //
                    //   return true;
                    // });

                    var promise =  {};
                    if (modelMethods.routeOptions.delete && modelMethods.routeOptions.delete.post) {
                      promise = modelMethods.routeOptions.delete.post(request.params.id, Log, objectData);
                    } else {
                      promise = Q.fcall(function () { });
                    }
                    promise.then(function () {
                      reply().code(204);
                    }).catch(function (error) {
                      Log.error("error: ", JSON.stringify(error));
                      return reply(Boom.badRequest("There was a postprocessing error deleting the resource", error));
                    });
                  } else {
                    return reply(Boom.notFound("No resource was found with that id."));
                  }
                });
              }).catch(function (error) {
                Log.error("error: ", JSON.stringify(error));
                reply(Boom.badRequest("There was a preprocessing error deleting the resource", error));
              });
            } else {
              return reply(Boom.notFound("No resource was found with that id."));
            }

          });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    generateUpdateHandler: function (model, options, Log) {
      return function (request, reply) {
        try {
          Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          var collectionName = model.collectionDisplayName || model.modelName;

          //EXPL: retrieve the old values before updating
          //NOTE: this is unnecesary since the "findByIdAndUpdate" below returns the old values
          var properties = Object.keys(request.payload);
          var oldValues = [];
          model.findOne({ '_id': request.params.id }).then(function (data) {
            for (var i = 0; i < properties.length; i++) {
              var property = properties[i];
              oldValues[property] = data[property];
            }

            //TODO: support eventLogs and log all property updates in one document rather than one document per property update
            //NOTE: need to do another "find" after the update to grab the new values and log them
            model.findByIdAndUpdate(request.params.id, request.payload).then(function (object) {
              Log.debug("object:", object);
              if (object) {
                var associations = model.schema.methods.routeOptions.associations;
                //EXPL: if a reference id was updated/added, we need to update the association
                //TODO: log all updated/added associations
                for (var key in request.payload) {
                  var association = associations[key];
                }

                var idField = model.idField || "id";
                var nameField = model.nameField || "name";

                var objectDisplayProperty = [];
                var objectDisplayOldValue = [];
                var objectDisplayNewValue = [];
                var associationModel = [];
                var params = {};
                //EXPL: Loop through each property changed and create a log with old and new values
                // for (var i = 0; i < properties.length; i++) {
                //   var property = properties[i];
                //
                //   objectDisplayProperty[i] = model.collectionAttributes[property].displayName;
                //
                //   //EXPL: by default the display values and original values are the same
                //   objectDisplayOldValue[i] = oldValues[property];
                //   objectDisplayNewValue[i] = newValues[property];
                //
                //   //EXPL: make this a function so it can be invoked later once values have been set
                //   function createEventLog(params) {
                //     options.models.eventLog.create(params).then(function (eventLog) {
                //       options.models.user.findById(eventLog.userId).then(function (user) {
                //         eventLog.user = user;
                //         require('../../api/utilities/refresh-activity-feeds')(request, server, null, options, Log)([eventLog]).then(function(result) {
                //         }).catch(function(error) {
                //           Log.error(error);
                //         });
                //         require('../../api/utilities/refresh-notifications')(request, server, null, options, Log)([eventLog]).then(function(result) {
                //         }).catch(function(error) {
                //           Log.error(error);
                //         });
                //       }).catch(function(error) {
                //         Log.error(error);
                //       });
                //       Log.log("Event Log Created: %s", JSON.stringify(eventLog));
                //     });
                //   }
                //
                //   //EXPL: if the property is an id then grab the objects corresponding to the new and old id values
                //   var propertyAssociation = model.collectionAttributes[property].association;
                //
                //   if (propertyAssociation) {
                //     associationModel[i] = options.models[propertyAssociation];
                //     associationModel[i].findAndCountAll({where: {id: {$or: [objectDisplayOldValue[i], objectDisplayNewValue[i]]}}}).then(function (valueData) {
                //       valueData = valueData.rows;
                //
                //       if (valueData.length > 0) {
                //         //EXPL: find the index of the property that's data was returned
                //         for (var index = 0; index < properties.length; index++) {
                //           var oldValueObject = valueData.filter(function (valueObject) {
                //             return valueObject.id === oldValues[properties[index]];
                //           });
                //           var newValueObject = valueData.filter(function (valueObject) {
                //             return valueObject.id === newValues[properties[index]];
                //           });
                //           if (oldValueObject[0] || newValueObject[0]) {
                //             break;
                //           }
                //         }
                //
                //         var propertyNameField = associationModel[index].nameField || "name";
                //
                //         //EXPL: update the display values
                //         //Ex: role: old -> Admin, new -> Owner
                //         if (oldValueObject[0]) {
                //           objectDisplayOldValue[index] = oldValueObject[0][propertyNameField];
                //         } else {
                //           objectDisplayOldValue[index] = null;
                //         }
                //
                //         if (newValueObject[0]) {
                //           objectDisplayNewValue[index] = newValueObject[0][propertyNameField];
                //         } else {
                //           objectDisplayNewValue[index] = null;
                //         }
                //       } else {
                //         //EXPL: find the first property with null old and new values that hasn't been logged
                //         for (index = 0; index < properties.length; index++) {
                //           if (objectDisplayOldValue[index] == null && objectDisplayNewValue[index] == null && properties[index] != null) {
                //             break;
                //           }
                //         }
                //       }
                //
                //       var associationParams = {
                //         userId: request.auth.credentials.user.id,
                //         organizationId: request.auth.credentials.user.organizationId,
                //         verb: "updated",
                //         objectId: newValues[idField] || "unknown",
                //         objectName: newValues[nameField] || "unknown",
                //         objectType: model.modelName,
                //         objectDisplayType: collectionName,
                //         objectProperty: properties[index],
                //         objectDisplayProperty: objectDisplayProperty[index],
                //         objectOldValue: oldValues[properties[index]],
                //         objectDisplayOldValue: objectDisplayOldValue[index],
                //         objectNewValue: newValues[properties[index]],
                //         objectDisplayNewValue: objectDisplayNewValue[index]
                //       };
                //
                //       //EXPL: mark this property as logged by setting it to null
                //       properties[index] = null;
                //       createEventLog(associationParams);
                //
                //     });
                //   } else {
                //     params = {
                //       userId: request.auth.credentials.user.id,
                //       organizationId: request.auth.credentials.user.organizationId,
                //       verb: "updated",
                //       objectId: newValues[idField] || "unknown",
                //       objectName: newValues[nameField] || "unknown",
                //       objectType: model.modelName,
                //       objectDisplayType: collectionName,
                //       objectProperty: property,
                //       objectDisplayProperty: objectDisplayProperty[i],
                //       objectOldValue: oldValues[property],
                //       objectDisplayOldValue: objectDisplayOldValue[i],
                //       objectNewValue: newValues[property],
                //       objectDisplayNewValue: objectDisplayNewValue[i]
                //     };
                //
                //     properties[i] = null;
                //     createEventLog(params);
                //   }
                // }
                reply().code(204);

              } else {
                reply(Boom.notFound("No resource was found with that id."));
              }
            }).catch(function (error) {
              Log.error("error(%s)", JSON.stringify(error));
              reply(Boom.badRequest("An error occurred updating the resource.", error));
            });
          }).catch(function (error) {
            Log.error("error(%s)", JSON.stringify(error));
            reply(Boom.badRequest("An error occurred updating the resource.", error));
          });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    generateAssociationAddOneHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

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
              }).catch(function (error) {
                Log.error(error);
                reply(Boom.gatewayTimeout("There was a database error while setting the children."));
              });
            } else {
              reply(Boom.notFound("No owner was found with that ID: " + request.params.ownerId));
            }
          }).catch(function (error) {
            Log.error(error);
            reply(Boom.gatewayTimeout("There was a database error while retrieving the owner resource."));
          });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    generateAssociationRemoveOneHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

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
              }).catch(function (error) {
                Log.error(error);
                reply(Boom.gatewayTimeout("There was a database error while removing the association."));
              });
            } else {
              reply(Boom.notFound("No owner was found with that ID: " + request.params.ownerId));
            }
          }).catch(function (error) {
            Log.error(error);
            reply(Boom.gatewayTimeout("There was a database error while retrieving the owner resource."));
          });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    generateAssociationAddManyHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

      var associationName = association.include.as;
      var childModel = association.include.model;
      var setMethodName = "set" + associationName[0].toUpperCase() + associationName.slice(1);
      var addMethodName = "add" + associationName[0].toUpperCase() + associationName.slice(1, -1);

      assert(setMethodName);

      return function (request, reply) {
        try {
          Log.log(setMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          ownerModel.findById(request.params.ownerId).then(function (ownerObject) {
            if (ownerObject) {
              var childIds = [];
              if (typeof request.payload[0] === 'string' || request.payload[0] instanceof String) {//EXPL: the payload is an array of Ids
                childIds = request.payload;
              } else {//EXPL: the payload contains extra fields
                childIds = request.payload.map(function(object) {
                  return object.childId;
                });
              }

              var promise_chain = Q.fcall(function(){});

              childIds.forEach(function(childId) {
                var promise_link = function() {
                  var deferred = Q.defer();
                  setAssociation(request, server, ownerModel, ownerObject, childModel, childId, associationName, options, Log).then(function(result) {
                    deferred.resolve(result);
                  }).catch(function (error) {
                    Log.error(error);
                    return reply(Boom.gatewayTimeout("There was a database error while setting the children."));
                  });
                  return deferred.promise;
                };

                promise_chain = promise_chain.then(promise_link);
              });

              promise_chain.then(function(result) {
                return reply().code(204);
              }).catch(function (error) {
                Log.error(error);
                return reply(Boom.gatewayTimeout("There was a database error while setting the children."));
              });
            } else {
              return reply(Boom.notFound("No owner was found with that ID: " + request.params.ownerId));
            }
          }).catch(function (error) {
            Log.error(error);
            return reply(Boom.gatewayTimeout("There was a database error while retrieving the owner resource."));
          });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    },

    generateAssociationGetAllHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

      var associationName = association.include.as;
      var childModel = association.include.model;
      var getAllMethodName = association.getAllMethodName || "get" + associationName[0].toUpperCase() + associationName.slice(1);
      var countAllMethodName = association.countAllMethodName || "count" + associationName[0].toUpperCase() + associationName.slice(1);

      assert(getAllMethodName);
      assert(countAllMethodName);

      return function (request, reply) {
        try {
          Log.log(getAllMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

          var ownerMethods = ownerModel.schema.methods;
          var associationType = ownerMethods.routeOptions.associations[associationName].type;
          var foreignField = ownerMethods.routeOptions.associations[associationName].foreignField;
          // Log.debug("associationType:", associationType);
          // Log.debug("foreignField:", foreignField);
          var returnForeignField = false;

          var populateQuery = associationName; //TODO: formulate proper mongooseQuery to filter embedded/populated data

          request.query.$embed = populateQuery;
          request.query.populateSelect = request.query.$select;
          if (foreignField && request.query.$select) {//EXPL: ONE_MANY virtual relationships require the foreignField to be included in the result. We add logic to make it optional.
            if (request.query.$select.includes(foreignField)) {
              returnForeignField = true;
            } else {
              request.query.populateSelect = request.query.populateSelect + "," + foreignField;
            }
          } else {
            returnForeignField = true;
          }
          delete request.query.$select;
          // Log.debug("returnForeignField:", returnForeignField);

          // Log.debug("populateQuery:", populateQuery);
          //TODO: allow for customized return data, i.e. a flat array without extra association fields
          var mongooseQuery = ownerModel.findOne({ '_id': request.params.ownerId });
          mongooseQuery = QueryHelper.createMongooseQuery(ownerModel, request.query, mongooseQuery, Log);
          mongooseQuery.exec().then(function (result) {//TODO: allow for nested populates through "embed" param
            result = result[associationName];
            return reply(result.map(function(object) {
              object = object.toJSON();
              if (!returnForeignField && foreignField) {
                delete object[foreignField];
              }
              // Log.debug("object:", object);
              return object;
            })).header('X-Total-Count', result.length);
          });

          // ownerModel.findById(request.params.ownerId).then(function (ownerObject) {
          //   if (ownerObject) {
          //     var sequelizeQuery = QueryHelper.createSequelizeQuery(childModel, request.query, Log);
          //
          //     ownerObject[getAllMethodName](sequelizeQuery).then(function (results) {
          //
          //       delete sequelizeQuery.limit;
          //       delete sequelizeQuery.offset;
          //       delete sequelizeQuery.include;
          //
          //       ownerObject[countAllMethodName](sequelizeQuery).then(function (count) {
          //
          //         var processedResults = results.map(function (data) {
          //           var result = data.toJSON();
          //
          //           if (options.resultProcessor) {
          //             result = options.resultProcessor(result);
          //           }
          //
          //           return result;
          //         });
          //
          //         reply(processedResults).header('X-Total-Count', count);
          //       }).catch(function (error) {
          //         Log.error(error);
          //         reply(Boom.gatewayTimeout("There was a database error counting the children."));
          //       });
          //     }).catch(function (error) {
          //       Log.error(error);
          //       reply(Boom.gatewayTimeout("There was a database error while setting the children."));
          //     });
          //   } else {
          //     reply(Boom.notFound("No owner was found with that ID: " + request.params.ownerId));
          //   }
          // }).catch(function (error) {
          //   Log.error(error);
          //   reply(Boom.gatewayTimeout("There was a database error while retrieving the owner resource."));
          // });
        }
        catch(error) {
          Log.error(error);
          reply(Boom.badRequest("There was an error processing the request.", error));
        }
      }
    }
  };

  function setAssociation(request, server, ownerModel, ownerObject, childModel, childId, associationName, options, Log) {
    var deferred = Q.defer();

    var payload = request.payload;

    var ownerMethods = ownerModel.schema.methods;
    var ownerCollectionName = ownerMethods.collectionDisplayName || ownerModel.modelName;
    var childMethods = childModel.schema.methods;
    var childCollectionName = childMethods.collectionDisplayName || childModel.modelName;

    var ownerIdField = ownerMethods.idField || "_id";
    var ownerNameField = ownerMethods.nameField || "name";
    var childIdField = ownerMethods.idField || "_id";
    var childNameField = ownerMethods.nameField || "name";

    childModel.findOne({ '_id': childId }).then(function (childObject) {
      if (childObject) {
        var promise = {};
        var association = ownerMethods.routeOptions.associations[associationName];
        Log.debug("associationType", association.type);
        if (association.type === "ONE_MANY") {//EXPL: one-many associations are virtual, so only update the child reference
          //TODO: MAKE THIS RIGHT
          childObject[association.foreignField] = ownerObject._id;

          promise = childObject.save()
        } else if (association.type === "MANY_MANY") {
          if (typeof request.payload[0] === 'string' || request.payload[0] instanceof String) {//EXPL: the payload is an array of Ids. No extra fields
            payload = {};
          } else {
            payload = payload.filter(function(object) {//EXPL: the payload contains extra fields
              return object.childId === childObject.id;
            });

            payload = payload[0];
            delete payload.childId;
          }
          payload[childModel.modelName] = childObject._id;

          var duplicate = ownerObject[associationName].filter(function (associationObject) {
            return associationObject[childModel.modelName].toString() === childId;
          });
          duplicate = duplicate[0];

          var duplicateIndex = ownerObject[associationName].indexOf(duplicate);

          if (duplicateIndex < 0) {//EXPL: if the association doesn't already exist, create it, otherwise update the extra fields
            ownerObject[associationName].push(payload);
          } else {
            payload._id = ownerObject[associationName][duplicateIndex]._id;//EXPL: retain the association instance id for consistency
            ownerObject[associationName][duplicateIndex] = payload;
          }

          payload = extend({}, payload);//EXPL: break the reference to the original payload
          delete payload._id;

          delete payload[childModel.modelName];
          payload[ownerModel.modelName] = ownerObject._id;
          var childAssociation = {};
          var childAssociations = childMethods.routeOptions.associations;
          for (var childAssociationKey in childAssociations) {
            var association = childAssociations[childAssociationKey];
            if (association.model === ownerModel.modelName) {
              childAssociation = association;
            }
          }
          var childAssociationName = childAssociation.include.as;

          duplicate = childObject[childAssociationName].filter(function (associationObject) {
            return associationObject[ownerModel.modelName].toString() === ownerObject._id.toString();
          });
          duplicate = duplicate[0];

          duplicateIndex = childObject[childAssociationName].indexOf(duplicate);

          if (duplicateIndex < 0) {//EXPL: if the association doesn't already exist, create it, otherwise update the extra fields
            childObject[childAssociationName].push(payload);
          } else {
            payload._id = childObject[childAssociationName][duplicateIndex]._id;//EXPL: retain the association instance id for consistency
            childObject[childAssociationName][duplicateIndex] = payload;
          }

          promise = Q.all(ownerObject.save(), childObject.save());
        } else {
          deferred.reject("Association type incorrectly defined.");
          return deferred.promise;
        }

        promise.then(function(result) {
          // Log.debug(result);


          //TODO: add eventLogs

          //TODO: allow eventLogs to log/support association extra fields
          deferred.resolve();
        }).catch(function (error) {
          Log.error(error);
          deferred.reject(error);
        });
        // ownerObject[addMethodName](childObject, payload).then(function (result) {
        //   //TODO: eventLogs
        //   // options.models.eventLog.create({
        //   //   userId: request.auth.credentials.user.id,
        //   //   organizationId: request.auth.credentials.user.organizationId,
        //   //   verb: "associated",
        //   //   objectId: ownerObject[ownerIdField] || "unknown",
        //   //   objectName: ownerObject[ownerNameField] || "unknown",
        //   //   objectType: ownerModel.modelName,
        //   //   objectDisplayType: ownerCollectionName,
        //   //   associatedObjectId: childObject[childIdField] || "unknown",
        //   //   associatedObjectName: childObject[childNameField] || "unknown",
        //   //   associatedObjectType: childModel.modelName,
        //   //   associatedObjectDisplayType: childCollectionName
        //   // }).then(function (eventLog) {
        //   //   options.models.user.findById(eventLog.userId).then(function (user) {
        //   //     eventLog.user = user;
        //   //     require('../../api/utilities/refresh-activity-feeds')(request, server, null, options, Log)([eventLog]).then(function(result) {
        //   //     }).catch(function(error) {
        //   //       Log.error(error);
        //   //     });
        //   //     require('../../api/utilities/refresh-notifications')(request, server, null, options, Log)([eventLog]).then(function(result) {
        //   //     }).catch(function(error) {
        //   //       Log.error(error);
        //   //     });
        //   //   }).catch(function(error) {
        //   //     Log.error(error);
        //   //   });
        //   //   deferred.resolve();
        //   // }).catch(function (error) {
        //   //   Log.error(error);
        //   //   deferred.resolve();
        //   // });
        // }).catch(function (error) {
        //   Log.error(error);
        //   deferred.reject(error);
        // });
      } else {
        deferred.reject("Child object not found.");
      }
    }).catch(function (error) {
      Log.error(error);
      deferred.reject(error);
    });

    return deferred.promise;
  }

  function removeAssociation(request, server, ownerModel, ownerObject, childModel, childId, associationName, options, Log) {
    var deferred = Q.defer();

    var payload = request.payload;

    var ownerMethods = ownerModel.schema.methods;
    var ownerCollectionName = ownerMethods.collectionDisplayName || ownerModel.modelName;
    var childMethods = childModel.schema.methods;
    var childCollectionName = childMethods.collectionDisplayName || childModel.modelName;

    var ownerIdField = ownerMethods.idField || "_id";
    var ownerNameField = ownerMethods.nameField || "name";
    var childIdField = ownerMethods.idField || "_id";
    var childNameField = ownerMethods.nameField || "name";

    childModel.findOne({ '_id': childId }).then(function (childObject) {
      if (childObject) {
        var promise = {};
        var associationType = ownerMethods.routeOptions.associations[associationName].type;
        Log.debug("associationType", associationType);
        if (associationType === "ONE_MANY") {//EXPL: one-many associations are virtual, so only update the child reference
          // childObject[ownerModel.modelName + "Id"] = null; //TODO: set reference to null instead of deleting it?
          // delete childObject[ownerModel.modelName + "Id"];
          var childAssociation = {};
          var childAssociations = childMethods.routeOptions.associations;
          for (var childAssociationKey in childAssociations) {
            var association = childAssociations[childAssociationKey];
            if (association.model === ownerModel.modelName) {
              childAssociation = association;
            }
          }
          var childAssociationName = childAssociation.include.as;
          delete childObject[childAssociationName];
          
          promise = childObject.save()
        } else if (associationType === "MANY_MANY") {//EXPL: remove references from both models

          //EXPL: remove the associated child from the owner
          var deleteChild = ownerObject[associationName].filter(function(child) {
            // Log.debug("child[childModel.modelName]:", child[childModel.modelName]);
            // Log.debug("childObject._id:", childObject._id);
            return child[childModel.modelName].toString() === childObject._id.toString();
          });
          deleteChild = deleteChild[0];

          // Log.debug("deleteChild:", deleteChild);
          // Log.debug("ownerList before:", ownerObject[associationName]);
          var index = ownerObject[associationName].indexOf(deleteChild);
          // Log.debug("index:", index);
          if (index > -1) {
            ownerObject[associationName].splice(index, 1);
          }
          // Log.debug("ownerList after:", ownerObject[associationName]);

          //EXPL: get the child association name
          var childAssociation = {};
          var childAssociations = childMethods.routeOptions.associations;
          for (var childAssociationKey in childAssociations) {
            var association = childAssociations[childAssociationKey];
            if (association.model === ownerModel.modelName) {
              childAssociation = association;
            }
          }
          var childAssociationName = childAssociation.include.as;

          //EXPL: remove the associated owner from the child
          var deleteOwner = childObject[childAssociationName].filter(function(owner) {
            // Log.debug("owner[ownerModel.modelName]:", owner[ownerModel.modelName]);
            // Log.debug("ownerObject._id:", ownerObject._id);
            return owner[ownerModel.modelName].toString() === ownerObject._id.toString();
          });
          deleteOwner = deleteOwner[0];

          // Log.debug("deleteOwner:", deleteOwner);
          // Log.debug("childList before:", childObject[childAssociationName]);
          index = childObject[childAssociationName].indexOf(deleteOwner);
          // Log.debug("index:", index);
          if (index > -1) {
            childObject[childAssociationName].splice(index, 1);
          }
          // Log.debug("childList after:", childObject[childAssociationName]);

          promise = Q.all(ownerObject.save(), childObject.save());
        } else {
          deferred.reject("Association type incorrectly defined.");
          return deferred.promise;
        }

        promise.then(function(result) {
          //TODO: add eventLogs
          deferred.resolve();
        }).catch(function (error) {
          Log.error(error);
          deferred.reject(error);
        });
        // ownerObject[addMethodName](childObject, payload).then(function (result) {
        //   //TODO: eventLogs
        //   // options.models.eventLog.create({
        //   //   userId: request.auth.credentials.user.id,
        //   //   organizationId: request.auth.credentials.user.organizationId,
        //   //   verb: "associated",
        //   //   objectId: ownerObject[ownerIdField] || "unknown",
        //   //   objectName: ownerObject[ownerNameField] || "unknown",
        //   //   objectType: ownerModel.modelName,
        //   //   objectDisplayType: ownerCollectionName,
        //   //   associatedObjectId: childObject[childIdField] || "unknown",
        //   //   associatedObjectName: childObject[childNameField] || "unknown",
        //   //   associatedObjectType: childModel.modelName,
        //   //   associatedObjectDisplayType: childCollectionName
        //   // }).then(function (eventLog) {
        //   //   options.models.user.findById(eventLog.userId).then(function (user) {
        //   //     eventLog.user = user;
        //   //     require('../../api/utilities/refresh-activity-feeds')(request, server, null, options, Log)([eventLog]).then(function(result) {
        //   //     }).catch(function(error) {
        //   //       Log.error(error);
        //   //     });
        //   //     require('../../api/utilities/refresh-notifications')(request, server, null, options, Log)([eventLog]).then(function(result) {
        //   //     }).catch(function(error) {
        //   //       Log.error(error);
        //   //     });
        //   //   }).catch(function(error) {
        //   //     Log.error(error);
        //   //   });
        //   //   deferred.resolve();
        //   // }).catch(function (error) {
        //   //   Log.error(error);
        //   //   deferred.resolve();
        //   // });
        // }).catch(function (error) {
        //   Log.error(error);
        //   deferred.reject(error);
        // });
      } else {
        deferred.reject("Child object not found.");
      }
    }).catch(function (error) {
      Log.error(error);
      deferred.reject(error);
    });

    return deferred.promise;
  }

  //EXPL: log instances when an object is added created or deleted and contains associations
  function logImplicitAssociations(associationType, request, server, options, childObject, childModel, Log) {
    var deferred = Q.defer();
    var attributes = childModel.attributes;
    var associations = childModel.routeOptions.associations;
    if (associations) {
      for (var associationKey in associations) {
        for (var attributeKey in attributes) {
          var attribute = attributes[attributeKey];
          if (attribute.association == associationKey) {//EXPL: find the attribute linking the association
            if (childObject[attributeKey]) {//EXPL: if an id is present during creation/deletion, log the association

              var ownerModel = options.models[associationKey];

              ownerModel.findById(childObject[attributeKey]).then(function(ownerObject) {
                var localOwnerModel = options.models[ownerObject["$modelOptions"].name.singular];
                createLog(request, server, options, Log, associationType, localOwnerModel, ownerObject, childModel, childObject).then(function(result) {
                  deferred.resolve();
                }).catch(function (error) {
                  Log.error(error);
                  deferred.resolve();
                });
              }).catch(function (error) {
                Log.error(error);
                deferred.resolve();
              });
            }
          }
        }
      }
    }

    return deferred.promise;
  }

  function createLog(request, server, options, Log, verb, ownerModel, ownerObject, childModel, childObject) {
    var deferred = Q.defer();

    var ownerCollectionName = ownerModel.collectionDisplayName || ownerModel.modelName;
    var ownerIdField = ownerModel.idField || "id";
    var ownerNameField = ownerModel.nameField || "name";

    var childCollectionName = childModel.collectionDisplayName || childModel.modelName;
    var childIdField = childModel.idField || "id";
    var childNameField = childModel.nameField || "name";

    options.models.eventLog.create({
      userId: request.auth.credentials.user.id,
      organizationId: request.auth.credentials.user.organizationId,
      verb: verb,
      objectId: ownerObject[ownerIdField] || "unknown",
      objectName: ownerObject[ownerNameField] || "unknown",
      objectType: ownerModel.modelName,
      objectDisplayType: ownerCollectionName,
      associatedObjectId: childObject[childIdField] || "unknown",
      associatedObjectName: childObject[childNameField] || "unknown",
      associatedObjectType: childModel.modelName,
      associatedObjectDisplayType: childCollectionName
    }).then(function (eventLog) {
      options.models.user.findById(eventLog.userId).then(function (user) {
        eventLog.user = user;
        require('../../api/utilities/refresh-activity-feeds')(request, server, null, options, Log)([eventLog]).then(function(result) {
        }).catch(function(error) {
          Log.error(error);
        });
        require('../../api/utilities/refresh-notifications')(request, server, null, options, Log)([eventLog]).then(function(result) {
        }).catch(function(error) {
          Log.error(error);
        });
      }).catch(function(error) {
        Log.error(error);
      });
      deferred.resolve();
    }).catch(function (error) {
      Log.error(error);
      deferred.resolve();
    });

    return deferred.promise;
  }

};
