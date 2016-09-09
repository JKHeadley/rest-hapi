var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function (done) {
  return del([gulp.paths.build + '/'], done);
});