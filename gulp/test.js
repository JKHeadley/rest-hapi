var gulp = require('gulp');
var tape = require('gulp-tape');
var tapColorize = require('tap-colorize');

gulp.task('test', function() {
  return gulp.src([
    gulp.paths.src + '/**/*.tests.js'
  ])
  .pipe(tape({
    reporter: tapColorize()
  }));
});