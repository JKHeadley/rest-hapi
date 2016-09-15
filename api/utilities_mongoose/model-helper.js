var mongoose = require("mongoose");

module.exports = {
  createModel: function(Schema) {
    return mongoose.model(Schema.methods.collectionName, Schema);
  },
  extend1: function (Schema) {//TODO: extend to support through table fields
    var extendObject = {};
    extendObject[Schema.methods.collectionName + "Id"] = mongoose.Schema.Types.ObjectId;

    Schema = Schema.extend(extendObject);
    return Schema;
  },
  extend2: function (Schema, schemas) {
    for (var associationKey in Schema.methods.routeOptions.associations) {
      var association = Schema.methods.routeOptions.associations[associationKey];
      var extendObject = {};
      extendObject[associationKey] = [schemas[association.model]];
      Schema = Schema.extend(extendObject);
    }
    return Schema;
  },
  associate: function (Schema, models) {
    for (var associationKey in Schema.methods.routeOptions.associations) {
      var association = Schema.methods.routeOptions.associations[associationKey];
      association.include = {
        model: models[association.model],
        as: associationKey
      };
    }
  }
};
