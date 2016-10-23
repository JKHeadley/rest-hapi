var gulp = require('gulp');
var gutil = require('gulp-util');
var filter = require('gulp-filter');
var rename = require('gulp-rename');

gulp.task('compile:local', ['compile', 'config:local'], function () {});

gulp.task('compile:development', ['compile', 'config:development'], function () {});

gulp.task('compile:production', ['compile', 'config:production'], function () {});

gulp.task('compile', ['jshint', 'clean'], function () {

  return gulp.src([
    gulp.paths.src + '/**/*',
    "!" + gulp.paths.src + '/tests/**',
    "!" + gulp.paths.src + "/**/config.local.js",
    "!" + gulp.paths.src + "/**/config.development.js",
    "!" + gulp.paths.src + "/**/config.production.js",
  ])
  .pipe(gulp.dest(gulp.paths.build))
  .on('error', gutil.log);

});