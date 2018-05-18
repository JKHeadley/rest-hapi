'use strict'

module.exports = function(mongoose) {
  var modelName = 'userProfile'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
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
