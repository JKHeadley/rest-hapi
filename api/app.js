var Hapi = require('hapi'),
  Inert = require('inert'),
  Vision = require('vision'),
  HapiSwagger = require('hapi-swagger');
var logging = require('loggin');//NOTE: loggin config is handled inside rest-helper-factory.js
var config = require('./config');
var chalk = require('chalk');
var Q = require("q");

var rootLogger = logging.getLogger(chalk.gray("app"));
rootLogger.logLevel = "DEBUG";

var logUtil = require('./utilities/log-util');

function appInit(){
  var logger = logUtil.bindHelper(rootLogger, 'appInit()');

  logUtil.logActionStart(logger, "Initializing Server");

  var server = new Hapi.Server();

  var config = require('./config');

  var mongoose = require('./components/mongoose-init')(logger, config);

  var tokenMaker = require('./components/token-maker');
  
  var generateModels = require('./models')(mongoose);

  generateModels.then(function(models) {

    server.connection({
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
      mongoose: mongoose,
      models: models,
      logger: logging,
      tokenMaker: tokenMaker,
      restHelperFactory: require('./utilities/rest-helper-factory')
    };

    server.register([require('hapi-auth-bearer-token')], function (err) {
      var Log = logUtil.bindHelper(logger, 'token-auth');
      var UserModel = modules.models.user;

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
      })
    });

    server.register([
        Inert,
        Vision,
        {
          register: HapiSwagger,
          options: swaggerOptions
        }],
      function (err) {
        var restHelper = modules.restHelperFactory(logger, modules.mongoose, server);

        for (var modelKey in models) {//EXPL: generate endpoints for all of the models
          var model = models[modelKey];
          restHelper.generateRoutes(server, model, {models:models})
        }

        require('./token/token.routes')(server, modules);
        require('./file-management/file-management.routes')(server, modules);

        server.start(function (err) {
          if (err) {
            console.log('error', err);
          }
          server.log('info', 'Server running at: ' + server.info.uri);
        });
      });
    
    logUtil.logActionComplete(logger, "Server Initialized", server.info);  
  });
  

  return server;
}


module.exports = appInit();
