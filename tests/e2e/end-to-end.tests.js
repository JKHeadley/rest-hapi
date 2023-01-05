'use strict'

const Test = require('blue-tape')
const Logging = require('loggin')
const Q = require('q')
const Decache = require('decache')

// Import test groups
const BasicCrudTests = require('./basic-crud.tests')
const DocAuthTests = require('./doc-auth.tests')
const BasicEmbedRestTests = require('./basic-embed-rest.tests')
const BasicEmbedWrapperTests = require('./basic-embed-wrapper.tests')
const BasicNonEmbedTests = require('./basic-non-embed.tests')
const AuditLogTests = require('./audit-log.tests')
const AdvanceAssocTests = require('./advance-assoc.tests')
const DuplicateFieldTests = require('./duplicate-field.tests')
const MiscTests = require('./misc.tests')

const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer
const mongoServer = new MongoMemoryServer({
  instance: {
    port: 27017,
    dbName: 'rest_hapi'
  }
})

// TODO: Possibly require this in every test and decache it to avoid unexpected
// errors between tests.
const Mongoose = require('mongoose')
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

process.on('unhandledRejection', error => {
  console.log('Unhandled error:', error.message)
})

function restore(Mongoose) {
  Decache('../../rest-hapi')

  Decache('../config')
  Object.keys(Mongoose.models).forEach(function(key) {
    delete Mongoose.models[key]
  })
  Object.keys(Mongoose.modelSchemas || []).forEach(function(key) {
    delete Mongoose?.modelSchemas[key]
  })

  return Mongoose.connection.db.dropDatabase()
}

Test('end to end tests', function(t) {
  mongoServer
    .getConnectionString()
    // .then(() => {
    //   return BasicCrudTests(t, Mongoose, internals, Log, restore)
    // })
    // .then(function() {
    //   return DocAuthTests(t, Mongoose, internals, Log, restore)
    // })
    // .then(function() {
    //   return BasicEmbedRestTests(t, Mongoose, internals, Log, restore)
    // })
    .then(function() {
      return BasicEmbedWrapperTests(t, Mongoose, internals, Log, restore)
    })
    // .then(function() {
    //   return BasicNonEmbedTests(t, Mongoose, internals, Log, restore)
    // })
    // .then(function() {
    //   return AuditLogTests(t, Mongoose, internals, Log, restore)
    // })
    // .then(function() {
    //   return AdvanceAssocTests(t, Mongoose, internals, Log, restore)
    // })
    // .then(function() {
    //   return DuplicateFieldTests(t, Mongoose, internals, Log, restore)
    // })
    // .then(function() {
    //   return MiscTests(t, Mongoose, internals, Log, restore)
    // })
    .then(function() {
      return t.test('clearing cache', function(t) {
        return Q.when().then(function() {
          Object.keys(require.cache).forEach(function(key) {
            delete require.cache[key]
          })
          restore(Mongoose)

          t.ok(true, 'DONE')
        })
      })
    })
})
