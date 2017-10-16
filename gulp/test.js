var gulp = require('gulp');
var tape = require('gulp-tape');
var tapColorize = require('tap-colorize');
const TestHelper = require('../tests/test-helper.js');


gulp.task('test', ['test-unit'], function() {
  return TestHelper.runTestFile('tests/end-to-end.tests.js');
});

gulp.task('test-e2e', function() {
  return TestHelper.runTestFile('tests/end-to-end.tests.js');
});

gulp.task('test-unit', function() {
  return gulp.src([
    gulp.paths.src + '/**/*.tests.js',
    '!' + gulp.paths.src + '/**/end-to-end.tests.js'
  ])
      .pipe(tape({
        reporter: tapColorize()
      }));
});