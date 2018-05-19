'use strict'

module.exports = function(mongoose) {
  let modelName = 'business'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
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
        roles: {
          type: 'ONE_MANY',
          alias: 'role',
          foreignField: 'company',
          model: 'role'
        }
      }
    }
  }

  return Schema
}
