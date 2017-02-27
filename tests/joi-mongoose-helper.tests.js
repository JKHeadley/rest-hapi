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
Log = Log.bind("joi-mongoose-helper");
var testHelper = require("./test-helper");
var Joi = require('joi');


test('joi-mongoose-helper exists and has expected members', function (t) {
  //<editor-fold desc="Arrange">
  var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

  t.plan(6);
  //</editor-fold>

  //<editor-fold desc="Assert">
  t.ok(joiMongooseHelper, "joi-mongoose-helper exists.");
  t.ok(joiMongooseHelper.generateJoiReadModel, "joi-mongoose-helper.generateJoiReadModel exists.");
  t.ok(joiMongooseHelper.generateJoiUpdateModel, "joi-mongoose-helper.generateJoiUpdateModel exists.");
  t.ok(joiMongooseHelper.generateJoiCreateModel, "joi-mongoose-helper.generateJoiCreateModel exists.");
  t.ok(joiMongooseHelper.generateJoiAssociationModel, "joi-mongoose-helper.generateJoiAssociationModel exists.");
  t.ok(joiMongooseHelper.generateJoiModelFromFieldType, "joi-mongoose-helper.generateJoiModelFromFieldType exists.");
  //</editor-fold>
});

test('joi-mongoose-helper.generateJoiReadModel', function (t) {
  var joiMongooseHelper = require('../utilities/joi-mongoose-helper');
  testHelper.testModelParameter(t, joiMongooseHelper.generateJoiReadModel, "joiMongooseHelper.generateJoiReadModel", ["model", "Log"], Log);

  t.test('joi-mongoose-helper.generateJoiReadModel calls generateJoiModelFromFieldType for regular readable fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType called on email field");
    t.ok(Joi.validate({email: "test"}, readModel).error === null, "email field allowed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel uses readModel if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        readModel: Joi.any().only("test")
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType not called on email field");
    t.ok(Joi.validate({email: "wrong"}, readModel).error !== null, "wrong field value not valid");
    t.ok(Joi.validate({email: "test"}, readModel).error === null, "correct field value valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel ignores fields where exclude is true or allowOnRead is false.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      firstName: {
        type: Types.String,
        allowOnRead: false
      },
      lastName: {
        type: Types.String,
        exclude: true
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var firstNameField = userModel.schema.paths["firstName"].options;
    var lastNameField = userModel.schema.paths["lastName"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(firstNameField), "generateJoiModelFromFieldType not called on firstName field");
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(lastNameField), "generateJoiModelFromFieldType not called on lastName field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel returns Joi object that rejects excluded fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(4);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      },
      firstName: {
        type: Types.String,
        allowOnRead: false
      },
      lastName: {
        type: Types.String,
        exclude: true
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({email: "test"}, readModel).error === null, "email field valid");
    t.ok(Joi.validate({firstName: "test"}, readModel).error !== null, "firstName field not valid");
    t.ok(Joi.validate({lastName: "test"}, readModel).error !== null, "lastName field not valid");
    t.ok(Joi.validate({notAField: "test"}, readModel).error !== null, "fields not listed not valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel returns Joi object that requires fields with "requireOnRead" set to true.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        requireOnRead: true
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({}, readModel).error !== null, "email field required");
    t.ok(Joi.validate({email: "test"}, readModel).error === null, "email field valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel includes associations.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(16);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({});

    userSchema.statics = {
      routeOptions: {
        associations: {
          title: {
            type: "MANY_ONE"
          },
          profileImage: {
            type: "ONE_ONE"
          },
          groups: {
            type: "ONE_MANY",
            foreignField: "user"
          },
          permissions: {
            type: "MANY_MANY",
            linkingModel: "link"
          }
        }
      }
    };

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.callCount === 1, "generateJoiModelFromFieldType not called on association fields");
    t.ok(Joi.validate({title: {}}, readModel).error === null, "title field valid");
    t.ok(Joi.validate({title: null}, readModel).error === null, "null title field valid");
    t.ok(Joi.validate({title: ""}, readModel).error !== null, "non-object title field not valid");
    t.ok(Joi.validate({profileImage: {}}, readModel).error === null, "profileImage field valid");
    t.ok(Joi.validate({profileImage: null}, readModel).error === null, "null profileImage field valid");
    t.ok(Joi.validate({profileImage: ""}, readModel).error !== null, "non-object profileImage field not valid");
    t.ok(Joi.validate({groups: [{}, {}]}, readModel).error === null, "groups field valid");
    t.ok(Joi.validate({groups: null}, readModel).error !== null, "null groups field not valid");
    t.ok(Joi.validate({groups: ["", 3, {}]}, readModel).error !== null, "groups field must be array of objects");
    t.ok(Joi.validate({permissions: [{}, {}]}, readModel).error === null, "permissions field valid");
    t.ok(Joi.validate({permissions: null}, readModel).error !== null, "null permissions field not valid");
    t.ok(Joi.validate({permissions: ["", 3, {}]}, readModel).error !== null, "permissions field must be array of objects");
    t.ok(Joi.validate({link: {}}, readModel).error === null, "link field valid");
    t.ok(Joi.validate({link: null}, readModel).error === null, "null link field valid");
    t.ok(Joi.validate({link: ""}, readModel).error !== null, "non-object link field not valid");
//</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel returns Joi object with appropriate className.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({});

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(readModel._meta[0].className === "userReadModel", "className correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

test('joi-mongoose-helper.generateJoiUpdateModel', function (t) {
  var joiMongooseHelper = require('../utilities/joi-mongoose-helper');
  testHelper.testModelParameter(t, joiMongooseHelper.generateJoiUpdateModel, "joiMongooseHelper.generateJoiUpdateModel", ["model", "Log"], Log);

  t.test('joi-mongoose-helper.generateJoiUpdateModel calls generateJoiModelFromFieldType for regular fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType called on email field");
    t.ok(Joi.validate({email: "test"}, updateModel).error === null, "email field allowed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel uses updateModel if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        updateModel: Joi.any().only("test")
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType not called on email field");
    t.ok(Joi.validate({email: "wrong"}, updateModel).error !== null, "wrong field value not valid");
    t.ok(Joi.validate({email: "test"}, updateModel).error === null, "correct field value valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel ignores fields where allowOnUpdate is false.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      firstName: {
        type: Types.String,
        allowOnUpdate: false
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var firstNameField = userModel.schema.paths["firstName"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(firstNameField), "generateJoiModelFromFieldType not called on firstName field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel ignores fields "__t" and "__v".', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      __t: {
        type: Types.String
      },
      __v: {
        type: Types.String
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var __tField = userModel.schema.paths["__t"].options;
    var __vField = userModel.schema.paths["__v"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(__tField), "generateJoiModelFromFieldType not called on __t field");
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(__vField), "generateJoiModelFromFieldType not called on __v field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel returns Joi object that rejects excluded fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      },
      firstName: {
        type: Types.String,
        allowOnUpdate: false
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({email: "test"}, updateModel).error === null, "email field valid");
    t.ok(Joi.validate({firstName: "test"}, updateModel).error !== null, "firstName field not valid");
    t.ok(Joi.validate({notAField: "test"}, updateModel).error !== null, "fields not listed not valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel returns Joi object that requires fields with "requireOnRead" set to true.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        requireOnUpdate: true
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({}, updateModel).error !== null, "email field required");
    t.ok(Joi.validate({email: "test"}, updateModel).error === null, "email field valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel includes associations.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(8);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any().only("test")
    });

    var userSchema = new mongoose.Schema({
      title: {
        type: Types.ObjectId
      },
      profileImage: {
        type: Types.ObjectId
      },
      groups: {
        type: Types.ObjectId
      },
      permissions: {
        type: Types.ObjectId
      }
    });

    userSchema.statics = {
      routeOptions: {
        associations: {
          title: {
            type: "MANY_ONE"
          },
          profileImage: {
            type: "ONE_ONE"
          },
          groups: {
            type: "ONE_MANY"
          },
          permissions: {
            type: "MANY_MANY"
          }
        }
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var titleField = userModel.schema.paths["title"].options;
    var profileImageField = userModel.schema.paths["profileImage"].options;

    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(titleField, Log), "generateJoiModelFromFieldType called on titleField field");
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(profileImageField, Log), "generateJoiModelFromFieldType called on profileImageField field");
    t.ok(Joi.validate({title: {}}, updateModel).error !== null, "title field not valid format");
    t.ok(Joi.validate({title: "test"}, updateModel).error === null, "title field valid format");
    t.ok(Joi.validate({profileImage: {}}, updateModel).error !== null, "profileImage field not valid format");
    t.ok(Joi.validate({profileImage: "test"}, updateModel).error === null, "profileImage field valid format");
    t.ok(Joi.validate({groups: "test"}, updateModel).error !== null, "groups field not allowed");
    t.ok(Joi.validate({permissions: "test"}, updateModel).error !== null, "permissions field not allowed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel returns Joi object with appropriate className.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(updateModel._meta[0].className === "userUpdateModel", "className correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

test('joi-mongoose-helper.generateJoiCreateModel', function (t) {
  var joiMongooseHelper = require('../utilities/joi-mongoose-helper');
  testHelper.testModelParameter(t, joiMongooseHelper.generateJoiCreateModel, "joiMongooseHelper.generateJoiCreateModel", ["model", "Log"], Log);

  t.test('joi-mongoose-helper.generateJoiCreateModel calls generateJoiModelFromFieldType for regular fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType called on email field");
    t.ok(Joi.validate({email: "test"}, createModel).error === null, "email field allowed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel uses createModel if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        createModel: Joi.any().only("test")
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType not called on email field");
    t.ok(Joi.validate({email: "wrong"}, createModel).error !== null, "wrong field value not valid");
    t.ok(Joi.validate({email: "test"}, createModel).error === null, "correct field value valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel ignores fields where allowOnCreate is false.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      firstName: {
        type: Types.String,
        allowOnCreate: false
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var firstNameField = userModel.schema.paths["firstName"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(firstNameField), "generateJoiModelFromFieldType not called on firstName field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel ignores fields "__t" and "__v".', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      __t: {
        type: Types.String
      },
      __v: {
        type: Types.String
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    var __tField = userModel.schema.paths["__t"].options;
    var __vField = userModel.schema.paths["__v"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(__tField), "generateJoiModelFromFieldType not called on __t field");
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(__vField), "generateJoiModelFromFieldType not called on __v field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel returns Joi object that rejects excluded fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      },
      firstName: {
        type: Types.String,
        allowOnCreate: false
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({email: "test"}, createModel).error === null, "email field valid");
    t.ok(Joi.validate({firstName: "test"}, createModel).error !== null, "firstName field not valid");
    t.ok(Joi.validate({notAField: "test"}, createModel).error !== null, "fields not listed not valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel returns Joi object that requires fields with "required" set to true.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        required: true
      }
    });

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({}, createModel).error !== null, "email field required");
    t.ok(Joi.validate({email: "test"}, createModel).error === null, "email field valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel includes associations.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(8);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any().only("test")
    });

    var userSchema = new mongoose.Schema({
      title: {
        type: Types.ObjectId
      },
      profileImage: {
        type: Types.ObjectId
      },
      groups: {
        type: Types.ObjectId
      },
      permissions: {
        type: Types.ObjectId
      }
    });

    userSchema.statics = {
      routeOptions: {
        associations: {
          title: {
            type: "MANY_ONE"
          },
          profileImage: {
            type: "ONE_ONE"
          },
          groups: {
            type: "ONE_MANY"
          },
          permissions: {
            type: "MANY_MANY"
          }
        }
      }
    };

    var userModel = mongoose.model("user", userSchema);

    var titleField = userModel.schema.paths["title"].options;
    var profileImageField = userModel.schema.paths["profileImage"].options;

    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(titleField, Log), "generateJoiModelFromFieldType called on titleField field");
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWithExactly(profileImageField, Log), "generateJoiModelFromFieldType called on profileImageField field");
    t.ok(Joi.validate({title: {}}, createModel).error !== null, "title field not valid format");
    t.ok(Joi.validate({title: "test"}, createModel).error === null, "title field valid format");
    t.ok(Joi.validate({profileImage: {}}, createModel).error !== null, "profileImage field not valid format");
    t.ok(Joi.validate({profileImage: "test"}, createModel).error === null, "profileImage field valid format");
    t.ok(Joi.validate({groups: "test"}, createModel).error !== null, "groups field not allowed");
    t.ok(Joi.validate({permissions: "test"}, createModel).error !== null, "permissions field not allowed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiCreateModel returns Joi object with appropriate className.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    userSchema.statics = {routeOptions: {}};
    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(createModel._meta[0].className === "userCreateModel", "className correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

test('joi-mongoose-helper.generateJoiAssociationModel', function (t) {
  t.test('joi-mongoose-helper.generateJoiAssociationModel calls generateJoiModelFromFieldType for regular fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userModel = {
      Schema: {
        email: {
          type: Types.String
        }
      },
      modelName: "group_permission"
    };

    var emailField = userModel.Schema["email"];
    //</editor-fold>

    //<editor-fold desc="Act">
    var associationModel = joiMongooseHelper.generateJoiAssociationModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType called on email field");
    t.ok(Joi.validate({email: "test"}, associationModel).error === null, "email field allowed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiAssociationModel uses createModel if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userModel = {
      Schema: {
        email: {
          type: Types.String,
          createModel: Joi.any().only("test")
        }
      }
    };

    var emailField = userModel.Schema["email"];
    //</editor-fold>

    //<editor-fold desc="Act">
    var associationModel = joiMongooseHelper.generateJoiAssociationModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromFieldType.calledWith(emailField), "generateJoiModelFromFieldType not called on email field");
    t.ok(Joi.validate({email: "wrong"}, associationModel).error !== null, "wrong field value not valid");
    t.ok(Joi.validate({email: "test"}, associationModel).error === null, "correct field value valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiAssociationModel returns Joi object that rejects excluded fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userModel = {
      Schema: {
        email: {
          type: Types.String
        }
      }
    };

    //</editor-fold>

    //<editor-fold desc="Act">
    var associationModel = joiMongooseHelper.generateJoiAssociationModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({email: "test"}, associationModel).error === null, "email field valid");
    t.ok(Joi.validate({notAField: "test"}, associationModel).error !== null, "fields not listed not valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiAssociationModel returns Joi object that requires fields with "required" set to true.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromFieldType", function () {
      return Joi.any()
    });

    var userModel = {
      Schema: {
        email: {
          type: Types.String,
          required: true
        }
      }
    };

    //</editor-fold>

    //<editor-fold desc="Act">
    var associationModel = joiMongooseHelper.generateJoiAssociationModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({}, associationModel).error !== null, "email field required");
    t.ok(Joi.validate({email: "test"}, associationModel).error === null, "email field valid");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromFieldType.restore();
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiAssociationModel returns Joi object with appropriate className.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    var userModel = {
      Schema: {},
      modelName: "user"
    };

    //</editor-fold>

    //<editor-fold desc="Act">
    var associationModel = joiMongooseHelper.generateJoiAssociationModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(associationModel._meta[0].className === "userAssociationModel", "className correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  });

  t.end();
});

test('joi-mongoose-helper.generateJoiModelFromFieldType', function (t) {
  t.test('joi-mongoose-helper.generateJoiAssociationModel returns correct models for types.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(13);

    var testSchema = {
      idType: {
        type: {
          schemaName: "ObjectId"
        }
      },
      booleanType: {
        type: {
          schemaName: "Boolean"
        }
      },
      numberType: {
        type: {
          schemaName: "Number"
        }
      },
      dateType: {
        type: {
          schemaName: "Date"
        }
      },
      stringType: {
        type: {
          schemaName: "String"
        }
      },
      enumType: {
        type: {
          schemaName: "String"
        },
        enum: ['test1', 'test2']
      },
      allowNullType: {
        type: {
          schemaName: "String"
        },
        allowNull: true
      }
    };

    //</editor-fold>

    //<editor-fold desc="Act">
    var idModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.idType, Log);
    var booleanModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.booleanType, Log);
    var numberModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.numberType, Log);
    var dateModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.dateType, Log);
    var stringModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.stringType, Log);
    var enumModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.enumType, Log);
    var allowNullModel = joiMongooseHelper.generateJoiModelFromFieldType(testSchema.allowNullType, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(idModel.validate("57d8752088ac2472a7d04863").error === null, "idModel validates an _id");
    t.ok(idModel.validate("57d8752088ac2472a7d04863Z").error !== null, "idModel rejects a _id with wrong format");
    t.ok(booleanModel.validate(true).error === null, "booleanModel validates a bool");
    t.ok(booleanModel.validate("").error !== null, "booleanModel rejects non bools");
    t.ok(numberModel.validate(3).error === null, "numberModel validates a number");
    t.ok(numberModel.validate("").error !== null, "numberModel rejects non numbers");
    t.ok(dateModel.validate(new Date()).error === null, "dateModel validates a date");
    t.ok(dateModel.validate("").error !== null, "dateModel rejects non dates");
    t.ok(stringModel.validate("test").error === null, "stringModel validates a string");
    t.ok(stringModel.validate(0).error !== null, "stringModel rejects non strings");
    t.ok(enumModel.validate("test2").error === null, "enumModel validates an allowed value");
    t.ok(enumModel.validate("test").error !== null, "enumModel rejects a not allowed value");
    t.ok(allowNullModel.validate(null).error === null, "allowNullModel validates a null value");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  });

  t.end();
});