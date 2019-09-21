'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

const test = require('blue-tape')
const _ = require('lodash')
const sinon = require('sinon')
const rewire = require('rewire')
const proxyquire = require('proxyquire')
const assert = require('assert')
const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const logging = require('loggin')
const logger = logging.getLogger('tests')
logger.logLevel = 'ERROR'
const testHelper = require('../../utilities/test-helper')
const Joi = require('@hapi/joi')
const Q = require('q')

// test('handler-helper-factory exists and has expected members', function (t) {
//   //<editor-fold desc="Arrange">
//   let server = sinon.spy();
//   let Log = logger.bind("handler-helper-factory");
//   let handlerHelperFactory = require('../../utilities/handler-helper-factory')(Log, mongoose, server);
//
//   t.plan(10);
//   //</editor-fold>
//
//   //<editor-fold desc="Assert">
//   t.ok(handlerHelperFactory, "handler-helper-factory exists.");
//   t.ok(handlerHelperFactory.generateListHandler, "handler-helper-factory.generateListHandler exists.");
//   t.ok(handlerHelperFactory.generateFindHandler, "handler-helper-factory.generateFindHandler exists.");
//   t.ok(handlerHelperFactory.generateCreateHandler, "handler-helper-factory.generateCreateHandler exists.");
//   t.ok(handlerHelperFactory.generateDeleteHandler, "handler-helper-factory.generateDeleteHandler exists.");
//   t.ok(handlerHelperFactory.generateUpdateHandler, "handler-helper-factory.generateUpdateHandler exists.");
//   t.ok(handlerHelperFactory.generateAssociationAddOneHandler, "handler-helper-factory.generateAssociationAddOneHandler exists.");
//   t.ok(handlerHelperFactory.generateAssociationRemoveOneHandler, "handler-helper-factory.generateAssociationRemoveOneHandler exists.");
//   t.ok(handlerHelperFactory.generateAssociationAddManyHandler, "handler-helper-factory.generateAssociationAddManyHandler exists.");
//   t.ok(handlerHelperFactory.generateAssociationGetAllHandler, "handler-helper-factory.generateAssociationGetAllHandler exists.");
//   //</editor-fold>
// });
//
// test('handler-helper-factory.generateListHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateListHandler calls model.find()
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler calls model.find()', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy();
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)({}, function(){});
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.find.called, "find called");
//       //</editor-fold>
//
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper-factory.generateListHandler calls QueryHelper.createMongooseQuery
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler calls QueryHelper.createMongooseQuery', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy(function(){ return "TEST" });
//
//       let request = { query: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, request.query, "TEST", Log), "createMongooseQuery called");
//       //</editor-fold>
//
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper-factory.generateListHandler calls post processing if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler calls post processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let deferred = Q.defer();
//       deferred.resolve("TEST");
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return deferred.promise }}};
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let postDeferred = Q.defer();
//       let postSpy = sandbox.spy(function() {
//         postDeferred.resolve() ;
//       });
//       userSchema.statics = {
//         routeOptions: {
//           list: {
//             post: postSpy
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy();
//
//       let request = { query: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return postDeferred.promise.then(function() {
//         t.ok(postSpy.calledWithExactly(request, "TEST", Log), "list.post called");
//       })
//       //</editor-fold>
//
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
//   //handler-helper-factory.generateListHandler replies with a list of results
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler replies with a list of results', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let deferred = Q.defer();
//       let result = [{ toJSON: function(){return "TEST1"} }, { toJSON: function(){return "TEST2"} }];
//       deferred.resolve(result);
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return deferred.promise }}}
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy();
//
//       let request = { query: {} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(reply.calledWithExactly(["TEST1","TEST2"]), "reply called with mapped result");
//       })
//       //</editor-fold>
//
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
//   //handler-helper-factory.generateListHandler returns results with no reply if request.noReply is truthy
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler returns results with no reply if request.noReply is truthy', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let result = [{ toJSON: function(){return "TEST1"} }, { toJSON: function(){return "TEST2"} }];
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when(result) }}}
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy();
//
//       let request = { query: {}, noReply: true };
//       let reply = sandbox.spy();
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       let promise = handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return promise.then(function(mappedResult) {
//         t.deepEquals(mappedResult, ["TEST1","TEST2"], "result returned");
//         t.notOk(reply.called, "reply not called");
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
//   //handler-helper-factory.generateListHandler replies with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler replies with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let deferred = Q.defer();
//       deferred.resolve("");
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return deferred.promise }}}
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let postDeferred = Q.defer();
//       let error = "error message";
//       postDeferred.reject(error);
//       userSchema.statics = {
//         routeOptions: {
//           list: {
//             post: function(){ return postDeferred.promise }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy();
//
//       let request = { query: {} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error.", error), "reply called with postprocessing error");
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
//   //handler-helper-factory.generateListHandler replies with a database error
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler replies with a database error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let error = "error message";
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.reject(error) }}};
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.find = sandbox.spy();
//
//       let request = { query: {} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.serverTimeout.calledWithExactly("There was an error accessing the database.", error), "reply called with database error");
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
//   //handler-helper-factory.generateListHandler replies with a general processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateListHandler replies with a general processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let error = "error message";
//       userModel.find = sandbox.spy(function(){ throw(error) });
//
//       let request = { query: {} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateListHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", error), "reply called with general processing error");
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
//   });
//
// });
//
// test('handler-helper-factory.generateFindHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateFindHandler calls model.findOne()
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler calls model.findOne()', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy();
//
//       let request = { params: { _id: "TEST" }};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, function(){});
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({ '_id': "TEST" }), "findOne called");
//       //</editor-fold>
//
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper-factory.generateFindHandler calls QueryHelper.createMongooseQuery
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler calls QueryHelper.createMongooseQuery', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy(function(){ return "TEST" });
//
//       let request = { query: {}, params: { _id: {}} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, request.query, "TEST", Log), "createMongooseQuery called");
//       //</editor-fold>
//
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper-factory.generateFindHandler calls post processing if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler calls post processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when("TEST") }}};
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let postDeferred = Q.defer();
//       let postSpy = sandbox.spy(function() {
//         postDeferred.resolve() ;
//       });
//       userSchema.statics = {
//         routeOptions: {
//           find: {
//             post: postSpy
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy();
//
//       let request = { query: {}, params: { _id: {}} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return postDeferred.promise.then(function() {
//         t.ok(postSpy.calledWithExactly(request, "TEST", Log), "list.post called");
//       })
//       //</editor-fold>
//
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
//   //handler-helper-factory.generateFindHandler replies with a list of results
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler replies with a single result', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let result = { toJSON: function(){ return "TEST" }}
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when(result) }}}
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy();
//
//       let request = { query: {}, params: { _id: {}} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         Log.error(reply.args[0]);
//         t.ok(reply.calledWithExactly("TEST"), "reply called with result");
//       })
//       //</editor-fold>
//
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
//   //handler-helper-factory.generateFindHandler replies with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler replies with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when("TEST") }}}
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let postDeferred = Q.defer();
//       let error = "error message";
//       postDeferred.reject(error);
//       userSchema.statics = {
//         routeOptions: {
//           find: {
//             post: function(){ return postDeferred.promise }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy();
//
//       let request = { query: {}, params: { _id: {}} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error.", error), "reply called with postprocessing error");
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
//   //handler-helper-factory.generateFindHandler replies with a not found error
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler replies with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when(null) }}}
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let postDeferred = Q.defer();
//       let error = "error message";
//       postDeferred.reject(error);
//       userSchema.statics = {
//         routeOptions: {
//           find: {
//             post: function(){ return postDeferred.promise }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy();
//
//       let request = { query: {}, params: { _id: "TEST"} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("There was no data found with that id.", "TEST"), "reply called with not found error");
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
//   //handler-helper-factory.generateFindHandler replies with a database error
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler replies with a database error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let error = "error message";
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.reject(error) }}};
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       userModel.findOne = sandbox.spy();
//
//       let request = { query: {}, params: { _id: "TEST"} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.serverTimeout.calledWithExactly("There was an error accessing the database.", error), "reply called with database error");
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
//   //handler-helper-factory.generateFindHandler replies with a general processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateFindHandler replies with a general processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let error = "error message";
//       userModel.findOne = sandbox.spy(function(){ throw(error) });
//
//       let request = { query: {}, params: { _id: "TEST"} };
//       let replyDeferred = Q.defer();
//       let reply = sandbox.spy(function() { replyDeferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateFindHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return replyDeferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", error), "reply called with general processing error");
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
//   });
//
// });
//
// test('handler-helper-factory.generateCreateHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateCreateHandler calls pre processing if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls pre processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let preDeferred = Q.defer();
//       let preSpy = sandbox.spy(function() {
//         preDeferred.resolve() ;
//       });
//       userSchema.statics = {
//         routeOptions: {
//           create: {
//             pre: preSpy
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return preDeferred.promise.then(function() {
//         t.ok(preSpy.calledWithExactly(request, Log), "create.pre called");
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
//   //handler-helper-factory.generateCreateHandler calls model.create
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls model.create', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       let createDeferred = Q.defer();
//       userModel.create = sandbox.spy(function(){ return createDeferred.resolve() });
//
//       let request = { query: {}, payload: "TEST" };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return createDeferred.promise.then(function() {
//         t.ok(userModel.create.calledWithExactly("TEST"), "model.create called");
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
//   //handler-helper-factory.generateCreateHandler calls QueryHelper.createAttributesFilter
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls QueryHelper.createAttributesFilter', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let deferred = Q.defer();
//       queryHelperStub.createAttributesFilter = sandbox.spy(function(){ return deferred.resolve() });
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.create = sandbox.spy(function(){ return Q.when() });
//
//       let request = { query: "TEST", payload: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateCreateHandler calls model.findOne
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.create = sandbox.spy(function(){ return Q.when({ _id: "TEST" }) });
//       let deferred = Q.defer();
//       userModel.findOne = sandbox.spy(function(){ return deferred.resolve() });
//
//       let request = { query: {}, payload: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateCreateHandler calls create.post if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls create.post if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let deferred = Q.defer();
//       let postSpy = sandbox.spy(function(){ return deferred.resolve() });
//       userSchema.statics = {
//         routeOptions: {
//           create: {
//             post: postSpy
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.create = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return "TEST" }}) });
//
//       let request = { query: {}, payload: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(postSpy.calledWithExactly(request, "TEST", Log), "create.post called");
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
//   //handler-helper-factory.generateCreateHandler calls reply with result
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls reply with result', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.create = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateCreateHandler calls reply with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls reply with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           create: {
//             post: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.create = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a postprocessing error creating the resource", "error message"), "reply called with a postprocessing error");
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
//   //handler-helper-factory.generateCreateHandler calls reply with a create error
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls reply with a create error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           create: {
//             post: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.create = sandbox.spy(function(){ return Q.reject("error message") });
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.serverTimeout.calledWithExactly("There was an error creating the resource", "error message"), "reply called with a create error");
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
//   //handler-helper-factory.generateCreateHandler calls reply with a preprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls reply with a preprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           create: {
//             pre: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was a preprocessing error creating the resource", "error message"), "reply called with a preprocessing error");
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
//   //handler-helper-factory.generateCreateHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateCreateHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           create: {
//             pre: function(){ throw("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateCreateHandler(userModel, {}, Log)(request, reply);
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
// test('handler-helper-factory.generateDeleteHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateDeleteHandler calls pre processing if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls pre processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let preDeferred = Q.defer();
//       let preSpy = sandbox.spy(function() {
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls model.findByIdAndRemove
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls model.findByIdAndRemove', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       let deferred = Q.defer();
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return deferred.resolve() });
//
//       let request = { query: {}, params: { _id: "TEST" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls create.post if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls delete.post if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let deferred = Q.defer();
//       let postSpy = sandbox.spy(function(){ return deferred.resolve() });
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             post: postSpy
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when("TEST") });
//
//       let request = { query: {}, params: { _id: {} } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls reply
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when() });
//
//       let request = { query: {}, params: { _id: {} } };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls reply with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls reply with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             post: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when("TEST") });
//
//       let request = { query: {}, params: { _id: {} } };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndRemove = sandbox.spy(function(){ return Q.when() });
//
//       let request = { query: {}, params: { _id: {} } };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls reply with a preprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls reply with a preprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             pre: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateDeleteHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateDeleteHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           delete: {
//             pre: function(){ throw("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateDeleteHandler(userModel, {}, Log)(request, reply);
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
// test('handler-helper-factory.generateUpdateHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateUpdateHandler calls pre processing if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls pre processing if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let preDeferred = Q.defer();
//       let preSpy = sandbox.spy(function() {
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls model.findByIdAndUpdate
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls model.findByIdAndUpdate', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       let createDeferred = Q.defer();
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return createDeferred.resolve() });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: "TEST" };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls QueryHelper.createAttributesFilter
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls QueryHelper.createAttributesFilter', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let deferred = Q.defer();
//       queryHelperStub.createAttributesFilter = sandbox.spy(function(){ return deferred.resolve() });
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({}) });
//
//       let request = { query: "TEST", params: { _id: "_id" }, payload: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls model.findOne
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: "TEST" }) });
//       let deferred = Q.defer();
//       userModel.findOne = sandbox.spy(function(){ return deferred.resolve() });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls update.post if it exists
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls update.post if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       let deferred = Q.defer();
//       let postSpy = sandbox.spy(function(){ return deferred.resolve() });
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             post: postSpy
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return "TEST" }}) });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: {} };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls reply with result
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls reply with result', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls reply with a postprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls reply with a postprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             post: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when({ _id: {} }) });
//       userModel.findOne = sandbox.spy(function(){ return Q.when({ toJSON: function(){ return { _id: 3 } }}) });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.when() });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls reply with a update error
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls reply with a update error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findByIdAndUpdate = sandbox.spy(function(){ return Q.reject("error message") });
//
//       let request = { query: {}, params: { _id: "_id" }, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls reply with a preprocessing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls reply with a preprocessing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             pre: function(){ return Q.reject("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateUpdateHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateUpdateHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createAttributesFilter = function(){ return "attributes" };
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//         'boom': boomStub
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           update: {
//             pre: function(){ throw("error message") }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let request = { query: {}, payload: {} };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateUpdateHandler(userModel, {}, Log)(request, reply);
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
// test('handler-helper-factory.generateAssociationAddOneHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateAssociationAddOneHandler calls model.findOne
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddOneHandler calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddOneHandler calls setAssociation
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddOneHandler calls setAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let setAssociation = sandbox.spy(function(){ return deferred.resolve() });
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("setAssociation", setAssociation);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddOneHandler calls reply
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("setAssociation", setAssociation);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddOneHandler calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("setAssociation", setAssociation);
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddOneHandler calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddOneHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddOneHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddOneHandler(userModel, association, {}, Log)(request, reply);
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
// test('handler-helper-factory.generateAssociationRemoveOneHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateAssociationRemoveOneHandler calls model.findOne
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationRemoveOneHandler calls removeAssociation
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls removeAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let removeAssociation = sandbox.spy(function(){ return deferred.resolve() });
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("removeAssociation", removeAssociation);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationRemoveOneHandler calls reply
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let removeAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("removeAssociation", removeAssociation);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationRemoveOneHandler calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let removeAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("removeAssociation", removeAssociation);
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationRemoveOneHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationRemoveOneHandler(userModel, association, {}, Log)(request, reply);
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
// test('handler-helper-factory.generateAssociationAddManyHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateAssociationAddManyHandler calls model.findOne
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddManyHandler calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddManyHandler calls setAssociation for every childId
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddManyHandler calls setAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("setAssociation", setAssociation);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddManyHandler calls reply
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("setAssociation", setAssociation);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddManyHandler calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("setAssociation", setAssociation);
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddManyHandler calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationAddManyHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationAddManyHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationAddManyHandler(userModel, association, {}, Log)(request, reply);
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
// test('handler-helper-factory.generateAssociationGetAllHandler', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.generateAssociationGetAllHandler calls model.findOne
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationGetAllHandler calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationGetAllHandler calls QueryHelper.createMongooseQuery
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationGetAllHandler calls QueryHelper.createMongooseQuery', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelperFactory = proxyquire('../../utilities/handler-helper-factory', {
//         './query-helper': queryHelperStub,
//       })(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let ownerRequest = { query: { $embed: "CHILD", populateSelect: "_id,foreignField" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
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
//   //handler-helper-factory.generateAssociationGetAllHandler calls generateListHandler
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationGetAllHandler calls generateListHandler', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let handlerSpy1 = sandbox.spy(function(){ deferred.resolve() });
//       let handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when({ "children": [{ _id: "childId1"},{ _id: "childId2"}] }) }}};
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("QueryHelper", queryHelperStub);
//       handlerHelperFactory.__set__("generateListHandler", handlerSpy2);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child"};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let Object.assignedRequest = Object.assign({}, request);
//       Object.assignedRequest.query.$where = Object.assign({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "generateListHandler called 1");
//         t.ok(handlerSpy1.calledWithExactly(Object.assignedRequest, reply), "generateListHandler called 2");
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
//   //handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations with linkingModels
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations with linkingModels', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
//       let handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
//         return Q.when(
//           {
//             "children": [
//               { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
//               { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
//               ]
//           })
//       }}};
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("QueryHelper", queryHelperStub);
//       handlerHelperFactory.__set__("generateListHandler", handlerSpy2);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let request = { query: {}, params: { ownerId: "_id" }, noReply: true };
//       let Object.assignedRequest = Object.assign({}, request);
//       Object.assignedRequest.query.$where = Object.assign({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "generateListHandler called 1");
//         t.ok(handlerSpy1.calledWithExactly(Object.assignedRequest, reply), "generateListHandler called 2");
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
//   //handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations without linkingModels
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationGetAllHandler handles MANY_MANY associations without linkingModels', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
//       let handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
//         return Q.when(
//           {
//             "children": [
//               { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
//               { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
//             ]
//           })
//       }}};
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("QueryHelper", queryHelperStub);
//       handlerHelperFactory.__set__("generateListHandler", handlerSpy2);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let request = { query: {}, params: { ownerId: "_id" }, noReply: true };
//       let Object.assignedRequest = Object.assign({}, request);
//       Object.assignedRequest.query.$where = Object.assign({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "generateListHandler called 1");
//         t.ok(handlerSpy1.calledWithExactly(Object.assignedRequest, reply), "generateListHandler called 2");
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
//   //handler-helper-factory.generateAssociationGetAllHandler calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper-factory.generateAssociationGetAllHandler calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       handlerHelperFactory.__set__("Boom", boomStub);
//       handlerHelperFactory = handlerHelperFactory(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelperFactory.generateAssociationGetAllHandler(userModel, association, {}, Log)(request, reply);
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
// test('handler-helper-factory.setAssociation', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.setAssociation calls model.findOne
//   .then(function() {
//     return t.test('setAssociation calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let setAssociation = handlerHelperFactory.__get__("setAssociation");
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = {};
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//       let deferred = Q.defer();
//       childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
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
//   //handler-helper-factory.setAssociation handles ONE_MANY relationships
//   .then(function() {
//     return t.test('setAssociation handles ONE_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let setAssociation = handlerHelperFactory.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = { _id: "_id" };
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, parent: {} };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
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
//   //handler-helper-factory.setAssociation creates a MANY_MANY association instance if it doesn't exist
//   .then(function() {
//     return t.test('setAssociation creates a MANY_MANY association instance if it doesn\'t exist', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let setAssociation = handlerHelperFactory.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "2", users: [] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [""] };
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
//   //handler-helper-factory.setAssociation updates a MANY_MANY association instance if it exists
//   .then(function() {
//     return t.test('setAssociation updates a MANY_MANY association instance if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let setAssociation = handlerHelperFactory.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
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
//   //handler-helper-factory.setAssociation rejects a promise if the association type is invalid
//   .then(function() {
//     return t.test('setAssociation rejects a promise if the association type is invalid', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let setAssociation = handlerHelperFactory.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
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
//   //handler-helper-factory.setAssociation rejects a promise if the child isn't found
//   .then(function() {
//     return t.test('setAssociation rejects a promise if the child isn\'t found', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let setAssociation = handlerHelperFactory.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
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
// test('handler-helper-factory.removeAssociation', function(t) {
//
//   return Q.when()
//
//   //handler-helper-factory.removeAssociation calls model.findOne
//   .then(function() {
//     return t.test('removeAssociation calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let removeAssociation = handlerHelperFactory.__get__("removeAssociation");
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = {};
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//       let deferred = Q.defer();
//       childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
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
//   //handler-helper-factory.removeAssociation handles ONE_MANY relationships
//   .then(function() {
//     return t.test('removeAssociation handles ONE_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let removeAssociation = handlerHelperFactory.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       handlerHelperFactory.__set__("Q", Qstub);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = { _id: "_id" };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, parent: "_id" };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let associationName = "children";
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
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
//   //handler-helper-factory.removeAssociation handles MANY_MANY relationships
//   .then(function() {
//     return t.test('removeAssociation handles MANY_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let removeAssociation = handlerHelperFactory.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { _id: "2", save: saveUser, children: [{child: "1"},{child: "2"}] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { _id: "1", save: saveChild, users: [{user: "1"},{user: "2"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let associationName = "children";
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
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
//   //handler-helper-factory.removeAssociation rejects a promise if the association type is invalid
//   .then(function() {
//     return t.test('removeAssociation rejects a promise if the association type is invalid', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let removeAssociation = handlerHelperFactory.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
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
//   //handler-helper-factory.removeAssociation rejects a promise if the child isn't found
//   .then(function() {
//     return t.test('removeAssociation rejects a promise if the child isn\'t found', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper-factory");
//       let server = sandbox.spy();
//       let handlerHelperFactory = rewire('../../utilities/handler-helper-factory');
//       let removeAssociation = handlerHelperFactory.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelperFactory.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
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
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
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
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
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
