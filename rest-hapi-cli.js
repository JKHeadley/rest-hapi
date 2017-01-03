#! /usr/bin/env node

var userArgs = process.argv.slice(2);

var command = userArgs[0];

var exec = require('child_process').exec;

switch (command) {
    case "seed":
        exec('gulp seed --gulpfile $PWD/node_modules/rest-hapi/gulpfile.js', function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
        break;
    case "test":
        exec('gulp test --gulpfile $PWD/node_modules/rest-hapi/gulpfile.js', function(err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
        break;
    default:
        console.error("error, unknown command:", command);
        break;
}

