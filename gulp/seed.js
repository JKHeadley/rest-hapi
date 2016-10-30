var gulp = require('gulp');
var mongoose = require('mongoose');

gulp.task('seed', function() {
    gulp.src('./seed/**/*.*')
    .pipe(gulp.dest('api/models'));
});



