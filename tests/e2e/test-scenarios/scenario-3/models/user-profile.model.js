'use strict'

module.exports = function(mongoose) {
  let modelName = 'userProfile'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
    {
      status: {
        type: Types.String,
        required: true
      },
      user: {
        type: Types.ObjectId,
        ref: 'user'
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      alias: 'user-profile',
      associations: {
        user: {
          type: 'ONE_ONE',
          model: 'user',
          duplicate: ['email']
        }
      }
    }
  }

  return Schema
}
