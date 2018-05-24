'use strict'

let gulp = require('gulp')
let exit = require('gulp-exit')
let mongoose = require('mongoose')
let config = require('../config')
let restHapi = require('../rest-hapi')
let path = require('path')

gulp.task('seed', ['models'], function() {
  mongoose.Promise = Promise

  mongoose.connect(restHapi.config.mongo.URI)

  restHapi.generateModels(mongoose).then(function(models) {
    restHapi.config.loglevel = 'DEBUG'
    let Log = restHapi.getLogger('seed')

    let roles = []
    let users = []

    let password = 'root'

    return dropCollections(models)
      .then(function() {
        Log.log('seeding roles')
        let roles = [
          {
            name: 'Account',
            description: 'A standard user account.'
          },
          {
            name: 'Admin',
            description: 'A user with advanced permissions.'
          },
          {
            name: 'SuperAdmin',
            description: 'A user with full permissions.'
          }
        ]
        return restHapi.create(models.role, roles, Log)
      })
      .then(function(result) {
        roles = result
        Log.log('seeding users')
        users = [
          {
            email: 'test@account.com',
            password: password,
            role: roles[0]._id
          },
          {
            email: 'test@admin.com',
            password: password,
            role: roles[1]._id
          },
          {
            email: 'test@superadmin.com',
            password: password,
            role: roles[2]._id
          }
        ]
        return restHapi.create(models.user, users, Log)
      })
      .then(function(result) {
        users = result
        return gulp.src('').pipe(exit())
      })
      .catch(function(error) {
        Log.error(error)
      })
  })
})

function dropCollections(models) {
  restHapi.config.loglevel = 'LOG'
  let Log = restHapi.getLogger('unseed')
  return models.user
    .remove({})
    .then(function() {
      Log.log('roles removed')
      return models.role.remove({})
    })
    .then(function() {
      Log.log('users removed')
    })
    .catch(function(error) {
      Log.error(error)
    })
}

gulp.task('models', function() {
  return gulp
    .src('./seed/**/*.*')
    .pipe(gulp.dest(path.join(__dirname, '/../../../', config.modelPath)))
})
