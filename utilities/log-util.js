let _ = require('lodash')
let chalk = require('chalk')

module.exports = {
  bindHelper: function(Log, name) {
    return Log.bind(chalk.gray(name))
  },
  logActionStart: function(Log, message, data) {
    if (data) {
      Log.log(chalk.blue(message) + chalk.white('...:'))
      _.forIn(data, function(value, key) {
        Log.log(chalk.gray('\t%s: `%s`'), chalk.magenta(key), chalk.cyan(value))
      })
    } else {
      Log.log(chalk.blue(message) + chalk.white('...'))
    }
  },
  logActionComplete: function(Log, message, data) {
    if (data) {
      Log.log(chalk.blue(message) + chalk.white(':'))
      _.forIn(data, function(value, key) {
        Log.log(chalk.gray('\t%s: `%s`'), chalk.magenta(key), chalk.cyan(value))
      })
    } else {
      Log.log(chalk.blue(message))
    }
  }
}
