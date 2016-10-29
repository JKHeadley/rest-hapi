'use strict';

var gulp = require('gulp');
var paths = gulp.paths;
var rename = require("gulp-rename");

gulp.task('config:local', ['clean'], function () {
  return gulp.src(paths.src + '/config.local.js')
    .pipe(rename("config.js"))
    .pipe(gulp.dest(paths.build))
});

gulp.task('config:development', ['clean'], function () {
  return gulp.src(paths.src + '/config.development.js')
  .pipe(rename("config.js"))
  .pipe(gulp.dest(paths.build))
});

gulp.task('config:production', ['clean'], function () {
  return gulp.src(paths.src + '/config.production.js')
  .pipe(rename("config.js"))
  .pipe(gulp.dest(paths.build))
});
