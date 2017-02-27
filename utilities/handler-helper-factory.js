'use strict';

var Boom = require('boom');
var Q = require('q');
var extend = require('util')._extend;
var handlerHelper = require('./handler-helper');
var errorHelper = require('./error-helper');
let config = require("../config");

//TODO: add bulk delete/delete many

//TODO: consolidate eventLog functionality

//TODO-DONE: make returns more consistent/return all reply's

//TODO: make sure pre and post is supported for appropriate endpoints

//TODO: handle errors/status responses appropriately

//TODO: include option to set all default fields to NULL so they exist and are returned with queries

//TODO: possibly refactor/remove routeOptions

//TODO: apply .lean() before any exec() to speed up execution time when returning data

//TODO: possibly execute .toJSON() on all return data to reduce data size

//TODO-DONE: update hapi version

//TODO: look into using glue

//TODO: abstract mongoose logic into CRUD utility methods that can be called directly with rest-hapi plugin
//TODO:(cont) This will allow users to CRUD data in extra endpoints using rest-hapi functions.

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
     * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
     * @param ownerModel: A mongoose model.
     * @param association: An object containing the association data/child mongoose model.
     * @param options: Options object.
     * @param Log: A logging object.
     * @returns {Function} A handler function
     */
    generateAssociationRemoveManyHandler: generateAssociationRemoveManyHandler,

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

      handlerHelper.list(model, request.query, Log)
          .then(function(result) {
            const pageData = result.pageData;
            delete result.pageData;
            return reply(result).code(200);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
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

      handlerHelper.find(model, request.params._id, request.query, Log)
          .then(function(result) {
            return reply(result).code(200);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
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

      handlerHelper.create(model, request.payload, Log)
          .then(function(result) {
            return reply(result).code(201);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
    }
    catch(error) {
      Log.error(error);
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

      handlerHelper.update(model, request.params._id, request.payload, Log)
          .then(function(result) {
            return reply(result).code(200);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
    }
    catch(error) {
      Log.error("error: ", error);
      return reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming DELETE requests to /RESOURCE/{_id} or /RESOURCE
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

      let promise = {};
      if (request.params._id) {
        var hardDelete = request.payload ? request.payload.hardDelete : false;
        promise = handlerHelper.deleteOne(model, request.params._id, hardDelete, Log);
      }
      else {
        promise = handlerHelper.deleteMany(model, request.payload, Log);
      }

      promise
          .then(function(result) {
            return reply().code(204);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
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
  var addMethodName = "addOne" + associationName[0].toUpperCase() + associationName.slice(1, -1);

  return function (request, reply) {
    try {
      Log.log(addMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      handlerHelper.addOne(ownerModel, request.params.ownerId, childModel, request.params.childId, associationName, request.payload, Log)
          .then(function(result) {
            return reply().code(204);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
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
  var removeMethodName = "removeOne" + associationName[0].toUpperCase() + associationName.slice(1, -1);

  return function (request, reply) {
    try {
      Log.log(removeMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      handlerHelper.removeOne(ownerModel, request.params.ownerId, childModel, request.params.childId, associationName, Log)
          .then(function(result) {
            return reply().code(204);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

/**
 * Handles incoming DELETE requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationAddManyHandler(ownerModel, association, options, Log) {
  var associationName = association.include.as;
  var childModel = association.include.model;
  var addMethodName = "addMany" + associationName[0].toUpperCase() + associationName.slice(1);

  return function (request, reply) {
    try {
      Log.log(addMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      handlerHelper.addMany(ownerModel, request.params.ownerId, childModel, associationName, request.payload, Log)
          .then(function(result) {
            return reply().code(204);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}

//TODO: need to make sure removeMany calls are sequential, otherwise errors occur
/**
 * Handles incoming POST requests to /OWNER_RESOURCE/{ownerId}/CHILD_RESOURCE
 * @param ownerModel: A mongoose model.
 * @param association: An object containing the association data/child mongoose model.
 * @param options: Options object.
 * @param Log: A logging object.
 * @returns {Function} A handler function
 */
function generateAssociationRemoveManyHandler(ownerModel, association, options, Log) {
  var associationName = association.include.as;
  var childModel = association.include.model;
  var removeMethodName = "removeMany" + associationName[0].toUpperCase() + associationName.slice(1);

  return function (request, reply) {
    try {
      Log.log(removeMethodName + " + params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));

      handlerHelper.removeMany(ownerModel, request.params.ownerId, childModel, associationName, request.payload, Log)
          .then(function(result) {
            Log.debug("result:", result);
            return reply().code(204);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
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

      handlerHelper.getAll(ownerModel, request.params.ownerId, childModel, associationName, request.query, Log)
          .then(function(result) {
            return reply(result).code(200);
          })
          .catch(function(error) {
            var response = errorHelper.formatResponse(error, Log);
            return reply(response);
          })
    }
    catch(error) {
      Log.error("error: ", error);
      reply(Boom.badRequest("There was an error processing the request.", error));
    }
  }
}