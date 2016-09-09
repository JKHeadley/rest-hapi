var test = require('tape');
var _ = require('lodash');

test('query-helper exists and has expected members', function (t) {
  var queryHelper = require('./query-helper');

  t.plan(10);

  t.ok(queryHelper, "query-helper exists.");
  t.ok(queryHelper.createSequelizeQuery, "query-helper.createSequelizeQuery exists.");
  t.ok(queryHelper.createAttributesFilter, "query-helper.createAttributesFilter exists.");
  t.ok(queryHelper.createIncludeArray, "query-helper.createIncludeArray exists.");
  t.ok(queryHelper.createDefaultWhere, "query-helper.createDefaultWhere exists.");
  t.ok(queryHelper.setTermSearch, "query-helper.setTermSearch exists.");
  t.ok(queryHelper.setSortFields, "query-helper.setSortFields exists.");
  t.ok(queryHelper.setReturnedAttributes, "query-helper.setReturnedAttributes exists.");
  t.ok(queryHelper.setLimitIfExists, "query-helper.setLimitIfExists exists.");
  t.ok(queryHelper.setOffsetIfExists, "query-helper.setOffsetIfExists exists.");
});

test('query-helper.getQueryableFields asserts model parameter', function (t) {
  var queryHelper = require('./query-helper');

  t.plan(2);

  try {
    queryHelper.getQueryableFields(null);
    t.fail("No error was thrown.");
  } catch (error) {
    t.equal(error.name, "AssertionError", "error is an AssertionError");
    t.ok(error.message.indexOf("model") > -1, "assertion message contains 'model' text.");
  }
});

test('query-helper.getQueryableFields returns an empty array if model.tableAttributes doesn\'t exist', function (t) {
  var queryHelper = require('./query-helper');

  t.plan(2);

  var modelParam = {};

  var result = queryHelper.getQueryableFields(modelParam);

  t.ok(_.isArray(result), "result is an array");
  t.equal(result.length, 0, "result is empty");
});

test('query-helper.getQueryableFields returns only fields marked as queryable.', function (t) {
  var queryHelper = require('./query-helper');

  t.plan(4);

  var modelParam = {
    tableAttributes:{
      field1:{
        queryable:true
      },
      field2:{
        queryable:false
      },
      field3:{
      },
      field4:{
        queryable:true
      }
    }
  };

  var result = queryHelper.getQueryableFields(modelParam);

  t.ok(_.isArray(result), "result is an array");
  t.equal(result.length, 2, "result has two items");
  t.ok(_.indexOf(result, "field1") > -1, "result contains field1");
  t.ok(_.indexOf(result, "field4") > -1, "result contains field4");
});