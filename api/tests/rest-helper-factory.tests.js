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

    sinon.stub(restHelperFactory, 'generateListEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteEndpoint', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(restHelperFactory.generateListEndpoint.called, "generateListEndpoint called");
    t.ok(restHelperFactory.generateFindEndpoint.called, "generateFindEndpoint called");
    t.ok(restHelperFactory.generateCreateEndpoint.called, "generateCreateEndpoint called");
    t.ok(restHelperFactory.generateUpdateEndpoint.called, "generateUpdateEndpoint called");
    t.ok(restHelperFactory.generateDeleteEndpoint.called, "generateDeleteEndpoint called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListEndpoint.restore();
    restHelperFactory.generateFindEndpoint.restore();
    restHelperFactory.generateCreateEndpoint.restore();
    restHelperFactory.generateUpdateEndpoint.restore();
    restHelperFactory.generateDeleteEndpoint.restore();
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

    sinon.stub(restHelperFactory, 'generateListEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteEndpoint', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(restHelperFactory.generateListEndpoint.called, "generateListEndpoint not called");
    t.notOk(restHelperFactory.generateFindEndpoint.called, "generateFindEndpoint not called");
    t.notOk(restHelperFactory.generateCreateEndpoint.called, "generateCreateEndpoint not called");
    t.notOk(restHelperFactory.generateUpdateEndpoint.called, "generateUpdateEndpoint not called");
    t.notOk(restHelperFactory.generateDeleteEndpoint.called, "generateDeleteEndpoint not called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListEndpoint.restore();
    restHelperFactory.generateFindEndpoint.restore();
    restHelperFactory.generateCreateEndpoint.restore();
    restHelperFactory.generateUpdateEndpoint.restore();
    restHelperFactory.generateDeleteEndpoint.restore();
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

    sinon.stub(restHelperFactory, 'generateListEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteEndpoint', sinon.spy());

    sinon.stub(restHelperFactory, 'generateAssociationAddOneEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationRemoveOneEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationAddManyEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationGetAllEndpoint', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(restHelperFactory.generateAssociationAddOneEndpoint.calledWith(server, userModel, title, {}), "generateAssociationAddOneEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationAddOneEndpoint.calledWith(server, userModel, profileImage, {}), "generateAssociationAddOneEndpoint not called");
    t.ok(restHelperFactory.generateAssociationAddOneEndpoint.calledWith(server, userModel, groups, {}), "generateAssociationAddOneEndpoint called");
    t.ok(restHelperFactory.generateAssociationAddOneEndpoint.calledWith(server, userModel, permissions, {}), "generateAssociationAddOneEndpoint called");
    t.notOk(restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(server, userModel, title, {}), "generateAssociationRemoveOneEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(server, userModel, profileImage, {}), "generateAssociationRemoveOneEndpoint not called");
    t.ok(restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(server, userModel, groups, {}), "generateAssociationRemoveOneEndpoint called");
    t.ok(restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(server, userModel, permissions, {}), "generateAssociationRemoveOneEndpoint called");
    t.notOk(restHelperFactory.generateAssociationAddManyEndpoint.calledWith(server, userModel, title, {}), "generateAssociationAddManyEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationAddManyEndpoint.calledWith(server, userModel, profileImage, {}), "generateAssociationAddManyEndpoint not called");
    t.ok(restHelperFactory.generateAssociationAddManyEndpoint.calledWith(server, userModel, groups, {}), "generateAssociationAddManyEndpoint called");
    t.ok(restHelperFactory.generateAssociationAddManyEndpoint.calledWith(server, userModel, permissions, {}), "generateAssociationAddManyEndpoint called");
    t.notOk(restHelperFactory.generateAssociationGetAllEndpoint.calledWith(server, userModel, title, {}), "generateAssociationGetAllEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationGetAllEndpoint.calledWith(server, userModel, profileImage, {}), "generateAssociationGetAllEndpoint not called");
    t.ok(restHelperFactory.generateAssociationGetAllEndpoint.calledWith(server, userModel, groups, {}), "generateAssociationGetAllEndpoint called");
    t.ok(restHelperFactory.generateAssociationGetAllEndpoint.calledWith(server, userModel, permissions, {}), "generateAssociationGetAllEndpoint called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListEndpoint.restore();
    restHelperFactory.generateFindEndpoint.restore();
    restHelperFactory.generateCreateEndpoint.restore();
    restHelperFactory.generateUpdateEndpoint.restore();
    restHelperFactory.generateDeleteEndpoint.restore();


    restHelperFactory.generateAssociationAddOneEndpoint.restore();
    restHelperFactory.generateAssociationRemoveOneEndpoint.restore();
    restHelperFactory.generateAssociationAddManyEndpoint.restore();
    restHelperFactory.generateAssociationGetAllEndpoint.restore();
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

    sinon.stub(restHelperFactory, 'generateListEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteEndpoint', sinon.spy());

    sinon.stub(restHelperFactory, 'generateAssociationAddOneEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationRemoveOneEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationAddManyEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateAssociationGetAllEndpoint', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(restHelperFactory.generateAssociationAddOneEndpoint.called, "generateAssociationAddOneEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationRemoveOneEndpoint.called, "generateAssociationRemoveOneEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationAddManyEndpoint.called, "generateAssociationAddManyEndpoint not called");
    t.notOk(restHelperFactory.generateAssociationGetAllEndpoint.called, "generateAssociationGetAllEndpoint not called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListEndpoint.restore();
    restHelperFactory.generateFindEndpoint.restore();
    restHelperFactory.generateCreateEndpoint.restore();
    restHelperFactory.generateUpdateEndpoint.restore();
    restHelperFactory.generateDeleteEndpoint.restore();


    restHelperFactory.generateAssociationAddOneEndpoint.restore();
    restHelperFactory.generateAssociationRemoveOneEndpoint.restore();
    restHelperFactory.generateAssociationAddManyEndpoint.restore();
    restHelperFactory.generateAssociationGetAllEndpoint.restore();
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
        extraEndpoints: [
          sinon.spy(),
          sinon.spy()
        ]
      }
    };
    var userModel = mongoose.model("user", userSchema);
    var extraEndpoints = userModel.schema.methods.routeOptions.extraEndpoints;

    sinon.stub(restHelperFactory, 'generateListEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateFindEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateCreateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateUpdateEndpoint', sinon.spy());
    sinon.stub(restHelperFactory, 'generateDeleteEndpoint', sinon.spy());
    //</editor-fold>

    //<editor-fold desc="Act">
    restHelperFactory.generateRoutes(server, userModel, {});
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(extraEndpoints[0].called, "extraEndpoint[0] called");
    t.ok(extraEndpoints[1].called, "extraEndpoint[1] called");
    //</editor-fold>

    //<editor-fold desc="Restore">
    restHelperFactory.generateListEndpoint.restore();
    restHelperFactory.generateFindEndpoint.restore();
    restHelperFactory.generateCreateEndpoint.restore();
    restHelperFactory.generateUpdateEndpoint.restore();
    restHelperFactory.generateDeleteEndpoint.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

test('rest-helper-factory.generateListEndpoint', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateListEndpoint, "restHelperFactory.generateListEndpoint", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateListEndpoint calls handlerHelper.generateListHandler', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateListHandler.called, "generateListHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListEndpoint calls queryHelper.getQueryableFields, getReadableFields, and getSortableFields', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListEndpoint calls server.route', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateListEndpoint calls server.route with "GET" method', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateListEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route with correct handler', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route using token authentication', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route with correct collectionName', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateListEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route using cors', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route using correct queryValidation', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route with $embed validation if associations exist', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateListEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route using correct header validation', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route using hapi-swagger plugin', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateListEndpoint calls server.route with correct response schema validation', sinon.test(function (t) {
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
    restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
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

test('rest-helper-factory.generateFindEndpoint', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateFindEndpoint, "restHelperFactory.generateFindEndpoint", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateFindEndpoint calls handlerHelper.generateFindHandler', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateFindHandler.called, "generateFindHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindEndpoint calls queryHelper.getReadableFields', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(queryHelperStub.getReadableFields.called, "getReadableFields called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindEndpoint calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindEndpoint calls server.route', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateFindEndpoint calls server.route with "GET" method', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateFindEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route with correct handler', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route using token authentication', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route with correct collectionName', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateFindEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route using cors', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route using correct queryValidation', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route with $embed validation if associations exist', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateFindEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route using correct params validation', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route using correct header validation', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route using hapi-swagger plugin', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateFindEndpoint calls server.route with correct response schema validation', sinon.test(function (t) {
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
    restHelperFactory.generateFindEndpoint(server, userModel, {}, Log);
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

test('rest-helper-factory.generateCreateEndpoint', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateCreateEndpoint, "restHelperFactory.generateCreateEndpoint", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateCreateEndpoint calls handlerHelper.generateCreateHandler', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateCreateHandler.called, "generateCreateHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateEndpoint calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t)  {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateEndpoint calls joiMongooseHelper.generateJoiCreateModel', sinon.test(function (t)  {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiCreateModel.called, "generateJoiCreateModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route with "POST" method', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateCreateEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route with correct handler', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route using token authentication', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route with correct collectionName', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateCreateEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route using cors', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route using correct payload validation', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route using correct header validation', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route using hapi-swagger plugin', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateCreateEndpoint calls server.route with correct response schema validation', sinon.test(function (t) {
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
    restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log);
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

test('rest-helper-factory.generateDeleteEndpoint', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateDeleteEndpoint, "restHelperFactory.generateDeleteEndpoint", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateDeleteEndpoint calls handlerHelper.generateDeleteHandler', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateDeleteHandler.called, "generateDeleteHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route with "DELETE" method', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateDeleteEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route with correct handler', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route using token authentication', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route with correct collectionName', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateDeleteEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route using cors', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route using correct params validation', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route using correct header validation', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateDeleteEndpoint calls server.route using hapi-swagger plugin', sinon.test(function (t) {
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
    restHelperFactory.generateDeleteEndpoint(server, userModel, {}, Log);
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

test('rest-helper-factory.generateUpdateEndpoint', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateUpdateEndpoint, "restHelperFactory.generateUpdateEndpoint", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateUpdateEndpoint calls handlerHelper.generateUpdateHandler', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateUpdateHandler.called, "generateUpdateHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateEndpoint calls joiMongooseHelper.generateJoiReadModel', sinon.test(function (t)  {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiReadModel.called, "generateJoiReadModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateEndpoint calls joiMongooseHelper.generateJoiUpdateModel', sinon.test(function (t)  {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelperStub.generateJoiUpdateModel.called, "generateJoiUpdateModel called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route with "PUT" method', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route with correct resourceAliasForRoute', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateUpdateEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route with correct handler', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route using token authentication', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route with correct collectionName', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel1, {}, Log);
    restHelperFactory.generateUpdateEndpoint(server, userModel2, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route using cors', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route using correct payload validation', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route using correct params validation', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route using correct header validation', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route using hapi-swagger plugin', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

  t.test('rest-helper-factory.generateUpdateEndpoint calls server.route with correct response schema validation', sinon.test(function (t) {
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
    restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log);
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

test('rest-helper-factory.generateAssociationAddOneEndpoint', function(t) {
  var server = sinon.spy();
  var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
  testHelper.testModelParameter(t, restHelperFactory.generateAssociationAddOneEndpoint, "restHelperFactory.generateAssociationAddOneEndpoint", ["server", "model", "options", "Log"], Log);

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint asserts routeOptions exist', sinon.test(function (t) {
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
      restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, {}, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint asserts routeOptions.associations exist', sinon.test(function (t) {
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
      restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, {}, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint asserts association input exists', sinon.test(function (t) {
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
      restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, null, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls handlerHelper.generateAssociationAddOneHandler', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(handlerHelperStub.generateAssociationAddOneHandler.called, "generateAssociationAddOneHandler called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(server.route.called, "server.route called");
    //</editor-fold>


    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with "PUT" method', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct ownerAlias and childAlias', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel2, association2, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct handler', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using token authentication', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct associationName and ownerModelName', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel2, association2, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using cors', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using correct payload validation', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel1, association1, {}, Log);
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel2, association2, {}, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    var serverObject1 = server.route.args[0][0];
    var serverObject2 = server.route.args[1][0];
    // Log.debug(JSON.stringify(serverObject));
    t.deepEqual(serverObject1.config.validate.payload, null, "correct payload validation");
    t.deepEqual(serverObject2.config.validate.payload, Joi.any().valid("TEST").allow(null), "correct payload validation");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  }));

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using correct params validation', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using correct header validation', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using hapi-swagger plugin', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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

  t.test('rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct response schema validation', sinon.test(function (t) {
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
    restHelperFactory.generateAssociationAddOneEndpoint(server, userModel, association, {}, Log);
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
