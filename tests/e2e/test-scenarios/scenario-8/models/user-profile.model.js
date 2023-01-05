'use strict'

module.exports = function(mongoose) {
  const modelName = 'userProfile'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
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
