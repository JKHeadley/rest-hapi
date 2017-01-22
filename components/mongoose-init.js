'use strict';

var chalk = require('chalk');
var logUtil = require('../utilities/log-util');
var _ = require('lodash');
let globals = require('./globals');

// var mongoose = require('mongoose');

module.exports = function (mongoose, logger, config) {
  mongoose.Promise = require('q').Promise;
  
  logger = logUtil.bindHelper(logger, "mongoose");

  logUtil.logActionStart(logger, "Connecting to Database", _.omit(config.mongo, ['pass']));
  
  mongoose.connect(config.mongo.URI);

  globals.mongoose = mongoose;

  return mongoose;
};