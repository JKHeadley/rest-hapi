var modelHelper = require('./utilities/model-helper');
var fs = require('fs');
var path = require('path');
var Q = require('q');

module.exports = function (mongoose) {
  var models = {};
  var schemas = {};
  var deferred = Q.defer();

  fs.readdir(__dirname + '/models', function(err, files) {
    if (err) {
      deferred.reject(err);
    }
    files.forEach(function(file) {//EXPL: Import all the model schemas
      var ext = path.extname(file);
      if (ext === '.js') {
        var modelName = path.basename(file,'.js');
        var schema = require(__dirname + '/models/' + modelName)(mongoose);
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