var test = require('tape');
var _ = require('lodash');

module.exports = {
  /**
   * Tests a given function (methodToTest) to verify that it's "model" parameter follows
   * the mongoose model format.
   * @param t: Parent test object.
   * @param methodToTest: The method being tested.
   * @param methodName: The name of the method being called.
   * @param parameters: A string array containing the parameter names for the method.
   * @param Log: A logging object.
   */
  testModelParameter: function(t, methodToTest, methodName, parameters, Log) {
    if (t) {
      test = t.test;
    }

    var modelIndex = parameters.indexOf("model");
    var logIndex = parameters.indexOf("Log");
    var paramCopy = {};

    parameters[logIndex] = Log;

    test(methodName + ' fails if model parameter isn\'t a mongoose model', function (t) {
      t.plan(8);

      var model = {};

      paramCopy = _.extend([], parameters);
      paramCopy[modelIndex] = model;
      try {
        methodToTest.apply(null, paramCopy);
        t.fail("No error was thrown.");
      } catch (error) {
        t.equal(error.name, "AssertionError", "error is an AssertionError");
        t.ok(error.message.indexOf("schema") > -1, "assertion message contains 'schema' text.");
      }

      model = {
        schema: {}
      };

      paramCopy = _.extend([], parameters);
      paramCopy[modelIndex] = model;
      try {
        methodToTest.apply(null, paramCopy);
        t.fail("No error was thrown.");
      } catch (error) {
        t.equal(error.name, "AssertionError", "error is an AssertionError");
        t.ok(error.message.indexOf("schema.paths") > -1, "assertion message contains 'schema.paths' text.");
      }

      model = {
        schema: {
          paths: {}
        }
      };

      paramCopy = _.extend([], parameters);
      paramCopy[modelIndex] = model;
      try {
        methodToTest.apply(null, paramCopy);
        t.fail("No error was thrown.");
      } catch (error) {
        t.equal(error.name, "AssertionError", "error is an AssertionError");
        t.ok(error.message.indexOf("routeOptions") > -1, "assertion message contains 'routeOptions' text.");
      }


      model = {
        schema: {
          paths: {
            field1: {},
            field2: {},
            field3: {},
            field4: {}
          }
        },
        routeOptions: {}
      };

      paramCopy = _.extend([], parameters);
      paramCopy[modelIndex] = model;
      try {
        methodToTest.apply(null, paramCopy);
        t.fail("No error was thrown.");
      } catch (error) {
        t.equal(error.name, "AssertionError", "error is an AssertionError");
        t.ok(error.message.indexOf("options") > -1, "assertion message contains 'options' text.");
      }
    });
  },
};

/**
 * Function to run a single test file using node cli.
 * Ex: "node tests/test-helper.js tests/model-helper.tests.js"
 */
var runTestFile = function() {
  var pathToTestFile = process.argv.slice(2)[0];
  if (pathToTestFile && pathToTestFile !== "test") {
    var gulp = require('gulp');
    var tape = require('gulp-tape');
    var tapColorize = require('tap-colorize');

    gulp.src([
      pathToTestFile
    ])
    .pipe(tape({
      reporter: tapColorize()
    }));
  }
}();