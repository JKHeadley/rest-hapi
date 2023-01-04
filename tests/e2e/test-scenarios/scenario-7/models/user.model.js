'use strict'

const Boom = require('@hapi/boom')

module.exports = function(mongoose) {
  const modelName = 'user'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      email: {
        type: Types.String,
        unique: true
      },
      password: {
        type: Types.String,
        required: true,
        exclude: true,
        allowOnUpdate: false
      },
      firstName: {
        type: Types.String
      },
      lastName: {
        type: Types.String
      },
      title: {
        type: Types.ObjectId,
        ref: 'role',
        required: true
      },
      firstProfile: {
        type: Types.ObjectId,
        ref: 'userProfile'
      },
      secondProfile: {
        type: Types.ObjectId,
        ref: 'userProfile'
      },
      thirdProfile: {
        type: Types.ObjectId,
        ref: 'userProfile'
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        firstProfile: {
          type: 'ONE_ONE',
          model: 'userProfile',
          duplicate: {
            field: 'status',
            as: 'firstState'
          }
        },
        secondProfile: {
          type: 'ONE_ONE',
          model: 'userProfile',
          duplicate: {
            field: 'status',
            as: 'secondState'
          }
        },
        thirdProfile: {
          type: 'ONE_ONE',
          model: 'userProfile',
          duplicate: {
            field: 'status',
            as: 'thirdState'
          }
        },
        title: {
          type: 'MANY_ONE',
          model: 'role',
          duplicate: [
            {
              field: 'name'
            },
            {
              field: 'description',
              as: 'summary'
            },
            {
              field: 'companyName',
              as: 'businessName'
            }
          ]
        },
        permissions: {
          type: 'MANY_MANY',
          alias: 'permissions',
          model: 'permission',
          linkingModel: 'user_permission'
        },
        tags: {
          type: '_MANY',
          model: 'hashtag'
        }
      },
      update: {
        pre: function(_id, payload, request, Log) {
          if (payload.email === 'error@user.com') {
            throw Boom.badRequest('user error')
          }

          return payload
        }
      }
    }
  }

  return Schema
}
