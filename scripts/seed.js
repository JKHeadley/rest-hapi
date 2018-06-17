'use strict'

let mongoose = require('mongoose')
let config = require('../config')
let RestHapi = require('../rest-hapi')
let path = require('path')
let fs = require('fs-extra')

let mongoURI = process.argv.slice(2)[0]
;(async function seed() {
  RestHapi.config.loglevel = 'DEBUG'
  let Log = RestHapi.getLogger('seed')
  try {
    await moveModels()

    mongoose.Promise = Promise

    mongoURI = mongoURI || RestHapi.config.mongo.URI
    mongoose.connect(mongoURI, {
      useMongoClient: true
    })

    let models = await RestHapi.generateModels(mongoose)

    let password = '1234'

    await dropCollections(models)

    Log.log('seeding roles')
    let roles = [
      {
        name: 'Account',
        description: 'A standard user account.'
      },
      {
        name: 'Admin',
        description: 'A user with advanced permissions.'
      },
      {
        name: 'SuperAdmin',
        description: 'A user with full permissions.'
      }
    ]

    roles = await RestHapi.create(models.role, roles, Log)

    Log.log('seeding users')
    let users = [
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
    ]
    await RestHapi.create(models.user, users, Log)
    process.exit()
  } catch (err) {
    Log.error(err)
    process.exit()
  }
})()

function moveModels() {
  return new Promise((resolve, reject) => {
    fs.copy(
      path.join(__dirname, '../seed'),
      path.join(__dirname, '/../../../', config.modelPath),
      err => {
        if (err) {
          reject(err)
        }
        resolve()
      }
    )
  })
}

async function dropCollections(models) {
  RestHapi.config.loglevel = 'LOG'
  let Log = RestHapi.getLogger('unseed')
  try {
    await models.user.remove({})
    Log.log('roles removed')
    await models.role.remove({})
    Log.log('users removed')
  } catch (err) {
    Log.error(err)
  }
}
