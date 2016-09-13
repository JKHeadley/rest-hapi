var Sequelize = require('sequelize');
var chalk = require('chalk');
var logUtil = require('../utilities_sequelize/log-util');
var _ = require('lodash');

module.exports = function (logger, config) {
  logger = logUtil.bindHelper(logger, "sql");

  logUtil.logActionStart(logger, "Connecting to Database", _.omit(config.mysql, ['pass']));

  return new Sequelize(
    config.mysql.db,
    config.mysql.user,
    config.mysql.pass,
    {
      host: config.mysql.host,
      dialect: 'mysql',
      logging: false
    }
  );
};