var assert = require('assert');
var Boom = require('boom');
var Q = require('q');

//TODO: consolidate eventLog functionality

module.exports = function (mongoose, server) {
  var QueryHelper = require('./query-helper');

  return {
    generateListHandler: function (model, options, Log) {
      return function (request, reply) {
        Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        var modelMethods = model.schema.methods;
        
        var mongooseQuery = model.find();
        mongooseQuery = QueryHelper.createMongooseQuery(model, request.query, mongooseQuery, Log);
        mongooseQuery.exec().then(function (result) {

          var promise = {};
          if (modelMethods.routeOptions.list && modelMethods.routeOptions.list.post) {
            promise = modelMethods.routeOptions.list.post(request, result, Log);
          } else {
            promise = Q.fcall(function () { return result });
          }

          promise.then(function (result) {
            reply(result.rows.map(function (data) {
              var result = data.toJSON();

              Log.log("Result: %s", JSON.stringify(result));
              return result;
            })).header('X-Total-Count', result.count);
          }).catch(function (error) {
            Log.error("error: ", JSON.stringify(error));
            reply(Boom.badRequest("There was a postprocessing error.", error));
          })
        }).catch(function (error) {
          Log.error(error);
          reply(Boom.serverTimeout("There was an error accessing the database."));
        });
      }
    },
    generateFindHandler: function (model, options, Log) {
      options = options || {};

      return function (request, reply) {
        Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        var modelMethods = model.schema.methods;
        
        var mongooseQuery = model.findOne({ '_id': request.params.id });
        mongooseQuery = QueryHelper.createMongooseQuery(model, request.query, mongooseQuery, Log);
        mongooseQuery.exec().then(function (data) {
          
          if (data) {
            var result = data.toJSON();

            var promise = {};
            if (modelMethods.routeOptions.find && modelMethods.routeOptions.find.post) {
              promise = modelMethods.routeOptions.list.post(request, result, Log);
            } else {
              promise = Q.fcall(function () { return result });
            }

            return promise.then(function(result) {
              result._id = result._id.toString();//TODO: handle this with preware
              return reply(result).code(200);
            }).catch(function (error) {
              Log.error("error: ", JSON.stringify(error));
              return reply(Boom.badRequest("There was a postprocessing error creating the resource", error));
            });
          } else {
            return reply(Boom.notFound("There was no data found with that id.", request.params.id));
          }
        }).catch(function (error) {
          Log.error("error(%s)", JSON.stringify(error));
          return reply(Boom.serverTimeout("There was an error accessing the database."));
        });
      }
    },
    generateCreateHandler: function (model, options, Log) {
      options = options || {};

      return function (request, reply) {
        Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        var modelMethods = model.schema.methods;
        var collectionName = modelMethods.collectionDisplayName || model.modelName;

        var promise =  {};
        if(modelMethods.routeOptions.create && modelMethods.routeOptions.create.pre){
          promise = modelMethods.routeOptions.create.pre(request, Log);
        } else {
          promise = Q.fcall(function () { return request });
        }

        return promise.then(function (request) {
          return model.create(request.payload).then(function (data) {

            var attributes = QueryHelper.createAttributesFilter(request.query, model, Log);

            return model.findOne({ '_id': data._id }, attributes).then(function(filteredData) {
              var returnResult = filteredData.toJSON();

              //TODO: include eventLogs

              if (modelMethods.routeOptions.create && modelMethods.routeOptions.create.post) {
                promise = modelMethods.routeOptions.create.post(request, returnResult, Log);
              } else {
                promise = Q.fcall(function () { return returnResult });
              }
              promise.then(function (result) {
                result._id = result._id.toString();//TODO: handle this with preware
                return reply(result).code(201);
              }).catch(function (error) {
                Log.error("error: ", JSON.stringify(error));
                return reply(Boom.badRequest("There was a postprocessing error creating the resource", error));
              });
            })
          }).catch(function (error) {
            Log.error("error: ", JSON.stringify(error));
            return reply(Boom.badRequest("There was an error creating the resource", error));
          });
        }).catch(function (error) {
          Log.error("error: ", JSON.stringify(error));
          return reply(Boom.badRequest("There was a preprocessing error creating the resource", error));
        });
      }
    },
    generateDeleteHandler: function (model, options, Log) {
      options = options || {};
      var objectData;
      var t;
      return function (request, reply) {
        Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        var collectionName = model.collectionDisplayName || model.modelName;

        Sequelize.transaction(function (tr) {
          t = tr;
          return model.findOne({where: {id: request.params.id}}).then(function (result) {
            objectData = result;
            var idField = model.idField || "id";
            var nameField = model.nameField || "name";

            var promise =  {};
            if(model.routeOptions.delete && model.routeOptions.delete.pre){
              promise = model.routeOptions.delete.pre(request.params.id, t, Log);
            } else {
              promise = Q.fcall(function () { });
            }

            return promise.then(function() {
              return model.destroy({where: {id: request.params.id}}, {transaction: t}).then(function (affectedRows) {
                if (affectedRows > 0) {
                  return options.models.eventLog.create({
                    userId: request.auth.credentials.user.id,
                    organizationId: request.auth.credentials.user.organizationId,
                    verb: "deleted",
                    objectId: objectData[idField] || "unknown",
                    objectName: objectData[nameField] || "unknown",
                    objectType: model.modelName,
                    objectDisplayType: collectionName
                  }, {transaction: t}).then(function (eventLog) {
                    Log.log("Event Log Created: %s", JSON.stringify(eventLog));
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

                    logImplicitAssociations("unassociated", request, server, options, objectData, model, Log);

                    return true;
                  });
                } else {
                  return false;
                }
              });
            }).catch(function (error) {
              Log.error("error: ", JSON.stringify(error));
              reply(Boom.badRequest("There was a preprocessing error deleting the resource", error));
            });
          });
        }).then(function (deleted) {
          if (deleted) {
            var promise =  {};
            if (model.routeOptions.delete && model.routeOptions.delete.post) {
              promise = model.routeOptions.delete.post(request.params.id, t, Log, objectData.dataValues);
            } else {
              promise = Q.fcall(function () { });
            }
            promise.then(function () {
              reply().code(204);
            }).catch(function (error) {
              Log.error("error: ", JSON.stringify(error));
              reply(Boom.badRequest("There was a postprocessing error deleting the resource", error));
            });
          } else {
            reply(Boom.notFound("No resource was found with that id."));
          }
        }).catch(function (error) {
          Log.error("error(%s)", JSON.stringify(error));
          reply(Boom.badRequest("An error occurred creating the resource.", error));
        });
      }
    },
    generateUpdateHandler: function (model, options, Log) {
      return function (request, reply) {
        Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        //TODO: wrap all this in a transaction

        var collectionName = model.collectionDisplayName || model.modelName;


        //EXPL: retrieve the old values before updating
        var properties = Object.keys(request.payload);
        var oldValues = [];
        model.findOne({where: {id: request.params.id}}).then(function (data) {
          for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            oldValues[property] = data[property];
          }

          model.update(request.payload, {where: {id: request.params.id}}).then(function (affectedRows) {
            if (affectedRows.length > 0) {

              model.findOne({where: {id: request.params.id}}).then(function (newValues) {
                var idField = model.idField || "id";
                var nameField = model.nameField || "name";

                var objectDisplayProperty = [];
                var objectDisplayOldValue = [];
                var objectDisplayNewValue = [];
                var associationModel = [];
                var params = {};
                //EXPL: Loop through each property changed and create a log with old and new values
                for (var i = 0; i < properties.length; i++) {
                  var property = properties[i];

                  objectDisplayProperty[i] = model.collectionAttributes[property].displayName;

                  //EXPL: by default the display values and original values are the same
                  objectDisplayOldValue[i] = oldValues[property];
                  objectDisplayNewValue[i] = newValues[property];

                  //EXPL: make this a function so it can be invoked later once values have been set
                  function createEventLog(params) {
                    options.models.eventLog.create(params).then(function (eventLog) {
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
                      Log.log("Event Log Created: %s", JSON.stringify(eventLog));
                    });
                  }

                  //EXPL: if the property is an id then grab the objects corresponding to the new and old id values
                  var propertyAssociation = model.collectionAttributes[property].association;

                  if (propertyAssociation) {
                    associationModel[i] = options.models[propertyAssociation];
                    associationModel[i].findAndCountAll({where: {id: {$or: [objectDisplayOldValue[i], objectDisplayNewValue[i]]}}}).then(function (valueData) {
                      valueData = valueData.rows;

                      if (valueData.length > 0) {
                        //EXPL: find the index of the property that's data was returned
                        for (var index = 0; index < properties.length; index++) {
                          var oldValueObject = valueData.filter(function (valueObject) {
                            return valueObject.id === oldValues[properties[index]];
                          });
                          var newValueObject = valueData.filter(function (valueObject) {
                            return valueObject.id === newValues[properties[index]];
                          });
                          if (oldValueObject[0] || newValueObject[0]) {
                            break;
                          }
                        }

                        var propertyNameField = associationModel[index].nameField || "name";

                        //EXPL: update the display values
                        //Ex: role: old -> Admin, new -> Owner
                        if (oldValueObject[0]) {
                          objectDisplayOldValue[index] = oldValueObject[0][propertyNameField];
                        } else {
                          objectDisplayOldValue[index] = null;
                        }

                        if (newValueObject[0]) {
                          objectDisplayNewValue[index] = newValueObject[0][propertyNameField];
                        } else {
                          objectDisplayNewValue[index] = null;
                        }
                      } else {
                        //EXPL: find the first property with null old and new values that hasn't been logged
                        for (index = 0; index < properties.length; index++) {
                          if (objectDisplayOldValue[index] == null && objectDisplayNewValue[index] == null && properties[index] != null) {
                            break;
                          }
                        }
                      }

                      var associationParams = {
                        userId: request.auth.credentials.user.id,
                        organizationId: request.auth.credentials.user.organizationId,
                        verb: "updated",
                        objectId: newValues[idField] || "unknown",
                        objectName: newValues[nameField] || "unknown",
                        objectType: model.modelName,
                        objectDisplayType: collectionName,
                        objectProperty: properties[index],
                        objectDisplayProperty: objectDisplayProperty[index],
                        objectOldValue: oldValues[properties[index]],
                        objectDisplayOldValue: objectDisplayOldValue[index],
                        objectNewValue: newValues[properties[index]],
                        objectDisplayNewValue: objectDisplayNewValue[index]
                      };

                      //EXPL: mark this property as logged by setting it to null
                      properties[index] = null;
                      createEventLog(associationParams);

                    });
                  } else {
                    params = {
                      userId: request.auth.credentials.user.id,
                      organizationId: request.auth.credentials.user.organizationId,
                      verb: "updated",
                      objectId: newValues[idField] || "unknown",
                      objectName: newValues[nameField] || "unknown",
                      objectType: model.modelName,
                      objectDisplayType: collectionName,
                      objectProperty: property,
                      objectDisplayProperty: objectDisplayProperty[i],
                      objectOldValue: oldValues[property],
                      objectDisplayOldValue: objectDisplayOldValue[i],
                      objectNewValue: newValues[property],
                      objectDisplayNewValue: objectDisplayNewValue[i]
                    };

                    properties[i] = null;
                    createEventLog(params);
                  }
                }
                reply().code(204);
              });
            } else {
              reply(Boom.notFound("No resource was found with that id."));
            }
          });
        }).catch(function (error) {
          Log.error("error(%s)", JSON.stringify(error));
          reply(Boom.badRequest("An error occurred updating the resource.", error));
        });
      }
    },
    generateAssociationAddOneHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

      var associationName = association.include.as;
      var childModel = association.include.model;
      var addMethodName = association.addMethodName || "add" + associationName[0].toUpperCase() + associationName.slice(1, -1);

      return function (request, reply) {
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
    },
    generateAssociationRemoveOneHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

      var ownerMethods = ownerModel.schema.methods;
      var ownerCollectionName = ownerMethods.collectionDisplayName || ownerModel.modelName;
      var associationName = association.include.as;
      var childModel = association.include.model;
      var childMethods = childModel.schema.methods;
      var childCollectionName = childMethods.collectionDisplayName || childModel.modelName;
      var removeMethodName = association.removeMethodName || "remove" + associationName[0].toUpperCase() + associationName.slice(1, -1);

      var ownerIdField = ownerMethods.idField || "id";
      var ownerNameField = ownerMethods.nameField || "name";
      var childIdField = childMethods.idField || "id";
      var childNameField = childMethods.nameField || "name";

      return function (request, reply) {
        Log.log(removeMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        ownerModel.findById(request.params.ownerId).then(function (ownerObject) {
          if (ownerObject) {
            childModel.findById(request.params.childId).then(function (childObject) {
              if (childObject) {
                ownerObject[removeMethodName](childObject).then(function (result) {
                  options.models.eventLog.create({
                    userId: request.auth.credentials.user.id,
                    organizationId: request.auth.credentials.user.organizationId,
                    verb: "unassociated",
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
                    return reply().code(204);
                  });
                }).catch(function (error) {
                  Log.error(error);
                  reply(Boom.gatewayTimeout("There was a database error while adding the child resource."));
                });
              } else {
                reply(Boom.notFound("No child was found with that ID: " + request.params.childId));
              }
            }).catch(function (error) {
              Log.error(error);
              reply(Boom.gatewayTimeout("There was a database error while retrieving the child resource."));
            });
          } else {
            reply(Boom.notFound("No owner was found with that ID: " + request.params.ownerId));
          }
        }).catch(function (error) {
          Log.error(error);
          reply(Boom.gatewayTimeout("There was a database error while retrieving the owner resource."));
        });
      }
    },
    generateAssociationSetAllHandler: function (ownerModel, association, options, Log) {
      assert(association);
      assert(association.include);

      var associationName = association.include.as;
      var childModel = association.include.model;
      var setMethodName = "set" + associationName[0].toUpperCase() + associationName.slice(1);
      var addMethodName = "add" + associationName[0].toUpperCase() + associationName.slice(1, -1);

      assert(setMethodName);

      return function (request, reply) {
        Log.log(setMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

        ownerModel.findById(request.params.ownerId).then(function (ownerObject) {
          if (ownerObject) {
            var childIds = [];
            if (typeof request.payload[0] === 'string' || request.payload[0] instanceof String) {//EXPL: the payload is an array of Ids
              childIds = request.payload;
            } else {//EXPL: the payload contains other fields
              childIds = request.payload.map(function(object) {
                return object.childId;
              });
            }

            var promises = [];

            childIds.forEach(function(childId) {
              promises.push(setAssociation(request, server, ownerModel, ownerObject, childModel, childId, addMethodName, options, Log));
            });
            
            Q.all(promises).then(function(result) {
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
        Log.log(getAllMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));


        ownerModel.findById(request.params.ownerId).then(function (ownerObject) {
          if (ownerObject) {
            var sequelizeQuery = QueryHelper.createSequelizeQuery(childModel, request.query, Log);

            ownerObject[getAllMethodName](sequelizeQuery).then(function (results) {

              delete sequelizeQuery.limit;
              delete sequelizeQuery.offset;
              delete sequelizeQuery.include;

              ownerObject[countAllMethodName](sequelizeQuery).then(function (count) {

                var processedResults = results.map(function (data) {
                  var result = data.toJSON();

                  if (options.resultProcessor) {
                    result = options.resultProcessor(result);
                  }

                  return result;
                });

                reply(processedResults).header('X-Total-Count', count);
              }).catch(function (error) {
                Log.error(error);
                reply(Boom.gatewayTimeout("There was a database error counting the children."));
              });
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
    },
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
        if (typeof request.payload[0] === 'string' || request.payload[0] instanceof String) {//EXPL: the payload is an array of Ids
          payload = payload.filter(function(childId) {
            return childId === childObject.id;
          });
        } else {
          payload = payload.filter(function(object) {
            return object.childId === childObject.id;
          });
        }

        payload = payload[0];
        delete payload.childId;
        payload[childModel.modelName + "Id"] = childId;
        payload["test"] = "yaya";
        Log.error("payload:", payload);


        Log.error("childModel:", childModel);
        ownerObject[associationName].push(payload);

        ownerObject.save().then(function(result) {
          Log.error(result);
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
