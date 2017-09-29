'use strict';

var gulp = require('gulp');
var exit = require('gulp-exit');
var Q = require('q');
var mongoose = require('mongoose');
var config = require('../config');
var restHapi = require('../rest-hapi');


gulp.task('update-associations', [], function() {

  console.log("ARGS:", process.argv);

  const uri = process.argv[6];

  console.log("URI:", uri);


  mongoose.Promise = Q.Promise;

  // var test = mongoose.connect(uri);

  // console.log("test:", test);


  let modelPath = "models"

  if (process.argv[7]) {
    modelPath = process.argv[7];
  }

  restHapi.config.absoluteModelPath = true;
  restHapi.config.modelPath = __dirname + '/../../../' + modelPath;

  console.log("MODELPATH:", restHapi.config.modelPath);

  return gulp.src("")
      .pipe(exit());

  // return restHapi.generateModels(mongoose).then(function (models) {
  //   restHapi.config.loglevel = "DEBUG";
  //   let Log = restHapi.getLogger("update-associations");
  //
  //   Log.debug("MODELS:", models);
  //
  //
  //   return gulp.src("")
  //       .pipe(exit());
  // })
});

function addLinking(model) {
  for (let associationName in model.routeOptions.associations) {
    let association = model.routeOptions.associations[associationName];


  }
}

function removeLinking(model) {

}

function addEmbedded(model) {

}

function removeEmbedded(model) {

}

gulp.task('models', function() {
  return gulp.src('./seed/**/*.*')
      .pipe(gulp.dest(__dirname + '/../../../' + config.modelPath));
});