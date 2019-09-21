'use strict'

// const _ = require('lodash');
// const Config = require('../config');

// const USER_ROLES = Config.get('/constants/USER_ROLES');

module.exports = function(mongoose) {
  const modelName = 'role'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String,
        // enum: _.values(USER_ROLES),
        required: true,
        unique: true
      },
      description: {
        type: Types.String
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      // scope: {
      //     scope: _.values(USER_ROLES),
      // },
      // documentScope: {
      //     scope: ['root'],
      // },
      policies: {
        // policies: ['test']
      }
      // authorizeDocumentCreatorToUpdate: true,
      // authorizeDocumentCreatorToRead: true,
      // associations: {
      //     users: {
      //         type: "ONE_MANY",
      //         alias: "user",
      //         foreignField: "role",
      //         model: "user"
      //     },
      //     permissions: {
      //         type: "MANY_MANY",
      //         alias: "permission",
      //         model: "permission",
      //         linkingModel: "role_permission",
      //     }
      // }
    }
  }

  return Schema
}
