'use strict';

module.exports = function (mongoose) {
  var modelName = "hashtag";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    text: {
      type: Types.String,
      required: true
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
      }
    }
  };

  return Schema;
};