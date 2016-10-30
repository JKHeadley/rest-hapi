var mongoose = require("mongoose");

//TODO: correctly label "model" and "schema" files and objects throughout project
//TODO: add "updated_at" and "created_at" to all resources
//TODO: make sure complex fields are supported for models. Ex:
// var blogSchema = new Schema({
//   title:  String,
//   author: String,
//   body:   String,
//   comments: [{ body: String, date: Date }],
//   date: { type: Date, default: Date.now },
//   hidden: Boolean,
//   meta: {
//     votes: Number,
//     favs:  Number
//   }
// });
//TODO-DONE: possibly remove "Schema.extend" and use "Schema.add"
//TODO: look at accessing "model.statics rather than "model
//TODO: create a field property that can mark it as "duplicate". i.e. any associated models referencing that model will duplicate those fields along with the reference Id
//TODO(cont): this will allow for a shallow embed that will return a list of reference ids with their "duplicate" values, and a full embed that will return the fully embedded references
//TODO: add option for TTL index on eventLogs so they can expire after a certain length of time
//TODO: make sure field default values are supported
//TODO: add support for updatedAt and createdAt fields for each model

module.exports = {
  /**
   * Create a mongoose model with the given Schema and collectionName
   * @param Schema: A mongoose schema object.
   * @returns {*}: The resulting mongoose model.
   */
  createModel: function(Schema) {
    return mongoose.model(Schema.statics.collectionName, Schema);
  },

  /**
   * Takes a mongoose schema and extends the fields to include the model associations.
   * @param Schema: A mongoose schema.
   * @returns {*}: The updated schema.
   */
  extendSchemaAssociations: function (Schema) {
    if(Schema.statics.routeOptions){
      for (var associationKey in Schema.statics.routeOptions.associations) {
        var association = Schema.statics.routeOptions.associations[associationKey];
        if (association.type === "MANY_MANY") {//EXPL: for many-many relationships, association references should exist on both schemas
          var extendObject = {};
          var dataObject = {};
          dataObject[association.model] = { type: mongoose.Schema.Types.ObjectId, ref: association.model };
          if (association.linkingModel) {//EXPL: if a linking model is defined, add it to the association definition
            var linkingModelFile = "../models/linking-models/" + association.linkingModel + ".model";
            var linkingModel = require(linkingModelFile)();
            association.include = {
              through: linkingModel
            };
            for (var objectKey in linkingModel.Schema) {
              var object = linkingModel.Schema[objectKey];
              dataObject[objectKey] = object;
            }
          }
          extendObject[associationKey] = [dataObject];
          Schema.add(extendObject);
        }
        else if (association.type === "ONE_MANY") {//EXPL: for one-many relationships, create a virtual relationship
          if (association.foreignField) {
            Schema.virtual(associationKey, {
              ref: association.model,
              localField: '_id',
              foreignField: association.foreignField
            });
          }
        } else {
          //TODO: define ONE_ONE and MANY_ONE associations if needed
        }
      }
    }
    return Schema;
  },

  /**
   * Takes a mongoose schema and adds a complete mongoose model to each association in the schema.
   * @param Schema: A mongoose schema.
   * @param models: The complete list of existing mongoose models.
   */
  //TODO: can probably simplify this to a model string/name reference since mongoose models can be accessed globally
  associateModels: function (Schema, models) {
    if (Schema.statics.routeOptions) {
      for (var associationKey in Schema.statics.routeOptions.associations) {
        var association = Schema.statics.routeOptions.associations[associationKey];
        if (!association.include) {
          association.include = {};
        }
        association.include.model = models[association.model];
        association.include.as = associationKey;
      }
    }
  }
};
