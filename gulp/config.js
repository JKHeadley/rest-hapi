'use strict';

var gulp = require('gulp');
var paths = gulp.paths;
var rename = require("gulp-rename");
var argv = require('yargs').argv;
var gutil = require('gulp-util');

// if (argv['local'] || gutil.env.env === 'local') {
//   configFile = '/config.local.js';
//   gutil.env.env = 'local';
// }
// if (argv['development'] || gutil.env.env === 'development') {
//   configFile = '/config.development.js';
//   gutil.env.env = 'development';
// }
// if (argv['production'] || gutil.env.env === 'production') {
//   configFile = '/config.production.js';
//   gutil.env.env = 'production';
// }
// if (!gutil.env.env) {//EXPL: default to local
//   configFile = '/config.local.js';
//   gutil.env.env = 'local';
// }

gulp.task('config:local', ['clean', 'test'], function () {
  return gulp.src(paths.src + '/config.local.js')
    .pipe(rename("config.js"))
    .pipe(gulp.dest(paths.build))
});

gulp.task('config:development', ['clean', 'test'], function () {
  return gulp.src(paths.src + '/config.development.js')
  .pipe(rename("config.js"))
  .pipe(gulp.dest(paths.build))
});

gulp.task('config:production', ['clean', 'test'], function () {
  return gulp.src(paths.src + '/config.production.js')
  .pipe(rename("config.js"))
  .pipe(gulp.dest(paths.build))
});
