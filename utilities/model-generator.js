var modelHelper = require('./utilities/model-helper');
var fs = require('fs');
var path = require('path');
var Q = require('q');

module.exports = function (mongoose, Log, config) {
  var models = {};
  var schemas = {};
  var deferred = Q.defer();

  fs.readdir(__dirname + '/../../' + config.modelDirectory, function(err, files) {
    if (err) {
      if (err.message.includes('no such file')) {
        Log.error(err);
        deferred.reject("The model directory provided is either empty or does not exist. " +
            "Try setting the 'modelDirectory' property of the config file.");
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
        var schema = require(__dirname + '/../../' + config.modelDirectory + '/' + modelName)(mongoose);
        schemas[schema.statics.collectionName] = schema;
      }
    });

    var extendedSchemas = {};

    for (var schemaKey in schemas) {
      var schema = schemas[schemaKey];
      extendedSchemas[schemaKey] = modelHelper.extendSchemaAssociations(schema);
    }

    for (var schemaKey in extendedSchemas) {//EXPL: Create models with final schemas
      var schema = extendedSchemas[schemaKey];
      models[schemaKey] = modelHelper.createModel(schema);
    }

    for (var modelKey in models) {//EXPL: Populate internal model associations
      var model = models[modelKey];
      modelHelper.associateModels(model.schema, models);
    }

    deferred.resolve(models);
  });

  return deferred.promise;
};