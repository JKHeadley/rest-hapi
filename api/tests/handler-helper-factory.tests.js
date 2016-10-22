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
      sandbox.stub(Log, 'error', function(){});

      var userSchema = new mongoose.Schema({});
      var postDeferred = Q.defer();
      var postSpy = sandbox.spy(function() {
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

      var request = { params: { id: "TEST" }};
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

      var request = { query: {}, params: { id: {}} };
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
      userSchema.methods = {
        routeOptions: {
          find: {
            post: postSpy
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { id: {}} };
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

      var request = { query: {}, params: { id: {}} };
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
      userSchema.methods = {
        routeOptions: {
          find: {
            post: function(){ return postDeferred.promise }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { id: {}} };
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
      userSchema.methods = {
        routeOptions: {
          find: {
            post: function(){ return postDeferred.promise }
          }
        }
      };

      var userModel = mongoose.model("user", userSchema);

      userModel.findOne = sandbox.spy();

      var request = { query: {}, params: { id: "TEST"} };
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

      var request = { query: {}, params: { id: "TEST"} };
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

      var request = { query: {}, params: { id: "TEST"} };
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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
      userSchema.methods = {
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