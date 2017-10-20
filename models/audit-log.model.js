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
    collectionName: {
      type: Types.String,
      require: true
    },
    documents: {
      type: [Types.ObjectId],
      required: true
    },
    payload: {
      type: Types.Mixed,
      allowNull: true,
      default: null
    },
    params: {
      type: Types.Object,
      allowNull: true,
      default: null
    },
    result: {
      type: Types.Object,
      allowNull: true,
      default: null
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      allowCreate: false,
      allowUpdate: false,
      allowDelete: false,
    }
  };

  return Schema;
};