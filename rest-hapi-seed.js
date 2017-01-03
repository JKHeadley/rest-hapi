#! /usr/bin/env node

var exec = require('child_process').exec;

console.log(__dirname);

exec('echo $PWD', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
});

// exec('gulp seed', function(err, stdout, stderr) {
//     console.log(stdout);
//     console.log(stderr);
// });