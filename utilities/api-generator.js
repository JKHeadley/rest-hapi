'use strict';

var fs = require('fs');
var path = require('path');
var Q = require('q');

/**
 * This module reads in all the files that define additional endpoints and generates those endpoints.
 * @param server
 * @param mongoose
 * @param Log
 * @param config
 * @returns {*|promise}
 */
module.exports = function (server, mongoose, Log, config) {
  var deferred = Q.defer();
  let apiPath = "";

  if (config.absoluteApiPath === true) {
    apiPath = config.apiPath;
  }
  else {
    apiPath = __dirname + '/../../../' + config.apiPath;
  }

  fs.readdir(apiPath, function(err, files) {
    if (err) {
      if (err.message.includes('no such file')) {
        if (config.absoluteApiPath === true) {
          Log.error(err);
          deferred.reject("The api directory provided is either empty or does not exist. " +
              "Try setting the 'apiPath' property of the config file.");
        }
        else {
          deferred.resolve();
        }
      }
      else {
        deferred.reject(err);
      }
      return;
    }

    files.forEach(function(file) {
      var ext = path.extname(file);
      if (ext === '.js') {
        var fileName = path.basename(file,'.js');

        //EXPL: register all the additional endpoints
        require(apiPath + '/' + fileName)(server, mongoose, Log);
      }
    });

    deferred.resolve();
  });

  return deferred.promise;
};