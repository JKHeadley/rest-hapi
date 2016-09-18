var mongoose = require("mongoose");

//TODO: correctly label "model" and "schema" files and objects throughout project
//TODO: add "updated_at" and "created_at" to all resources

module.exports = {
  createModel: function(Schema) {
    return mongoose.model(Schema.methods.collectionName, Schema);
  },
  extendSchemaAssociations: function (Schema) {
    for (var associationKey in Schema.methods.routeOptions.associations) {
      var association = Schema.methods.routeOptions.associations[associationKey];
      if (association.type === "MANY_MANY") {//EXPL: for many-many relationships, association references should exist on both schemas
        var extendObject = {};
        var dataObject = {};
        dataObject[association.model] = { type: mongoose.Schema.Types.ObjectId, ref: association.model };
        if (association.linkingModel) {//EXPL: if a linking model is defined, add it to the association definition
          var linkingModelFile = "../models/linking-models/" + association.linkingModel + ".model";
          // console.log(linkingModelFile);
          var linkingModel = require(linkingModelFile)();
          association.include = {
            through: linkingModel
          };
          // console.log(linkingModel);
          for (var objectKey in linkingModel.Schema) {
            var object = linkingModel.Schema[objectKey];
            dataObject[objectKey] = object;
          }
        }
        // console.log(dataObject);
        extendObject[associationKey] = [dataObject];
        Schema = Schema.extend(extendObject);
      } else if (association.type === "ONE_MANY") {//EXPL: for one-many relationships, create a virtual relationship
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
      if (!association.include) {
        association.include = {};
      }
      association.include.model = models[association.model];
      association.include.as = associationKey;
    }
  }
};
