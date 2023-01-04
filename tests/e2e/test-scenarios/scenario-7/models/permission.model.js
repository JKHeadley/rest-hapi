'use strict'

module.exports = function(mongoose) {
  const modelName = 'permission'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String,
        required: true
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
      associations: {
        users: {
          type: 'MANY_MANY',
          alias: 'user',
          model: 'user',
          linkingModel: 'user_permission'
        },
        roles: {
          type: 'MANY_MANY',
          alias: 'role',
          model: 'role'
        }
      }
    }
  }

  return Schema
}
