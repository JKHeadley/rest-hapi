let _ = require('lodash')
let chalk = require('chalk')

module.exports = {
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
