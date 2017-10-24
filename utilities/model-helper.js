'use strict';

let config = require("../config");

//TODO: allow "unique" field to be rest-hapi specific if soft deletes are enabled (i.e. implement a unique constraint based on the required field and the "isDeleted" flag)
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
//TODO: create a field property that can mark it as "duplicate". i.e. any associated models referencing that model will duplicate those fields along with the reference Id
//TODO(cont): this will allow for a shallow embed that will return a list of reference ids with their "duplicate" values, and a full embed that will return the fully embedded references
//TODO(cont): Limiting the populated fields could also be accomplished with the "select" parameter of the "populate" function.
//TODO: add option for TTL index on eventLogs so they can expire after a certain length of time
//TODO-DONE: make sure field default values are supported
//TODO: add support for updatedAt and createdAt fields for each model

const internals = {};


/**
 * Create a mongoose model with the given Schema and collectionName after adding optional metadata fields
 * @param Schema: A mongoose schema object.
 * @returns {*}: The resulting mongoose model.
 */
internals.createModel = function(Schema, mongoose) {
  const Types = mongoose.Schema.Types;
  //TODO: require createdAt and updatedAt
  if (Schema.statics.collectionName !== 'auditLog') {
    if (config.enableCreatedAt) {
      let createdAt = {
        createdAt: {
          type: Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      };
      Schema.add(createdAt);
    }
    if (config.enableUpdatedAt) {
      let updatedAt = {
        updatedAt: {
          type: Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      };
      Schema.add(updatedAt);
    }
    if (config.enableDeletedAt) {
      let deletedAt = {
        deletedAt: {
          type: Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false,
        }
      };
      Schema.add(deletedAt);
    }
    if (config.enableCreatedBy) {
      let createdBy = {
        createdBy: {
          type: Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      };
      Schema.add(createdBy);
    }
    if (config.enableUpdatedBy) {
      let updatedBy = {
        updatedBy: {
          type: Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      };
      Schema.add(updatedBy);
    }
    if (config.enableDeletedBy) {
      let deletedBy = {
        deletedBy: {
          type: Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false,
        }
      };
      Schema.add(deletedBy);
    }
    if (config.enableSoftDelete) {
      let isDeleted = {
        isDeleted: {
          type: Types.Boolean,
          allowOnCreate: false,
          allowOnUpdate: false,
          default: false
        }
      };
      Schema.add(isDeleted);
    }
    if (config.enableDocumentScopes) {
      let scope = {
        scope: {
          rootScope: {
            type: [Types.String]
          },
          readScope: {
            type: [Types.String]
          },
          updateScope: {
            type: [Types.String]
          },
          deleteScope: {
            type: [Types.String]
          },
          associateScope: {
            type: [Types.String]
          },
          type: Types.Object,
          allowOnUpdate: false,
          allowOnCreate: false
        }
      };
      Schema.add(scope);
    }
  }
  return mongoose.model(Schema.statics.collectionName, Schema);
};

/**
 * Takes a mongoose schema and extends the fields to include the model associations.
 * @param Schema: A mongoose schema.
 * @returns {*}: The updated schema.
 */
internals.extendSchemaAssociations = function (Schema, mongoose, modelPath) {
  if(Schema.statics.routeOptions){
    for (var associationKey in Schema.statics.routeOptions.associations) {
      var association = Schema.statics.routeOptions.associations[associationKey];
      if (association.type === "MANY_MANY") {
        var extendObject = {};
        var dataObject = {};
        dataObject[association.model] = { type: mongoose.Schema.Types.ObjectId, ref: association.model };
        var embedAssociation = association.embedAssociation === undefined ? config.embedAssociations : association.embedAssociation;
        //EXPL: if a linking model is defined, add it to the association definition
        if (association.linkingModel) {
          var linkingModelFiles = require('require-all')(modelPath + '/linking-models');
          for (var fileName in linkingModelFiles) {
            if (linkingModelFiles[fileName]().modelName === association.linkingModel) {
              var linkingModel = linkingModelFiles[fileName]();
              break;
            }
          }
          if (!linkingModel) {
            throw "unknown linking model: " + association.linkingModel;
          }

          association.include = {};

          let modelExists = true;
          try {
            association.include.through = mongoose.model(linkingModel.modelName);
          }
          catch(error) {
            modelExists = false;
          }

          //EXPL: if the association isn't embedded, create separate collection for linking model
          if (!embedAssociation) {
            const modelName = Schema.statics.collectionName;
            if (!modelExists) {
              const Types = mongoose.Schema.Types;
              linkingModel.Schema[modelName] = {
                type: Types.ObjectId,
                ref: modelName
              };
              linkingModel.Schema[association.model] = {
                type: Types.ObjectId,
                ref: association.model
              };

              var linkingModelSchema = new mongoose.Schema(linkingModel.Schema, { collection: linkingModel.modelName });
              association.include.through = mongoose.model(linkingModel.modelName, linkingModelSchema);
            }

            //EXPL: we use virtual relationships for linking model collections
            Schema.virtual(associationKey, {
              ref: linkingModel.modelName,
              localField: '_id',
              foreignField: modelName
            });
          }
          //EXPL: if the association is embedded, extend original schema with linking model schema
          else {
            if (!modelExists) {
              var linkingModelSchema = new mongoose.Schema(linkingModel.Schema, { collection: linkingModel.modelName });
              association.include.through = mongoose.model(linkingModel.modelName, linkingModelSchema);
            }

            for (var objectKey in linkingModel.Schema) {
              var object = linkingModel.Schema[objectKey];
              dataObject[objectKey] = object;
            }

            extendObject[associationKey] = [dataObject];
            Schema.add(extendObject);
          }

          association.include.through.routeOptions = {};
        }
        else {
          //EXPL: if the association isn't embedded and a linking model isn't defined, then we need to create a basic linking collection
          if (!embedAssociation) {
            const linkingModelName_1 = Schema.statics.collectionName + "_" + association.model;
            const linkingModelName_2 = association.model + "_" + Schema.statics.collectionName;
            let linkingModelName = linkingModelName_1;

            association.include = {};

            let modelExists = [true, true];
            try {
              association.include.through = mongoose.model(linkingModelName_1);
              linkingModelName = linkingModelName_1;
            }
            catch(error) {
              modelExists[0] = false;
            }
            try {
              association.include.through = mongoose.model(linkingModelName_2);
              linkingModelName = linkingModelName_2;
            }
            catch(error) {
              modelExists[1] = false;
            }
            const modelName = Schema.statics.collectionName;
            if (!modelExists[0] && !modelExists[1]) {
              const Types = mongoose.Schema.Types;

              linkingModel = { Schema: {} };

              linkingModel.Schema[modelName] = {
                type: Types.ObjectId,
                ref: modelName
              };
              linkingModel.Schema[association.model] = {
                type: Types.ObjectId,
                ref: association.model
              };
              var linkingModelSchema = new mongoose.Schema(linkingModel.Schema, { collection: linkingModelName });

              association.include.through = mongoose.model(linkingModelName, linkingModelSchema);
            }
            association.include.through.routeOptions = {};
            //EXPL: we use virtual relationships for linking model collections
            Schema.virtual(associationKey, {
              ref: linkingModelName,
              localField: '_id',
              foreignField: modelName
            });
          }
          //EXPL: if the association is embedded, extend the original schema to support the association data
          else {
            extendObject[associationKey] = [dataObject];
            Schema.add(extendObject);
          }
        }
      }
      else if (association.type === "ONE_MANY") {//EXPL: for one-many relationships, create a virtual relationship
        if (association.foreignField) {
          Schema.virtual(associationKey, {
            ref: association.model,
            localField: '_id',
            foreignField: association.foreignField
          });
        }
      }
      else if (association.type === "_MANY") {//EXPL: for one sided _many relationships, the association exists as a simple array of objectIds
        var extendObject = {};
        extendObject[associationKey] = { type: [mongoose.Schema.Types.ObjectId], ref: association.model };
        Schema.add(extendObject);
      }
      else {
        //TODO: define ONE_ONE and MANY_ONE associations if needed
      }
    }
  }
  return Schema;
};

/**
 * Takes a mongoose schema and adds a complete mongoose model to each association in the schema.
 * @param Schema: A mongoose schema.
 * @param models: The complete list of existing mongoose models.
 */
//TODO: can probably simplify this to a model string/name reference since mongoose models can be accessed globally
internals.associateModels = function (Schema, models) {
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
};


module.exports = {

  createModel: internals.createModel,

  extendSchemaAssociations: internals.extendSchemaAssociations,

  associateModels: internals.associateModels
};
