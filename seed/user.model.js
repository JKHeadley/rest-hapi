let Q = require('q')
let Joi = require('joi')
let bcrypt = require('bcryptjs')
let RestHapi = require('rest-hapi')

// TODO: assign a unique text index to email field

module.exports = function(mongoose) {
  let modelName = 'user'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema({
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
    role: {
      type: Types.ObjectId,
      ref: 'role'
    },
    token: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    },
    tokenCreatedAt: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    },
    accountActivated: {
      type: Types.Boolean,
      default: false
    }
  })

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        role: {
          type: 'MANY_ONE',
          model: 'role'
        },
        groups: {
          type: 'MANY_MANY',
          alias: 'group',
          model: 'group'
        },
        permissions: {
          type: 'MANY_MANY',
          alias: 'permission',
          model: 'permission',
          linkingModel: 'user_permission'
        }
      },
      extraEndpoints: [
        // Password Update Endpoint
        function(server, model, options, Log) {
          Log = Log.bind('Password Update')
          let Boom = require('boom')

          let collectionName = model.collectionDisplayName || model.modelName

          Log.note('Generating Password Update endpoint for ' + collectionName)

          let handler = function(request, h) {
            let hashedPassword = model.generatePasswordHash(
              request.payload.password
            )
            return model
              .findByIdAndUpdate(request.params._id, {
                password: hashedPassword
              })
              .then(function(result) {
                if (result) {
                  return h.response('Password updated.').code(200)
                } else {
                  throw Boom.notFound('No resource was found with that id.')
                }
              })
              .catch(function(error) {
                Log.error('error: ', error)
                throw Boom.badImplementation(
                  'An error occurred updating the resource.',
                  error
                )
              })
          }

          server.route({
            method: 'PUT',
            path: '/user/{_id}/password',
            config: {
              handler: handler,
              auth: null,
              description: "Update a user's password.",
              tags: ['api', 'User', 'Password'],
              validate: {
                params: {
                  _id: RestHapi.joiHelper.joiObjectId().required()
                },
                payload: {
                  password: Joi.string()
                    .required()
                    .description("The user's new password")
                }
              },
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    { code: 200, message: 'Success' },
                    { code: 400, message: 'Bad Request' },
                    { code: 404, message: 'Not Found' },
                    { code: 500, message: 'Internal Server Error' }
                  ]
                }
              }
            }
          })
        }
      ],
      create: {
        pre: function(payload, Log) {
          let deferred = Q.defer()
          let hashedPassword = mongoose
            .model('user')
            .generatePasswordHash(payload.password)

          payload.password = hashedPassword
          deferred.resolve(payload)
          return deferred.promise
        }
      }
    },

    generatePasswordHash: function(password) {
      let salt = bcrypt.genSaltSync(10)
      let hash = bcrypt.hashSync(password, salt)
      return hash
    }
  }

  return Schema
}
