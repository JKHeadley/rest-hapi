var test = require('tape');
var _ = require('lodash');
var sinon = require('sinon');
var rewire = require('rewire');
var proxyquire = require('proxyquire');
var assert = require('assert');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var logging = require('loggin');
var Log = logging.getLogger("tests");
Log.logLevel = "DEBUG";
Log = Log.bind("rest-helper-factory");
var testHelper = require("./test-helper");
var Joi = require('joi');


test('rest-helper-factory exists and has expected members', function (t) {
  //<editor-fold desc="Arrange">
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

  t.plan(11);
  //</editor-fold>

  //<editor-fold desc="Assert">
  t.ok(restHelperFactory, "rest-helper-factory exists.");
  t.ok(restHelperFactory.generateRoutes, "rest-helper-factory.generateRoutes exists.");
  t.ok(restHelperFactory.generateListEndpoint, "rest-helper-factory.generateListEndpoint exists.");
  t.ok(restHelperFactory.generateFindEndpoint, "rest-helper-factory.generateFindEndpoint exists.");
  t.ok(restHelperFactory.generateCreateEndpoint, "rest-helper-factory.generateCreateEndpoint exists.");
  t.ok(restHelperFactory.generateDeleteEndpoint, "rest-helper-factory.generateDeleteEndpoint exists.");
  t.ok(restHelperFactory.generateUpdateEndpoint, "rest-helper-factory.generateUpdateEndpoint exists.");
  t.ok(restHelperFactory.generateAssociationAddOneEndpoint, "rest-helper-factory.generateAssociationAddOneEndpoint exists.");
  t.ok(restHelperFactory.generateAssociationRemoveOneEndpoint, "rest-helper-factory.generateAssociationRemoveOneEndpoint exists.");
  t.ok(restHelperFactory.generateAssociationAddManyEndpoint, "rest-helper-factory.generateAssociationAddManyEndpoint exists.");
  t.ok(restHelperFactory.generateAssociationGetAllEndpoint, "rest-helper-factory.generateAssociationGetAllEndpoint exists.");
  //</editor-fold>
});

test('rest-helper-factory.defaultHeadersValidation', function(t) {
  t.test('rest-helper-factory.defaultHeadersValidation requires authorization property', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(2);

    var header1 = {};
    var header2 = { authorization: "test" };
    //</editor-fold>

    //<editor-fold desc="Act">
    var defaultHeadersValidation = restHelperFactory.defaultHeadersValidation;
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate(header1, defaultHeadersValidation).error !== null, "no authorization fails validation");
    t.ok(Joi.validate(header2, defaultHeadersValidation).error === null, "authorization valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  });

  t.test('rest-helper-factory.defaultHeadersValidation allows unknown header properties', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(1);

    var header = { authorization: "test", unknown: "test" };
    //</editor-fold>

    //<editor-fold desc="Act">
    var defaultHeadersValidation = restHelperFactory.defaultHeadersValidation;
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate(header, defaultHeadersValidation).error === null, "unknown property valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  });

  t.end();
});

test('rest-helper-factory.generateRoutes', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateRoutes, "restHelperFactory.generateRoutes", ["server", "model", "Log"], Log);

  // t.test('rest-helper-factory.defaultHeadersValidation requires authorization property', function (t) {
  //   //<editor-fold desc="Arrange">
  //   var server = sinon.spy();
  //   var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  //
  //   t.plan(2);
  //
  //   var header1 = {};
  //   var header2 = { authorization: "test" };
  //   //</editor-fold>
  //
  //   //<editor-fold desc="Act">
  //   var defaultHeadersValidation = restHelperFactory.defaultHeadersValidation;
  //   //</editor-fold>
  //
  //   //<editor-fold desc="Assert">
  //   t.ok(Joi.validate(header1, defaultHeadersValidation).error !== null, "no authorization fails validation");
  //   t.ok(Joi.validate(header2, defaultHeadersValidation).error === null, "authorization valid");
  //   //</editor-fold>
  //
  //   //<editor-fold desc="Restore">
  //   //</editor-fold>
  // });
  //
  // t.test('rest-helper-factory.defaultHeadersValidation allows unknown header properties', function (t) {
  //   //<editor-fold desc="Arrange">
  //   var server = sinon.spy();
  //   var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  //
  //   t.plan(1);
  //
  //   var header = { authorization: "test", unknown: "test" };
  //   //</editor-fold>
  //
  //   //<editor-fold desc="Act">
  //   var defaultHeadersValidation = restHelperFactory.defaultHeadersValidation;
  //   //</editor-fold>
  //
  //   //<editor-fold desc="Assert">
  //   t.ok(Joi.validate(header, defaultHeadersValidation).error === null, "unknown property valid");
  //   //</editor-fold>
  //
  //   //<editor-fold desc="Restore">
  //   //</editor-fold>
  // });

  t.end();
});