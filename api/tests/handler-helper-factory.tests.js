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
Log.logLevel = "ERROR";
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
  t.ok(restHelperFactory.generateListHandler, "rest-helper-factory.generateListHandler exists.");
  t.ok(restHelperFactory.generateFindHandler, "rest-helper-factory.generateFindHandler exists.");
  t.ok(restHelperFactory.generateCreateHandler, "rest-helper-factory.generateCreateHandler exists.");
  t.ok(restHelperFactory.generateDeleteHandler, "rest-helper-factory.generateDeleteHandler exists.");
  t.ok(restHelperFactory.generateUpdateHandler, "rest-helper-factory.generateUpdateHandler exists.");
  t.ok(restHelperFactory.generateAssociationAddOneHandler, "rest-helper-factory.generateAssociationAddOneHandler exists.");
  t.ok(restHelperFactory.generateAssociationRemoveOneHandler, "rest-helper-factory.generateAssociationRemoveOneHandler exists.");
  t.ok(restHelperFactory.generateAssociationAddManyHandler, "rest-helper-factory.generateAssociationAddManyHandler exists.");
  t.ok(restHelperFactory.generateAssociationGetAllHandler, "rest-helper-factory.generateAssociationGetAllHandler exists.");
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

  t.test('rest-helper-factory.generateRoutes calls CRUD endpoint generators by default', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(5);

    var userSchema = new mongoose.Schema();
    userSchema.methods = {
      routeOptions: {}
    };
    var userModel = mongoose.model("user", userSchema);

    sinon.stub(restHelperFactory, 'generateListHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteHandler', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(restHelperFactory.generateListHandler.called, "generateListHandler called");
    t.ok(restHelperFactory.generateFindHandler.called, "generateFindHandler called");
    t.ok(restHelperFactory.generateCreateHandler.called, "generateCreateHandler called");
    t.ok(restHelperFactory.generateUpdateHandler.called, "generateUpdateHandler called");
    t.ok(restHelperFactory.generateDeleteHandler.called, "generateDeleteHandler called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListHandler.restore();
    restHelperFactory.generateFindHandler.restore();
    restHelperFactory.generateCreateHandler.restore();
    restHelperFactory.generateUpdateHandler.restore();
    restHelperFactory.generateDeleteHandler.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('rest-helper-factory.generateRoutes does not call CRUD endpoint generators if not allowed', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(5);

    var userSchema = new mongoose.Schema();
    userSchema.methods = {
      routeOptions: {
        allowRead: false,
        allowCreate: false,
        allowUpdate: false,
        allowDelete: false
      }
    };
    var userModel = mongoose.model("user", userSchema);

    sinon.stub(restHelperFactory, 'generateListHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteHandler', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(restHelperFactory.generateListHandler.called, "generateListHandler not called");
    t.notOk(restHelperFactory.generateFindHandler.called, "generateFindHandler not called");
    t.notOk(restHelperFactory.generateCreateHandler.called, "generateCreateHandler not called");
    t.notOk(restHelperFactory.generateUpdateHandler.called, "generateUpdateHandler not called");
    t.notOk(restHelperFactory.generateDeleteHandler.called, "generateDeleteHandler not called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListHandler.restore();
    restHelperFactory.generateFindHandler.restore();
    restHelperFactory.generateCreateHandler.restore();
    restHelperFactory.generateUpdateHandler.restore();
    restHelperFactory.generateDeleteHandler.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('rest-helper-factory.generateRoutes calls association endpoint generators for MANY_MANY and ONE_MANY associations', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(16);

    var userSchema = new mongoose.Schema();
    userSchema.methods = {
      routeOptions: {
        associations: {
          title: {
            type: "MANY_ONE"
          },
          profileImage: {
            type: "ONE_ONE"
          },
          groups: {
            type: "MANY_MANY"
          },
          permissions: {
            type: "ONE_MANY"
          }
        }
      }
    };
    var userModel = mongoose.model("user", userSchema);
    var title = userModel.schema.methods.routeOptions.associations.title;
    var profileImage = userModel.schema.methods.routeOptions.associations.profileImage;
    var groups = userModel.schema.methods.routeOptions.associations.groups;
    var permissions = userModel.schema.methods.routeOptions.associations.permissions;

    sinon.stub(restHelperFactory, 'generateListHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteHandler', sinon.spy());

    sinon.stub(restHelperFactory, 'generateAssociationAddOneHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationRemoveOneHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationAddManyHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationGetAllHandler', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(restHelperFactory.generateAssociationAddOneHandler.calledWith(server, userModel, title, {}), "generateAssociationAddOneHandler not called");
    t.notOk(restHelperFactory.generateAssociationAddOneHandler.calledWith(server, userModel, profileImage, {}), "generateAssociationAddOneHandler not called");
    t.ok(restHelperFactory.generateAssociationAddOneHandler.calledWith(server, userModel, groups, {}), "generateAssociationAddOneHandler called");
    t.ok(restHelperFactory.generateAssociationAddOneHandler.calledWith(server, userModel, permissions, {}), "generateAssociationAddOneHandler called");
    t.notOk(restHelperFactory.generateAssociationRemoveOneHandler.calledWith(server, userModel, title, {}), "generateAssociationRemoveOneHandler not called");
    t.notOk(restHelperFactory.generateAssociationRemoveOneHandler.calledWith(server, userModel, profileImage, {}), "generateAssociationRemoveOneHandler not called");
    t.ok(restHelperFactory.generateAssociationRemoveOneHandler.calledWith(server, userModel, groups, {}), "generateAssociationRemoveOneHandler called");
    t.ok(restHelperFactory.generateAssociationRemoveOneHandler.calledWith(server, userModel, permissions, {}), "generateAssociationRemoveOneHandler called");
    t.notOk(restHelperFactory.generateAssociationAddManyHandler.calledWith(server, userModel, title, {}), "generateAssociationAddManyHandler not called");
    t.notOk(restHelperFactory.generateAssociationAddManyHandler.calledWith(server, userModel, profileImage, {}), "generateAssociationAddManyHandler not called");
    t.ok(restHelperFactory.generateAssociationAddManyHandler.calledWith(server, userModel, groups, {}), "generateAssociationAddManyHandler called");
    t.ok(restHelperFactory.generateAssociationAddManyHandler.calledWith(server, userModel, permissions, {}), "generateAssociationAddManyHandler called");
    t.notOk(restHelperFactory.generateAssociationGetAllHandler.calledWith(server, userModel, title, {}), "generateAssociationGetAllHandler not called");
    t.notOk(restHelperFactory.generateAssociationGetAllHandler.calledWith(server, userModel, profileImage, {}), "generateAssociationGetAllHandler not called");
    t.ok(restHelperFactory.generateAssociationGetAllHandler.calledWith(server, userModel, groups, {}), "generateAssociationGetAllHandler called");
    t.ok(restHelperFactory.generateAssociationGetAllHandler.calledWith(server, userModel, permissions, {}), "generateAssociationGetAllHandler called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListHandler.restore();
    restHelperFactory.generateFindHandler.restore();
    restHelperFactory.generateCreateHandler.restore();
    restHelperFactory.generateUpdateHandler.restore();
    restHelperFactory.generateDeleteHandler.restore();


    restHelperFactory.generateAssociationAddOneHandler.restore();
    restHelperFactory.generateAssociationRemoveOneHandler.restore();
    restHelperFactory.generateAssociationAddManyHandler.restore();
    restHelperFactory.generateAssociationGetAllHandler.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('rest-helper-factory.generateRoutes does not call association endpoint generators if not allowed', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(4);

    var userSchema = new mongoose.Schema();
    userSchema.methods = {
      routeOptions: {
        associations: {
          groups: {
            type: "MANY_MANY",
            allowAddOne: false,
            allowRemoveOne: false,
            allowAddMany: false,
            allowRead: false
          }
        }
      }
    };
    var userModel = mongoose.model("user", userSchema);

    sinon.stub(restHelperFactory, 'generateListHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteHandler', sinon.spy());

    sinon.stub(restHelperFactory, 'generateAssociationAddOneHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationRemoveOneHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationAddManyHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationGetAllHandler', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(restHelperFactory.generateAssociationAddOneHandler.called, "generateAssociationAddOneHandler not called");
    t.notOk(restHelperFactory.generateAssociationRemoveOneHandler.called, "generateAssociationRemoveOneHandler not called");
    t.notOk(restHelperFactory.generateAssociationAddManyHandler.called, "generateAssociationAddManyHandler not called");
    t.notOk(restHelperFactory.generateAssociationGetAllHandler.called, "generateAssociationGetAllHandler not called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListHandler.restore();
    restHelperFactory.generateFindHandler.restore();
    restHelperFactory.generateCreateHandler.restore();
    restHelperFactory.generateUpdateHandler.restore();
    restHelperFactory.generateDeleteHandler.restore();


    restHelperFactory.generateAssociationAddOneHandler.restore();
    restHelperFactory.generateAssociationRemoveOneHandler.restore();
    restHelperFactory.generateAssociationAddManyHandler.restore();
    restHelperFactory.generateAssociationGetAllHandler.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('rest-helper-factory.generateRoutes creates extra endpoints if they exist.', function (t) {
    //<editor-fold desc="Arrange">
    var server = sinon.spy();
    var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema();
    userSchema.methods = {
      routeOptions: {
        extraHandlers: [
          sinon.spy(),
          sinon.spy()
        ]
      }
    };
    var userModel = mongoose.model("user", userSchema);
    var extraHandlers = userModel.schema.methods.routeOptions.extraHandlers;

    sinon.stub(restHelperFactory, 'generateListHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateHandler', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteHandler', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(extraHandlers[0].called, "extraHandler[0] called");
    t.ok(extraHandlers[1].called, "extraHandler[1] called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListHandler.restore();
    restHelperFactory.generateFindHandler.restore();
    restHelperFactory.generateCreateHandler.restore();
    restHelperFactory.generateUpdateHandler.restore();
    restHelperFactory.generateDeleteHandler.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

test('rest-helper-factory.generateListHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateListHandler, "restHelperFactory.generateListHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateListHandler calls handlerHelper.generateListHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateListHandler.called, "generateListHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls queryHelper.getQueryableFields, getReadableFields, and getSortableFields', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(3);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(queryHelperStub.getQueryableFields.called, "getQueryableFields called");
    t.ok(queryHelperStub.getReadableFields.called, "getReadableFields called");
    t.ok(queryHelperStub.getSortableFields.called, "getSortableFields called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route with "GET" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "GET", "GET method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel1, {}, Log);
    restHelperFactory.generateListHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1", "correct route");
    t.equal(serverObject2.path, "/PEEPS", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateListHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route with correct collectionName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel1, {}, Log);
    restHelperFactory.generateListHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Get a list of user1s", "correct description");
    t.equal(serverObject2.config.description, "Get a list of Users", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'User'], "correct tags");
//</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route using correct queryValidation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    queryHelperStub.getQueryableFields = this.spy(function(){return ["test"]});
    var readableFields = ['readable'];
    var sortableFields = ['sortable'];
    queryHelperStub.getReadableFields = this.spy(function(){return readableFields});
    queryHelperStub.getSortableFields = this.spy(function(){return sortableFields});
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.number = function () {
      return {
        integer: function () {
          return {
            min: function () {
              return {
                optional: function () {
                  return {
                    description: function () {
                      return "TEST";
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(6);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var queryValidation = {};

    queryValidation.$select = Joi.alternatives().try(Joi.string().valid(readableFields), Joi.array().items(Joi.string().valid(readableFields)))
    .description('A list of basic fields to be included in each resource. Valid values include: ' + readableFields);
    // queryValidation.$term = Joi.string().optional()
    //   .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + queryableFields);
    // queryValidation.$searchFields = Joi.string().optional()//TODO: make enumerated array.
    //   .description('A set of fields to apply the \"$term\" search parameter to. If this parameter is not included, the \"$term\" search parameter is applied to all searchable fields. Valid values include: ' + queryableFields);
    queryValidation.$sort = Joi.alternatives().try(Joi.string().valid(sortableFields), Joi.array().items(Joi.string().valid(sortableFields)))
    .description('A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending ' +
      '\'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value). Listing multiple' +
      'fields prioritizes the sort starting with the first field listed. Valid values include: ' + sortableFields);
    queryValidation.$where = Joi.any().optional()
    .description('An optional field for raw mongoose queries.');

    queryValidation["test"] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));

    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    //TODO: find out why $skip and $limit are failing
    t.deepEqual(serverObject.config.validate.query.$skip, "TEST", "correct $skip");
    t.deepEqual(serverObject.config.validate.query.$limit, "TEST", "correct $limit");
    t.deepEqual(serverObject.config.validate.query.$select, queryValidation.$select, "correct $select");
    t.deepEqual(serverObject.config.validate.query.$sort, queryValidation.$sort, "correct $sort");
    t.deepEqual(serverObject.config.validate.query.$where, queryValidation.$where, "correct $where");
    t.deepEqual(serverObject.config.validate.query['test'], queryValidation['test'], "correct test");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route with $embed validation if associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    queryHelperStub.getQueryableFields = this.spy(function(){return ["test"]});
    var readableFields = ['readable'];
    var sortableFields = ['sortable'];
    queryHelperStub.getReadableFields = this.spy(function(){return readableFields});
    queryHelperStub.getSortableFields = this.spy(function(){return sortableFields});
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {
          test: {}
        }
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var queryValidation = {};
    queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
    .description('A set of complex object properties to populate. Valid values include ' + Object.keys({test:{}}));
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel1, {}, Log);
    restHelperFactory.generateListHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    //TODO: find out why $skip and $limit are failing
    t.notOk(serverObject1.config.validate.query.$embed, "$embed not included with not associations");
    t.deepEqual(serverObject2.config.validate.query.$embed, queryValidation.$embed, "correct $embed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var readModel = Joi.any().valid(["test"]);
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var responseSchema = Joi.array().items(readModel);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateListHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response.schema, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateFindHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateFindHandler, "restHelperFactory.generateFindHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateFindHandler calls handlerHelper.generateFindHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateFindHandler.called, "generateFindHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls queryHelper.getReadableFields', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(queryHelperStub.getReadableFields.called, "getReadableFields called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route with "GET" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "GET", "GET method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel1, {}, Log);
    restHelperFactory.generateFindHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{_id}", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{_id}", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateFindHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route with correct collectionName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel1, {}, Log);
    restHelperFactory.generateFindHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Get a specific user1", "correct description");
    t.equal(serverObject2.config.description, "Get a specific User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'User'], "correct tags");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route using correct queryValidation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    queryHelperStub.getQueryableFields = this.spy(function(){return ["test"]});
    var readableFields = ['readable'];
    var sortableFields = ['sortable'];
    queryHelperStub.getReadableFields = this.spy(function(){return readableFields});
    queryHelperStub.getSortableFields = this.spy(function(){return sortableFields});
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var queryValidation = {};

    queryValidation.$select = Joi.alternatives().try(Joi.string().valid(readableFields), Joi.array().items(Joi.string().valid(readableFields)))
    .description('A list of basic fields to be included in each resource. Valid values include: ' + readableFields);

    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.query.$select, queryValidation.$select, "correct $select");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route with $embed validation if associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    queryHelperStub.getQueryableFields = this.spy(function(){return ["test"]});
    var readableFields = ['readable'];
    var sortableFields = ['sortable'];
    queryHelperStub.getReadableFields = this.spy(function(){return readableFields});
    queryHelperStub.getSortableFields = this.spy(function(){return sortableFields});
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {
          test: {}
        }
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var queryValidation = {};
    queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
    .description('A set of complex object properties to populate. Valid values include ' + Object.keys({test:{}}));
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel1, {}, Log);
    restHelperFactory.generateFindHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    //TODO: find out why $skip and $limit are failing
    t.notOk(serverObject1.config.validate.query.$embed, "$embed not included with not associations");
    t.deepEqual(serverObject2.config.validate.query.$embed, queryValidation.$embed, "correct $embed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route using correct params validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.objectId = function () {
      return {
        required: function () {
          return "TEST";
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var params =  {
        _id: "TEST"
      };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.params, params, "params validated");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var readModel = Joi.any().valid(["test"]);
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var responseSchema = readModel;
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateFindHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response.schema, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateCreateHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateCreateHandler, "restHelperFactory.generateCreateHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateCreateHandler calls handlerHelper.generateCreateHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateCreateHandler.called, "generateCreateHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t)  {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls joiMongooseHelper.generateJoiCreateModel', sinon.test(function (t)  {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiCreateModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiCreateModel.called, "generateJoiCreateModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route with "POST" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "POST", "POST method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiCreateModel =function(){return Joi.any()};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel1, {}, Log);
    restHelperFactory.generateCreateHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1", "correct route");
    t.equal(serverObject2.path, "/PEEPS", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateCreateHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route with correct collectionName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel1, {}, Log);
    restHelperFactory.generateCreateHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Create a new user1", "correct description");
    t.equal(serverObject2.config.description, "Create a new User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'User'], "correct tags");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route using correct payload validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiCreateModel = function(){return Joi.any().valid("TEST")};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.payload, Joi.any().valid("TEST"), "correct payload validation");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var readModel = Joi.any().valid(["test"]);
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var responseSchema = readModel;
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateCreateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response.schema, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateDeleteHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateDeleteHandler, "restHelperFactory.generateDeleteHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateDeleteHandler calls handlerHelper.generateDeleteHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateDeleteHandler.called, "generateDeleteHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route with "DELETE" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "DELETE", "DELETE method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel1, {}, Log);
    restHelperFactory.generateDeleteHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{_id}", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{_id}", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateDeleteHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route with correct collectionName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel1, {}, Log);
    restHelperFactory.generateDeleteHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Delete a user1", "correct description");
    t.equal(serverObject2.config.description, "Delete a User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'User'], "correct tags");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route using correct params validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.objectId = function () {
      return {
        required: function () {
          return "TEST";
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var params =  {
      _id: "TEST"
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.params, params, "params validated");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateDeleteHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateUpdateHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateUpdateHandler, "restHelperFactory.generateUpdateHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateUpdateHandler calls handlerHelper.generateUpdateHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateUpdateHandler.called, "generateUpdateHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t)  {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls joiMongooseHelper.generateJoiUpdateModel', sinon.test(function (t)  {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiUpdateModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiUpdateModel.called, "generateJoiUpdateModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route with "PUT" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "PUT", "PUT method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiUpdateModel =function(){return Joi.any()};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel1, {}, Log);
    restHelperFactory.generateUpdateHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{_id}", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{_id}", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateUpdateHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route with correct collectionName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel1, {}, Log);
    restHelperFactory.generateUpdateHandler(server, userModel2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Update a user1", "correct description");
    t.equal(serverObject2.config.description, "Update a User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'User'], "correct tags");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route using correct payload validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiUpdateModel = function(){return Joi.any().valid("TEST")};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.payload, Joi.any().valid("TEST"), "correct payload validation");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route using correct params validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.objectId = function () {
      return {
        required: function () {
          return "TEST";
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var params =  {
      _id: "TEST"
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.params, params, "params validated");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var readModel = Joi.any().valid(["test"]);
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var responseSchema = readModel;
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateUpdateHandler(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response.schema, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateAssociationAddOneHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateAssociationAddOneHandler, "restHelperFactory.generateAssociationAddOneHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateAssociationAddOneHandler asserts routeOptions exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("routeOptions") > -1, "assertion message contains 'routeOptions' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler asserts routeOptions.associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {}
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("associations") > -1, "assertion message contains 'associations' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler asserts association input exists', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneHandler(server, userModel, null, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("association input") > -1, "assertion message contains 'association input' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls handlerHelper.generateAssociationAddOneHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateAssociationAddOneHandler.called, "generateAssociationAddOneHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route with "PUT" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "PUT", "PUT method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route with correct ownerAlias and childAlias', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiUpdateModel =function(){return Joi.any()};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {},
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { modelName: "TEST1" } } };
    var association2 = { include: { model: {} }, alias: "TEST2" };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddOneHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{ownerId}/TEST1/{childId}", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{ownerId}/TEST2/{childId}", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateAssociationAddOneHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route with correct associationName and ownerModelName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      },
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { modelName: "TEST1" } } };
    var association2 = { include: { model: {}, as: "TEST2" } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddOneHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Add a single TEST1 to a user1", "correct description");
    t.equal(serverObject2.config.description, "Add a single TEST2 to a User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'TEST1', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'TEST2', 'User'], "correct tags");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route using correct payload validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiAssociationModel = function(){return Joi.any().valid("TEST")};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { } } };
    var association2 = { include: { model: {}, through: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddOneHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject1.config.validate.payload, null, "correct payload validation");
    t.deepEqual(serverObject2.config.validate.payload, Joi.any().valid("TEST").allow(null), "correct payload validation");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route using correct params validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.objectId = function () {
      return {
        required: function () {
          return "TEST";
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var params =  {
      ownerId: "TEST",
      childId: "TEST"
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.params, params, "params validated");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var responseSchema = {};
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateAssociationRemoveOneHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateAssociationRemoveOneHandler, "restHelperFactory.generateAssociationRemoveOneHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler asserts routeOptions exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("routeOptions") > -1, "assertion message contains 'routeOptions' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler asserts routeOptions.associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {}
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("associations") > -1, "assertion message contains 'associations' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler asserts association input exists', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, null, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("association input") > -1, "assertion message contains 'association input' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls handlerHelper.generateAssociationRemoveOneHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateAssociationRemoveOneHandler.called, "generateAssociationRemoveOneHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route with "DELETE" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "DELETE", "DELETE method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route with correct ownerAlias and childAlias', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiUpdateModel =function(){return Joi.any()};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {},
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { modelName: "TEST1" } } };
    var association2 = { include: { model: {} }, alias: "TEST2" };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{ownerId}/TEST1/{childId}", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{ownerId}/TEST2/{childId}", "correct route alias");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateAssociationRemoveOneHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route with correct associationName and ownerModelName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      },
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { modelName: "TEST1" } } };
    var association2 = { include: { model: {}, as: "TEST2" } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Remove a single TEST1 from a user1", "correct description");
    t.equal(serverObject2.config.description, "Remove a single TEST2 from a User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'TEST1', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'TEST2', 'User'], "correct tags");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route using correct params validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.objectId = function () {
      return {
        required: function () {
          return "TEST";
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var params =  {
      ownerId: "TEST",
      childId: "TEST"
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.params, params, "params validated");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationRemoveOneHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var responseSchema = {};
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationRemoveOneHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateAssociationAddManyHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateAssociationAddManyHandler, "restHelperFactory.generateAssociationAddManyHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateAssociationAddManyHandler asserts routeOptions exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("routeOptions") > -1, "assertion message contains 'routeOptions' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler asserts routeOptions.associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {}
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("associations") > -1, "assertion message contains 'associations' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler asserts association input exists', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyHandler(server, userModel, null, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("association input") > -1, "assertion message contains 'association input' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls handlerHelper.generateAssociationAddManyHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateAssociationAddManyHandler.called, "generateAssociationAddManyHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route with "POST" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "POST", "POST method used");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route with correct ownerAlias and childAlias', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiUpdateModel =function(){return Joi.any()};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {},
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { modelName: "TEST1" } } };
    var association2 = { include: { model: {} }, alias: "TEST2" };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddManyHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{ownerId}/TEST1", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{ownerId}/TEST2", "correct route alias");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateAssociationAddManyHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route with correct associationName and ownerModelName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      },
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { modelName: "TEST1" } } };
    var association2 = { include: { model: {}, as: "TEST2" } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddManyHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Sets multiple TEST1s for a user1", "correct description");
    t.equal(serverObject2.config.description, "Sets multiple TEST2s for a User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'TEST1', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'TEST2', 'User'], "correct tags");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route using correct payload validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiAssociationModel = function(){return Joi.object().unknown()};
    var joiStub = require('Joi');
    joiStub.objectId = function() {
      return Joi.any().valid("objectId");
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var association1 = { include: { model: { } } };
    var association2 = { include: { model: {}, through: {} } };

    var payloadValidation1 = Joi.array().items(Joi.object().unknown().keys({ childId: Joi.any().valid("objectId") })).required();
    var payloadValidation2 = Joi.array().items(Joi.any().valid("objectId")).required();
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddManyHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject1.config.validate.payload, payloadValidation2, "correct payload validation");
    t.deepEqual(serverObject2.config.validate.payload, payloadValidation1, "correct payload validation");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route using correct params validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.objectId = function() {
      return Joi.any().valid("objectId");
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var params =  {
      ownerId: Joi.any().valid("objectId").required()
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.params, params, "params validated");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddManyHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: { model: {} } };

    var responseSchema = {};
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationAddManyHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.end();
});

test('rest-helper-factory.generateAssociationGetAllHandler', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateAssociationGetAllHandler, "restHelperFactory.generateAssociationGetAllHandler", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateAssociationGetAllHandler asserts routeOptions exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("routeOptions") > -1, "assertion message contains 'routeOptions' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler asserts routeOptions.associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {}
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllHandler(server, userModel, {}, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("associations") > -1, "assertion message contains 'associations' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler asserts association input exists', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var association = { include: {} };
    //</editor-fold>

    try {
      //<editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllHandler(server, userModel, null, {}, Log);
      t.fail("No error was thrown.");
      //</editor-fold>
    }

    catch (error) {
      //<editor-fold desc="Assert">
      t.equal(error.name, "AssertionError", "error is an AssertionError");
      t.ok(error.message.indexOf("association input") > -1, "assertion message contains 'association input' text.");
      //</editor-fold>
    }

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls handlerHelper.generateAssociationGetAllHandler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateAssociationGetAllHandler.called, "generateAssociationGetAllHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls queryHelper.getQueryableFields, getReadableFields, and getSortableFields', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(3);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(queryHelperStub.getQueryableFields.called, "getQueryableFields called");
    t.ok(queryHelperStub.getReadableFields.called, "getReadableFields called");
    t.ok(queryHelperStub.getSortableFields.called, "getSortableFields called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route with "GET" method', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.method, "GET", "GET method used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route with correct ownerAlias and childAlias', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    joiMongooseHelperStub.generateJoiUpdateModel =function(){return Joi.any()};
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {},
        alias: "PEEPS"
      }
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var childModel1 = mongoose.model("child1", userSchema1);
    var childModel2 = mongoose.model("child2", userSchema2);

    var association1 = { include: { model: childModel1 } };
    var association2 = { include: { model: childModel2 }, alias: "TEST2" };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationGetAllHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.path, "/user1/{ownerId}/child1", "correct route");
    t.equal(serverObject2.path, "/PEEPS/{ownerId}/TEST2", "correct route alias");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.child1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    delete mongoose.models.child2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route with correct handler', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    handlerHelperStub.generateAssociationGetAllHandler = this.spy(function(){return "HANDLER"})
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.handler, "HANDLER", "correct handler used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route using token authentication', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.auth, "token", "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route with correct associationName and ownerModelName', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(4);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      },
      collectionDisplayName: "User"
    };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var childModel1 = mongoose.model("child1", userSchema1);
    var childModel2 = mongoose.model("child2", userSchema2);

    var association1 = { include: { model: childModel1 } };
    var association2 = { include: { model: childModel2, as: "TEST2" } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationGetAllHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject1.config.description, "Gets all of the child1s for a user1", "correct description");
    t.equal(serverObject2.config.description, "Gets all of the TEST2s for a User", "correct description");
    t.deepEqual(serverObject1.config.tags, ['api', 'child1', 'user1'], "correct tags");
    t.deepEqual(serverObject2.config.tags, ['api', 'TEST2', 'User'], "correct tags");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.child1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    delete mongoose.models.child2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route using cors', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.equal(serverObject.config.cors, true, "cors used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route using correct queryValidation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    queryHelperStub.getQueryableFields = this.spy(function(){return ["test"]});
    var readableFields = ['readable'];
    var sortableFields = ['sortable'];
    queryHelperStub.getReadableFields = this.spy(function(){return readableFields});
    queryHelperStub.getSortableFields = this.spy(function(){return sortableFields});
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var joiStub = require('Joi');
    joiStub.number = function () {
      return {
        integer: function () {
          return {
            min: function () {
              return {
                optional: function () {
                  return {
                    description: function () {
                      return "TEST";
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub,
      'joi': joiStub
    })(Log, mongoose, server);

    t.plan(6);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };

    var queryValidation = {};

    queryValidation.$select = Joi.alternatives().try(Joi.string().valid(readableFields), Joi.array().items(Joi.string().valid(readableFields)))
    .description('A list of basic fields to be included in each resource. Valid values include: ' + readableFields);
    // queryValidation.$term = Joi.string().optional()
    //   .description('A generic search parameter. This can be refined using the `searchFields` parameter. Valid values include: ' + queryableFields);
    // queryValidation.$searchFields = Joi.string().optional()//TODO: make enumerated array.
    //   .description('A set of fields to apply the \"$term\" search parameter to. If this parameter is not included, the \"$term\" search parameter is applied to all searchable fields. Valid values include: ' + queryableFields);
    queryValidation.$sort = Joi.alternatives().try(Joi.string().valid(sortableFields), Joi.array().items(Joi.string().valid(sortableFields)))
    .description('A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending ' +
      '\'-\' indicates descending. The default sort direction is \'ascending\' (lowest value to highest value). Listing multiple' +
      'fields prioritizes the sort starting with the first field listed. Valid values include: ' + sortableFields);
    queryValidation.$where = Joi.any().optional()
    .description('An optional field for raw mongoose queries.');

    queryValidation["test"] = Joi.alternatives().try(Joi.string().optional(), Joi.array().items(Joi.string()));

    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    //TODO: find out why $skip and $limit are failing
    t.deepEqual(serverObject.config.validate.query.$skip, "TEST", "correct $skip");
    t.deepEqual(serverObject.config.validate.query.$limit, "TEST", "correct $limit");
    t.deepEqual(serverObject.config.validate.query.$select, queryValidation.$select, "correct $select");
    t.deepEqual(serverObject.config.validate.query.$sort, queryValidation.$sort, "correct $sort");
    t.deepEqual(serverObject.config.validate.query.$where, queryValidation.$where, "correct $where");
    t.deepEqual(serverObject.config.validate.query['test'], queryValidation['test'], "correct test");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route with $embed validation if associations exist', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    queryHelperStub.getQueryableFields = this.spy(function(){return ["test"]});
    var readableFields = ['readable'];
    var sortableFields = ['sortable'];
    queryHelperStub.getReadableFields = this.spy(function(){return readableFields});
    queryHelperStub.getSortableFields = this.spy(function(){return sortableFields});
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(2);

    var userSchema1 = new mongoose.Schema({});
    userSchema1.methods = {
      routeOptions: {
        associations: {
          test: {}
        }
      }
    };

    var userSchema2 = new mongoose.Schema({});
    userSchema2.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var childSchema1 = new mongoose.Schema({});

    var childModel1 = mongoose.model("child1", childSchema1);
    var childModel2 = mongoose.model("child2", userSchema1);

    var association1 = { include: { model: childModel1 } };
    var association2 = { include: { model: childModel2 }, alias: "TEST2" };

    var userModel1 = mongoose.model("user1", userSchema1);
    var userModel2 = mongoose.model("user2", userSchema2);

    var queryValidation = {};
    queryValidation.$embed = Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()))
    .description('A set of complex object properties to populate. Valid values include ' + Object.keys({test:{}}));
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationGetAllHandler(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    //TODO: find out why $skip and $limit are failing
    t.notOk(serverObject1.config.validate.query.$embed, "$embed not included with no associations");
    t.deepEqual(serverObject2.config.validate.query.$embed, queryValidation.$embed, "correct $embed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user1;
    delete mongoose.modelSchemas.user1;
    delete mongoose.models.child1;
    delete mongoose.models.user2;
    delete mongoose.modelSchemas.user2;
    delete mongoose.models.child2;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route using correct header validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };

    var headerValidation = Joi.object({
      'authorization': Joi.string().required()
    }).options({allowUnknown: true});
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject.config.validate.headers, headerValidation, "token auth used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route using hapi-swagger plugin', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return Joi.any()});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.ok(serverObject.config.plugins['hapi-swagger'], "hapi-swagger used");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationGetAllHandler calls server.route with correct response schema validation', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    var server = this.stub({route: function(){}});

    var handlerHelperStub = this.stub(require('../utilities/handler-helper-factory')(this.spy(),server));
    var handlerHelperStubWrapper = this.stub();
    handlerHelperStubWrapper.returns(handlerHelperStub);
    var queryHelperStub = this.stub(require('../utilities/query-helper'));
    var readModel = Joi.any().valid(["test"]);
    var joiMongooseHelperStub = this.stub(require('../utilities/joi-mongoose-helper'), 'generateJoiReadModel', function(){return readModel});
    var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
      './handler-helper-factory': handlerHelperStubWrapper,
      './query-helper': queryHelperStub,
      './joi-mongoose-helper': joiMongooseHelperStub
    })(Log, mongoose, server);

    t.plan(1);

    var userSchema = new mongoose.Schema({});
    userSchema.methods = {
      routeOptions: {
        associations: {}
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var childModel = mongoose.model("child", userSchema);
    var association = { include: { model: childModel } };

    var responseSchema = Joi.array().items(readModel);
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateAssociationGetAllHandler(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject = server.route.args[0][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEquals(serverObject.config.response.schema, responseSchema, "response schema correct");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    delete mongoose.models.child;
    delete mongoose.modelSchemas.child;
    //</editor-fold>
  }));

  t.end();
});
