'use strict';

var gulp = require('gulp');
var exit = require('gulp-exit');
var Q = require('q');
var mongoose = require('mongoose');
var config = require('../config');
var restHapi = require('../rest-hapi');


gulp.task('seed', ['models'], function() {

    mongoose.Promise = Q.Promise;

    mongoose.connect(restHapi.config.mongo.URI);

    restHapi.generateModels(mongoose).then(function (models) {
        restHapi.config.loglevel = "DEBUG";
        let Log = restHapi.getLogger("seed");

        let roles = [],
            users = [];

        var password = "root";

        return dropCollections(models)
            .then(function() {
                Log.log("seeding roles");
                var roles = [
                    {
                        name: "Account",
                        description: "A standard user account."
                    },
                    {
                        name: "Admin",
                        description: "A user with advanced permissions."
                    },
                    {
                        name: "SuperAdmin",
                        description: "A user with full permissions."
                    }
                ];
                return restHapi.create(models.role, roles, Log);
            })
            .then(function(result) {
                roles = result;
                Log.log("seeding users");
                var users = [
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
                ];
                return restHapi.create(models.user, users, Log);
            })
            .then(function(result) {
                users = result;
                return gulp.src("")
                    .pipe(exit());
            })
            .catch(function (error) {
                Log.error(error);
            });
    })
});

function dropCollections(models) {
    restHapi.config.loglevel = "LOG";
    let Log = restHapi.getLogger("unseed");
    var deferred = Q.defer();
    models.user.remove({})
        .then(function() {
            Log.log('roles removed');
            return models.role.remove({});
        })
        .then(function() {
            Log.log('users removed');
            deferred.resolve();
        })
        .catch(function (error) {
            Log.error(error);
        });
    return deferred.promise;
}

gulp.task('models', function() {
    return gulp.src('./seed/**/*.*')
        .pipe(gulp.dest(__dirname + '/../../../' + config.modelPath));
});