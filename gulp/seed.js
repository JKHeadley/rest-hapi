var gulp = require('gulp');
var exit = require('gulp-exit');
var Q = require('q');
var mongoose = require('mongoose');
// var passwordUtility = require('../api/utilities/password-helper');
var config = require('../config');

gulp.task('seed', ['models'], function() {

    mongoose.connect(config.mongo.URI);

    var generateModels = require('../utilities/model-generator');

    // var hashedPassword = passwordUtility.hash_password('1234');
    var hashedPassword = '1234';

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
    .pipe(gulp.dest(__dirname + '/../../' + config.modelDirectory));
});