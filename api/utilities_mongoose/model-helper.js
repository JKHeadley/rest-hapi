var mongoose = require("mongoose");

module.exports = {
  createModel: function(Schema) {
    return mongoose.model(Schema.methods.collectionName, Schema);
  },
  
  // extendSchemaFields: function (Schema) {//TODO: extend to support through table fields
  //   var extendObject = {};
  //   extendObject[Schema.methods.collectionName + "Id"] = mongoose.Schema.Types.ObjectId;
  //
  //   Schema = Schema.extend(extendObject);
  //   return Schema;
  // },
  
  // extendSchemaAssociations: function (Schema, extendedSchemas) {
  //   for (var associationKey in Schema.methods.routeOptions.associations) {
  //     var association = Schema.methods.routeOptions.associations[associationKey];
  //     var extendObject = {};
  //     extendObject[associationKey] = [extendedSchemas[association.model]];
  //     Schema = Schema.extend(extendObject);
  //   }
  //   return Schema;
  // },

  extendSchemaAssociations: function (Schema) {
    for (var associationKey in Schema.methods.routeOptions.associations) {
      var association = Schema.methods.routeOptions.associations[associationKey];
      if (association.type === "MANY_MANY") {//EXPL: for many-many relationships, association references should exist on both schemas
        var extendObject = {};
        var dataObject = {};
        dataObject[association.model] = { type: mongoose.Schema.Types.ObjectId, ref: association.model };
        dataObject.extraValue = mongoose.Schema.Types.String;//TODO: define "extra fields" using through table
        extendObject[associationKey] = [dataObject];
        Schema = Schema.extend(extendObject);
      } else if (association.type === "ONE_MANY") {
        Schema.virtual(associationKey, {
          ref: association.model,
          localField: '_id', 
          foreignField: Schema.methods.collectionName + "Id"
        });
      } else {
        //TODO: define ONE_ONE associations
      }
    }
    return Schema;
  },
  
  associateModels: function (Schema, models) {
    for (var associationKey in Schema.methods.routeOptions.associations) {
      var association = Schema.methods.routeOptions.associations[associationKey];
      association.include = {
        model: models[association.model],
        as: associationKey
      };
    }
  }
};
