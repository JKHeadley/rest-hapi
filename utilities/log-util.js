const _ = require('lodash')
const chalk = require('chalk')

/**
 * Function that truncates the properties of an object to a certain length.
 */
function truncatedProps(obj, truncateLength = 100) {
  const result = {}
  if (!_.isObject(obj)) return truncateProp(obj, truncateLength)
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = truncateProp(obj[key], truncateLength)
    }
  }
  return result
}

function truncateProp(prop, truncateLength = 100) {
  let result = null
  let value = _.clone(prop)
  // if value is an array, truncate each element
  if (_.isArray(value)) {
    // First truncate the array to 10 elements
    if (value.length > 10) {
      value = value.slice(0, 10).concat(['.', '.', '.'])
    }
    result = value.map(v => truncatedProps(v, truncateLength))
  } else if (_.isObject(value)) {
    result = truncatedProps(value, truncateLength)

    // if value is a string, truncate it to truncateLength characters
  } else if (typeof value === 'string') {
    if (value.length <= truncateLength) {
      result = value
    } else {
      result = value.substring(0, truncateLength) + '...'
    }

    // otherwise, just return it
  } else {
    result = value
  }

  return result
}

function truncatedStringify(obj, truncateLength = 100) {
  return JSON.stringify(truncatedProps(obj, truncateLength), null, 2)
}

module.exports = {
  truncatedProps,
  truncatedStringify,
  bindHelper: function(logger, name) {
    return logger.bind(chalk.gray(name))
  },
  logActionStart: function(logger, message, data) {
    if (data) {
      logger.log(chalk.blue(message) + chalk.white('...:'))
      _.forIn(data, function(value, key) {
        logger.log(
          chalk.gray('\t%s: `%s`'),
          chalk.magenta(key),
          chalk.cyan(value)
        )
      })
    } else {
      logger.log(chalk.blue(message) + chalk.white('...'))
    }
  },
  logActionComplete: function(logger, message, data) {
    if (data) {
      logger.log(chalk.blue(message) + chalk.white(':'))
      _.forIn(data, function(value, key) {
        logger.log(
          chalk.gray('\t%s: `%s`'),
          chalk.magenta(key),
          chalk.cyan(value)
        )
      })
    } else {
      logger.log(chalk.blue(message))
    }
  }
}
