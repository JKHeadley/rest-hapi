var test = require('blue-tape');
var _ = require('lodash');
var sinon = require('sinon');
var rewire = require('rewire');
var proxyquire = require('proxyquire');
var assert = require('assert');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var logging = require('loggin');
var logger = logging.getLogger("tests");
logger.logLevel = "ERROR";
var testHelper = require("./test-helper");
var Joi = require('joi');
var Q = require('q');

test('handler-helper-factory exists and has expected members', function (t) {
  //<editor-fold desc="Arrange">
  var server = sinon.spy();
  var Log = logger.bind("handler-helper-factory");
  var handlerHelperFactory = require('../utilities/handler-helper-factory')(Log, mongoose, server);

  t.plan(10);
  //</editor-fold>

  //<editor-fold desc="Assert">
  t.ok(handlerHelperFactory, "handler-helper-factory exists.");
  t.ok(handlerHelperFactory.generateListHandler, "handler-helper-factory.generateListHandler exists.");
  t.ok(handlerHelperFactory.generateFindHandler, "handler-helper-factory.generateFindHandler exists.");
  t.ok(handlerHelperFactory.generateCreateHandler, "handler-helper-factory.generateCreateHandler exists.");
  t.ok(handlerHelperFactory.generateDeleteHandler, "handler-helper-factory.generateDeleteHandler exists.");
  t.ok(handlerHelperFactory.generateUpdateHandler, "handler-helper-factory.generateUpdateHandler exists.");
  t.ok(handlerHelperFactory.generateAssociationAddOneHandler, "handler-helper-factory.generateAssociationAddOneHandler exists.");
  t.ok(handlerHelperFactory.generateAssociationRemoveOneHandler, "handler-helper-factory.generateAssociationRemoveOneHandler exists.");
  t.ok(handlerHelperFactory.generateAssociationAddManyHandler, "handler-helper-factory.generateAssociationAddManyHandler exists.");
  t.ok(handlerHelperFactory.generateAssociationGetAllHandler, "handler-helper-factory.generateAssociationGetAllHandler exists.");
  //</editor-fold>
});

test('handler-helper-factory.generateListHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateListHandler calls model.find()
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler calls model.find()', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy();
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)({}, function(){});
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(userModel.find.called, "find called");
      //</editor-fold>


      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateListHandler calls QueryHelper.createMongooseQuery
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler calls QueryHelper.createMongooseQuery', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy(function(){ return "TEST" });

      var request = { query: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, request.query, "TEST", Log), "createMongooseQuery called");
      //</editor-fold>


      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateListHandler calls post processing if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler calls post processing if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var deferred = Q.defer();
      deferred.resolve("TEST");
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return deferred.promise }}};
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var postDeferred = Q.defer();
      var postSpy = sandbox.spy(function() {
        sandbox.stub(Log, 'error', function(){});
        postDeferred.resolve() ;
      });
      userSchema.methods = {
        routeOptions: {
          list: {
            post: postSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy();

      var request = { query: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return postDeferred.promise.then(function() {
        t.ok(postSpy.calledWithExactly(request, "TEST", Log), "list.post called");
      })
      //</editor-fold>


      //<editor-fold desc="Restore">
      .then(function(){
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateListHandler replies with a list of results
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler replies with a list of results', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var deferred = Q.defer();
      var result = [{ toJSON: function(){return "TEST1"} }, { toJSON: function(){return "TEST2"} }];
      deferred.resolve(result);
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return deferred.promise }}}
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy();

      var request = { query: {} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return replyDeferred.promise.then(function() {
        t.ok(reply.calledWithExactly(["TEST1","TEST2"]), "reply called with mapped result");
      })
      //</editor-fold>


      //<editor-fold desc="Restore">
      .then(function(){
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateListHandler replies with a postprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler replies with a postprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var deferred = Q.defer();
      deferred.resolve("");
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return deferred.promise }}}
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var postDeferred = Q.defer();
      var error = "error message";
      postDeferred.reject(error);
      userSchema.methods = {
        routeOptions: {
          list: {
            post: function(){ return postDeferred.promise }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy();

      var request = { query: {} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return replyDeferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error.", error), "reply called with postprocessing error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function(){
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateListHandler replies with a database error
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler replies with a database error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var error = "error message";
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.reject(error) }}};
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy();

      var request = { query: {} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return replyDeferred.promise.then(function() {
        t.ok(boomStub.serverTimeout.calledWithExactly("There was an error accessing the database.", error), "reply called with database error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function(){
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateListHandler replies with a general processing error
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler replies with a general processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      var error = "error message";
      userModel.find = sandbox.spy(function(){ throw(error) });

      var request = { query: {} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return replyDeferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", error), "reply called with general processing error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function(){
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
      });
      //</editor-fold>
    });
  });

});