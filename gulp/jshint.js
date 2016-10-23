var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('jshint', [], function(){
  return gulp.src([
      gulp.paths.src + '**/*.js',
      //gulp.paths.src + '/models/**/*.js',
      //gulp.paths.src + '/routes/**/*.js'
  ])
    // .pipe(jshint())
    // .pipe(jshint.reporter('default'))
    // .pipe(jshint.reporter('fail'));
});