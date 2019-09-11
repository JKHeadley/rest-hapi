'use strict'

const Test = require('blue-tape')
const Logging = require('loggin')
const Q = require('q')
const Decache = require('decache')

// Import test groups
const BasicCrudTests = require('./basic-crud.tests')
const DocAuthTests = require('./doc-auth.tests')
const BasicEmbedTests = require('./basic-embed.tests')
const BasicNonEmbedTests = require('./basic-non-embed.tests')
const AuditLogTests = require('./audit-log.tests')
const AdvanceAssocTests = require('./advance-assoc.tests')
const DuplicateFieldTests = require('./duplicate-field.tests')

const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoServer = new MongoMemoryServer({
  instance: {
    port: 27017,
    dbName: 'rest_hapi'
  }
})

// TODO: Possibly require this in every test and decache it to avoid unexpected
// errors between tests.
let Mongoose = require('mongoose')
Mongoose.Promise = Promise

let Log = Logging.getLogger('tests')
Log.logLevel = 'DEBUG'
Log = Log.bind('end-to-end')

const internals = {
  previous: {}
}

internals.onFinish = function() {
  process.exit()
}

Test.onFinish(internals.onFinish)

function restore(Mongoose) {
  Decache('../../rest-hapi')

  Decache('../config')
  Object.keys(Mongoose.models).forEach(function(key) {
    delete Mongoose.models[key]
  })
  Object.keys(Mongoose.modelSchemas).forEach(function(key) {
    delete Mongoose.modelSchemas[key]
  })

  return Mongoose.connection.db.dropDatabase()
}

Test('end to end tests', function(t) {
  mongoServer
    .getConnectionString()
    .then(() => {
      return BasicCrudTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return DocAuthTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return BasicEmbedTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return BasicNonEmbedTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return AuditLogTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return AdvanceAssocTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return DuplicateFieldTests(t, Mongoose, internals, Log, restore)
    })
    .then(function() {
      return t.test('clearing cache', function(t) {
        return Q.when().then(function() {
          Object.keys(require.cache).forEach(function(key) {
            delete require.cache[key]
          })

          t.ok(true, 'DONE')
        })
      })
    })
})
