'use strict'

const path = require('path')
const Decache = require('decache')
const Q = require('q')
const QueryString = require('query-string')
const Hapi = require('hapi')

module.exports = (t, Mongoose, internals, Log) =>
  t.test('basic CRUD tests', function(t) {
    return (
      Q.when()
        // basic "Create" works
        .then(function() {
          return t.test('basic "Create" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-1/models'
              )
            }

            RestHapi.config = config

            return (
              server
                .register({
                  plugin: RestHapi,
                  options: {
                    mongoose: Mongoose,
                    config: config
                  }
                })
                .then(function() {
                  server.start()

                  const method = 'POST'
                  const url = '/role'
                  const params = {}
                  const query = {}
                  const payload = {
                    name: 'test'
                  }
                  const credentials = {}

                  let fullUrl = url
                  for (const key in params) {
                    fullUrl = fullUrl.replace('{' + key + '}', params[key])
                  }
                  fullUrl = fullUrl + '?' + QueryString.stringify(query)

                  const injectOptions = {
                    method: method,
                    url: fullUrl,
                    payload: payload,
                    credentials: credentials
                  }

                  return injectOptions
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function(injectOptions) {
                  return server.inject(injectOptions)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.result.name,
                    'test',
                    'role with name "test" created'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                    delete Mongoose.modelSchemas[key]
                  })
                })
            )
            // </editor-fold>
          })
        })
        // basic "List" works
        .then(function() {
          return t.test('basic "List" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-1/models'
              )
            }

            RestHapi.config = config

            return (
              server
                .register({
                  plugin: RestHapi,
                  options: {
                    mongoose: Mongoose,
                    config: config
                  }
                })
                .then(function() {
                  server.start()

                  const method = 'GET'
                  const url = '/role'
                  const params = {}
                  const query = {}
                  const payload = {}
                  const credentials = {}

                  let fullUrl = url
                  for (const key in params) {
                    fullUrl = fullUrl.replace('{' + key + '}', params[key])
                  }
                  fullUrl = fullUrl + '?' + QueryString.stringify(query)

                  const injectOptions = {
                    method: method,
                    url: fullUrl,
                    payload: payload,
                    credentials: credentials
                  }

                  return injectOptions
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function(injectOptions) {
                  return server.inject(injectOptions)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.result.docs[0].name,
                    'test',
                    'role with name "test" retrieved'
                  )
                  internals.previous = response.result
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                    delete Mongoose.modelSchemas[key]
                  })
                })
                .catch(err => {
                  Log.error(err)
                })
            )
            // </editor-fold>
          })
        })
        // basic "Find" works
        .then(function() {
          return t.test('basic "Find" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-1/models'
              )
            }

            RestHapi.config = config

            return (
              server
                .register({
                  plugin: RestHapi,
                  options: {
                    mongoose: Mongoose,
                    config: config
                  }
                })
                .then(function() {
                  server.start()

                  const method = 'GET'
                  const url = '/role/{_id}'
                  const params = {
                    _id: internals.previous.docs[0]._id
                  }
                  const query = {}
                  const payload = {}
                  const credentials = {}

                  let fullUrl = url
                  for (const key in params) {
                    fullUrl = fullUrl.replace('{' + key + '}', params[key])
                  }
                  fullUrl = fullUrl + '?' + QueryString.stringify(query)

                  const injectOptions = {
                    method: method,
                    url: fullUrl,
                    payload: payload,
                    credentials: credentials
                  }

                  return injectOptions
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function(injectOptions) {
                  return server.inject(injectOptions)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.result.name,
                    'test',
                    'role with name "test" retrieved'
                  )
                  internals.previous = response.result
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                    delete Mongoose.modelSchemas[key]
                  })
                })
            )
            // </editor-fold>
          })
        })
        // basic "Update" works
        .then(function() {
          return t.test('basic "Update" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-1/models'
              )
            }

            RestHapi.config = config

            return (
              server
                .register({
                  plugin: RestHapi,
                  options: {
                    mongoose: Mongoose,
                    config: config
                  }
                })
                .then(function() {
                  server.start()

                  const method = 'PUT'
                  const url = '/role/{_id}'
                  const params = {
                    _id: internals.previous._id
                  }
                  const query = {}
                  const payload = {
                    name: 'test_updated'
                  }
                  const credentials = {}

                  let fullUrl = url
                  for (const key in params) {
                    fullUrl = fullUrl.replace('{' + key + '}', params[key])
                  }
                  fullUrl = fullUrl + '?' + QueryString.stringify(query)

                  const injectOptions = {
                    method: method,
                    url: fullUrl,
                    payload: payload,
                    credentials: credentials
                  }

                  return injectOptions
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function(injectOptions) {
                  return server.inject(injectOptions)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.result.name,
                    'test_updated',
                    'role with name "test_updated" returned'
                  )
                  internals.previous = response.result
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                    delete Mongoose.modelSchemas[key]
                  })
                })
            )
            // </editor-fold>
          })
        })
        // basic "Soft Delete" works
        .then(function() {
          return t.test('basic "Delete" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-1/models'
              )
            }

            RestHapi.config = config

            return (
              server
                .register({
                  plugin: RestHapi,
                  options: {
                    mongoose: Mongoose,
                    config: config
                  }
                })
                .then(function() {
                  server.start()

                  const method = 'DELETE'
                  const url = '/role/{_id}'
                  const params = {
                    _id: internals.previous._id
                  }
                  const query = {}
                  const payload = {}
                  const credentials = {}

                  let fullUrl = url
                  for (const key in params) {
                    fullUrl = fullUrl.replace('{' + key + '}', params[key])
                  }
                  fullUrl = fullUrl + '?' + QueryString.stringify(query)

                  const injectOptions = {
                    method: method,
                    url: fullUrl,
                    payload: payload,
                    credentials: credentials
                  }

                  return injectOptions
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function(injectOptions) {
                  return server.inject(injectOptions)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  return Mongoose.model('role')
                    .find()
                    .then(function(response) {
                      t.deepEquals(response, [], 'role deleted')
                    })
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                    delete Mongoose.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
    )
  })
