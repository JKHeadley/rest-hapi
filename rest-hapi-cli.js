#! /usr/bin/env node

let userArgs = process.argv.slice(2)

let command = userArgs[0]

let args = userArgs

args.shift()

let exec = require('child_process').exec

let isWindows = /^win/.test(process.platform)

let cmdString = '$PWD/node_modules/rest-hapi/scripts/'

if (isWindows) {
  cmdString = './node_modules/rest-hapi/scripts/'
}

switch (command) {
  case 'seed':
    exec('node ' + cmdString + 'seed.js ' + args, function(
      err,
      stdout,
      stderr
    ) {
      console.log(stdout)
      console.log(stderr)
      if (err) {
        throw err
      }
    })
    break
  case 'test':
    exec('npm run test', function(err, stdout, stderr) {
      console.log(stdout)
      console.log(stderr)
      if (err) {
        throw err
      }
    })
    break
  case 'update-associations':
    exec(
      'node ' +
        cmdString +
        'update-associations.js' +
        ' --options ' +
        args.join(' --options '),
      function(err, stdout, stderr) {
        console.log(stdout)
        console.log(stderr)
        if (err) {
          throw err
        }
      }
    )
    break
  default:
    console.error('error, unknown command:', command)
    break
}
