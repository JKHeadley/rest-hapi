'use strict'

let fs = require('fs')
let path = require('path')
let Q = require('q')

/**
 * This module reads in all the files that define additional endpoints and generates those endpoints.
 * @param server
 * @param mongoose
 * @param Log
 * @param config
 * @returns {*|promise}
 */
module.exports = function(server, mongoose, Log, config) {
  let deferred = Q.defer()
  let apiPath = ''

  if (config.absoluteApiPath === true) {
    apiPath = config.apiPath
  } else {
    apiPath = path.join(__dirname, '/../../../', config.apiPath)
  }

  fs.readdir(apiPath, function(err, files) {
    if (err) {
      if (err.message.includes('no such file')) {
        if (config.absoluteApiPath === true) {
          Log.error(err)
          deferred.reject(
            'The api directory provided is either empty or does not exist. ' +
              "Try setting the 'apiPath' property of the config file."
          )
        } else {
          deferred.resolve()
        }
      } else {
        deferred.reject(err)
      }
      return
    }

    files.forEach(function(file) {
      let ext = path.extname(file)
      if (ext === '.js') {
        let fileName = path.basename(file, '.js')

        // EXPL: register all the additional endpoints
        require(apiPath + '/' + fileName)(server, mongoose, Log)
      }
    })

    deferred.resolve()
  })

  return deferred.promise
}
