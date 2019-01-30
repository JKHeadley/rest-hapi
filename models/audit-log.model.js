'use strict'

const Config = require('../config')
const _ = require('lodash')

module.exports = function(mongoose) {
  let modelName = 'auditLog'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
    {
      date: {
        type: Types.Date,
        default: () => {
          return Date.now()
        },
        expires: Config.auditLogTTL
      },
      method: {
        type: Types.String,
        enum: ['POST', 'PUT', 'DELETE', 'GET', null],
        allowNull: true,
        default: null
      },
      action: {
        type: Types.String,
        allowNull: true,
        default: null
      },
      endpoint: {
        type: Types.String,
        allowNull: true,
        default: null
      },
      user: {
        type: Types.ObjectId,
        allowNull: true,
        default: null
      },
      collectionName: {
        type: Types.String,
        allowNull: true,
        default: null
      },
      childCollectionName: {
        type: Types.String,
        allowNull: true,
        default: null
      },
      associationType: {
        type: Types.String,
        enum: ['ONE_MANY', 'MANY_MANY', '_MANY', null],
        allowNull: true,
        default: null
      },
      documents: {
        type: [Types.ObjectId],
        allowNull: true,
        default: null
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
      },
      result: {
        type: Types.Object,
        allowNull: true,
        default: null
      },
      statusCode: {
        type: Types.Number,
        allowNull: true,
        default: null
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
      },
      ipAddress: {
        type: Types.String,
        allowNull: true,
        default: null
      },
      notes: {
        type: Types.String,
        allowNull: true,
        default: null
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      allowUpdate: false,
      allowDelete: false
    }
  }

  if (!_.isEmpty(Config.auditLogScope)) {
    Schema.statics.routeOptions.routeScope = {
      rootScope: Config.auditLogScope
    }
  }

  return Schema
}
