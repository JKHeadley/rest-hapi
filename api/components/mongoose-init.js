var chalk = require('chalk');
var logUtil = require('../utilities/log-util');
var _ = require('lodash');

require('mongoose-schema-extend');

var mongoose = require('mongoose');

module.exports = function (logger, config) {
  mongoose.Promise = require('q').Promise;
  
  logger = logUtil.bindHelper(logger, "sql");

  logUtil.logActionStart(logger, "Connecting to Database", _.omit(config.mongo, ['pass']));
  
  mongoose.connect(config.mongo.URI);

  return mongoose;
};