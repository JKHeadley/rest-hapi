var Sequelize = require('sequelize');
var Joi = require('joi');
var uuid = require('node-uuid');
var Q = require('q');
var queryString = require('query-string');

module.exports = function (sql) {

  var Model = sql.define('notification', {
    id: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    hasBeenRead: {
      type: Sequelize.BOOLEAN,
      typeKey: Sequelize.BOOLEAN.key,
      defaultValue: false,
      allowNull: false,
      queryable: true,
      displayName: "Read Flag"
    },
    hasBeenCleared: {
      type: Sequelize.BOOLEAN,
      typeKey: Sequelize.BOOLEAN.key,
      defaultValue: false,
      allowNull: false,
      queryable: true,
      displayName: "Cleared Flag"
    },
    webMessage: {
      typeKey: Sequelize.TEXT.key,
      type: Sequelize.TEXT,
      allowNull: true,
      queryable:true
    },
    androidMessage: {
      typeKey: Sequelize.TEXT.key,
      type: Sequelize.TEXT,
      allowNull: true,
      queryable:true
    },
    eventLogId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: false,
      queryable: true,
    },
    isValid: {
      type: Sequelize.BOOLEAN,
      typeKey: Sequelize.BOOLEAN.key,
      defaultValue: false,
      allowNull: false,
      queryable: true,
      displayName: "Valid Flag"
    },
    createdAt: {
      type: Sequelize.DATE,
      typeKey: Sequelize.DATE.key,
      default: Sequelize.NOW,
      queryable:true
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        Model.belongsTo(models.eventLog, {as: 'eventLog', foreignKey: "eventLogId"});
        Model.routeOptions.associations.eventLog.include = {model: models.eventLog, as: "eventLog"};
      },
      nameField: null,
      //NOTE: was using "tableName" for this property, but apparently
      // that is a keyword and was somehow causing cyclic dependencies
      tableDisplayName:"Notification",
      routeOptions: {
        associations: {
          organization: {},
          publicUser: {},
          eventLog: {}
        },
        extraEndpoints:[
          //Refresh Notifications
          function(server, model, options, Log){
            Log = Log.bind("Refresh");
            Log.note("Generating Refresh endpoint for " + model.getTableName());
            server.route({
              method: 'POST',
              path: '/notification/refresh',
              config: {
                handler: function (request, reply) {
                  Log.debug("REFRESH");

                  var injectOptions = {};
                  injectOptions.method = 'GET';
                  var params = {
                    embed:"user,organization,publicUser",
                    //id:request.payload.eventLogIds
                  };
                  var url = '?' + queryString.stringify(params);
                  injectOptions.url = '/event-log' + url;

                  injectOptions.headers = {
                    Authorization: request.orig.headers.authorization
                  };

                  server.inject(injectOptions, function(res) {
                    var result = res.result;
                    require('../../api/utilities/refresh-notifications')(request, server, Model, options, Log)(result)
                        .then(function(result) {
                          Log.error("FINISHED");
                          reply().code(400);
                        }).catch(function(error) {
                      Log.error(error);
                      reply().code(500);
                    })
                  });
                },
                auth: "token",
                cors: true,
                description: 'Refresh the requested notifications',
                tags: ['api', 'notification'],
                validate: {
                  payload:{
                    eventLogIds: Joi.array().items(Joi.string().guid()).required()
                        .description('The list of eventLog Ids')
                  },
                  headers: Joi.object({
                    'authorization': Joi.string().required()
                  }).options({allowUnknown: true})
                },
                plugins: {
                  'hapi-swagger': {
                    responseMessages: [
                      {code: 200, message: 'The resource was created successfully.'},
                      {code: 400, message: 'The request was malformed.'},
                      {
                        code: 401,
                        message: 'The authentication header was missing/malformed, or the token has expired.'
                      },
                      {code: 500, message: 'There was an unknown error.'},
                      {code: 503, message: 'There was a problem with the database.'}
                    ]
                  }
                },
                response: {
                }
              }
            });
          },

          //Get Notifications
          function(server, model, options, Log){
            Log = Log.bind("GetNotifications");
            Log.note("Generating GetNotifications endpoint for " + model.getTableName());
            server.route({
              method: 'GET',
              path: '/notification/get-notifications',
              config: {
                handler: function (request, reply) {
                  require('../../api/utilities/get-notifications')(request, server, Model, options, Log)().then(function(notifications) {
                    reply(notifications).header('X-Total-Count', notifications.length);
                  });
                },
                auth: "token",
                cors: true,
                description: 'Filter and retrieve notifications',
                tags: ['api', 'notification'],
                validate: {
                  query:{
                    organizationId: Joi.string().guid()
                        .description('Filter by organizationId'),
                    publicUserId: Joi.string().guid()
                        .description('Filter by publicUserId'),
                    hasBeenRead: Joi.boolean()
                        .description('Filter by notification that have been read'),
                    hasBeenCleared: Joi.boolean()
                        .description('Filter by notification that have been cleared'),
                    limit: Joi.number()
                        .description('Limit the number of activityFeeds returned'),
                  },
                  headers: Joi.object({
                    'authorization': Joi.string().required()
                  }).options({allowUnknown: true})
                },
                plugins: {
                  'hapi-swagger': {
                    responseMessages: [
                      {code: 200, message: 'The resource was created successfully.'},
                      {code: 400, message: 'The request was malformed.'},
                      {
                        code: 401,
                        message: 'The authentication header was missing/malformed, or the token has expired.'
                      },
                      {code: 500, message: 'There was an unknown error.'},
                      {code: 503, message: 'There was a problem with the database.'}
                    ]
                  }
                },
                response: {
                }
              }
            });
          }
        ],
      },
      extraReadModelAttributes: {
        updatedAt: Joi.date().optional(),
        createdAt: Joi.date().optional(),
        notificationId: Joi.string().guid().allow(null).optional() //HACK not sure why sequelize adds this.
      }
    }
  });

  return Model;
};