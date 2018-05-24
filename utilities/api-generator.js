'use strict'

let fs = require('fs')
let path = require('path')

/**
 * This module reads in all the files that define additional endpoints and generates those endpoints.
 * @param server
 * @param mongoose
 * @param Log
 * @param config
 * @returns {*|promise}
 */
module.exports = function(server, mongoose, Log, config) {
  let apiPath = ''

  if (config.absoluteApiPath === true) {
    apiPath = config.apiPath
  } else {
    apiPath = path.join(__dirname, '/../../../', config.apiPath)
  }

  return new Promise((resolve, reject) => {
    fs.readdir(apiPath, (err, files) => {
      if (err) {
        if (err.message.includes('no such file')) {
          if (config.absoluteApiPath === true) {
            Log.error(err)
            reject(
              new Error(
                'The api directory provided is either empty or does not exist. ' +
                  "Try setting the 'apiPath' property of the config file."
              )
            )
          } else {
            resolve()
          }
        } else {
          reject(err)
        }
        return
      }

      for (let file of files) {
        let ext = path.extname(file)
        if (ext === '.js') {
          let fileName = path.basename(file, '.js')

          // EXPL: register all the additional endpoints
          require(apiPath + '/' + fileName)(server, mongoose, Log)
        }
      }

      resolve()
    })
  })
}
