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
      required: true,
      expires: Config.auditLogTTL
    },
    method: {
      type: Types.String,
      enum: ["POST", "PUT", "DELETE", "GET"],
      required: true
    },
    action: {
      type: Types.String,
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
      allowNull: true,
      default: null
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
    },
    statusCode: {
      type: Types.Number,
      required: true
    },
    responseMessage: {
      type: Types.String,
      allowNull: true,
      default: null
    },
    isError: {
      type: Types.Boolean,
      default: false,
      required: true
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      allowUpdate: false,
      allowDelete: false,
    }
  };

  if (!_.isEmpty(Config.auditLogScope)) {
    Schema.statics.routeOptions.routeScope.rootScope = Config.auditLogScope;
  }

  return Schema;
};