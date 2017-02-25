'use strict';

var modelHelper = require('./model-helper');
var authHelper = require('./auth-helper');
var fs = require('fs');
var path = require('path');
var Q = require('q');

/**
 * This module reads in all the model files and generates the corresponding mongoose models.
 * @param mongoose
 * @param Log
 * @param config
 * @returns {*|promise}
 */
module.exports = function (mongoose, Log, config) {
  var models = {};
  var schemas = {};
  var deferred = Q.defer();
  let modelPath = "";

  if (config.absoluteModelPath === true) {
    modelPath = config.modelPath;
  }
  else {
    modelPath = __dirname + '/../../../' + config.modelPath;
  }

  fs.readdir(modelPath, function(err, files) {
    if (err) {
      if (err.message.includes('no such file')) {
        Log.error(err);
        deferred.reject("The model directory provided is either empty or does not exist. " +
            "Try setting the 'modelPath' property of the config file.");
      }
      else {
        deferred.reject(err);
      }
      return;
    }

    files.forEach(function(file) {//EXPL: Import all the model schemas
      var ext = path.extname(file);
      if (ext === '.js') {
        var modelName = path.basename(file,'.js');
        var schema = require(modelPath + '/' + modelName)(mongoose);

        //EXPL: Add text index if enabled
        if (config.enableTextSearch) {
          schema.index({'$**': 'text'});
        }
        schemas[schema.statics.collectionName] = schema;
      }
    });

    var extendedSchemas = {};

    for (var schemaKey in schemas) {
      var schema = schemas[schemaKey];
      extendedSchemas[schemaKey] = modelHelper.extendSchemaAssociations(schema, mongoose, modelPath);
    }

    for (var schemaKey in extendedSchemas) {//EXPL: Create models with final schemas
      var schema = extendedSchemas[schemaKey];
      models[schemaKey] = modelHelper.createModel(schema, mongoose);
    }

    for (var modelKey in models) {//EXPL: Populate internal model associations
      var model = models[modelKey];
      modelHelper.associateModels(model.schema, models);
    }

    for (var modelKey in models) {//EXPL: Generate scopes if enabled
      if (config.generateScopes) {
        var model = models[modelKey];
        authHelper.generateScopeForModel(model, Log);
      }
    }

    deferred.resolve(models);
  });

  return deferred.promise;
};