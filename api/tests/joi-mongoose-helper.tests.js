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
  t.ok(joiMongooseHelper.generateJoiModelFromAttribute, "joi-mongoose-helper.generateJoiModelFromAttribute exists.");
  //</editor-fold>
});

test('joi-mongoose-helper.generateJoiReadModel', function(t) {
  var joiMongooseHelper = require('../utilities/joi-mongoose-helper');
  testHelper.testModelParameter(t, joiMongooseHelper.generateJoiReadModel, "joiMongooseHelper.generateJoiReadModel", ["model", "Log"], Log);

  t.test('joi-mongoose-helper.generateJoiReadModel calls generateJoiModelFromAttribute for regular readable fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      }
    });

    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromAttribute.calledWith(emailField), "generateJoiModelFromAttribute called on email field");
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "email field allowed" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel uses readModel if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        readModel: Joi.any().only("test")
      }
    });

    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromAttribute.calledWith(emailField), "generateJoiModelFromAttribute not called on email field");
    t.ok(Joi.validate({ email: "wrong" }, readModel).error !== null, "wrong field value not valid" );
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "correct field value valid" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel ignores fields where exclude is true or allowOnRead is false.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

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

    var userModel = mongoose.model("user", userSchema);

    var firstNameField = userModel.schema.paths["firstName"].options;
    var lastNameField = userModel.schema.paths["lastName"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromAttribute.calledWithExactly(firstNameField), "generateJoiModelFromAttribute not called on firstName field");
    t.notOk(joiMongooseHelper.generateJoiModelFromAttribute.calledWithExactly(lastNameField), "generateJoiModelFromAttribute not called on lastName field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel returns Joi object that rejects excluded fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(4);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

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

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "email field valid" );
    t.ok(Joi.validate({ firstName: "test" }, readModel).error !== null, "firstName field not valid" );
    t.ok(Joi.validate({ lastName: "test" }, readModel).error !== null, "lastName field not valid" );
    t.ok(Joi.validate({ notAField: "test" }, readModel).error !== null, "fields not listed not valid" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel returns Joi object that requires fields with "requireOnRead" set to true.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        requireOnRead: true
      }
    });

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({}, readModel).error !== null, "email field required" );
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "email field valid" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel includes associations.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(13);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({});

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
            type: "ONE_MANY",
            foreignField: "user"
          },
          permissions: {
            type: "MANY_MANY"
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
    t.ok(joiMongooseHelper.generateJoiModelFromAttribute.callCount === 2, "generateJoiModelFromAttribute not called on association fields");
    t.ok(Joi.validate({ title: {} }, readModel).error === null, "title field valid" );
    t.ok(Joi.validate({ title: null }, readModel).error === null, "null title field valid" );
    t.ok(Joi.validate({ title: "" }, readModel).error !== null, "non-object title field not valid" );
    t.ok(Joi.validate({ profileImage: {} }, readModel).error === null, "profileImage field not valid" );
    t.ok(Joi.validate({ profileImage: null }, readModel).error === null, "null profileImage field valid" );
    t.ok(Joi.validate({ profileImage: "" }, readModel).error !== null, "non-object profileImage field not valid" );
    t.ok(Joi.validate({ groups: [{},{}] }, readModel).error === null, "groups field not valid" );
    t.ok(Joi.validate({ groups: null }, readModel).error !== null, "null groups field not valid" );
    t.ok(Joi.validate({ groups: ["",3,{}] }, readModel).error !== null, "groups field must be array of objects" );
    t.ok(Joi.validate({ permissions: [{},{}] }, readModel).error === null, "permissions field not valid" );
    t.ok(Joi.validate({ permissions: null }, readModel).error !== null, "null permissions field not valid" );
    t.ok(Joi.validate({ permissions: ["",3,{}] }, readModel).error !== null, "permissions field must be array of objects" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiReadModel returns Joi object with appropriate className.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(readModel._meta[0].className === "userReadModel", "className correct" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

test('joi-mongoose-helper.generateJoiUpdateModel', function(t) {
  var joiMongooseHelper = require('../utilities/joi-mongoose-helper');
  testHelper.testModelParameter(t, joiMongooseHelper.generateJoiUpdateModel, "joiMongooseHelper.generateJoiUpdateModel", ["model", "Log"], Log);

  t.test('joi-mongoose-helper.generateJoiUpdateModel calls generateJoiModelFromAttribute for regular fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String
      }
    });

    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    // Log.debug(readModel);

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromAttribute.calledWith(emailField), "generateJoiModelFromAttribute called on email field");
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "email field allowed" );
  //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel uses updateModel if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(3);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        updateModel: Joi.any().only("test")
      }
    });

    var userModel = mongoose.model("user", userSchema);

    var emailField = userModel.schema.paths["email"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromAttribute.calledWith(emailField), "generateJoiModelFromAttribute not called on email field");
    t.ok(Joi.validate({ email: "wrong" }, readModel).error !== null, "wrong field value not valid" );
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "correct field value valid" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel ignores fields where allowOnUpdate is false.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

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

    var userModel = mongoose.model("user", userSchema);

    var firstNameField = userModel.schema.paths["firstName"].options;
    var lastNameField = userModel.schema.paths["lastName"].options;
    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notOk(joiMongooseHelper.generateJoiModelFromAttribute.calledWithExactly(firstNameField), "generateJoiModelFromAttribute not called on firstName field");
    t.notOk(joiMongooseHelper.generateJoiModelFromAttribute.calledWithExactly(lastNameField), "generateJoiModelFromAttribute not called on lastName field");
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel returns Joi object that rejects excluded fields.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(4);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

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

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "email field valid" );
    t.ok(Joi.validate({ firstName: "test" }, readModel).error !== null, "firstName field not valid" );
    t.ok(Joi.validate({ lastName: "test" }, readModel).error !== null, "lastName field not valid" );
    t.ok(Joi.validate({ notAField: "test" }, readModel).error !== null, "fields not listed not valid" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel returns Joi object that requires fields with "requireOnRead" set to true.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(2);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        requireOnRead: true
      }
    });

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(Joi.validate({}, readModel).error !== null, "email field required" );
    t.ok(Joi.validate({ email: "test" }, readModel).error === null, "email field valid" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel includes associations.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(13);

    sinon.stub(joiMongooseHelper, "generateJoiModelFromAttribute", function() { return Joi.any() });

    var userSchema = new mongoose.Schema({});

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
            type: "ONE_MANY",
            foreignField: "user"
          },
          permissions: {
            type: "MANY_MANY"
          }
        }
      }
    };

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(joiMongooseHelper.generateJoiModelFromAttribute.callCount === 2, "generateJoiModelFromAttribute not called on association fields");
    t.ok(Joi.validate({ title: {} }, readModel).error === null, "title field valid" );
    t.ok(Joi.validate({ title: null }, readModel).error === null, "null title field valid" );
    t.ok(Joi.validate({ title: "" }, readModel).error !== null, "non-object title field not valid" );
    t.ok(Joi.validate({ profileImage: {} }, readModel).error === null, "profileImage field not valid" );
    t.ok(Joi.validate({ profileImage: null }, readModel).error === null, "null profileImage field valid" );
    t.ok(Joi.validate({ profileImage: "" }, readModel).error !== null, "non-object profileImage field not valid" );
    t.ok(Joi.validate({ groups: [{},{}] }, readModel).error === null, "groups field not valid" );
    t.ok(Joi.validate({ groups: null }, readModel).error !== null, "null groups field not valid" );
    t.ok(Joi.validate({ groups: ["",3,{}] }, readModel).error !== null, "groups field must be array of objects" );
    t.ok(Joi.validate({ permissions: [{},{}] }, readModel).error === null, "permissions field not valid" );
    t.ok(Joi.validate({ permissions: null }, readModel).error !== null, "null permissions field not valid" );
    t.ok(Joi.validate({ permissions: ["",3,{}] }, readModel).error !== null, "permissions field must be array of objects" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    joiMongooseHelper.generateJoiModelFromAttribute.restore();
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.test('joi-mongoose-helper.generateJoiUpdateModel returns Joi object with appropriate className.', function (t) {
    //<editor-fold desc="Arrange">
    var joiMongooseHelper = require('../utilities/joi-mongoose-helper');

    t.plan(1);

    var userSchema = new mongoose.Schema({});

    var userModel = mongoose.model("user", userSchema);

    //</editor-fold>

    //<editor-fold desc="Act">
    var readModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(readModel._meta[0].className === "userReadModel", "className correct" );
    //</editor-fold>

    //<editor-fold desc="Restore">
    delete mongoose.models.user;
    delete mongoose.modelSchemas.user;
    //</editor-fold>
  });

  t.end();
});

// test('joi-mongoose-helper.extendSchemaAssociations', function(t) {
//   t.test('joi-mongoose-helper.extendSchemaAssociations calls Schema.extend with correct args if association is MANY_MANY.', function (t) {
//     //<editor-fold desc="Arrange">
//     var joiMongooseHelper = require("../utilities/joi-mongoose-helper");
//
//     t.plan(2);
//
//     var userSchema = {};
//
//     userSchema.methods = {
//       routeOptions: {
//         associations: {
//           groups: {
//             type: "MANY_MANY",
//             model: "group"
//           }
//         }
//       }
//     };
//
//     userSchema.extend = sinon.spy();
//
//     var extendObject = {
//       groups: [{
//         group: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "group"
//         }
//       }]
//     };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     joiMongooseHelper.extendSchemaAssociations(userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(userSchema.extend.called, "Schema.extend was called");
//     t.ok(userSchema.extend.calledWithExactly(extendObject), "Schema.extend was called with extendObject");
//     //</editor-fold>
//   });
//
//   t.test('joi-mongoose-helper.extendSchemaAssociations calls Schema.virtual with correct args if association is ONE_MANY and has a foreignField.', function (t) {
//     //<editor-fold desc="Arrange">
//     var joiMongooseHelper = require("../utilities/joi-mongoose-helper");
//
//     t.plan(3);
//
//     var userSchema_foreignField = {};
//
//     userSchema_foreignField.methods = {
//       routeOptions: {
//         associations: {
//           employees: {
//             type: "ONE_MANY",
//             model: "user",
//             foreignField: "boss"
//           }
//         }
//       }
//     };
//
//     var userSchema_no_foreignField = {};
//
//     userSchema_no_foreignField.methods = {
//       routeOptions: {
//         associations: {
//           employees: {
//             type: "ONE_MANY",
//             model: "user"
//           }
//         }
//       }
//     };
//
//     userSchema_foreignField.virtual = sinon.spy();
//     userSchema_no_foreignField.virtual = sinon.spy();
//
//     var virtualObject = {
//       ref: "user",
//       localField: "_id",
//       foreignField: "boss"
//     };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     joiMongooseHelper.extendSchemaAssociations(userSchema_foreignField);
//     joiMongooseHelper.extendSchemaAssociations(userSchema_no_foreignField);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(userSchema_foreignField.virtual.called, "Schema.virtual was called");
//     t.ok(userSchema_foreignField.virtual.calledWithExactly("employees", virtualObject), "Schema.virtual was called with virtualObject");
//     t.notOk(userSchema_no_foreignField.virtual.called, "Schema.virtual was not called");
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('joi-mongoose-helper.associateModels', function(t) {
//   t.test('joi-mongoose-helper.associateModels builds association.include property.', function (t) {
//     //<editor-fold desc="Arrange">
//     var joiMongooseHelper = require("../utilities/joi-mongoose-helper");
//
//     t.plan(6);
//
//     var userSchema = {};
//
//     var groups = {
//       type: "MANY_MANY",
//       model: "group"
//     };
//
//     var title = {
//       type: "MANY_ONE",
//       model: "role"
//     };
//
//     userSchema.methods = {
//       routeOptions: {
//         associations: {
//           groups: groups,
//           title: title
//         }
//       }
//     };
//
//     var models = {
//       group: "testGroup",
//       role: "testRole"
//     };
//
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     joiMongooseHelper.associateModels(userSchema, models);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(groups.include, "groups.include exists");
//     t.equals(groups.include.model, models.group, "groups.include.model is correct");
//     t.equals(groups.include.as, "groups", "groups.include.as is correct");
//     t.ok(title.include, "title.include exists");
//     t.equals(title.include.model, models.role, "title.include.model is correct");
//     t.equals(title.include.as, "title", "title.include.as is correct");
//     //</editor-fold>
//   });
//
//   t.end();
// });