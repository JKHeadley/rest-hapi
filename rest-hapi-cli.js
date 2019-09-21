#! /usr/bin/env node

const userArgs = process.argv.slice(2)

const command = userArgs[0]

const args = userArgs

args.shift()

const exec = require('child_process').exec

const isWindows = /^win/.test(process.platform)

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
