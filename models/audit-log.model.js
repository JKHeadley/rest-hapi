'use strict';

const Config = require('../config');
const _ = require('lodash');

module.exports = function (mongoose) {
  var modelName = "auditLog";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    date: {
      type: Types.Date,
      default: Date.now(),
      required: true
    },
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
      required: true
    },
    user: {
      type: Types.ObjectId,
      allowNull: true,
      default: null
    },
    collectionName: {
      type: Types.String,
      required: true
    },
    childCollectionName: {
      type: Types.String,
      allowNull: true,
      default: null
    },
    associationType: {
      type: Types.String,
      enum: ["ONE_MANY", "MANY_MANY", "_MANY", null],
      allowNull: true,
      default: null
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

  if (!_.isEmpty(Config.auditLogScope)) {
    Schema.statics.routeOptions.routeScope.rootScope = Config.auditLogScope;
  }

  return Schema;
};