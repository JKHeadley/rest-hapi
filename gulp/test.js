var gulp = require('gulp');
var tape = require('gulp-tape');
var tapColorize = require('tap-colorize');

gulp.task('test', ['test-e2e'], function() {

});

gulp.task('test-e2e', ['test-unit'], function() {
  return gulp.src([
    gulp.paths.src + '/**/end-to-end.tests.js'
  ])
      .pipe(tape({
        reporter: tapColorize()
      }));
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