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

// test('rest-helper-factory.generateListEndpoint', function(t) {
//   var server = sinon.spy();
//   var restHelperFactory = require('../utilities/rest-helper-factory')(Log, mongoose, server);
//   testHelper.testModelParameter(t, restHelperFactory.generateListEndpoint, "restHelperFactory.generateListEndpoint", ["server", "model", "options", "Log"], Log);
//
//   t.test('rest-helper-factory.generateListEndpoint calls generateListHandler', function (t) {
//     //<editor-fold desc="Arrange">
//     var server = sinon.stub({route: function(){}});
//
//     var handlerHelperStub = sinon.stub(require('../utilities/handler-helper-factory')(sinon.spy(),server));
//     var handlerHelperStubWrapper = sinon.stub();
//     handlerHelperStubWrapper.returns(handlerHelperStub);
//     var queryHelperStub = sinon.stub(require('../utilities/query-helper'));
//     var joiMongooseHelperStub = sinon.stub(require('../utilities/joi-mongoose-helper'));
//     var restHelperFactory = proxyquire('../utilities/rest-helper-factory', {
//       './handler-helper-factory': handlerHelperStubWrapper,
//       './query-helper': queryHelperStub,
//       './joi-mongoose-helper': joiMongooseHelperStub
//     })(Log, mongoose, server);
//
//     t.plan(1);
//
//     var userSchema = new mongoose.Schema();
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     restHelperFactory.generateListEndpoint(server, userModel, {}, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(handlerHelperStub.generateListHandler.called, "generateListHandler called");
//     //</editor-fold>
//
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     handlerHelperStub.restore();
//     queryHelperStub.restore();
//     joiMongooseHelperStub.restore();
//     //</editor-fold>
//   });
//
//   t.end();
// });