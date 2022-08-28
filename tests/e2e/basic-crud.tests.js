'use strict'

const path = require('path')
const Decache = require('decache')
const Q = require('q')
const Hapi = require('@hapi/hapi')

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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: { name: 'test' },
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.name,
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
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
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

                  return RestHapi.list({
                    model: Mongoose.model('role'),
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.docs[0].name,
                    'test',
                    'role with name "test" retrieved'
                  )
                  internals.previous = response
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
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

                  return RestHapi.find({
                    model: Mongoose.model('role'),
                    _id: internals.previous.docs[0]._id,
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.name,
                    'test',
                    'role with name "test" retrieved'
                  )
                  internals.previous = response
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
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

                  return RestHapi.update({
                    model: Mongoose.model('role'),
                    _id: internals.previous._id,
                    payload: {
                      name: 'test_updated'
                    },
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.equals(
                    response.name,
                    'test_updated',
                    'role with name "test_updated" returned'
                  )
                  internals.previous = response
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })
                })
            )
            // </editor-fold>
          })
        })
        // basic "Delete" works
        .then(function() {
          return t.test('basic "Delete" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,
              enableSoftDelete: false,

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
                .then(function(response) {
                  server.start()

                  return Mongoose.model('role').find()
                })
                .then(function(response) {
                  internals.previous = response

                  return RestHapi.deleteOne({
                    model: Mongoose.model('role'),
                    _id: internals.previous[0]._id,
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  return Mongoose.model('role')
                    .find()
                    .then(function(response) {
                      t.deepEquals(
                        internals.previous[0].name,
                        'test_updated',
                        'role previously existed'
                      )
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
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
        // basic "Soft Delete" works
        .then(function() {
          return t.test('basic "Soft Delete" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,
              enableSoftDelete: true,

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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: { name: 'test' },
                    restCall: true
                  })
                })
                .then(function(response) {
                  return RestHapi.deleteOne({
                    model: Mongoose.model('role'),
                    _id: response._id,
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  return Mongoose.model('role')
                    .find()
                    .then(function(response) {
                      t.deepEquals(
                        response[0].isDeleted,
                        true,
                        'role soft deleted'
                      )
                    })
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
        // basic "Hard Delete" works
        .then(function() {
          return t.test('basic "Hard Delete" works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,
              enableSoftDelete: true,

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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: { name: 'test_hard' },
                    restCall: true
                  })
                })
                .then(function(response) {
                  internals.previous = response
                  return RestHapi.deleteOne({
                    model: Mongoose.model('role'),
                    _id: response._id,
                    hardDelete: true,
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function() {
                  return Mongoose.model('role')
                    .find()
                    .then(function(response) {
                      t.deepEquals(
                        internals.previous.name,
                        'test_hard',
                        'role previously existed'
                      )
                      t.deepEquals(response, [], 'role hard deleted')
                    })
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
        // create many works
        .then(function() {
          return t.test('create many works', function(t) {
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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: [
                      { name: 'test1' },
                      { name: 'test2' },
                      { name: 'test3' }
                    ],
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  internals.previous = response
                  t.equals(
                    response[0].name,
                    'test1',
                    'role with name "test1" created'
                  )
                  t.equals(
                    response[1].name,
                    'test2',
                    'role with name "test2" created'
                  )
                  t.equals(
                    response[2].name,
                    'test3',
                    'role with name "test3" created'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
        // basic delete many works
        .then(function() {
          return t.test('basic delete many works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,
              enableSoftDelete: true,

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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: [
                      { name: 'test1' },
                      { name: 'test2' },
                      { name: 'test3' }
                    ],
                    restCall: true
                  })
                })
                .then(function(response) {
                  return RestHapi.deleteMany({
                    model: Mongoose.model('role'),
                    payload: response
                      .filter(obj => obj.name !== 'test1')
                      .map(obj => ({
                        _id: obj._id,
                        hardDelete: true
                      })),
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  return Mongoose.model('role')
                    .find()
                    .then(function(response) {
                      t.deepEquals(
                        response.length,
                        1,
                        'correct number of roles deleted'
                      )
                      t.deepEquals(
                        response[0].name,
                        'test1',
                        'correct roles deleted'
                      )
                    })
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
        // cant soft delete when disabled
        .then(function() {
          return t.test('cant soft delete when disabled', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,
              enableSoftDelete: false,

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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: [
                      { name: 'test1' },
                      { name: 'test2' },
                      { name: 'test3' }
                    ],
                    restCall: true
                  })
                })
                .then(function(response) {
                  return RestHapi.deleteMany({
                    model: Mongoose.model('role'),
                    payload: response
                      .filter(obj => obj.name !== 'test1')
                      .map(obj => ({
                        _id: obj._id,
                        hardDelete: true
                      })),
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.deepEquals(
                    response.message,
                    'Invalid request payload input',
                    'rejected soft delete'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
        // delete many non-rest call handles objectIds
        .then(function() {
          return t.test('delete many non-rest call handles objectIds', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,
              enableSoftDelete: true,

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

                  return RestHapi.create({
                    model: Mongoose.model('role'),
                    payload: [
                      { name: 'test1' },
                      { name: 'test2' },
                      { name: 'test3' }
                    ],
                    restCall: true
                  })
                })
                .then(function(response) {
                  return RestHapi.deleteMany({
                    model: Mongoose.model('role'),
                    payload: response
                      .filter(obj => obj.name !== 'test1')
                      .map(obj => ({
                        _id: obj._id,
                        hardDelete: true
                      })),
                    restCall: false
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  return Mongoose.model('role')
                    .find()
                    .then(function(response) {
                      t.deepEquals(
                        response.length,
                        1,
                        'correct number of roles deleted'
                      )
                      t.deepEquals(
                        response[0].name,
                        'test1',
                        'correct roles deleted'
                      )
                    })
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function(response) {
                  Decache('../../rest-hapi')

                  Object.keys(Mongoose.models).forEach(function(key) {
                    delete Mongoose.models[key]
                  })
                  Object.keys(Mongoose.modelSchemas || []).forEach(function(
                    key
                  ) {
                    delete Mongoose?.modelSchemas[key]
                  })

                  return Mongoose.connection.db.dropDatabase()
                })
            )
            // </editor-fold>
          })
        })
    )
  })
