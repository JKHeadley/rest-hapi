var gulp = require('gulp');
var exit = require('gulp-exit');
var Q = require('q');
var mongoose = require('mongoose');
var passwordUtility = require('../api/utilities/password-helper');

gulp.task('seed', ['models'], function() {

    mongoose.connect('mongodb://localhost/rest_hapi');

    var generateModels = require('../api/models');

    var hashedPassword = passwordUtility.hash_password('devdev');

    return generateModels(mongoose).then(function(models) {

        return dropCollections(models).then(function() {
            console.log("seeding roles");
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
            return models.role.create(roles, function (error, roles) {
                console.log("seeding users");
                var users = [
                    {
                        email: 'test@account.com',
                        password: hashedPassword,
                        role: roles[0]._id
                    },
                    {
                        email: 'test@admin.com',
                        password: hashedPassword,
                        role: roles[1]._id
                    },
                    {
                        email: 'test@superadmin.com',
                        password: hashedPassword,
                        role: roles[2]._id
                    }
                ];
                return models.user.create(users, function (error, users) {
                    return gulp.src("")
                    .pipe(exit());
                })
            })

        })
    })

});

function dropCollections(models) {
    var deferred = Q.defer();
    models.user.remove({}, function(err) {
        console.log('roles removed');
        models.role.remove({}, function(err) {
            console.log('users removed');
            deferred.resolve();
        });
    });
    return deferred.promise;
}

gulp.task('models', function() {
    return gulp.src('./seed/**/*.*')
    .pipe(gulp.dest('api/models'));
});