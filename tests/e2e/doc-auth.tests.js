'use strict'

const path = require('path')
const TestHelper = require('../../utilities/test-helper')
const Decache = require('decache')
const Q = require('q')
const Hapi = require('hapi')

module.exports = (t, Mongoose, internals, Log) => {
  return t.test('document authorization tests', function(t) {
    const userId = new Mongoose.Types.ObjectId()
    return (
      Q.when()
        // average user unauthorized
        .then(function() {
          return t.test('average user unauthorized', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const authStrategy = 'testStrategy'

            TestHelper.mockStrategy(server, authStrategy)

            const config = {
              loglevel: 'ERROR',
              authStrategy: authStrategy,
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-2/models'
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

                  const request = {
                    method: 'POST',
                    url: '/role',
                    params: {},
                    query: {},
                    payload: {
                      name: 'test'
                    },
                    credentials: {
                      user: { _id: userId }
                    },
                    headers: {
                      authorization: 'testAuth'
                    }
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  internals.previous = response.result

                  const request = {
                    method: 'GET',
                    url: '/role/{_id}',
                    params: {
                      _id: response.result._id
                    },
                    query: {},
                    payload: {},
                    credentials: {},
                    headers: {
                      authorization: 'testAuth'
                    }
                  }

                  const injectOptions = TestHelper.mockInjection(request)

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
                  t.equals(response.result.statusCode, 403, 'access denied')
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
        // root user authorized
        .then(function() {
          return t.test('root user authorized', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const authStrategy = 'testStrategy'

            TestHelper.mockStrategy(server, authStrategy)

            const config = {
              loglevel: 'ERROR',
              authStrategy: authStrategy,
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-2/models'
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

                  const request = {
                    method: 'GET',
                    url: '/role/{_id}',
                    params: {
                      _id: internals.previous._id
                    },
                    query: {},
                    payload: {},
                    credentials: {
                      scope: ['root']
                    },
                    headers: {
                      authorization: 'testAuth'
                    }
                  }

                  const injectOptions = TestHelper.mockInjection(request)

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
                  t.equals(response.result.name, 'test', 'user authorized')
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
        // owner user authorized
        .then(function() {
          return t.test('owner user authorized', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const authStrategy = 'testStrategy'

            TestHelper.mockStrategy(server, authStrategy)

            const config = {
              loglevel: 'ERROR',
              authStrategy: authStrategy,
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-2/models'
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

                  const request = {
                    method: 'GET',
                    url: '/role/{_id}',
                    params: {
                      _id: internals.previous._id
                    },
                    query: {},
                    payload: {},
                    credentials: {
                      scope: ['user-' + userId.toString()]
                    },
                    headers: {
                      authorization: 'testAuth'
                    }
                  }

                  const injectOptions = TestHelper.mockInjection(request)

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
                  t.equals(response.result.name, 'test', 'user authorized')
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Decache('../../config')
                  Decache('hapi')
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
}
