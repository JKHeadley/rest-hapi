var test = require('tape');
var _ = require('lodash');
var sinon = require('sinon');
var rewire = require('rewire');
var mongoose = require('mongoose');
var Types = mongoose.Schema.Types;
var logging = require('loggin');
var Log = logging.getLogger("tests");
Log.logLevel = "DEBUG";
Log = Log.bind("model-helper");
var testHelper = require("./test-helper");


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

// test('model-helper.getQueryableFields', function(t) {
//   var modelHelper = require('../utilities/model-helper');
//   testHelper.testModelParameter(t, modelHelper.getQueryableFields, "modelHelper.getQueryableFields", ["model", "Log"], Log);
//
//   t.test('model-helper.getQueryableFields doesn\'t return fields with "queryable" set to false.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(6);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: false
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.getQueryableFields(userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(_.isArray(result), "result is an array");
//     t.equal(result.length, 3, "result has three items");
//     t.ok(_.indexOf(result, "email") > -1, "result contains email");
//     t.ok(_.indexOf(result, "firstName") > -1, "result contains firstName");
//     t.ok(_.indexOf(result, "lastName") > -1, "result contains lastName");
//     t.ok(_.indexOf(result, "password") < 0, "result doesn't contain password");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.getQueryableFields doesn\'t return fields with "exclude" set to true.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(6);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.getQueryableFields(userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(_.isArray(result), "result is an array");
//     t.equal(result.length, 3, "result has three items");
//     t.ok(_.indexOf(result, "email") > -1, "result contains email");
//     t.ok(_.indexOf(result, "firstName") > -1, "result contains firstName");
//     t.ok(_.indexOf(result, "lastName") > -1, "result contains lastName");
//     t.ok(_.indexOf(result, "password") < 0, "result doesn't contain password");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.getQueryableFields doesn\'t return the fields "__v", "__t", or "_id".', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(5);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//
//     var fields = userModel.schema.paths;
//     var fieldNames = Object.keys(fields);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.getQueryableFields(userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(_.indexOf(fieldNames, "__v") > -1, "model contains __v field");
//     t.ok(_.indexOf(fieldNames, "_id") > -1, "model contains _id field");
//
//     t.ok(_.indexOf(result, "__v") < 0, "result doesn't contain __v");
//     t.ok(_.indexOf(result, "__t") < 0, "result doesn't contain __t");
//     t.ok(_.indexOf(result, "_id") < 0, "result doesn't contain _id");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.getQueryableFields returns association fields except for those of type "MANY_MANY".', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(4);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       },
//       title: {
//         type: Types.ObjectId
//       },
//       profileImage: {
//         type: Types.ObjectId
//       },
//       groups: {
//         type: [Types.ObjectId]
//       },
//       permissions: {
//         type: [Types.ObjectId]
//       }
//     });
//
//     userSchema.methods = {
//       routeOptions: {
//         associations: {
//           title: {
//             type: "ONE_MANY"
//           },
//           profileImage: {
//             type: "ONE_ONE"
//           },
//           groups: {
//             type: "MANY_MANY"
//           },
//           permissions: {
//             type: "MANY_MANY"
//           }
//         }
//       }
//     };
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.getQueryableFields(userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(_.indexOf(result, "title") > -1, "result contains title");
//     t.ok(_.indexOf(result, "profileImage") > -1, "result contains profileImage");
//     t.ok(_.indexOf(result, "groups") < 0, "result doesn't contain groups");
//     t.ok(_.indexOf(result, "permissions") < 0, "result doesn't contain permissions");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('model-helper.getReadableFields', function(t) {
//   var modelHelper = require('../utilities/model-helper');
//   testHelper.testModelParameter(t, modelHelper.getReadableFields, "modelHelper.getReadableFields", ["model", "Log"], Log);
//
//   t.test('model-helper.getReadableFields doesn\'t return fields with "exclude" set to true.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(5);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String,
//         queryable: false
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.getReadableFields(userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(_.isArray(result), "result is an array");
//     t.ok(_.indexOf(result, "email") > -1, "result contains email");
//     t.ok(_.indexOf(result, "firstName") > -1, "result contains firstName");
//     t.ok(_.indexOf(result, "lastName") > -1, "result contains lastName");
//     t.ok(_.indexOf(result, "password") < 0, "result doesn't contain password");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.getReadableFields doesn\'t return the field "__v".', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(4);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//
//     var fields = userModel.schema.paths;
//     var fieldNames = Object.keys(fields);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.getReadableFields(userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(_.indexOf(fieldNames, "__v") > -1, "model contains __v field");
//     t.ok(_.indexOf(fieldNames, "_id") > -1, "model contains _id field");
//
//     t.ok(_.indexOf(result, "__v") < 0, "result doesn't contain __v");
//     t.ok(_.indexOf(result, "_id") > -1, "result contains _id");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('model-helper.setSkip', function(t) {
//   t.test('model-helper.setSkip calls the "skip" function with the "$skip" query parameter.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(4);
//
//     var query = { $skip: 3 };
//     var mongooseQuery = {};
//     mongooseQuery.skip = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.setSkip(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(mongooseQuery.skip.called, "the skip function was called");
//     t.ok(mongooseQuery.skip.calledWith(3), "the skip function was called with argument '3'");
//     t.notOk(query.$skip, "the '$skip' query parameter was deleted");
//     t.equals(mongooseQuery, result, "the mongooseQuery is returned");
//     //</editor-fold>
//   });
//
//   t.test('model-helper.setSkip doesn\'t call the "skip" function if the "$skip" query parameter is missing.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(2);
//
//     var query = {};
//     var mongooseQuery = {};
//     mongooseQuery.skip = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.setSkip(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.notOk(mongooseQuery.skip.called, "the skip function was not called");
//     t.equals(mongooseQuery, result, "the mongooseQuery is returned");
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('model-helper.setLimit', function(t) {
//   t.test('model-helper.setLimit calls the "limit" function with the "$limit" query parameter.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(4);
//
//     var query = { $limit: 3 };
//     var mongooseQuery = {};
//     mongooseQuery.limit = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.setLimit(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(mongooseQuery.limit.called, "the limit function was called");
//     t.ok(mongooseQuery.limit.calledWith(3), "the limit function was called with argument '3'");
//     t.notOk(query.$limit, "the '$limit' query parameter was deleted");
//     t.equals(mongooseQuery, result, "the mongooseQuery is returned");
//     //</editor-fold>
//   });
//
//   t.test('model-helper.setLimit doesn\'t call the "limit" function if the "$limit" query parameter is missing.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(2);
//
//     var query = {};
//     var mongooseQuery = {};
//     mongooseQuery.limit = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.setLimit(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.notOk(mongooseQuery.limit.called, "the limit function was not called");
//     t.equals(mongooseQuery, result, "the mongooseQuery is returned");
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('model-helper.populateEmbeddedDocs', function(t) {
//   t.test('model-helper.populateEmbeddedDocs returns immediately if "$embed" query parameter is missing.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(2);
//
//     var attributesFilter = {};
//     var mongooseQuery = {};
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.populateEmbeddedDocs({}, mongooseQuery, attributesFilter, {}, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.deepEqual(mongooseQuery, result.mongooseQuery, "mongooseQuery unchanged");
//     t.deepEqual(attributesFilter,result.attributesFilter, "attributesFilter unchanged");
//     //</editor-fold>
//   });
//
//   t.test('model-helper.populateEmbeddedDocs generates populate object and calls "mongooseQuery.populate".', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     var nestPopulate = sinon.stub();
//     nestPopulate.returns({});
//     modelHelper.__set__("nestPopulate", nestPopulate);
//
//     t.plan(4);
//
//     var attributesFilter = {};
//     var mongooseQuery = {};
//     mongooseQuery.populate = sinon.spy();
//     var query = { $embed: "title,profileImage,groups" };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     modelHelper.populateEmbeddedDocs(query, mongooseQuery, attributesFilter, {}, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(nestPopulate.called, "nestPopulate called");
//     t.equals(nestPopulate.callCount, 3, "nestPopulate called for each embed parameter");
//     t.ok(mongooseQuery.populate.called, "mongooseQuery.populate called");
//     t.equals(mongooseQuery.populate.callCount, 3, "mongooseQuery.populate called for each embed parameter");
//     //</editor-fold>
//   });
//
//   t.test('model-helper.populateEmbeddedDocs returns updated attributesFilter.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     var nestPopulate = sinon.stub();
//     nestPopulate.returns({});
//     modelHelper.__set__("nestPopulate", nestPopulate);
//
//     t.plan(1);
//
//     var attributesFilter = {};
//     var mongooseQuery = {};
//     mongooseQuery.populate = sinon.spy();
//     var query = { $embed: "title,profileImage,groups" };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.populateEmbeddedDocs(query, mongooseQuery, attributesFilter, {}, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.notEquals(attributesFilter, result.attributesFilter, "attributesFilter updated");
//     //</editor-fold>
//   });
//
//   t.test('model-helper.populateEmbeddedDocs deletes appropriate query params when finished.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     var nestPopulate = sinon.stub();
//     nestPopulate.returns({});
//     modelHelper.__set__("nestPopulate", nestPopulate);
//
//     t.plan(2);
//
//     var attributesFilter = {};
//     var mongooseQuery = {};
//     mongooseQuery.populate = sinon.spy();
//     var query = { $embed: "title,profileImage,groups", populateSelect: "" };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     modelHelper.populateEmbeddedDocs(query, mongooseQuery, attributesFilter, {}, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.notOk(query.$embed, "query.$embed deleted");
//     t.notOk(query.populateSelect, "query.populateSelect deleted");
//     //</editor-fold>
//   });
//
//   t.test('nestPopulate uses query.populateSelect if it exists.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     sinon.stub(modelHelper, "createAttributesFilter", sinon.spy());
//
//     var nestPopulate = modelHelper.__get__("nestPopulate");
//
//     t.plan(2);
//
//     var query = {
//       $embed: "title.users.groups,profileImage,groups",
//       populateSelect: {
//         replace: sinon.spy()
//       }
//     };
//
//     var embeds = ["title"];
//     var associations = {
//       title: {
//         type: {},
//         model: {}
//       }
//     };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     nestPopulate(query, {}, 0, embeds, associations, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(query.populateSelect.replace.called, "populateSelect used for select");
//     t.notOk(modelHelper.createAttributesFilter.called, "createAttributesFilter not used for select");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     modelHelper.createAttributesFilter.restore();
//     //</editor-fold>
//   });
//
//   t.test('nestPopulate uses createAttributesFilter if query.populateSelect doesn\'t exist.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     sinon.stub(modelHelper, "createAttributesFilter", sinon.spy());
//
//     var nestPopulate = modelHelper.__get__("nestPopulate");
//
//     t.plan(1);
//
//     var query = {};
//
//     var embeds = ["title"];
//     var associations = {
//       title: {
//         type: {},
//         model: {},
//         include: {
//           model: {}
//         }
//       }
//     };
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     nestPopulate(query, {}, 0, embeds, associations, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(modelHelper.createAttributesFilter.called, "createAttributesFilter used for select");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     modelHelper.createAttributesFilter.restore();
//     //</editor-fold>
//   });
//
//   t.test('nestPopulate uses association.model in populatePath if association.type is "MANY_MANY".', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     sinon.stub(modelHelper, "createAttributesFilter", sinon.spy());
//
//     var nestPopulate = modelHelper.__get__("nestPopulate");
//
//     t.plan(2);
//
//     var query = {};
//
//     var embeds = ["title"];
//
//     var associations_many = {
//       title: {
//         type: "MANY_MANY",
//         model: "role",
//         include: {
//           model: {}
//         }
//       }
//     };
//
//     var associations_one = {
//       title: {
//         type: "ONE_MANY",
//         model: "role",
//         include: {
//           model: {}
//         }
//       }
//     };
//
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result_many = nestPopulate(query, {}, 0, embeds, associations_many, Log);
//     var result_one = nestPopulate(query, {}, 0, embeds, associations_one, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.equals(result_many.path, "title.role", "association.model used in path");
//     t.equals(result_one.path, "title", "association.model not used in path");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     modelHelper.createAttributesFilter.restore();
//     //</editor-fold>
//   });
//
//   t.test('nestPopulate handles nested embedding.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = rewire('../utilities/model-helper');
//
//     var createAttributesFilter = sinon.stub();
//     createAttributesFilter.returns("test");
//
//     sinon.stub(modelHelper, "createAttributesFilter", createAttributesFilter);
//
//     var nestPopulate = modelHelper.__get__("nestPopulate");
//
//     t.plan(6);
//
//     var query = {};
//
//     var embeds = ["title", "users", "groups"];
//
//     var associations_three = {
//       groups: {
//         type: "MANY_MANY",
//         model: "group",
//         include: {
//           model: { schema: { methods: { routeOptions: { associations: { } } } } }
//         }
//       }
//     };
//
//     var associations_two = {
//       users: {
//         type: "ONE_MANY",
//         model: "user",
//         include: {
//           model: { schema: { methods: { routeOptions: { associations: associations_three } } } }
//         }
//       }
//     };
//
//     var associations_one = {
//       title: {
//         type: "ONE_MANY",
//         model: "role",
//         include: {
//           model: { schema: { methods: { routeOptions: { associations: associations_two } } } }
//         }
//       }
//     };
//
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var populate = nestPopulate(query, {}, 0, embeds, associations_one, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.equals(populate.path, "title");
//     t.equals(populate.select, "test users");
//     t.equals(populate.populate.path, "users");
//     t.equals(populate.populate.select, "test groups.group");
//     t.equals(populate.populate.populate.path, "groups.group");
//     t.equals(populate.populate.populate.select, "test");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     modelHelper.createAttributesFilter.restore();
//     //</editor-fold>
//   });
//   t.end();
// });
//
// test('model-helper.setSort', function(t) {
//   t.test('model-helper.setSort calls the "sort" function with the "$sort" query parameter.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(4);
//
//     var query = { $sort: "email" };
//     var mongooseQuery = {};
//     mongooseQuery.sort = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.setSort(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(mongooseQuery.sort.called, "the sort function was called");
//     t.ok(mongooseQuery.sort.calledWith("email"), "the sort function was called with argument 'email'");
//     t.notOk(query.$sort, "the '$sort' query parameter was deleted");
//     t.equals(mongooseQuery, result, "the mongooseQuery is returned");
//     //</editor-fold>
//   });
//
//   t.test('model-helper.setSort replaces "," with " " in the "$sort" parameter.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(1);
//
//     var query = { $sort: "email,firstName,lastName" };
//     var mongooseQuery = {};
//     mongooseQuery.sort = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     modelHelper.setSort(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(mongooseQuery.sort.calledWith("email firstName lastName"), "the $sort parameter was modified");;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.setSort doesn\'t call the "sort" function if the "$sort" query parameter is missing.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(2);
//
//     var query = {};
//     var mongooseQuery = {};
//     mongooseQuery.sort = sinon.spy();
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.setSort(query, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.notOk(mongooseQuery.sort.called, "the sort function was not called");
//     t.equals(mongooseQuery, result, "the mongooseQuery is returned");
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('model-helper.createAttributesFilter', function(t) {
//   var modelHelper = require('../utilities/model-helper');
//   testHelper.testModelParameter(t, modelHelper.createAttributesFilter, "modelHelper.createAttributesFilter", ["query", "model", "Log"], Log);
//
//   t.test('model-helper.createAttributesFilter doesn\'t return fields with "exclude" set to true.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(1);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.createAttributesFilter({}, userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.equal(result, "email firstName lastName _id", "password excluded");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.createAttributesFilter returns association fields except for those of type "MANY_MANY".', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(1);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       },
//       title: {
//         type: Types.ObjectId
//       },
//       profileImage: {
//         type: Types.ObjectId
//       },
//       groups: {
//         type: [Types.ObjectId]
//       },
//       permissions: {
//         type: [Types.ObjectId]
//       }
//     });
//
//     userSchema.methods = {
//       routeOptions: {
//         associations: {
//           title: {
//             type: "ONE_MANY"
//           },
//           profileImage: {
//             type: "ONE_ONE"
//           },
//           groups: {
//             type: "MANY_MANY"
//           },
//           permissions: {
//             type: "MANY_MANY"
//           }
//         }
//       }
//     };
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.createAttributesFilter({}, userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.equal(result, "email firstName lastName title profileImage _id", "MANY_MANY associations excluded");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.createAttributesFilter only returns fields in "query.$select" if present.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     t.plan(2);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       },
//       title: {
//         type: Types.ObjectId
//       },
//       profileImage: {
//         type: Types.ObjectId
//       },
//       groups: {
//         type: [Types.ObjectId]
//       },
//       permissions: {
//         type: [Types.ObjectId]
//       }
//     });
//
//     var query = { $select: "email,lastName" };
//
//     var userModel = mongoose.model("user", userSchema);
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.createAttributesFilter(query, userModel, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.equals(result, "email lastName", "selected fields returned");
//     t.notOk(query.$select, "$select property deleted");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.end();
// });
//
// test('model-helper.createMongooseQuery', function(t) {
//   var modelHelper = require('../utilities/model-helper');
//   testHelper.testModelParameter(t, modelHelper.createMongooseQuery, "modelHelper.createMongooseQuery", ["model", "query", "mongooseQuery", "Log"], Log);
//
//   t.test('model-helper.createMongooseQuery calls correct methods.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     var mongooseQuery = {
//       select: sinon.spy(),
//       where: sinon.spy()
//     };
//     sinon.stub(modelHelper, "setSkip", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "setLimit", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "createAttributesFilter", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "populateEmbeddedDocs", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "setSort", function(){ return mongooseQuery });
//
//     t.plan(7);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.createMongooseQuery(userModel, {}, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(modelHelper.setSkip.called, "setSkip called");
//     t.ok(modelHelper.setLimit.called, "setLimit called");
//     t.ok(modelHelper.createAttributesFilter.called, "createAttributesFilter called");
//     t.notOk(modelHelper.populateEmbeddedDocs.called, "populateEmbeddedDocs not called when no routeOptions");
//     t.ok(modelHelper.setSort.called, "setSort called");
//     t.ok(mongooseQuery.select.called, "mongooseQuery.select called");
//     t.ok(mongooseQuery.where.called, "mongooseQuery.where called");
//     //</editor-fold>
//
//
//     //<editor-fold desc="Restore">
//     modelHelper.setSkip.restore();
//     modelHelper.setLimit.restore();
//     modelHelper.createAttributesFilter.restore();
//     modelHelper.populateEmbeddedDocs.restore();
//     modelHelper.setSort.restore();
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.test('model-helper.createMongooseQuery calls populateEmbeddedDocs when routeOptions exist.', function (t) {
//     //<editor-fold desc="Arrange">
//     var modelHelper = require('../utilities/model-helper');
//
//     var mongooseQuery = {
//       select: sinon.spy(),
//       where: sinon.spy()
//     };
//     sinon.stub(modelHelper, "setSkip", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "setLimit", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "createAttributesFilter", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "populateEmbeddedDocs", function(){ return mongooseQuery });
//     sinon.stub(modelHelper, "setSort", function(){ return mongooseQuery });
//
//     t.plan(1);
//
//     var userSchema = new mongoose.Schema({
//       email: {
//         type: Types.String,
//         queryable: true
//       },
//       firstName: {
//         type: Types.String,
//         queryable: true
//       },
//       lastName: {
//         type: Types.String
//       },
//       password: {
//         type: Types.String,
//         queryable: true,
//         exclude: true
//       }
//     });
//
//     var userModel = mongoose.model("user", userSchema);
//     userModel.schema.methods.routeOptions = {};
//
//     //</editor-fold>
//
//     //<editor-fold desc="Act">
//     var result = modelHelper.createMongooseQuery(userModel, {}, mongooseQuery, Log);
//     //</editor-fold>
//
//     //<editor-fold desc="Assert">
//     t.ok(modelHelper.populateEmbeddedDocs.called, "populateEmbeddedDocs called when routeOptions exist");
//     //</editor-fold>
//
//     //<editor-fold desc="Restore">
//     modelHelper.setSkip.restore();
//     modelHelper.setLimit.restore();
//     modelHelper.createAttributesFilter.restore();
//     modelHelper.populateEmbeddedDocs.restore();
//     modelHelper.setSort.restore();
//     delete mongoose.models.user;
//     delete mongoose.modelSchemas.user;
//     //</editor-fold>
//   });
//
//   t.end();
// });