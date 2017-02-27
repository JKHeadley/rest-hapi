var test = require('tape');
var _ = require('lodash');
var sinon = require('sinon');
var rewire = require('rewire');
var proxyquire = require('proxyquire');
var assert = require('assert');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var logging = require('loggin');
var Q = require('q');
var Log = logging.getLogger("tests");
Log.logLevel = "DEBUG";
Log = Log.bind("model-helper");

//TODO: update createModel tests


test('model-helper exists and has expected members', function (t) {
  //<editor-fold desc="Arrange">
  var modelHelper = require('../utilities/model-helper');

  t.plan(4);
  //</editor-fold>

  //<editor-fold desc="Assert">
  t.ok(modelHelper, "model-helper exists.");
  t.ok(modelHelper.createModel, "model-helper.createModel exists.");
  t.ok(modelHelper.extendSchemaAssociations, "model-helper.extendSchemaAssociations exists.");
  t.ok(modelHelper.associateModels, "model-helper.associateModels exists.");
  //</editor-fold>
});

// test('model-helper.createModel', function(t) {
//   t.test('model-helper.createModel calls mongoose.model with correct arguments.', function (t) {
//     //<editor-fold desc="Arrange">
//     var mongooseStub = { model: sinon.spy() };
//     var modelHelper = proxyquire('../utilities/model-helper', {
//       'mongoose': mongooseStub
//     });
//     t.plan(2);
//
//     var collectionName = "user";
//     var Schema = { add: function(){},statics: { collectionName: collectionName } };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.createModel(Schema, mongooseStub);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(mongooseStub.model.called, "mongoose.model called");
//     t.ok(mongooseStub.model.calledWithExactly(collectionName, Schema), "mongoose.model called with correct args");
//     //</editor-fold>
//   });
//
//   t.end();
// });

test('model-helper.extendSchemaAssociations', function (t) {
  t.test('model-helper.extendSchemaAssociations calls Schema.add with correct args if association is MANY_MANY.', function (t) {
    //<editor-fold desc="Arrange">
    var modelHelper = require("../utilities/model-helper");

    t.plan(2);

    var userSchema = {};

    userSchema.statics = {
      routeOptions: {
        associations: {
          groups: {
            type: "MANY_MANY",
            model: "group"
          }
        }
      }
    };

    userSchema.add = sinon.spy();

    var extendObject = {
      groups: [{
        group: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "group"
        }
      }]
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    modelHelper.extendSchemaAssociations(userSchema, mongoose, "testPath");
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(userSchema.add.called, "Schema.add was called");
    t.ok(userSchema.add.calledWithExactly(extendObject), "Schema.add was called with extendObject");
    //</editor-fold>
  });

  t.test('model-helper.extendSchemaAssociations uses linkingModel to extend schema if it exists.', function (t) {
    //<editor-fold desc="Arrange">
    var modelHelper = require("../utilities/model-helper");

    t.plan(1);

    var userSchema = {};

    userSchema.statics = {
      routeOptions: {
        associations: {
          groups: {
            type: "MANY_MANY",
            model: "group",
            linkingModel: "test_linking"
          }
        }
      }
    };

    userSchema.add = sinon.spy();

    var linkingModelFile =
        "var mongoose = require('mongoose');\n\n" +
        "module.exports = function () {\n\n" +
        "  var Types = mongoose.Schema.Types;\n\n" +
        "  var Model = {\n" +
        "      Schema: {\n" +
        "        linkingModel: {\n" +
        "          type: Types.String\n" +
        "        }\n" +
        "      },\n" +
        "      modelName: 'test_linking'\n" +
        "  };\n" +
        "  return Model;\n" +
        "};\n";

    var extendObject = {
      groups: [{
        group: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "group"
        },
        linkingModel: {
          type: mongoose.Schema.Types.String
        }
      }]
    };

    var fs = require('fs');
    var mkdirp = require('mkdirp');
    var rmdir = require('rmdir');
    var linkingModelPath = __dirname + "/../models/linking-models/";
    var linkingModelfileName = linkingModelPath + "test_linking.model.js";

    mkdirp(linkingModelPath, function (err) {
      var deferred = Q.defer();

      if (err) {
        Log.error(err);
        deferred.reject(err);
      }

      fs.openSync(linkingModelfileName, 'w');

      fs.writeFile(linkingModelfileName, linkingModelFile, function (err) {
        if (err) {
          Log.error(err);
          deferred.reject(err);
        }
        deferred.resolve();
      });
      //</editor-fold>

      deferred.promise.then(function () {
        //<editor-fold desc="Act">
        try {
          modelHelper.extendSchemaAssociations(userSchema, mongoose, __dirname + "/../models");
        }
        catch (error) {
          Log.error(error);
          throw error;
        }
        //</editor-fold>

        //<editor-fold desc="Assert">
        t.ok(userSchema.add.calledWithExactly(extendObject), "Schema.add was called with extendObject");
        //</editor-fold>

        //<editor-fold desc="Restore">
        rmdir(__dirname + "/../models");
        fs.unlinkSync(linkingModelPath);
        //</editor-fold>
      });
    });

  });

  t.test('model-helper.extendSchemaAssociations calls Schema.virtual with correct args if association is ONE_MANY and has a foreignField.', function (t) {
    //<editor-fold desc="Arrange">
    var modelHelper = require("../utilities/model-helper");

    t.plan(3);

    var userSchema_foreignField = {};

    userSchema_foreignField.statics = {
      routeOptions: {
        associations: {
          employees: {
            type: "ONE_MANY",
            model: "user",
            foreignField: "boss"
          }
        }
      }
    };

    var userSchema_no_foreignField = {};

    userSchema_no_foreignField.statics = {
      routeOptions: {
        associations: {
          employees: {
            type: "ONE_MANY",
            model: "user"
          }
        }
      }
    };

    userSchema_foreignField.virtual = sinon.spy();
    userSchema_no_foreignField.virtual = sinon.spy();

    var virtualObject = {
      ref: "user",
      localField: "_id",
      foreignField: "boss"
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    modelHelper.extendSchemaAssociations(userSchema_foreignField);
    modelHelper.extendSchemaAssociations(userSchema_no_foreignField);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(userSchema_foreignField.virtual.called, "Schema.virtual was called");
    t.ok(userSchema_foreignField.virtual.calledWithExactly("employees", virtualObject), "Schema.virtual was called with virtualObject");
    t.notOk(userSchema_no_foreignField.virtual.called, "Schema.virtual was not called");
    //</editor-fold>
  });

  t.end();
});

test('model-helper.associateModels', function (t) {
  t.test('model-helper.associateModels builds association.include property.', function (t) {
    //<editor-fold desc="Arrange">
    var modelHelper = require("../utilities/model-helper");

    t.plan(6);

    var userSchema = {};

    var groups = {
      type: "MANY_MANY",
      model: "group"
    };

    var title = {
      type: "MANY_ONE",
      model: "role"
    };

    userSchema.statics = {
      routeOptions: {
        associations: {
          groups: groups,
          title: title
        }
      }
    };

    var models = {
      group: "testGroup",
      role: "testRole"
    };

    //</editor-fold>

    //<editor-fold desc="Act">
    modelHelper.associateModels(userSchema, models);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(groups.include, "groups.include exists");
    t.equals(groups.include.model, models.group, "groups.include.model is correct");
    t.equals(groups.include.as, "groups", "groups.include.as is correct");
    t.ok(title.include, "title.include exists");
    t.equals(title.include.model, models.role, "title.include.model is correct");
    t.equals(title.include.as, "title", "title.include.as is correct");
    //</editor-fold>
  });

  t.end();
});