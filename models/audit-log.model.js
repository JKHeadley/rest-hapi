'use strict';

module.exports = function (mongoose) {
  var modelName = "auditLog";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    method: {
      type: Types.String,
      enum: ["POST", "PUT", "DELETE"],
      required: true
    },
    action: {
      type: Types.String,
      enum: ["Create", "Update", "Add", "Remove", "Delete"],
      required: true
    },
    endpoint: {
      type: Types.String,
      require: true
    },
    user: {
      type: Types.ObjectId,
      allowNull: true,
      default: null
    },
    collection: {
      type: Types.String,
      require: true
    },
    document: {
      type: Types.ObjectId,
      required: true
    },
    payload: {
      type: Types.Object,
      allowNull: true,
      default: null
    },
    params: {
      type: Types.Object,
      allowNull: true,
      default: null
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