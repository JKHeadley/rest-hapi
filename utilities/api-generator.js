'use strict'

let fs = require('fs')
let path = require('path')

/**
 * This module reads in all the files that define additional endpoints and generates those endpoints.
 * @param server
 * @param mongoose
 * @param logger
 * @param config
 * @returns {*|promise}
 */
module.exports = async function(server, mongoose, logger, config) {
  const Log = logger.bind('api-generator')

  let apiPath = ''

  if (config.absoluteApiPath === true) {
    apiPath = config.apiPath
  } else {
    apiPath = path.join(__dirname, '/../../../', config.apiPath)
  }

  try {
    const files = fs.readdirSync(apiPath)

    for (let file of files) {
      let ext = path.extname(file)
      if (ext === '.js') {
        let fileName = path.basename(file, '.js')

        // EXPL: register all the additional endpoints
        require(apiPath + '/' + fileName)(server, mongoose, logger)
      }
    }
  } catch (err) {
    if (err.message.includes('no such file')) {
      if (config.absoluteApiPath === true) {
        Log.error(err)
        throw new Error(
          'The api directory provided is either empty or does not exist. ' +
            "Try setting the 'apiPath' property of the config file."
        )
      }
    } else {
      throw err
    }
  }
}
