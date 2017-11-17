'use strict';

module.exports = function (mongoose) {
  var modelName = "business";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        roles: {
          type: "ONE_MANY",
          alias: "role",
          foreignField: "business",
          model: "role"
        }
      }
    }
  };

  return Schema;
};