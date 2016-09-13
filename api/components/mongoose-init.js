var Sequelize = require('sequelize');
var chalk = require('chalk');
var logUtil = require('../utilities_mongoose/log-util');
var _ = require('lodash');

var mongoose = require('mongoose');

module.exports = function (logger, config) {
  logger = logUtil.bindHelper(logger, "sql");

  logUtil.logActionStart(logger, "Connecting to Database", _.omit(config.mongo, ['pass']));
  
  mongoose.connect(config.mongo.URI);

  return mongoose;
};