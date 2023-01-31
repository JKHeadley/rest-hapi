'use strict'

module.exports = function(mongoose) {
  const modelName = 'role'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
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
        ref: 'business',
        required: true
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
          model: 'user',
          onDelete: 'CASCADE'
        },
        permissions: {
          type: 'MANY_MANY',
          model: 'permission',
          onDelete: 'SET_NULL',
          linkingModel: 'role_permission'
        }
      }
    }
  }

  return Schema
}
