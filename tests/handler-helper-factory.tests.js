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
var extend = require('util')._extend;

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
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var postDeferred = Q.defer();
      var postSpy = sandbox.spy(function() {
        postDeferred.resolve() ;
      });
      userSchema.statics = {
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

  //handler-helper-factory.generateListHandler returns results with no reply if request.noReply is truthy
  .then(function() {
    return t.test('handler-helper-factory.generateListHandler returns results with no reply if request.noReply is truthy', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var result = [{ toJSON: function(){return "TEST1"} }, { toJSON: function(){return "TEST2"} }];
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when(result) }}}
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      userModel.find = sandbox.spy();

      var request = { query: {}, noReply: true };
      var reply = sandbox.spy();
      //</editor-fold>

      //<editor-fold desc="Act">
      var promise = handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return promise.then(function(mappedResult) {
        t.deepEquals(mappedResult, ["TEST1","TEST2"], "result returned");
        t.notOk(reply.called, "reply not called");
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
      userSchema.statics = {
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

test('handler-helper-factory.generateFindHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateFindHandler calls model.findOne()
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler calls model.findOne()', function (t) {
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

      userModel.findOne = sandbox.spy();

      var request = { params: { _id: "TEST" }};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, function(){});
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(userModel.findOne.calledWithExactly({ '_id': "TEST" }), "findOne called");
      //</editor-fold>


      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateFindHandler calls QueryHelper.createMongooseQuery
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler calls QueryHelper.createMongooseQuery', function (t) {
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

      userModel.findOne = sandbox.spy(function(){ return "TEST" });

      var request = { query: {}, params: { _id: {}} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
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

  //handler-helper-factory.generateFindHandler calls post processing if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler calls post processing if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when("TEST") }}};
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var postDeferred = Q.defer();
      var postSpy = sandbox.spy(function() {
        postDeferred.resolve() ;
      });
      userSchema.statics = {
        routeOptions: {
          find: {
            post: postSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { _id: {}} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
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

  //handler-helper-factory.generateFindHandler replies with a list of results
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler replies with a single result', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var result = { toJSON: function(){ return "TEST" }}
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when(result) }}}
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { _id: {}} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return replyDeferred.promise.then(function() {
        Log.error(reply.args[0]);
        t.ok(reply.calledWithExactly("TEST"), "reply called with result");
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

  //handler-helper-factory.generateFindHandler replies with a postprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler replies with a postprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when("TEST") }}}
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
      userSchema.statics = {
        routeOptions: {
          find: {
            post: function(){ return postDeferred.promise }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { _id: {}} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
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

  //handler-helper-factory.generateFindHandler replies with a not found error
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler replies with a not found error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when(null) }}}
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
      userSchema.statics = {
        routeOptions: {
          find: {
            post: function(){ return postDeferred.promise }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { _id: "TEST"} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return replyDeferred.promise.then(function() {
        t.ok(boomStub.notFound.calledWithExactly("There was no data found with that id.", "TEST"), "reply called with not found error");
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

  //handler-helper-factory.generateFindHandler replies with a database error
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler replies with a database error', function (t) {
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

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { _id: "TEST"} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
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

  //handler-helper-factory.generateFindHandler replies with a general processing error
  .then(function() {
    return t.test('handler-helper-factory.generateFindHandler replies with a general processing error', function (t) {
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
      userModel.findOne = sandbox.spy(function(){ throw(error) });

      var request = { query: {}, params: { _id: "TEST"} };
      var replyDeferred = Q.defer();
      var reply = sandbox.spy(function() { replyDeferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
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

test('handler-helper-factory.generateCreateHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateCreateHandler calls pre processing if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls pre processing if it exists', function (t) {
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
      var preDeferred = Q.defer();
      var preSpy = sandbox.spy(function() {
        preDeferred.resolve() ;
      });
      userSchema.statics = {
        routeOptions: {
          create: {
            pre: preSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return preDeferred.promise.then(function() {
        t.ok(preSpy.calledWithExactly(request, Log), "create.pre called");
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

  //handler-helper-factory.generateCreateHandler calls model.create
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls model.create', function (t) {
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
      var createDeferred = Q.defer();
      userModel.create = sandbox.spy(function(){ return createDeferred.resolve() });

      var request = { query: {}, payload: "TEST" };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return createDeferred.promise.then(function() {
        t.ok(userModel.create.calledWithExactly("TEST"), "model.create called");
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

  //handler-helper-factory.generateCreateHandler calls QueryHelper.createAttributesFilter
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls QueryHelper.createAttributesFilter', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var deferred = Q.defer();
      queryHelperStub.createAttributesFilter = sandbox.spy(function(){ return deferred.resolve() });
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.create = sandbox.spy(function(){ return Q.when() });

      var request = { query: "TEST", payload: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(queryHelperStub.createAttributesFilter.calledWithExactly("TEST", userModel, Log), "queryHelperStub.createAttributesFilter called");
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

  //handler-helper-factory.generateCreateHandler calls model.findOne
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.create = sandbox.spy(function(){ return Q.when({ _id: "TEST" }) });
      var deferred = Q.defer();
      userModel.findOne = sandbox.spy(function(){ return deferred.resolve() });

      var request = { query: {}, payload: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(userModel.findOne.calledWithExactly({ '_id': "TEST"}, "attributes"), "model.findOne called");
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

  //handler-helper-factory.generateCreateHandler calls create.post if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls create.post if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var deferred = Q.defer();
      var postSpy = sandbox.spy(function(){ return deferred.resolve() });
      userSchema.statics = {
        routeOptions: {
          create: {
            post: postSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.create = sandbox.spy(function(){ return Q.when({ _id: {} }) });
      userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return "TEST" }}) });

      var request = { query: {}, payload: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(postSpy.calledWithExactly(request, "TEST", Log), "create.post called");
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

  //handler-helper-factory.generateCreateHandler calls reply with result
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls reply with result', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.create = sandbox.spy(function(){ return Q.when({ _id: {} }) });
      userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(reply.calledWithExactly({ _id: '3' }), "reply called with result");
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

  //handler-helper-factory.generateCreateHandler calls reply with a postprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls reply with a postprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          create: {
            post: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.create = sandbox.spy(function(){ return Q.when({ _id: {} }) });
      userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error creating the resource", "error message"), "reply called with a postprocessing error");
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

  //handler-helper-factory.generateCreateHandler calls reply with a create error
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls reply with a create error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          create: {
            post: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.create = sandbox.spy(function(){ return Q.reject("error message") });

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.serverTimeout.calledWithExactly("There was an error creating the resource", "error message"), "reply called with a create error");
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

  //handler-helper-factory.generateCreateHandler calls reply with a preprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls reply with a preprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          create: {
            pre: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a preprocessing error creating the resource", "error message"), "reply called with a preprocessing error");
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

  //handler-helper-factory.generateCreateHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateCreateHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          create: {
            pre: function(){ throw("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with a processing error");
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

});

test('handler-helper-factory.generateDeleteHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateDeleteHandler calls pre processing if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls pre processing if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var preDeferred = Q.defer();
      var preSpy = sandbox.spy(function() {
        preDeferred.resolve() ;
      });
      userSchema.statics = {
        routeOptions: {
          delete: {
            pre: preSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return preDeferred.promise.then(function() {
        t.ok(preSpy.calledWithExactly(request, Log), "delete.pre called");
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

  //handler-helper-factory.generateDeleteHandler calls model.findByIdAndRemove
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls model.findByIdAndRemove', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      var deferred = Q.defer();
      userModel.findByIdAndRemove = sandbox.spy(function(){ return deferred.resolve() });

      var request = { query: {}, params: { _id: "TEST" } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(userModel.findByIdAndRemove.calledWithExactly("TEST"), "model.findByIdAndRemove called");
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

  //handler-helper-factory.generateDeleteHandler calls create.post if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls delete.post if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var deferred = Q.defer();
      var postSpy = sandbox.spy(function(){ return deferred.resolve() });
      userSchema.statics = {
        routeOptions: {
          delete: {
            post: postSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when("TEST") });

      var request = { query: {}, params: { _id: {} } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(postSpy.calledWithExactly(request, "TEST", Log), "delete.post called");
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

  //handler-helper-factory.generateDeleteHandler calls reply
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls reply', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when() });

      var request = { query: {}, params: { _id: {} } };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(reply.called, "reply called");
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

  //handler-helper-factory.generateDeleteHandler calls reply with a postprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls reply with a postprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          delete: {
            post: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when("TEST") });

      var request = { query: {}, params: { _id: {} } };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error deleting the resource", "error message"), "reply called with a postprocessing error");
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

  //handler-helper-factory.generateDeleteHandler calls reply with a not found error
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls reply with a not found error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when() });

      var request = { query: {}, params: { _id: {} } };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.notFound.calledWithExactly("No resource was found with that id."), "reply called with a not found error");
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

  //handler-helper-factory.generateDeleteHandler calls reply with a preprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls reply with a preprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          delete: {
            pre: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a preprocessing error deleting the resource", "error message"), "reply called with a preprocessing error");
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

  //handler-helper-factory.generateDeleteHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateDeleteHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          delete: {
            pre: function(){ throw("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with a processing error");
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

});

test('handler-helper-factory.generateUpdateHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateUpdateHandler calls pre processing if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls pre processing if it exists', function (t) {
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
      var preDeferred = Q.defer();
      var preSpy = sandbox.spy(function() {
        preDeferred.resolve() ;
      });
      userSchema.statics = {
        routeOptions: {
          update: {
            pre: preSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return preDeferred.promise.then(function() {
        t.ok(preSpy.calledWithExactly(request, Log), "update.pre called");
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

  //handler-helper-factory.generateUpdateHandler calls model.findByIdAndUpdate
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls model.findByIdAndUpdate', function (t) {
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
      var createDeferred = Q.defer();
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return createDeferred.resolve() });

      var request = { query: {}, params: { _id: "_id" }, payload: "TEST" };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return createDeferred.promise.then(function() {
        t.ok(userModel.findByIdAndUpdate.calledWithExactly("_id", "TEST"), "model.findByIdAndUpdate called");
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

  //handler-helper-factory.generateUpdateHandler calls QueryHelper.createAttributesFilter
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls QueryHelper.createAttributesFilter', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      var deferred = Q.defer();
      queryHelperStub.createAttributesFilter = sandbox.spy(function(){ return deferred.resolve() });
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({}) });

      var request = { query: "TEST", params: { _id: "_id" }, payload: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(queryHelperStub.createAttributesFilter.calledWithExactly("TEST", userModel, Log), "queryHelperStub.createAttributesFilter called");
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

  //handler-helper-factory.generateUpdateHandler calls model.findOne
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: "TEST" }) });
      var deferred = Q.defer();
      userModel.findOne = sandbox.spy(function(){ return deferred.resolve() });

      var request = { query: {}, params: { _id: "_id" }, payload: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(userModel.findOne.calledWithExactly({ '_id': "TEST"}, "attributes"), "model.findOne called");
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

  //handler-helper-factory.generateUpdateHandler calls update.post if it exists
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls update.post if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var deferred = Q.defer();
      var postSpy = sandbox.spy(function(){ return deferred.resolve() });
      userSchema.statics = {
        routeOptions: {
          update: {
            post: postSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
      userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return "TEST" }}) });

      var request = { query: {}, params: { _id: "_id" }, payload: {} };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(postSpy.calledWithExactly(request, "TEST", Log), "update.post called");
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

  //handler-helper-factory.generateUpdateHandler calls reply with result
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls reply with result', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
      userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });

      var request = { query: {}, params: { _id: "_id" }, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(reply.calledWithExactly({ _id: '3' }), "reply called with result");
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

  //handler-helper-factory.generateUpdateHandler calls reply with a postprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls reply with a postprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          update: {
            post: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
      userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });

      var request = { query: {}, params: { _id: "_id" }, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error updating the resource", "error message"), "reply called with a postprocessing error");
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

  //handler-helper-factory.generateUpdateHandler calls reply with a not found error
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls reply with a not found error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when() });

      var request = { query: {}, params: { _id: "_id" }, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.notFound.calledWithExactly("No resource was found with that id."), "reply called with a not found error");
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

  //handler-helper-factory.generateUpdateHandler calls reply with a update error
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls reply with a update error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.reject("error message") });

      var request = { query: {}, params: { _id: "_id" }, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.serverTimeout.calledWithExactly("There was an error updating the resource", "error message"), "reply called with a create error");
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

  //handler-helper-factory.generateUpdateHandler calls reply with a preprocessing error
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls reply with a preprocessing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          update: {
            pre: function(){ return Q.reject("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was a preprocessing error updating the resource", "error message"), "reply called with a preprocessing error");
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

  //handler-helper-factory.generateUpdateHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateUpdateHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createAttributesFilter = function(){ return "attributes" };
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
        './query-helper': queryHelperStub,
        'boom': boomStub
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          update: {
            pre: function(){ throw("error message") }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      var request = { query: {}, payload: {} };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with a processing error");
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

});

test('handler-helper-factory.generateAssociationAddOneHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateAssociationAddOneHandler calls model.findOne
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddOneHandler calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy();

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { query: {}, params: { ownerId: "_id" } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
      //</editor-fold>

      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      delete mongoose.models.child;
      delete mongoose.modelSchemas.child;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddOneHandler calls setAssociation
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddOneHandler calls setAssociation', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var deferred = Q.defer();
      var setAssociation = sandbox.spy(function(){ return deferred.resolve() });
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("setAssociation", setAssociation);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(setAssociation.calledWithExactly({ params: { ownerId: "ownerId", childId: "childId" }, payload: [ 'TEST' ] }, server, userModel, "ownerObject", childModel, "childId", "CHILD", {}, Log), "setAssociation called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddOneHandler calls reply
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var setAssociation = sandbox.spy(function(){ return Q.when() });
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("setAssociation", setAssociation);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(reply.called, "reply called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddOneHandler calls reply with an association error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply with an association error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("setAssociation", setAssociation);
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while setting the association.", "error message"), "reply called with association error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddOneHandler calls reply with a not found error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply with a not found error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when() });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddOneHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ throw("error message") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

});

test('handler-helper-factory.generateAssociationRemoveOneHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateAssociationRemoveOneHandler calls model.findOne
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy();

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { query: {}, params: { ownerId: "_id" } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
      //</editor-fold>

      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      delete mongoose.models.child;
      delete mongoose.modelSchemas.child;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationRemoveOneHandler calls removeAssociation
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls removeAssociation', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var deferred = Q.defer();
      var removeAssociation = sandbox.spy(function(){ return deferred.resolve() });
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("removeAssociation", removeAssociation);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(removeAssociation.calledWithExactly(request, server, userModel, "ownerObject", childModel, "childId", "CHILD", {}, Log), "removeAssociation called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationRemoveOneHandler calls reply
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var removeAssociation = sandbox.spy(function(){ return Q.when() });
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("removeAssociation", removeAssociation);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(reply.called, "reply called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationRemoveOneHandler calls reply with an association error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply with an association error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var removeAssociation = sandbox.spy(function(){ return Q.reject("error message") });
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("removeAssociation", removeAssociation);
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while removing the association.", "error message"), "reply called with association error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a not found error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a not found error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when() });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ throw("error message") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

});

test('handler-helper-factory.generateAssociationAddManyHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateAssociationAddManyHandler calls model.findOne
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddManyHandler calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy();

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { query: {}, params: { ownerId: "_id" } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
      //</editor-fold>

      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      delete mongoose.models.child;
      delete mongoose.modelSchemas.child;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddManyHandler calls setAssociation for every childId
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddManyHandler calls setAssociation', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var setAssociation = sandbox.spy(function(){ return Q.when() });
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("setAssociation", setAssociation);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" } };
      request.payload = ["child1", "child2", "child3"];
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.equals(setAssociation.callCount, 3, "setAssociation called for each child");
        t.ok(setAssociation.getCall(2).calledWithExactly(request, server, userModel, "ownerObject", childModel, "child3", "CHILD", {}, Log), "setAssociation called with correct args");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddManyHandler calls reply
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var setAssociation = sandbox.spy(function(){ return Q.when() });
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("setAssociation", setAssociation);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" } };
      request.payload = ["child1", "child2", "child3"];
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(reply.called, "reply called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddManyHandler calls reply with an association error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply with an association error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("setAssociation", setAssociation);
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" } };
      request.payload = ["child1", "child2", "child3"];
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while setting the associations.", "error message"), "reply called with association error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddManyHandler calls reply with a not found error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply with a not found error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ return Q.when() });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" } };
      request.payload = ["child1", "child2", "child3"];
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationAddManyHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ throw("error message") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { params: { ownerId: "ownerId", childId: "childId" } };
      request.payload = ["child1", "child2", "child3"];
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

});

test('handler-helper-factory.generateAssociationGetAllHandler', function(t) {

  return Q.when()

  //handler-helper-factory.generateAssociationGetAllHandler calls model.findOne
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationGetAllHandler calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = proxyquire('../utilities/handler-helper-factory', {
      })(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            CHILD: {
              foreignField: "foreignField"
            }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy();

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { query: {}, params: { ownerId: "_id" } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
      //</editor-fold>

      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      delete mongoose.models.child;
      delete mongoose.modelSchemas.child;
      return Q.when();
      //</editor-fold>
    });
  })
    
  //handler-helper-factory.generateAssociationGetAllHandler calls QueryHelper.createMongooseQuery
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationGetAllHandler calls QueryHelper.createMongooseQuery', function (t) {
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
      userSchema.statics = {
        routeOptions: {
          associations: {
            CHILD: {
              foreignField: "foreignField"
            }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){return "TEST"});

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "CHILD", model: childModel }};

      var request = { query: {}, params: { ownerId: "_id" } };
      var ownerRequest = { query: { $embed: "CHILD", populateSelect: "_id,foreignField" } };
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, ownerRequest.query, "TEST", Log), "createMongooseQuery called");
      //</editor-fold>


      //<editor-fold desc="Restore">
      sandbox.restore();
      delete mongoose.models.user;
      delete mongoose.modelSchemas.user;
      delete mongoose.models.child;
      delete mongoose.modelSchemas.child;
      return Q.when();
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationGetAllHandler calls generateListHandler
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationGetAllHandler calls generateListHandler', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var deferred = Q.defer();
      var handlerSpy1 = sandbox.spy(function(){ deferred.resolve() });
      var handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when({ "children": [{ _id: "childId1"},{ _id: "childId2"}] }) }}};
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("QueryHelper", queryHelperStub);
      handlerHelperFactory.__set__("generateListHandler", handlerSpy2);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              foreignField: "foreignField"
            }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){return "TEST"});

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "children", model: childModel }, model: "child"};

      var request = { query: {}, params: { ownerId: "_id" } };
      var extendedRequest = extend({}, request);
      extendedRequest.query.$where = extend({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
      var reply = function(){};
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "generateListHandler called 1");
        t.ok(handlerSpy1.calledWithExactly(extendedRequest, reply), "generateListHandler called 2");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations with linkingModels
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations with linkingModels', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var deferred = Q.defer();
      var handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
      var handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
        return Q.when(
          {
            "children": [
              { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
              { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
              ]
          })
      }}};
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("QueryHelper", queryHelperStub);
      handlerHelperFactory.__set__("generateListHandler", handlerSpy2);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              foreignField: "foreignField"
            }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){return "TEST"});

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};

      var request = { query: {}, params: { ownerId: "_id" }, noReply: true };
      var extendedRequest = extend({}, request);
      extendedRequest.query.$where = extend({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "generateListHandler called 1");
        t.ok(handlerSpy1.calledWithExactly(extendedRequest, reply), "generateListHandler called 2");
        t.ok(reply.calledWithExactly([{_id: "childId1", link: {value: "value1"}},{_id: "childId2", link: {value: "value2"}}]), "reply called with correct result");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations without linkingModels
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations without linkingModels', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var deferred = Q.defer();
      var handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
      var handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
      var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
      queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
        return Q.when(
          {
            "children": [
              { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
              { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
            ]
          })
      }}};
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("QueryHelper", queryHelperStub);
      handlerHelperFactory.__set__("generateListHandler", handlerSpy2);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              foreignField: "foreignField"
            }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){return "TEST"});

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};

      var request = { query: {}, params: { ownerId: "_id" }, noReply: true };
      var extendedRequest = extend({}, request);
      extendedRequest.query.$where = extend({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "generateListHandler called 1");
        t.ok(handlerSpy1.calledWithExactly(extendedRequest, reply), "generateListHandler called 2");
        t.ok(reply.calledWithExactly([{_id: "childId1"},{_id: "childId2"}]), "reply called with correct result");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.generateAssociationGetAllHandler calls reply with a processing error
  .then(function() {
    return t.test('handler-helper-factory.generateAssociationGetAllHandler calls reply with a processing error', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var boomStub = sandbox.stub(require('boom'));
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      handlerHelperFactory.__set__("Boom", boomStub);
      handlerHelperFactory = handlerHelperFactory(mongoose, server);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              foreignField: "foreignField"
            }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);
      userModel.findOne = sandbox.spy(function(){ throw("error message") });

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};

      var request = { params: { ownerId: "ownerId", childId: "childId" } };
      request.payload = ["child1", "child2", "child3"];
      var deferred = Q.defer();
      var reply = sandbox.spy(function(){ return deferred.resolve() });
      //</editor-fold>

      //<editor-fold desc="Act">
      handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      });
      //</editor-fold>
    });
  })

});

test('handler-helper-factory.setAssociation', function(t) {

  return Q.when()

  //handler-helper-factory.setAssociation calls model.findOne
  .then(function() {
    return t.test('setAssociation calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var setAssociation = handlerHelperFactory.__get__("setAssociation");
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      var userObject = {};

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);
      var deferred = Q.defer();
      childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};

      var associationName = association.include.as;

      var childId = "1";

      var request = { query: {}, params: { ownerId: "_id" } };
      //</editor-fold>

      //<editor-fold desc="Act">
      setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(childModel.findOne.calledWithExactly({'_id': childId}), "model.findOne called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.setAssociation handles ONE_MANY relationships
  .then(function() {
    return t.test('setAssociation handles ONE_MANY relationships', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var setAssociation = handlerHelperFactory.__get__("setAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
      Qstub.defer = function(){ return deferredSpy };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "ONE_MANY",
              foreignField: "parent"
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var userObject = { _id: "_id" };

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, parent: {} };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};

      var associationName = association.include.as;

      var childId = "1";

      var request = { query: {}, params: { ownerId: "_id" } };
      //</editor-fold>

      //<editor-fold desc="Act">
      setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(deferredSpy.resolve.called, "deferred.resolve called");
        t.ok(childObject.save.called, "childObject.save called");
        t.equals(childObject.parent, "_id", "childObject updated");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.setAssociation creates a MANY_MANY association instance if it doesn't exist
  .then(function() {
    return t.test('setAssociation creates a MANY_MANY association instance if it doesn\'t exist', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var setAssociation = handlerHelperFactory.__get__("setAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "MANY_MANY",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { save: saveUser, _id: "1", children: [] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, _id: "2", users: [] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};

      var associationName = association.include.as;

      var childId = "1";

      var request = { query: {}, params: { ownerId: "_id" }, payload: [""] };
      //</editor-fold>

      //<editor-fold desc="Act">
      setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(deferredSpy.resolve.called, "deferred.resolve called");
        t.ok(childObject.save.called, "childObject.save called");
        t.ok(userObject.save.called, "userObject.save called");
        t.deepEqual(userObject.children, [{child: "2"}], "association added to userObject");
        t.deepEqual(childObject.users, [{user: "1"}], "association added to childObject");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.setAssociation updates a MANY_MANY association instance if it exists
  .then(function() {
    return t.test('setAssociation updates a MANY_MANY association instance if it exists', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var setAssociation = handlerHelperFactory.__get__("setAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "MANY_MANY",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};

      var associationName = association.include.as;

      var childId = "3";

      var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
      //</editor-fold>

      //<editor-fold desc="Act">
      setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(deferredSpy.resolve.called, "deferred.resolve called");
        t.ok(childObject.save.called, "childObject.save called");
        t.ok(userObject.save.called, "userObject.save called");
        t.deepEqual(userObject.children, [{ _id: "_id", child: "3", value: "no"}], "userObject updated");
        t.deepEqual(childObject.users, [{ _id: "_id", user: "1", value: "no"}], "childObject updated");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.setAssociation rejects a promise if the association type is invalid
  .then(function() {
    return t.test('setAssociation rejects a promise if the association type is invalid', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var setAssociation = handlerHelperFactory.__get__("setAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "BAD",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};

      var associationName = association.include.as;

      var childId = "3";

      var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
      //</editor-fold>

      //<editor-fold desc="Act">
      setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function(error) {
        t.equal(error, "Association type incorrectly defined.", "error returned");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.setAssociation rejects a promise if the child isn't found
  .then(function() {
    return t.test('setAssociation rejects a promise if the child isn\'t found', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var setAssociation = handlerHelperFactory.__get__("setAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "BAD",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};

      var associationName = association.include.as;

      var childId = "3";

      var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
      //</editor-fold>

      //<editor-fold desc="Act">
      setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function(error) {
        t.equal(error, "Child object not found.", "error returned");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

});

test('handler-helper-factory.removeAssociation', function(t) {

  return Q.when()

  //handler-helper-factory.removeAssociation calls model.findOne
  .then(function() {
    return t.test('removeAssociation calls model.findOne', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var removeAssociation = handlerHelperFactory.__get__("removeAssociation");
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});

      var userModel = mongoose.model("user", userSchema);

      var userObject = {};

      var childSchema = new mongoose.Schema({});

      var childModel = mongoose.model("child", childSchema);
      var deferred = Q.defer();
      childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};

      var associationName = association.include.as;

      var childId = "1";

      var request = { query: {}, params: { ownerId: "_id" } };
      //</editor-fold>

      //<editor-fold desc="Act">
      removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(childModel.findOne.calledWithExactly({'_id': childId}), "model.findOne called");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.removeAssociation handles ONE_MANY relationships
  .then(function() {
    return t.test('removeAssociation handles ONE_MANY relationships', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var removeAssociation = handlerHelperFactory.__get__("removeAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
      Qstub.defer = function(){ return deferredSpy };
      handlerHelperFactory.__set__("Q", Qstub);
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "ONE_MANY",
              foreignField: "parent"
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var userObject = { _id: "_id" };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "ONE_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, parent: "_id" };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var associationName = "children";

      var childId = "1";

      var request = { query: {}, params: { ownerId: "_id" } };
      //</editor-fold>

      //<editor-fold desc="Act">
      removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(deferredSpy.resolve.called, "deferred.resolve called");
        t.ok(childObject.save.called, "childObject.save called");
        t.notOk(childObject.parent, "association removed");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })


  //handler-helper-factory.removeAssociation handles MANY_MANY relationships
  .then(function() {
    return t.test('removeAssociation handles MANY_MANY relationships', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var removeAssociation = handlerHelperFactory.__get__("removeAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "MANY_MANY",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { _id: "2", save: saveUser, children: [{child: "1"},{child: "2"}] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { _id: "1", save: saveChild, users: [{user: "1"},{user: "2"}] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var associationName = "children";

      var childId = "1";

      var request = { query: {}, params: { ownerId: "_id" } };
      //</editor-fold>

      //<editor-fold desc="Act">
      removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function() {
        t.ok(deferredSpy.resolve.called, "deferred.resolve called");
        t.ok(childObject.save.called, "childObject.save called");
        t.ok(userObject.save.called, "userObject.save called");
        t.deepEqual(userObject.children, [{child: "2"}], "association removed from userObject");
        t.deepEqual(childObject.users, [{user: "1"}], "association removed from childObject");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.removeAssociation rejects a promise if the association type is invalid
  .then(function() {
    return t.test('removeAssociation rejects a promise if the association type is invalid', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var removeAssociation = handlerHelperFactory.__get__("removeAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "BAD",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};

      var associationName = association.include.as;

      var childId = "3";

      var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
      //</editor-fold>

      //<editor-fold desc="Act">
      removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function(error) {
        t.equal(error, "Association type incorrectly defined.", "error returned");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

  //handler-helper-factory.removeAssociation rejects a promise if the child isn't found
  .then(function() {
    return t.test('removeAssociation rejects a promise if the child isn\'t found', function (t) {
      //<editor-fold desc="Arrange">
      var sandbox = sinon.sandbox.create();
      var Log = logger.bind("handler-helper-factory");
      var server = sandbox.spy();
      var handlerHelperFactory = rewire('../utilities/handler-helper-factory');
      var removeAssociation = handlerHelperFactory.__get__("removeAssociation");
      var Qstub = {};
      var deferred = Q.defer();
      var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
      Qstub.defer = function(){ return deferredSpy };
      Qstub.all = function(){ return Q.when() };
      handlerHelperFactory.__set__("Q", Qstub);
      // sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      userSchema.statics = {
        routeOptions: {
          associations: {
            children: {
              type: "BAD",
            }
          }
        }
      }

      var userModel = mongoose.model("user", userSchema);

      var saveUser = sandbox.spy(function(){ return Q.when() });
      var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };

      var childSchema = new mongoose.Schema({});
      childSchema.statics = {
        routeOptions: {
          associations: {
            users: {
              type: "MANY_MANY",
              model: "user",
              include: {
                as: "users"
              }
            }
          }
        }
      }

      var childModel = mongoose.model("child", childSchema);

      var saveChild = sandbox.spy(function(){ return Q.when() });
      var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
      childModel.findOne = sandbox.spy(function(){ return Q.when(); });

      var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};

      var associationName = association.include.as;

      var childId = "3";

      var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
      //</editor-fold>

      //<editor-fold desc="Act">
      removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
      //</editor-fold>

      //<editor-fold desc="Assert">
      return deferred.promise.then(function(error) {
        t.equal(error, "Child object not found.", "error returned");
      })
      //</editor-fold>

      //<editor-fold desc="Restore">
      .then(function() {
        sandbox.restore();
        delete mongoose.models.user;
        delete mongoose.modelSchemas.user;
        delete mongoose.models.child;
        delete mongoose.modelSchemas.child;
      })
      //</editor-fold>
    });
  })

});
