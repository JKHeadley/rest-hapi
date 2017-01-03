#! /usr/bin/env node

var exec = require('child_process').exec;

// console.log($PWD);

exec('gulp seed --gulpfile $PWD/node_modules/rest-hapi/gulpfile.js', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
});

// exec('gulp seed', function(err, stdout, stderr) {
//     console.log(stdout);
//     console.log(stderr);
// });