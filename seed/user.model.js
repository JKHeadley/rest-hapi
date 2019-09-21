const Joi = require('@hapi/joi')
// NOTE: Install bcrypt then uncomment the line below
// let bcrypt = require('bcryptjs')
const RestHapi = require('rest-hapi')

// TODO: assign a unique text index to email field

module.exports = function(mongoose) {
  const modelName = 'user'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema({
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
      ref: 'role',
      required: true
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
        function(server, model, options, logger) {
          const Log = logger.bind('Password Update')
          const Boom = require('@hapi/boom')

          const collectionName = model.collectionDisplayName || model.modelName

          Log.note('Generating Password Update endpoint for ' + collectionName)

          const handler = async function(request, h) {
            try {
              const hashedPassword = model.generatePasswordHash(
                request.payload.password
              )

              await model.findByIdAndUpdate(request.params._id, {
                password: hashedPassword
              })

              return h.response('Password updated.').code(200)
            } catch (err) {
              Log.error(err)
              throw Boom.badImplementation(err)
            }
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
        pre: function(payload, logger) {
          const hashedPassword = mongoose
            .model('user')
            .generatePasswordHash(payload.password)

          payload.password = hashedPassword

          return payload
        }
      }
    },

    generatePasswordHash: function(password) {
      const hash = password
      // NOTE: Uncomment these two lines once bcrypt is installed
      // let salt = bcrypt.genSaltSync(10)
      // hash = bcrypt.hashSync(password, salt)
      return hash
    }
  }

  return Schema
}
