#! /usr/bin/env node

var userArgs = process.argv.slice(2);

var command = userArgs[0];

var args = userArgs;

args.shift();

var exec = require('child_process').exec;

var isWindows = /^win/.test(process.platform);

var cmdString = '$PWD/node_modules/rest-hapi/gulpfile.js';

if (isWindows) {
	// This will fix the error "No gulpfile found" on windows OS
	cmdString = './node_modules/rest-hapi/gulpfile.js';
}

switch (command) {
	case "seed":
		exec('gulp seed --gulpfile ' + cmdString, function(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
		});
		break;
	case "test":
		exec('gulp test --gulpfile ' + cmdString, function(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
		});
		break;
	case "update-associations":
		exec('gulp update-associations --gulpfile ' + cmdString + " --options " + args.join(' --options '), function(err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
		});
		break;
	default:
		console.error("error, unknown command:", command);
		break;
}

