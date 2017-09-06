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

test('handler-helper exists and has expected members', function (t) {
  //<editor-fold desc="Arrange">
  var server = sinon.spy();
  var Log = logger.bind("handler-helper");
  var handlerHelper = require('../utilities/handler-helper');

  t.plan(21);
  //</editor-fold>

  //<editor-fold desc="Assert">
  t.ok(handlerHelper, "handler-helper exists.");
  t.ok(handlerHelper.list, "handler-helper.list exists.");
  t.ok(handlerHelper.find, "handler-helper.find exists.");
  t.ok(handlerHelper.create, "handler-helper.create exists.");
  t.ok(handlerHelper.deleteOne, "handler-helper.deleteOne exists.");
  t.ok(handlerHelper.deleteMany, "handler-helper.deleteMany exists.");
  t.ok(handlerHelper.update, "handler-helper.update exists.");
  t.ok(handlerHelper.addOne, "handler-helper.addOne exists.");
  t.ok(handlerHelper.removeOne, "handler-helper.removeOne exists.");
  t.ok(handlerHelper.addMany, "handler-helper.addMany exists.");
  t.ok(handlerHelper.getAll, "handler-helper.getAll exists.");
  t.ok(handlerHelper.listHandler, "handler-helper.listHandler exists.");
  t.ok(handlerHelper.findHandler, "handler-helper.findHandler exists.");
  t.ok(handlerHelper.createHandler, "handler-helper.createHandler exists.");
  t.ok(handlerHelper.deleteOneHandler, "handler-helper.deleteOneHandler exists.");
  t.ok(handlerHelper.deleteManyHandler, "handler-helper.deleteManyHandler exists.");
  t.ok(handlerHelper.updateHandler, "handler-helper.updateHandler exists.");
  t.ok(handlerHelper.addOneHandler, "handler-helper.addOneHandler exists.");
  t.ok(handlerHelper.removeOneHandler, "handler-helper.removeOneHandler exists.");
  t.ok(handlerHelper.addManyHandler, "handler-helper.addManyHandler exists.");
  t.ok(handlerHelper.getAllHandler, "handler-helper.getAllHandler exists.");
  //</editor-fold>
});

test('handler-helper.listHandler', function (t) {

  return Q.when()

  //handler-helper.listHandler calls model.find()
      .then(function () {
        return t.test('handler-helper.listHandler calls model.find()', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy();
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, { query: {} }, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function (){
            t.ok(userModel.find.called, "find called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function (){
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler calls QueryHelper.createMongooseQuery
      .then(function () {
        return t.test('handler-helper.listHandler calls QueryHelper.createMongooseQuery', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy(function () {
            return "TEST"
          });

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function () {
            t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, query, "TEST", Log), "createMongooseQuery called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function (){
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler calls mongooseQuery.count
      .then(function () {
        return t.test('handler-helper.listHandler calls mongooseQuery.count', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var countSpy = sandbox.spy()
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return {
              lean: function () {
                return {count: countSpy}
              }
            }
          };
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy(function () {
            return "TEST"
          });

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function (){
            t.ok(countSpy.called, "count called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function (){
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler calls QueryHelper.paginate
      .then(function () {
        return t.test('handler-helper.listHandler calls QueryHelper.paginate', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var countSpy = sandbox.spy(function () {
            return Q.when()
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          var paginateDeferred = Q.defer();
          var paginateSpy = sandbox.spy(function () {
            paginateDeferred.resolve()
          });
          queryHelperStub.paginate = paginateSpy;
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy(function () {
            return "TEST"
          });

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          var LogStub = sandbox.stub(Log, 'error', function () {
          });
          //<editor-fold desc="Act">
          handlerHelper.listHandler(userModel, request, LogStub);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return paginateDeferred.promise.then(function () {
            t.ok(queryHelperStub.paginate.calledWithExactly(query, mongooseQuery1, LogStub), "paginate called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
                return Q.when();
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler calls mongooseQuery.exec
      .then(function () {
        return t.test('handler-helper.listHandler calls mongooseQuery.exec', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var countSpy = sandbox.spy(function () {
            return Q.when()
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          var deferred = Q.defer();
          var execSpy = sandbox.spy(function () {
            deferred.resolve()
          });
          var paginateSpy = sandbox.spy(function () {
            return {exec: execSpy}
          });
          queryHelperStub.paginate = paginateSpy;
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy(function () {
            return "TEST"
          });

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return deferred.promise.then(function () {
            t.ok(execSpy.calledWithExactly('find'), "exec called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
                return Q.when();
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler calls pre processing if it exists
      .then(function () {
        return t.test('handler-helper.listHandler calls pre processing if it exists', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var preDeferred = Q.defer();
          var preSpy = sandbox.spy(function () {
            preDeferred.resolve();
          });
          userSchema.statics = {
            routeOptions: {
              list: {
                pre: preSpy
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy();

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return preDeferred.promise.then(function () {
            t.ok(preSpy.calledWithExactly(query, request, Log), "list.pre called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler calls post processing if it exists
      .then(function () {
        return t.test('handler-helper.listHandler calls post processing if it exists', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var countSpy = sandbox.spy(function () {
            return Q.when()
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          var deferred = Q.defer();
          deferred.resolve("TEST");
          var execSpy = sandbox.spy(function () {
            return deferred.promise
          });
          var paginateSpy = sandbox.spy(function () {
            return {exec: execSpy}
          });
          queryHelperStub.paginate = paginateSpy;

          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var postDeferred = Q.defer();
          var postSpy = sandbox.spy(function () {
            postDeferred.resolve();
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

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return postDeferred.promise.then(function () {
            t.ok(postSpy.calledWithExactly(request, "TEST", Log), "list.post called");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler returns a list of results
      .then(function () {
        return t.test('handler-helper.listHandler returns a list of results', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var deferred = Q.defer();
          var countSpy = sandbox.spy(function () {
            return Q.when()
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          var result = ["TEST1", "TEST2"];
          deferred.resolve(result);
          var execSpy = sandbox.spy(function () {
            return deferred.promise
          });
          var paginateSpy = sandbox.spy(function () {
            return {exec: execSpy}
          });
          queryHelperStub.paginate = paginateSpy;

          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function () {
          });

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy();

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function (result) {
            t.deepEqual(result.docs, ["TEST1", "TEST2"], "returns list of mapped result");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler returns pagination data
      .then(function () {
        return t.test('handler-helper.listHandler returns pagination data', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var deferred = Q.defer();
          var result = ["TEST1", "TEST2", "TEST1", "TEST2", "TEST1", "TEST2", "TEST1", "TEST2", "TEST1", "TEST2", "TEST1", "TEST2"];
          var countSpy = sandbox.spy(function () {
            return Q.when(result.length)
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          deferred.resolve(result);
          var execSpy = sandbox.spy(function () {
            return deferred.promise
          });
          var paginateSpy = sandbox.spy(function () {
            return {exec: execSpy}
          });
          queryHelperStub.paginate = paginateSpy;

          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function () {
          });

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy();

          var query = {$page: 2, $limit: 3};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function (result) {
            t.deepEqual(result.items, {begin: 4, end: 6, limit: 3, total: 12}, "returns correct items data");
            t.deepEqual(result.pages, {
              current: 2,
              hasNext: true,
              hasPrev: true,
              next: 3,
              prev: 1,
              total: 4
            }, "returns correct pages data");
          })
          //</editor-fold>


          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler throws a postprocessing error
      .then(function () {
        return t.test('handler-helper.listHandler throws a postprocessing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var deferred = Q.defer();
          var countSpy = sandbox.spy(function () {
            return Q.when()
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          var result = "";
          deferred.resolve(result);
          var execSpy = sandbox.spy(function () {
            return deferred.promise
          });
          var paginateSpy = sandbox.spy(function () {
            return {exec: execSpy}
          });
          queryHelperStub.paginate = paginateSpy;

          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function () {
          });

          var userSchema = new mongoose.Schema({});
          var postDeferred = Q.defer();
          var error = "error message";
          postDeferred.reject(error);
          userSchema.statics = {
            routeOptions: {
              list: {
                post: function () {
                  return postDeferred.promise
                }
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy();

          var query = {test: {}};
          var request = { query: query };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function (error) {
                t.equals(error.message, "There was a postprocessing error.", "threw a postprocessing error");
              })
          //</editor-fold>

          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler throws a database error
      .then(function () {
        return t.test('handler-helper.listHandler throws a database error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var error = "error message";

          var countSpy = sandbox.spy(function () {
            return Q.when()
          });
          var mongooseQuery1 = {count: countSpy};
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1
            }
          };
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function () {
            return mongooseQuery2
          };
          var execSpy = sandbox.spy(function () {
            return Q.reject(error)
          });
          var paginateSpy = sandbox.spy(function () {
            return {exec: execSpy}
          });
          queryHelperStub.paginate = paginateSpy;

          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function () {
          });

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.find = sandbox.spy();
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, { query: {} }, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function (error) {
                t.equals(error.message, "There was an error accessing the database.", "threw a database error");
              })
          //</editor-fold>

          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler throws a preprocessing error
      .then(function () {
        return t.test('handler-helper.listHandler throws a preprocessing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function () {
          });

          var userSchema = new mongoose.Schema({});
          userSchema.statics = {
            routeOptions: {
              list: {
                pre: function () {
                  return Q.reject("error message");
                }
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, { query: {} }, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function (error) {
                t.equals(error.message, "There was a preprocessing error.", "threw a preprocessing error");
              })
          //</editor-fold>

          //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      })

      //handler-helper.listHandler throws a general processing error
      .then(function () {
        return t.test('handler-helper.listHandler throws a general processing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function () {
          });

          var userSchema = new mongoose.Schema({});
          userSchema.statics = {
            routeOptions: {
              list: {
                pre: function () {
                  throw("error message");
                }
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.listHandler(userModel, { query: {} }, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function (error) {
                t.equals(error.message, "There was an error processing the request.", "threw a general processing error");
              })
              //</editor-fold>

              //<editor-fold desc="Restore">
              .then(function () {
                sandbox.restore();
                delete mongoose.models.user;
                delete mongoose.modelSchemas.user;
              });
          //</editor-fold>
        });
      });

});

test('handler-helper.findHandler', function(t) {

  return Q.when()

  //handler-helper.findHandler calls model.findOne()
      .then(function() {
        return t.test('handler-helper.findHandler calls model.findOne()', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy();

          var request = { params: { _id: "TEST" }};
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function(){
            t.ok(userModel.findOne.calledWithExactly({ _id: "TEST" }), "findOne called");
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

      //handler-helper.findHandler calls QueryHelper.createMongooseQuery
      .then(function() {
        return t.test('handler-helper.findHandler calls QueryHelper.createMongooseQuery', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy(function (){
            return "TEST";
          });

          var request = { query: {}, params: { _id: "TEST" } };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function(){
            t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, request.query, "TEST", Log), "createMongooseQuery called");
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

      //handler-helper.findHandler calls pre processing if it exists
      .then(function() {
        return t.test('handler-helper.findHandler calls pre processing if it exists', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var preDeferred = Q.defer();
          var preSpy = sandbox.spy(function() {
            preDeferred.resolve();
          });
          userSchema.statics = {
            routeOptions: {
              find: {
                pre: preSpy
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy();

          var request = { query: {}, params: { _id: {}} };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return preDeferred.promise.then(function() {
                t.ok(preSpy.calledWithExactly("TEST", request.query, request, Log), "find.pre called");
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

      //handler-helper.findHandler calls post processing if it exists
      .then(function() {
        return t.test('handler-helper.findHandler calls post processing if it exists', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var mongooseQuery1 = {
            exec: function(){ return Q.when("TEST") }
          };
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1;
            }
          };

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function(){
            return mongooseQuery2;
          };
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var deferred = Q.defer();
          var postSpy = sandbox.spy(function() {
            deferred.resolve();
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
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return deferred.promise.then(function() {
            t.ok(postSpy.calledWithExactly(request, "TEST", Log), "find.post called");
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

      //handler-helper.findHandler returns a single result
      .then(function() {
        return t.test('handler-helper.findHandler returns a single result', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var mongooseQuery1 = {
            exec: function(){ return Q.when("TEST1") }
          };
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1;
            }
          };

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function(){
            return mongooseQuery2;
          };

          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy();

          var request = { query: {}, params: { _id: {}} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function (result) {
            // Log.error(reply.args[0]);
            t.deepEqual(result, "TEST1", "returns single result");
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

      //handler-helper.findHandler throws a postprocessing error
      .then(function() {
        return t.test('handler-helper.findHandler throws a postprocessing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var mongooseQuery1 = {
            exec: function(){ return Q.when("TEST") }
          };
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1;
            }
          };

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function(){
            return mongooseQuery2;
          };

          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var postDeferred = Q.defer();
          var error = "error message";
          postDeferred.reject(error);
          userSchema.statics = {
            routeOptions: {
              find: {
                post: function(){
                  return postDeferred.promise;
                }
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy();

          var request = { query: {}, params: { _id: {}} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function (error) {
                t.equals(error.message, "There was a postprocessing error.", "threw a postprocessing error");
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

      //handler-helper.findHandler throws a not found error
      .then(function() {
        return t.test('handler-helper.findHandler throws a not found error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var mongooseQuery1 = {
            exec: function(){ return Q.when() }
          };
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1;
            }
          };

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function(){
            return mongooseQuery2;
          };

          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy();

          var request = { query: {}, params: { _id: "TEST"} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function (error) {
                t.equals(error.message, "No resource was found with that id.", "threw a not found error");
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

      //handler-helper.findHandler replies with a database error
      .then(function() {
        return t.test('handler-helper.findHandler replies with a database error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();

          var mongooseQuery1 = {
            exec: function(){ return Q.reject("error") }
          };
          var mongooseQuery2 = {
            lean: function () {
              return mongooseQuery1;
            }
          };

          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createMongooseQuery = function(){
            return mongooseQuery2;
          };

          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);

          userModel.findOne = sandbox.spy();

          var request = { query: {}, params: { _id: "TEST"} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was an error accessing the database.", "threw a database error");
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

      //handler-helper.findHandler throws a preprocessing error
      .then(function() {
        return t.test('handler-helper.findHandler throws a preprocessing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          userSchema.statics = {
            routeOptions: {
              find: {
                pre: function(){
                  return Q.reject("error message");
                }
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          var request = { query: {}, params: { _id: "TEST"} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was an error preprocessing the request.", "threw a preprocessing error");
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

      //handler-helper.findHandler throws a general processing error
      .then(function() {
        return t.test('handler-helper.findHandler throws a general processing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          userSchema.statics = {
            routeOptions: {
              find: {
                pre: function(){
                  throw("error message");
                }
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          var request = { query: {}, params: { _id: "TEST"} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.findHandler(userModel, "TEST", request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was an error processing the request.", "threw a general processing error");
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

test('handler-helper.createHandler', function(t) {

  return Q.when()

  //handler-helper.createHandler calls pre processing if it exists
      .then(function() {
        return t.test('handler-helper.createHandler calls pre processing if it exists', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});
          var preDeferred = Q.defer();
          var preSpy = sandbox.spy(function(payload) {
            preDeferred.resolve();
            return Q.when(payload);
          });
          userSchema.statics = {
            routeOptions: {
              create: {
                pre: preSpy
              }
            }
          };

          var userModel = mongoose.model("user", userSchema);

          var payload = { field: "value" };
          var request = { payload: payload };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return preDeferred.promise.then(function() {
            t.ok(preSpy.calledWithExactly(payload, request, Log), "create.pre called");
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

      //handler-helper.createHandler calls model.create
      .then(function() {
        return t.test('handler-helper.createHandler calls model.create', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);
          var createDeferred = Q.defer();
          userModel.create = sandbox.spy(function(){
            return createDeferred.resolve();
          });

          var payload = { field: "value" };
          var request = { payload: payload };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return createDeferred.promise.then(function() {
            // use sinon.match to allow for added date fields
            t.ok(userModel.create.calledWithExactly([sinon.match(payload)]), "model.create called");
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

      //handler-helper.createHandler calls QueryHelper.createAttributesFilter
      .then(function() {
        return t.test('handler-helper.createHandler calls QueryHelper.createAttributesFilter', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          var deferred = Q.defer();
          queryHelperStub.createAttributesFilter = sandbox.spy(function(){
            return deferred.resolve();
          });
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);
          userModel.create = sandbox.spy(function(){
            return Q.when()
          });

          var request = { query: "TEST", payload: {} };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return deferred.promise.then(function() {
            t.ok(queryHelperStub.createAttributesFilter.calledWithExactly({}, userModel, Log), "queryHelperStub.createAttributesFilter called");
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

      //handler-helper.createHandler calls model.find
      .then(function() {
        return t.test('handler-helper.createHandler calls model.find', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);
          userModel.create = sandbox.spy(function(){ return Q.when([{ _id: "TEST" }]) });
          var deferred = Q.defer();
          userModel.find = sandbox.spy(function(){ return deferred.resolve() });

          var request = { query: {}, payload: {} };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return deferred.promise.then(function() {
            // TODO create used to call findOne() with query and attributes as args
            //      now calls find() with no args but chains additional calls
            //      should test those chained calls
            t.ok(userModel.find.calledWithExactly(), "model.find called");
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

      //handler-helper.createHandler calls create.post if it exists
      .then(function() {
        return t.test('handler-helper.createHandler calls create.post if it exists', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var errorHelperStub = sandbox.stub(require('../utilities/error-helper'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            './error-helper': errorHelperStub
          });
          // sandbox.stub(Log, 'error', function(){});

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
          userModel.create = sandbox.spy(function(){ return Q.when([{ _id: "TEST" }]) });

          var findExec = function(){
            return Q.when([{ _id: "TEST" }]);
          };
          var findLean = function(){
            return { exec: findExec };
          };
          var findSelect = function(){
            return { lean: findLean };
          };
          var findWhere = function(){
            return { select: findSelect };
          };

          userModel.find = sandbox.spy(function(){
            return { where: findWhere };
          });

          var request = { query: {}, payload: {} };
          //</editor-fold>

          //<editor-fold desc="Act">
          handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return deferred.promise.then(function() {
            t.ok(postSpy.calledWithExactly({ _id: "TEST" }, request, [{ _id: "TEST" }], Log), "create.post called");
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

      //handler-helper.createHandler returns single result when payload is not an array
      .then(function() {
        return t.test('handler-helper.createHandler returns single result when payload is not an array', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);
          userModel.create = sandbox.spy(function(){ return Q.when([{ _id: "TEST" }]) });

          //NOTE: payload is an object so we expect a single object to be returned
          var payload = { _id: '3' };

          var findExec = function(){
            return Q.when([payload]);
          };
          var findLean = function(){
            return { exec: findExec };
          };
          var findSelect = function(){
            return { lean: findLean };
          };
          var findWhere = function(){
            return { select: findSelect };
          };

          userModel.find = sandbox.spy(function(){
            return { where: findWhere };
          });

          var request = { query: {}, payload: payload };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function(result) {
            t.deepEqual(result, payload, "returned single result");
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

      //handler-helper.createHandler returns an array when payload is an array
      .then(function() {
        return t.test('handler-helper.createHandler returns an array when payload is an array', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub
          });
          sandbox.stub(Log, 'error', function(){});

          var userSchema = new mongoose.Schema({});

          var userModel = mongoose.model("user", userSchema);
          userModel.create = sandbox.spy(function(){ return Q.when([{ _id: "TEST" }]) });

          //NOTE: payload is an array so we expect an array to be returned
          var payload = [{ _id: '3' }, { _id: '4' }];

          var findExec = function(){
            return Q.when(payload);
          };
          var findLean = function(){
            return { exec: findExec };
          };
          var findSelect = function(){
            return { lean: findLean };
          };
          var findWhere = function(){
            return { select: findSelect };
          };

          userModel.find = sandbox.spy(function(){
            return { where: findWhere };
          });

          var request = { query: {}, payload: payload };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise.then(function(result) {
            t.deepEqual(result, payload, "returned array");
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

      //handler-helper.createHandler throws a postprocessing error
      .then(function() {
        return t.test('handler-helper.createHandler throws a postprocessing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
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
          userModel.create = sandbox.spy(function(){ return Q.when([{ _id: "TEST" }]) });

          var findExec = function(){
            return Q.when([{ _id: "TEST" }]);
          };
          var findLean = function(){
            return { exec: findExec };
          };
          var findSelect = function(){
            return { lean: findLean };
          };
          var findWhere = function(){
            return { select: findSelect };
          };

          userModel.find = sandbox.spy(function(){
            return { where: findWhere };
          });

          var request = { query: {}, payload: {} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was a postprocessing error creating the resource.", "threw a postprocessing error");
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

      //handler-helper.createHandler throws a create error
      .then(function() {
        return t.test('handler-helper.createHandler throws a create error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
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

          var findExec = function(){
            return Q.when([{ _id: "TEST" }]);
          };
          var findLean = function(){
            return { exec: findExec };
          };
          var findSelect = function(){
            return { lean: findLean };
          };
          var findWhere = function(){
            return { select: findSelect };
          };

          userModel.find = sandbox.spy(function(){
            return { where: findWhere };
          });

          var request = { query: {}, payload: {} };
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was an error creating the resource.", "threw a create error");
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

      //handler-helper.createHandler throws a preprocessing error
      .then(function() {
        return t.test('handler-helper.createHandler throws a preprocessing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
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
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was a preprocessing error creating the resource.", "threw a preprocessing error");
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

      //handler-helper.createHandler throws a general processing error
      .then(function() {
        return t.test('handler-helper.createHandler throws a general processing error', function (t) {
          //<editor-fold desc="Arrange">
          var sandbox = sinon.sandbox.create();
          var Log = logger.bind("handler-helper");
          var server = sandbox.spy();
          var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
          queryHelperStub.createAttributesFilter = function(){ return "attributes" };
          var boomStub = sandbox.stub(require('boom'));
          var handlerHelper = proxyquire('../utilities/handler-helper', {
            './query-helper': queryHelperStub,
            'boom': boomStub
          });
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
          //</editor-fold>

          //<editor-fold desc="Act">
          var promise = handlerHelper.createHandler(userModel, request, Log);
          //</editor-fold>

          //<editor-fold desc="Assert">
          return promise
              .catch(function(error) {
                t.equals(error.message, "There was an error processing the request.", "threw a general processing error");
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

// test('handler-helper.delete', function(t) {
//
//   return Q.when()
//
//   //handler-helper.delete calls pre processing if it exists
//   .then(function() {
//     return t.test('handler-helper.delete calls pre processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       var preDeferred = Q.defer();
//       var preSpy = sandbox.spy(function() {
//         preDeferred.resolve() ;
//       });
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             pre: preSpy
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var request = { query: {} };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return preDeferred.promise.then(function() {
//         t.ok(preSpy.calledWithExactly(request, Log), "delete.pre called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls model.findByIdAndRemove
//   .then(function() {
//     return t.test('handler-helper.delete calls model.findByIdAndRemove', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       var deferred = Q.defer();
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return deferred.resolve() });
//
//       var request = { query: {}, params: { _id: "TEST" } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(userModel.findByIdAndRemove.calledWithExactly("TEST"), "model.findByIdAndRemove called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls create.post if it exists
//   .then(function() {
//     return t.test('handler-helper.delete calls delete.post if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       var deferred = Q.defer();
//       var postSpy = sandbox.spy(function(){ return deferred.resolve() });
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             post: postSpy
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when("TEST") });
//
//       var request = { query: {}, params: { _id: {} } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(postSpy.calledWithExactly(request, "TEST", Log), "delete.post called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls reply
//   .then(function() {
//     return t.test('handler-helper.delete calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when() });
//
//       var request = { query: {}, params: { _id: {} } };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls reply with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper.delete calls reply with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             post: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when("TEST") });
//
//       var request = { query: {}, params: { _id: {} } };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error deleting the resource", "error message"), "reply called with a postprocessing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.delete calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when() });
//
//       var request = { query: {}, params: { _id: {} } };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No resource was found with that id."), "reply called with a not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls reply with a preprocessing error
//   .then(function() {
//     return t.test('handler-helper.delete calls reply with a preprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             pre: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var request = { query: {}, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a preprocessing error deleting the resource", "error message"), "reply called with a preprocessing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.delete calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.delete calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             pre: function(){ throw("error message") }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var request = { query: {}, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.delete(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with a processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.update', function(t) {
//
//   return Q.when()
//
//   //handler-helper.update calls pre processing if it exists
//   .then(function() {
//     return t.test('handler-helper.update calls pre processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       var preDeferred = Q.defer();
//       var preSpy = sandbox.spy(function() {
//         preDeferred.resolve() ;
//       });
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             pre: preSpy
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var request = { query: {} };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return preDeferred.promise.then(function() {
//         t.ok(preSpy.calledWithExactly(request, Log), "update.pre called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls model.findByIdAndUpdate
//   .then(function() {
//     return t.test('handler-helper.update calls model.findByIdAndUpdate', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       var createDeferred = Q.defer();
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return createDeferred.resolve() });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: "TEST" };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return createDeferred.promise.then(function() {
//         t.ok(userModel.findByIdAndUpdate.calledWithExactly("_id", "TEST"), "model.findByIdAndUpdate called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls QueryHelper.createAttributesFilter
//   .then(function() {
//     return t.test('handler-helper.update calls QueryHelper.createAttributesFilter', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       var deferred = Q.defer();
//       queryHelperStub.createAttributesFilter = sandbox.spy(function(){ return deferred.resolve() });
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({}) });
//
//       var request = { query: "TEST", params: { _id: "_id" }, payload: {} };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(queryHelperStub.createAttributesFilter.calledWithExactly("TEST", userModel, Log), "queryHelperStub.createAttributesFilter called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.update calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: "TEST" }) });
//       var deferred = Q.defer();
//       userModel.findOne = sandbox.spy(function(){ return deferred.resolve() });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: {} };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(userModel.findOne.calledWithExactly({ '_id': "TEST"}, "attributes"), "model.findOne called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls update.post if it exists
//   .then(function() {
//     return t.test('handler-helper.update calls update.post if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       var deferred = Q.defer();
//       var postSpy = sandbox.spy(function(){ return deferred.resolve() });
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             post: postSpy
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return "TEST" }}) });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: {} };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(postSpy.calledWithExactly(request, "TEST", Log), "update.post called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls reply with result
//   .then(function() {
//     return t.test('handler-helper.update calls reply with result', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.calledWithExactly({ _id: '3' }), "reply called with result");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls reply with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper.update calls reply with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             post: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error updating the resource", "error message"), "reply called with a postprocessing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.update calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when() });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No resource was found with that id."), "reply called with a not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls reply with a update error
//   .then(function() {
//     return t.test('handler-helper.update calls reply with a update error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.reject("error message") });
//
//       var request = { query: {}, params: { _id: "_id" }, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.serverTimeout.calledWithExactly("There was an error updating the resource", "error message"), "reply called with a create error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls reply with a preprocessing error
//   .then(function() {
//     return t.test('handler-helper.update calls reply with a preprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             pre: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var request = { query: {}, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a preprocessing error updating the resource", "error message"), "reply called with a preprocessing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.update calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.update calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             pre: function(){ throw("error message") }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var request = { query: {}, payload: {} };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.update(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with a processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function(){
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.addOne', function(t) {
//
//   return Q.when()
//
//   //handler-helper.addOne calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.addOne calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls setAssociation
//   .then(function() {
//     return t.test('handler-helper.addOne calls setAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var deferred = Q.defer();
//       var setAssociation = sandbox.spy(function(){ return deferred.resolve() });
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(setAssociation.calledWithExactly({ params: { ownerId: "ownerId", childId: "childId" }, payload: [ 'TEST' ] }, server, userModel, "ownerObject", childModel, "childId", "CHILD", {}, Log), "setAssociation called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var setAssociation = sandbox.spy(function(){ return Q.when() });
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while setting the association.", "error message"), "reply called with association error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.removeOne', function(t) {
//
//   return Q.when()
//
//   //handler-helper.removeOne calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.removeOne calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls removeAssociation
//   .then(function() {
//     return t.test('handler-helper.removeOne calls removeAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var deferred = Q.defer();
//       var removeAssociation = sandbox.spy(function(){ return deferred.resolve() });
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("removeAssociation", removeAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(removeAssociation.calledWithExactly(request, server, userModel, "ownerObject", childModel, "childId", "CHILD", {}, Log), "removeAssociation called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var removeAssociation = sandbox.spy(function(){ return Q.when() });
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("removeAssociation", removeAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var removeAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("removeAssociation", removeAssociation);
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while removing the association.", "error message"), "reply called with association error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.addMany', function(t) {
//
//   return Q.when()
//
//   //handler-helper.addMany calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.addMany calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls setAssociation for every childId
//   .then(function() {
//     return t.test('handler-helper.addMany calls setAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var setAssociation = sandbox.spy(function(){ return Q.when() });
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.equals(setAssociation.callCount, 3, "setAssociation called for each child");
//         t.ok(setAssociation.getCall(2).calledWithExactly(request, server, userModel, "ownerObject", childModel, "child3", "CHILD", {}, Log), "setAssociation called with correct args");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var setAssociation = sandbox.spy(function(){ return Q.when() });
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while setting the associations.", "error message"), "reply called with association error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.getAll', function(t) {
//
//   return Q.when()
//
//   //handler-helper.getAll calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.getAll calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             CHILD: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll calls QueryHelper.createMongooseQuery
//   .then(function() {
//     return t.test('handler-helper.getAll calls QueryHelper.createMongooseQuery', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       var handlerHelper = proxyquire('../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//       });
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             CHILD: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "CHILD", model: childModel }};
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       var ownerRequest = { query: { $embed: "CHILD", populateSelect: "_id,foreignField" } };
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, ownerRequest.query, "TEST", Log), "createMongooseQuery called");
//       //</editor-fold>
//
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll calls list
//   .then(function() {
//     return t.test('handler-helper.getAll calls list', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var deferred = Q.defer();
//       var handlerSpy1 = sandbox.spy(function(){ deferred.resolve() });
//       var handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when({ "children": [{ _id: "childId1"},{ _id: "childId2"}] }) }}};
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("QueryHelper", queryHelperStub);
//       handlerHelper.__set__("list", handlerSpy2);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "children", model: childModel }, model: "child"};
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       var extendedRequest = extend({}, request);
//       extendedRequest.query.$where = extend({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       var reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "list called 1");
//         t.ok(handlerSpy1.calledWithExactly(extendedRequest, reply), "list called 2");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll handles MANY_MANY associations with linkingModels
//   .then(function() {
//     return t.test('handler-helper.getAll handles MANY_MANY associations with linkingModels', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var deferred = Q.defer();
//       var handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
//       var handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
//         return Q.when(
//           {
//             "children": [
//               { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
//               { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
//               ]
//           })
//       }}};
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("QueryHelper", queryHelperStub);
//       handlerHelper.__set__("list", handlerSpy2);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       var request = { query: {}, params: { ownerId: "_id" }, noReply: true };
//       var extendedRequest = extend({}, request);
//       extendedRequest.query.$where = extend({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "list called 1");
//         t.ok(handlerSpy1.calledWithExactly(extendedRequest, reply), "list called 2");
//         t.ok(reply.calledWithExactly([{_id: "childId1", link: {value: "value1"}},{_id: "childId2", link: {value: "value2"}}]), "reply called with correct result");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll handles MANY_MANY associations without linkingModels
//   .then(function() {
//     return t.test('handler-helper.getAll handles MANY_MANY associations without linkingModels', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var deferred = Q.defer();
//       var handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
//       var handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       var queryHelperStub = sandbox.stub(require('../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
//         return Q.when(
//           {
//             "children": [
//               { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
//               { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
//             ]
//           })
//       }}};
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("QueryHelper", queryHelperStub);
//       handlerHelper.__set__("list", handlerSpy2);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       var request = { query: {}, params: { ownerId: "_id" }, noReply: true };
//       var extendedRequest = extend({}, request);
//       extendedRequest.query.$where = extend({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "list called 1");
//         t.ok(handlerSpy1.calledWithExactly(extendedRequest, reply), "list called 2");
//         t.ok(reply.calledWithExactly([{_id: "childId1"},{_id: "childId2"}]), "reply called with correct result");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.getAll calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var boomStub = sandbox.stub(require('boom'));
//       var handlerHelper = rewire('../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       var userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       var request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       var deferred = Q.defer();
//       var reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.setAssociation', function(t) {
//
//   return Q.when()
//
//   //handler-helper.setAssociation calls model.findOne
//   .then(function() {
//     return t.test('setAssociation calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var setAssociation = handlerHelper.__get__("setAssociation");
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var userObject = {};
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//       var deferred = Q.defer();
//       childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       var associationName = association.include.as;
//
//       var childId = "1";
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(childModel.findOne.calledWithExactly({'_id': childId}), "model.findOne called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation handles ONE_MANY relationships
//   .then(function() {
//     return t.test('setAssociation handles ONE_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var setAssociation = handlerHelper.__get__("setAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "ONE_MANY",
//               foreignField: "parent"
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var userObject = { _id: "_id" };
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, parent: {} };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       var associationName = association.include.as;
//
//       var childId = "1";
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.equals(childObject.parent, "_id", "childObject updated");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation creates a MANY_MANY association instance if it doesn't exist
//   .then(function() {
//     return t.test('setAssociation creates a MANY_MANY association instance if it doesn\'t exist', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var setAssociation = handlerHelper.__get__("setAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "MANY_MANY",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { save: saveUser, _id: "1", children: [] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, _id: "2", users: [] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       var associationName = association.include.as;
//
//       var childId = "1";
//
//       var request = { query: {}, params: { ownerId: "_id" }, payload: [""] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.ok(userObject.save.called, "userObject.save called");
//         t.deepEqual(userObject.children, [{child: "2"}], "association added to userObject");
//         t.deepEqual(childObject.users, [{user: "1"}], "association added to childObject");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation updates a MANY_MANY association instance if it exists
//   .then(function() {
//     return t.test('setAssociation updates a MANY_MANY association instance if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var setAssociation = handlerHelper.__get__("setAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "MANY_MANY",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       var associationName = association.include.as;
//
//       var childId = "3";
//
//       var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.ok(userObject.save.called, "userObject.save called");
//         t.deepEqual(userObject.children, [{ _id: "_id", child: "3", value: "no"}], "userObject updated");
//         t.deepEqual(childObject.users, [{ _id: "_id", user: "1", value: "no"}], "childObject updated");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation rejects a promise if the association type is invalid
//   .then(function() {
//     return t.test('setAssociation rejects a promise if the association type is invalid', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var setAssociation = handlerHelper.__get__("setAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       var associationName = association.include.as;
//
//       var childId = "3";
//
//       var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Association type incorrectly defined.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation rejects a promise if the child isn't found
//   .then(function() {
//     return t.test('setAssociation rejects a promise if the child isn\'t found', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var setAssociation = handlerHelper.__get__("setAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       var associationName = association.include.as;
//
//       var childId = "3";
//
//       var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Child object not found.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.removeAssociation', function(t) {
//
//   return Q.when()
//
//   //handler-helper.removeAssociation calls model.findOne
//   .then(function() {
//     return t.test('removeAssociation calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var removeAssociation = handlerHelper.__get__("removeAssociation");
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var userObject = {};
//
//       var childSchema = new mongoose.Schema({});
//
//       var childModel = mongoose.model("child", childSchema);
//       var deferred = Q.defer();
//       childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       var associationName = association.include.as;
//
//       var childId = "1";
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(childModel.findOne.calledWithExactly({'_id': childId}), "model.findOne called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeAssociation handles ONE_MANY relationships
//   .then(function() {
//     return t.test('removeAssociation handles ONE_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var removeAssociation = handlerHelper.__get__("removeAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       handlerHelper.__set__("Q", Qstub);
//       sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "ONE_MANY",
//               foreignField: "parent"
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var userObject = { _id: "_id" };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "ONE_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, parent: "_id" };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var associationName = "children";
//
//       var childId = "1";
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.notOk(childObject.parent, "association removed");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//
//   //handler-helper.removeAssociation handles MANY_MANY relationships
//   .then(function() {
//     return t.test('removeAssociation handles MANY_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var removeAssociation = handlerHelper.__get__("removeAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "MANY_MANY",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { _id: "2", save: saveUser, children: [{child: "1"},{child: "2"}] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { _id: "1", save: saveChild, users: [{user: "1"},{user: "2"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var associationName = "children";
//
//       var childId = "1";
//
//       var request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.ok(userObject.save.called, "userObject.save called");
//         t.deepEqual(userObject.children, [{child: "2"}], "association removed from userObject");
//         t.deepEqual(childObject.users, [{user: "1"}], "association removed from childObject");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeAssociation rejects a promise if the association type is invalid
//   .then(function() {
//     return t.test('removeAssociation rejects a promise if the association type is invalid', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var removeAssociation = handlerHelper.__get__("removeAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       var associationName = association.include.as;
//
//       var childId = "3";
//
//       var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Association type incorrectly defined.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeAssociation rejects a promise if the child isn't found
//   .then(function() {
//     return t.test('removeAssociation rejects a promise if the child isn\'t found', function (t) {
//       //<editor-fold desc="Arrange">
//       var sandbox = sinon.sandbox.create();
//       var Log = logger.bind("handler-helper");
//       var server = sandbox.spy();
//       var handlerHelper = rewire('../utilities/handler-helper');
//       var removeAssociation = handlerHelper.__get__("removeAssociation");
//       var Qstub = {};
//       var deferred = Q.defer();
//       var deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error', function(){});
//
//       var userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       var userModel = mongoose.model("user", userSchema);
//
//       var saveUser = sandbox.spy(function(){ return Q.when() });
//       var userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       var childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       var childModel = mongoose.model("child", childSchema);
//
//       var saveChild = sandbox.spy(function(){ return Q.when() });
//       var childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(); });
//
//       var association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       var associationName = association.include.as;
//
//       var childId = "3";
//
//       var request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Child object not found.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
// });
