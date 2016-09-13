var Sequelize = require('sequelize');
var Joi = require('joi');
var Q = require('q');
var queryString = require('query-string');

module.exports = function (sql) {
  var Model = sql.define('activityFeed', {
    id: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      queryable:true
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
      allowNull: true,
      queryable:true
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
        //Model.belongsTo(models.eventLog, {foreignKey: 'eventLogId', as: "eventLog"});
        Model.routeOptions.associations.eventLog.include = {model: models.eventLog, as: "eventLog"};
      },
      routeOptions: {
        alias:"activity-feed",
        allowCreate:false,
        allowUpdate:false,
        allowDelete:false,
        associations: {
          eventLog: {}
        },
        extraEndpoints:[
            //Refresh Activity Feeds
          function(server, model, options, Log){
            Log = Log.bind("Refresh");
            Log.note("Generating Refresh endpoint for " + model.getTableName());
            server.route({
              method: 'POST',
              path: '/activity-feed/refresh',
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
                    require('../../api/utilities/refresh-activity-feeds')(request, server, Model, options, Log)(result)
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
                description: 'Refresh the requested activity feeds',
                tags: ['api', 'activityFeed'],
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

            //Get Activity Feeds
          function(server, model, options, Log){
            Log = Log.bind("GetActivtiyFeeds");
            Log.note("Generating GetActivtiyFeeds endpoint for " + model.getTableName());
            server.route({
              method: 'GET',
              path: '/activity-feed/get-activity-feeds',
              config: {
                handler: function (request, reply) {
                  require('../../api/utilities/get-activity-feeds')(request, server, Model, options, Log)().then(function(result) {
                    // request.response.header('X-Total-Count', result.total);
                    // return reply(result.eventLogs).header('X-Total-Count', result.total);
                    // reply(result.eventLogs).header('X-Total-Count', result.total);
                    // reply(result.eventLogs);

                    //TODO: return total with header
                    reply(result); //EXPL: include both because hapi won't return headers for some reasone
                  });
                },
                auth: "token",
                cors: true,
                description: 'Filter and retrieve activity feeds',
                tags: ['api', 'activityFeed'],
                validate: {
                  query:{
                    userId: Joi.string().guid()
                        .description('Filter by userId'),
                    objectId: Joi.string().guid()
                        .description('Filter by objectId'),
                    organizationId: Joi.string().guid()
                        .description('Filter by organizationId'),
                    publicUserId: Joi.string().guid()
                        .description('Filter by publicUserId'),
                    objectType: Joi.string()
                        .description('Describe the object type'),
                    searchForType: Joi.boolean()
                        .description('Filter by the object type'),
                    limit: Joi.number()
                        .description('The maximum number of records to return. This is typically used in pagination.'),
                    offset: Joi.number()
                        .description('The number of records to skip in the database. This is typically used in pagination.'),
                    maxDate: Joi.date()
                        .description('Limit the date of activityFeeds returned'),
                    allowedOrganizations: Joi.string()
                        .description('List of organization ids to filter by'),
                    allowedPublicUsers: Joi.string()
                        .description('List of public user ids to filter by'),
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
        activityFeedId: Joi.string().guid().allow(null).optional() //HACK not sure why sequelize adds this.
      }
    }
  });

  return Model;
};