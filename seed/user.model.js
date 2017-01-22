var Q = require('q');
var Joi = require('joi');
var bcrypt = require('bcryptjs');

//TODO: assign a unique text index to email field

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
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
      ref: "role"
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
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role"
        },
        groups: {
          type: "MANY_MANY",
          alias: "group",
          model: "group"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission",
          linkingModel: "user_permission"
        }
      },
      extraEndpoints: [
        //Password Update Endpoint
        function (server, model, options, Log) {
          Log = Log.bind("Password Update");
          var Boom = require('boom');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Password Update endpoint for " + collectionName);

          var handler = function (request, reply) {
            var hashedPassword = model.generatePasswordHash(request.payload.password);
            return model.findByIdAndUpdate(request.params._id, {password: hashedPassword}).then(function (result) {
              if (result) {
                return reply("Password updated.").code(200);
              }
              else {
                return reply(Boom.notFound("No resource was found with that id."));
              }
            })
            .catch(function (error) {
              Log.error("error: ", error);
              return reply(Boom.badImplementation("An error occurred updating the resource.", error));
            });
          }

          server.route({
            method: 'PUT',
            path: '/user/{_id}/password',
            config: {
              handler: handler,
              auth: null,
              description: 'Update a user\'s password.',
              tags: ['api', 'User', 'Password'],
              validate: {
                params: {
                  _id: Joi.objectId().required()
                },
                payload: {
                  password: Joi.string().required()
                  .description('The user\'s new password')
                }
              },
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        }
      ],
      create: {
        pre: function (payload, Log) {
          var deferred = Q.defer();
          var hashedPassword = mongoose.model('user').generatePasswordHash(payload.password);

          payload.password = hashedPassword;
          deferred.resolve(payload);
          return deferred.promise;
        }
      }
    },

    generatePasswordHash: function(password) {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
      return hash;
    },
  };
  
  return Schema;
};
