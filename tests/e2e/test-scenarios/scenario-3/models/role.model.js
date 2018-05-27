'use strict'

module.exports = function(mongoose) {
  let modelName = 'role'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String,
        enum: ['User', 'Admin', 'SuperAdmin'],
        required: true
      },
      description: {
        type: Types.String
      },
      company: {
        type: Types.ObjectId,
        ref: 'business'
      },
      companyName: {
        type: Types.String
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        company: {
          type: 'MANY_ONE',
          model: 'business',
          duplicate: 'name'
        },
        users: {
          type: 'ONE_MANY',
          alias: 'people',
          foreignField: 'title',
          model: 'user'
        },
        permissions: {
          type: 'MANY_MANY',
          model: 'permission'
        }
      }
    }
  }

  return Schema
}
