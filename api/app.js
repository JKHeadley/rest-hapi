var Hapi = require('hapi'),
    Inert = require('inert'),
    Vision = require('vision'),
    HapiSwagger = require('hapi-swagger');
var logging = require('loggin');//NOTE: loggin config is handled inside rest-helper-factory.js
var config = require('./config');
var chalk = require('chalk');

var rootLogger = logging.getLogger(chalk.gray("app"));
rootLogger.logLevel = "DEBUG";

var logUtil = require('./utilities_sequelize/log-util');

function appInit(){
  var logger = logUtil.bindHelper(rootLogger, 'appInit()');

  logUtil.logActionStart(logger, "Initializing Server");

  var server = new Hapi.Server();

  var path = require('path');
  var config = require('./config');

  var sql = require('./components/sequelize-init')(logger, config);
  var mongoose = require('./components/mongoose-init')(logger, config);
  
  var tokenMaker = require('./components/token-maker');

  var models = require('./models')(sql, mongoose);

  server.connection({
    /*
     ** NOTE: The host is commented out for deployment reasons.
     ** Docker MUST set it's own host ip address. (I think :P)
     */
    port: config.server.port,
    routes: {
      cors: {
        additionalHeaders: ['X-Total-Count'],
        additionalExposedHeaders: ['X-Total-Count']
      }
    }
  });

  var swaggerOptions = {
    apiVersion: '1.0',
    documentationPath: '/'
  };

  var modules = {
    config: config,
    sql: sql,
    mongoose: mongoose,
    models: models,
    logger: logging,
    tokenMaker: tokenMaker,
    restHelperFactory_sequelize: require('./utilities_sequelize/rest-helper-factory'),
    restHelperFactory_mongoose: require('./utilities_mongoose/rest-helper-factory')
  };

  server.register([
        Inert,
        Vision,
        {
          register: HapiSwagger,
          options: swaggerOptions
        }],
      function (err) {
        sql.sync().then(function () {
          var restHelper_sequelize = modules.restHelperFactory_sequelize(logger, modules.sql, server);

          //TODO: generate routes dynamically
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.eventLog, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.user, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.notification, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.imageFile, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.role, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.group, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.permission, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.emailLink, {models:models.sequelize});
          // restHelper_sequelize.generateRoutes(server, modules.models.sequelize.activityFeed, {models:models.sequelize});


          var restHelper_mongoose = modules.restHelperFactory_mongoose(logger, modules.mongoose, server);

          //TODO: generate routes dynamically
          // restHelper_mongoose.generateRoutes(server, modules.models.mongoose.eventLog, {models:models.mongoose});
          restHelper_mongoose.generateRoutes(server, modules.models.mongoose.user, {models:models.mongoose});
          // restHelper_mongoose.generateRoutes(server, modules.models.mongoose.notification, {models:models.mongoose});
          // restHelper_mongoose.generateRoutes(server, modules.models.mongoose.imageFile, {models:models.mongoose});
          restHelper_mongoose.generateRoutes(server, modules.models.mongoose.role, {models:models.mongoose});
          restHelper_mongoose.generateRoutes(server, modules.models.mongoose.group, {models:models.mongoose});
          restHelper_mongoose.generateRoutes(server, modules.models.mongoose.permission, {models:models.mongoose});
          // restHelper_mongoose.generateRoutes(server, modules.models.mongoose.emailLink, {models:models.mongoose});
          // restHelper_mongoose.generateRoutes(server, modules.models.mongoose.activityFeed, {models:models.mongoose});

          require('./token/token.routes')(server, modules);
          require('./file-management/file-management.routes')(server, modules);

          server.start(function (err) {
            if (err) {
              console.log('error', err);
            }
            server.log('info', 'Server running at: ' + server.info.uri);
          });
        }).catch(function(error){
          logging.error(error);
        });
      });
  
  server.register([require('hapi-auth-bearer-token')], function (err) {
    var Log = logUtil.bindHelper(logger, 'token-auth');
    var UserModel = modules.models.mongoose.user;

    server.auth.strategy('token', 'bearer-access-token', {
      allowQueryToken: true,              // optional, true by default
      allowMultipleHeaders: false,        // optional, false by default
      //accessTokenName: 'Authorization',    // optional, 'access_token' by default
      validateFunc: function (token, callback) {
        var request = this;

        token = decodeURI(token);

        UserModel.findOne({token: token}).then(function (user) {
          //TODO: check token expiration
          if (user) {
            delete user.password;

            callback(null, true, {token: token, user: user});
          } else {
            Log.debug("User not found.");

            callback("User not found.", false);
          }
        }, function (error) {
          Log.error("Error finding user by token: %s", token);
          callback(error, false);
        });
      }
    });
  });

  logUtil.logActionComplete(logger, "Server Initialized", server.info);

  return server;
}



module.exports = appInit();
