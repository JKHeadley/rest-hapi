'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

const Boom = require('@hapi/boom')
const test = require('blue-tape')
const _ = require('lodash')
const sinon = require('sinon')
const rewire = require('rewire')
const proxyquire = require('proxyquire')
const assert = require('assert')
const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const logging = require('loggin')
const logger = logging.getLogger('tests')
logger.logLevel = 'FATAL'
const testHelper = require('../../utilities/test-helper')
const Joi = require('@hapi/joi')
const Q = require('q')

process.on('unhandledRejection', error => {
  console.log('Unhandled error:', error.message)
})

test('handler-helper exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  const server = sinon.spy()
  const Log = logger.bind('handler-helper')
  const handlerHelper = require('../../utilities/handler-helper')

  t.plan(21)
  // </editor-fold>

  // <editor-fold desc="Assert">
  t.ok(handlerHelper, 'handler-helper exists.')
  t.ok(handlerHelper.list, 'handler-helper.list exists.')
  t.ok(handlerHelper.find, 'handler-helper.find exists.')
  t.ok(handlerHelper.create, 'handler-helper.create exists.')
  t.ok(handlerHelper.deleteOne, 'handler-helper.deleteOne exists.')
  t.ok(handlerHelper.deleteMany, 'handler-helper.deleteMany exists.')
  t.ok(handlerHelper.update, 'handler-helper.update exists.')
  t.ok(handlerHelper.addOne, 'handler-helper.addOne exists.')
  t.ok(handlerHelper.removeOne, 'handler-helper.removeOne exists.')
  t.ok(handlerHelper.addMany, 'handler-helper.addMany exists.')
  t.ok(handlerHelper.getAll, 'handler-helper.getAll exists.')
  t.ok(handlerHelper.listHandler, 'handler-helper.listHandler exists.')
  t.ok(handlerHelper.findHandler, 'handler-helper.findHandler exists.')
  t.ok(handlerHelper.createHandler, 'handler-helper.createHandler exists.')
  t.ok(
    handlerHelper.deleteOneHandler,
    'handler-helper.deleteOneHandler exists.'
  )
  t.ok(
    handlerHelper.deleteManyHandler,
    'handler-helper.deleteManyHandler exists.'
  )
  t.ok(handlerHelper.updateHandler, 'handler-helper.updateHandler exists.')
  t.ok(handlerHelper.addOneHandler, 'handler-helper.addOneHandler exists.')
  t.ok(
    handlerHelper.removeOneHandler,
    'handler-helper.removeOneHandler exists.'
  )
  t.ok(handlerHelper.addManyHandler, 'handler-helper.addManyHandler exists.')
  t.ok(handlerHelper.getAllHandler, 'handler-helper.getAllHandler exists.')
  // </editor-fold>
})

test('handler-helper.listHandler', function(t) {
  return (
    Q.when()

      // handler-helper.listHandler calls model.find()
      .then(function() {
        return t.test('handler-helper.listHandler calls model.find()', function(
          t
        ) {
          // <editor-fold desc="Arrange">
          const sandbox = sinon.sandbox.create()
          const Log = logger.bind('handler-helper')
          const server = sandbox.spy()
          const queryHelperStub = sandbox.stub(
            require('../../utilities/query-helper')
          )

          const handlerHelper = proxyquire('../../utilities/handler-helper', {
            './query-helper': queryHelperStub
          })
          sandbox.stub(Log, 'error').callsFake(function() {})

          const userSchema = new mongoose.Schema({})

          const userModel = mongoose.model('user', userSchema)

          userModel.find = sandbox.spy()
          // </editor-fold>

          // <editor-fold desc="Act">
          const promise = handlerHelper.listHandler(
            userModel,
            { query: {} },
            Log
          )
          // </editor-fold>

          // <editor-fold desc="Assert">
          return (
            promise
              .catch(function() {
                t.ok(userModel.find.called, 'find called')
              })
              // </editor-fold>

              // <editor-fold desc="Restore">
              .then(function() {
                sandbox.restore()
                delete mongoose.models.user
                delete mongoose.modelSchemas.user
              })
          )
          // </editor-fold>
        })
      })

      // handler-helper.listHandler calls QueryHelper.createMongooseQuery
      .then(function() {
        return t.test(
          'handler-helper.listHandler calls QueryHelper.createMongooseQuery',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy(function() {
              return 'TEST'
            })

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function() {
                  t.ok(
                    queryHelperStub.createMongooseQuery.calledWithExactly(
                      userModel,
                      query,
                      'TEST',
                      Log
                    ),
                    'createMongooseQuery called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler calls mongooseQuery.count
      .then(function() {
        return t.test(
          'handler-helper.listHandler calls mongooseQuery.count',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const countSpy = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return {
                lean: function() {
                  return { count: countSpy }
                }
              }
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy(function() {
              return 'TEST'
            })

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function() {
                  t.ok(countSpy.called, 'count called')
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler calls QueryHelper.paginate
      .then(function() {
        return t.test(
          'handler-helper.listHandler calls QueryHelper.paginate',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const countSpy = sandbox.spy(function() {
              return Q.when()
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            const paginateDeferred = Q.defer()
            const paginateSpy = sandbox.spy(function() {
              paginateDeferred.resolve()
              return {
                exec: function() {
                  return Q.when([])
                }
              }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy(function() {
              return 'TEST'
            })

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              paginateDeferred.promise
                .then(function() {
                  t.ok(
                    queryHelperStub.paginate.calledWithExactly(
                      query,
                      mongooseQuery1,
                      Log
                    ),
                    'paginate called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                  return Q.when()
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler calls mongooseQuery.exec
      .then(function() {
        return t.test(
          'handler-helper.listHandler calls mongooseQuery.exec',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const countSpy = sandbox.spy(function() {
              return Q.when()
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            const deferred = Q.defer()
            const execSpy = sandbox.spy(function() {
              deferred.resolve()
              return Q.when([])
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy(function() {
              return 'TEST'
            })

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(execSpy.calledWithExactly('find'), 'exec called')
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                  return Q.when()
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler calls pre processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.listHandler calls pre processing if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const preDeferred = Q.defer()
            const preSpy = sandbox.spy(function() {
              preDeferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                list: {
                  pre: preSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy()

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              preDeferred.promise
                .then(function() {
                  t.ok(
                    preSpy.calledWithExactly(query, request, Log),
                    'list.pre called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler calls post processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.listHandler calls post processing if it exists',
          async function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const countSpy = sandbox.spy(function() {
              return Q.when()
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            const deferred = Q.defer()
            deferred.resolve('TEST')
            const execSpy = sandbox.spy(function() {
              return deferred.promise
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })

            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const postSpy = sandbox.spy()
            userSchema.statics = {
              routeOptions: {
                list: {
                  post: postSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy()

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            try {
              await promise
            } catch (err) {
              t.ok(
                postSpy.calledWithExactly(request, 'TEST', Log),
                'list.post called'
              )
            }
            // </editor-fold>

            // <editor-fold desc="Restore">
            sandbox.restore()
            delete mongoose.models.user
            delete mongoose.modelSchemas.user
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler returns a list of results
      .then(function() {
        return t.test(
          'handler-helper.listHandler returns a list of results',
          async function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const deferred = Q.defer()
            const countSpy = sandbox.spy(function() {
              const promise = Q.when('test')
              return promise
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            let result = ['TEST1', 'TEST2']
            deferred.resolve(result)
            const execSpy = sandbox.spy(function() {
              return deferred.promise
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy()

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            result = await promise
            t.deepEqual(
              result.docs,
              ['TEST1', 'TEST2'],
              'returns list of mapped result'
            )
            // </editor-fold>

            // <editor-fold desc="Restore">
            sandbox.restore()
            delete mongoose.models.user
            delete mongoose.modelSchemas.user
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler returns pagination data
      .then(function() {
        return t.test(
          'handler-helper.listHandler returns pagination data',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const deferred = Q.defer()
            const result = [
              'TEST1',
              'TEST2',
              'TEST1',
              'TEST2',
              'TEST1',
              'TEST2',
              'TEST1',
              'TEST2',
              'TEST1',
              'TEST2',
              'TEST1',
              'TEST2'
            ]
            const countSpy = sandbox.spy(function() {
              return Q.when(result.length)
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            deferred.resolve(result)
            const execSpy = sandbox.spy(function() {
              return deferred.promise
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy()

            const query = { $page: 2, $limit: 3 }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .then(function(result) {
                  t.deepEqual(
                    result.items,
                    { begin: 4, end: 6, limit: 3, total: 12 },
                    'returns correct items data'
                  )
                  t.deepEqual(
                    result.pages,
                    {
                      current: 2,
                      hasNext: true,
                      hasPrev: true,
                      next: 3,
                      prev: 1,
                      total: 4
                    },
                    'returns correct pages data'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler throws a generic postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.listHandler throws a generic postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const deferred = Q.defer()
            const countSpy = sandbox.spy(function() {
              return Q.when()
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            const result = ''
            deferred.resolve(result)
            const execSpy = sandbox.spy(function() {
              return deferred.promise
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                list: {
                  post: function() {
                    throw new Error('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy()

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a postprocessing error.',
                    'threw a generic postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler throws a custom postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.listHandler throws a custom postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const deferred = Q.defer()
            const countSpy = sandbox.spy(function() {
              return Q.when()
            })
            const mongooseQuery1 = { count: countSpy }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }
            const result = ''
            deferred.resolve(result)
            const execSpy = sandbox.spy(function() {
              return deferred.promise
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const postDeferred = Q.defer()
            const error = 'error message'
            postDeferred.reject(error)
            userSchema.statics = {
              routeOptions: {
                list: {
                  post: function() {
                    throw Boom.badRequest(error)
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.find = sandbox.spy()

            const query = { test: {} }
            const request = { query: query }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler throws a generic preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.listHandler throws a generic preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                list: {
                  pre: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(
              userModel,
              { query: {} },
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a preprocessing error.',
                    'threw a generic preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler throws a custom preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.listHandler throws a custom preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                list: {
                  pre: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(
              userModel,
              { query: {} },
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.listHandler throws a general processing error
      .then(function() {
        return t.test(
          'handler-helper.listHandler throws a general processing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const execSpy = sandbox.spy(function() {
              return Q.reject()
            })
            const paginateSpy = sandbox.spy(function() {
              return { exec: execSpy }
            })
            queryHelperStub.paginate = paginateSpy

            const qStub = sandbox.stub(Q, 'when').callsFake(function() {
              throw new Error('ERROR')
            })

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub,
              q: qStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.listHandler(
              userModel,
              { query: {} },
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error processing the request.',
                    'threw a general processing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })
  )
})

test('handler-helper.findHandler', function(t) {
  return (
    Q.when()

      // handler-helper.findHandler calls model.findOne()
      .then(function() {
        return t.test(
          'handler-helper.findHandler calls model.findOne()',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function() {
                  t.ok(
                    userModel.findOne.calledWithExactly({ _id: 'TEST' }),
                    'findOne called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler calls QueryHelper.createMongooseQuery
      .then(function() {
        return t.test(
          'handler-helper.findHandler calls QueryHelper.createMongooseQuery',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy(function() {
              return 'TEST'
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function() {
                  t.ok(
                    queryHelperStub.createMongooseQuery.calledWithExactly(
                      userModel,
                      request.query,
                      'TEST',
                      Log
                    ),
                    'createMongooseQuery called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler calls pre processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.findHandler calls pre processing if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const preDeferred = Q.defer()
            const preSpy = sandbox.spy(function() {
              preDeferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                find: {
                  pre: preSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { query: {}, params: { _id: {} } }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.findHandler(userModel, 'TEST', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              preDeferred.promise
                .catch(function() {
                  t.ok(
                    preSpy.calledWithExactly(
                      'TEST',
                      request.query,
                      request,
                      Log
                    ),
                    'find.pre called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler calls post processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.findHandler calls post processing if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const mongooseQuery1 = {
              exec: function() {
                return Q.when('TEST')
              }
            }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const deferred = Q.defer()
            const postSpy = sandbox.spy(function() {
              deferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                find: {
                  post: postSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { query: {}, params: { _id: {} } }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.findHandler(userModel, 'TEST', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .catch(function() {
                  t.ok(
                    postSpy.calledWithExactly(request, 'TEST', Log),
                    'find.post called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler returns a single result
      .then(function() {
        return t.test(
          'handler-helper.findHandler returns a single result',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const mongooseQuery1 = {
              exec: function() {
                return Q.when('TEST1')
              }
            }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { query: {}, params: { _id: {} } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(result) {
                  // Log.error(reply.args[0]);
                  t.deepEqual(result, 'TEST1', 'returns single result')
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler throws a generic postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.findHandler throws a generic postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const mongooseQuery1 = {
              exec: function() {
                return Q.when('TEST')
              }
            }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const postDeferred = Q.defer()
            const error = new Error()
            postDeferred.reject(error)
            userSchema.statics = {
              routeOptions: {
                find: {
                  post: function() {
                    return postDeferred.promise
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { query: {}, params: { _id: {} } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a postprocessing error.',
                    'threw a generic postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler throws a custom postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.findHandler throws a custom postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const mongooseQuery1 = {
              exec: function() {
                return Q.when('TEST')
              }
            }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const postDeferred = Q.defer()
            const error = 'error message'
            postDeferred.reject(error)
            userSchema.statics = {
              routeOptions: {
                find: {
                  post: function() {
                    throw Boom.badRequest(error)
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { query: {}, params: { _id: {} } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler throws a not found error
      .then(function() {
        return t.test(
          'handler-helper.findHandler throws a not found error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()

            const mongooseQuery1 = {
              exec: function() {
                return Q.when()
              }
            }
            const mongooseQuery2 = {
              lean: function() {
                return mongooseQuery1
              }
            }

            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createMongooseQuery = function() {
              return mongooseQuery2
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const userModel = mongoose.model('user', userSchema)

            userModel.findOne = sandbox.spy()

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'No resource was found with that id.',
                    'threw a not found error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler throws a generic preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.findHandler throws a generic preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                find: {
                  pre: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a preprocessing error.',
                    'threw a generic preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler throws a custom preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.findHandler throws a custom preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                find: {
                  pre: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.findHandler throws a general processing error
      .then(function() {
        return t.test(
          'handler-helper.findHandler throws a general processing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const qStub = sandbox.stub(Q, 'when').callsFake(function() {
              throw new Error('ERROR')
            })

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub,
              q: qStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.findHandler(
              userModel,
              'TEST',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error processing the request.',
                    'threw a general processing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })
  )
})

test('handler-helper.createHandler', function(t) {
  return (
    Q.when()

      // handler-helper.createHandler calls pre processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.createHandler calls pre processing if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const preDeferred = Q.defer()
            const preSpy = sandbox.spy(function(payload) {
              preDeferred.resolve()
              return Q.when(payload)
            })
            userSchema.statics = {
              routeOptions: {
                create: {
                  pre: preSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const payload = { field: 'value' }
            const request = { payload: payload }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              preDeferred.promise
                .catch(function() {
                  t.ok(
                    preSpy.calledWithExactly(payload, request, Log),
                    'create.pre called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler calls model.create
      .then(function() {
        return t.test(
          'handler-helper.createHandler calls model.create',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            const createDeferred = Q.defer()
            userModel.create = sandbox.spy(function() {
              return createDeferred.resolve()
            })

            const payload = { field: 'value' }
            const request = { payload: payload }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              createDeferred.promise
                .then(function() {
                  // use sinon.match to allow for added date fields
                  t.ok(
                    userModel.create.calledWithExactly([sinon.match(payload)]),
                    'model.create called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler calls QueryHelper.createAttributesFilter
      .then(function() {
        return t.test(
          'handler-helper.createHandler calls QueryHelper.createAttributesFilter',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            const deferred = Q.defer()
            queryHelperStub.createAttributesFilter = sandbox.spy(function() {
              return deferred.resolve()
            })

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              return Q.when()
            })

            const request = { query: 'TEST', payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .catch(function() {
                  t.ok(
                    queryHelperStub.createAttributesFilter.calledWithExactly(
                      {},
                      userModel,
                      Log
                    ),
                    'queryHelperStub.createAttributesFilter called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler calls model.find
      .then(function() {
        return t.test('handler-helper.createHandler calls model.find', function(
          t
        ) {
          // <editor-fold desc="Arrange">
          const sandbox = sinon.sandbox.create()
          const Log = logger.bind('handler-helper')
          const server = sandbox.spy()
          const queryHelperStub = sandbox.stub(
            require('../../utilities/query-helper')
          )
          queryHelperStub.createAttributesFilter = function() {
            return 'attributes'
          }

          const handlerHelper = proxyquire('../../utilities/handler-helper', {
            './query-helper': queryHelperStub
          })
          sandbox.stub(Log, 'error').callsFake(function() {})

          const userSchema = new mongoose.Schema({})

          const userModel = mongoose.model('user', userSchema)
          userModel.create = sandbox.spy(function() {
            return Q.when([{ _id: 'TEST' }])
          })
          const deferred = Q.defer()
          userModel.find = sandbox.spy(function() {
            return deferred.resolve()
          })

          const request = { query: {}, payload: {} }
          // </editor-fold>

          // <editor-fold desc="Act">
          handlerHelper.createHandler(userModel, request, Log)
          // </editor-fold>

          // <editor-fold desc="Assert">
          return (
            deferred.promise
              .then(function() {
                // TODO create used to call findOne() with query and attributes as args
                //      now calls find() with no args but chains additional calls
                //      should test those chained calls
                t.ok(userModel.find.calledWithExactly(), 'model.find called')
              })
              // </editor-fold>

              // <editor-fold desc="Restore">
              .then(function() {
                sandbox.restore()
                delete mongoose.models.user
                delete mongoose.modelSchemas.user
              })
          )
          // </editor-fold>
        })
      })

      // handler-helper.createHandler calls create.post if it exists
      .then(function() {
        return t.test(
          'handler-helper.createHandler calls create.post if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            // sandbox.stub(Log, 'error').callsFake(function(){});

            const userSchema = new mongoose.Schema({})
            const deferred = Q.defer()
            const postSpy = sandbox.spy(function() {
              return deferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                create: {
                  post: postSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              return Q.when([{ _id: 'TEST' }])
            })

            const findExec = function() {
              return Q.when([{ _id: 'TEST' }])
            }
            const findLean = function() {
              return { exec: findExec }
            }
            const findSelect = function() {
              return { lean: findLean }
            }
            const findWhere = function() {
              return { select: findSelect }
            }

            userModel.find = sandbox.spy(function() {
              return { where: findWhere }
            })

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(
                    postSpy.calledWithExactly(
                      { _id: 'TEST' },
                      request,
                      [{ _id: 'TEST' }],
                      Log
                    ),
                    'create.post called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler returns single result when payload is not an array
      .then(function() {
        return t.test(
          'handler-helper.createHandler returns single result when payload is not an array',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              return Q.when([{ _id: 'TEST' }])
            })

            // NOTE: payload is an object so we expect a single object to be returned
            const payload = { _id: '3' }

            const findExec = function() {
              return Q.when([payload])
            }
            const findLean = function() {
              return { exec: findExec }
            }
            const findSelect = function() {
              return { lean: findLean }
            }
            const findWhere = function() {
              return { select: findSelect }
            }

            userModel.find = sandbox.spy(function() {
              return { where: findWhere }
            })

            const request = { query: {}, payload: payload }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .then(function(result) {
                  t.deepEqual(result, payload, 'returned single result')
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler returns an array when payload is an array
      .then(function() {
        return t.test(
          'handler-helper.createHandler returns an array when payload is an array',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              return Q.when([{ _id: 'TEST' }])
            })

            // NOTE: payload is an array so we expect an array to be returned
            const payload = [{ _id: '3' }, { _id: '4' }]

            const findExec = function() {
              return Q.when(payload)
            }
            const findLean = function() {
              return { exec: findExec }
            }
            const findSelect = function() {
              return { lean: findLean }
            }
            const findWhere = function() {
              return { select: findSelect }
            }

            userModel.find = sandbox.spy(function() {
              return { where: findWhere }
            })

            const request = { query: {}, payload: payload }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .then(function(result) {
                  t.deepEqual(result, payload, 'returned array')
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler throws a generic postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.createHandler throws a generic postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                create: {
                  post: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              return Q.when([{ _id: 'TEST' }])
            })

            const findExec = function() {
              return Q.when([{ _id: 'TEST' }])
            }
            const findLean = function() {
              return { exec: findExec }
            }
            const findSelect = function() {
              return { lean: findLean }
            }
            const findWhere = function() {
              return { select: findSelect }
            }

            userModel.find = sandbox.spy(function() {
              return { where: findWhere }
            })

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a postprocessing error creating the resource.',
                    'threw a generic postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler throws a custom postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.createHandler throws a custom postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                create: {
                  post: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              return Q.when([{ _id: 'TEST' }])
            })

            const findExec = function() {
              return Q.when([{ _id: 'TEST' }])
            }
            const findLean = function() {
              return { exec: findExec }
            }
            const findSelect = function() {
              return { lean: findLean }
            }
            const findWhere = function() {
              return { select: findSelect }
            }

            userModel.find = sandbox.spy(function() {
              return { where: findWhere }
            })

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler throws a create error
      .then(function() {
        return t.test(
          'handler-helper.createHandler throws a create error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                create: {
                  post: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.create = sandbox.spy(function() {
              throw Boom.badRequest('error message')
            })

            const findExec = function() {
              return Q.when([{ _id: 'TEST' }])
            }
            const findLean = function() {
              return { exec: findExec }
            }
            const findSelect = function() {
              return { lean: findLean }
            }
            const findWhere = function() {
              return { select: findSelect }
            }

            userModel.find = sandbox.spy(function() {
              return { where: findWhere }
            })

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error creating the resource.',
                    'threw a create error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler throws a generic preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.createHandler throws a generic preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                create: {
                  pre: function() {
                    throw new Error()
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, payload: { boo: 'boo' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a preprocessing error creating the resource.',
                    'threw a generic preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler throws a custom preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.createHandler throws a custom preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                create: {
                  pre: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.createHandler throws a general processing error
      .then(function() {
        return t.test(
          'handler-helper.createHandler throws a general processing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            let userModel = mongoose.model('user', userSchema)

            userModel = sandbox.stub(userModel, 'find').callsFake(function() {
              throw new Error('ERROR')
            })

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.createHandler(userModel, request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error processing the request.',
                    'threw a general processing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })
  )
})

test('handler-helper.updateHandler', function(t) {
  return (
    Q.when()

      // handler-helper.updateHandler calls pre processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.updateHandler calls pre processing if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const preDeferred = Q.defer()
            const preSpy = sandbox.spy(function() {
              preDeferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                update: {
                  pre: preSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const payload = { name: 'TEST' }

            const request = { query: {}, payload: payload }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.updateHandler(userModel, '_id', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              preDeferred.promise
                .then(function() {
                  t.ok(
                    preSpy.calledWithExactly('_id', payload, request, Log),
                    'update.pre called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler calls model.findByIdAndUpdate
      .then(function() {
        return t.test(
          'handler-helper.updateHandler calls model.findByIdAndUpdate',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            const updateDeferred = Q.defer()
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return updateDeferred.resolve()
            })

            const payload = { field: 'value' }
            const request = {
              query: {},
              params: { _id: '_id' },
              payload: payload
            }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.updateHandler(userModel, '_id', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              updateDeferred.promise
                .then(function() {
                  // use sinon.match to allow for added date fields
                  t.ok(
                    userModel.findByIdAndUpdate.calledWithExactly(
                      '_id',
                      sinon.match(payload),
                      { runValidators: false }
                    ),
                    'model.findByIdAndUpdate called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler calls model.findByIdAndUpdate with runValidators: true
      .then(function() {
        return t.test(
          'handler-helper.updateHandler calls model.findByIdAndUpdate with runValidators: true',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const config = { enableMongooseRunValidators: true }
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub,
              '../config': config
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            const updateDeferred = Q.defer()
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return updateDeferred.resolve()
            })

            const payload = { field: 'value' }
            const request = {
              query: {},
              params: { _id: '_id' },
              payload: payload
            }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.updateHandler(userModel, '_id', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              updateDeferred.promise
                .then(function() {
                  // use sinon.match to allow for added date fields
                  t.ok(
                    userModel.findByIdAndUpdate.calledWithExactly(
                      '_id',
                      sinon.match(payload),
                      { runValidators: true }
                    ),
                    'model.findByIdAndUpdate called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler calls QueryHelper.createAttributesFilter
      .then(function() {
        return t.test(
          'handler-helper.updateHandler calls QueryHelper.createAttributesFilter',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            const deferred = Q.defer()
            queryHelperStub.createAttributesFilter = sandbox.spy(function() {
              return deferred.resolve()
            })

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return Q.when({})
            })

            const request = {
              query: 'TEST',
              params: { _id: '_id' },
              payload: {}
            }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.updateHandler(userModel, '_id', {}, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  // TODO this test previously expected createAttributesFilter to be called with request.query,
                  //      but the code currently calls it with a hard-coded {}
                  //      which is correct?
                  t.ok(
                    queryHelperStub.createAttributesFilter.calledWithExactly(
                      {},
                      userModel,
                      Log
                    ),
                    'queryHelperStub.createAttributesFilter called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler calls model.findOne
      .then(function() {
        return t.test(
          'handler-helper.updateHandler calls model.findOne',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return Q.when({ _id: 'TEST' })
            })
            const deferred = Q.defer()
            userModel.findOne = sandbox.spy(function() {
              return deferred.resolve()
            })

            const request = { query: {}, params: { _id: '_id' }, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.updateHandler(userModel, '_id', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(
                    userModel.findOne.calledWithExactly(
                      { _id: 'TEST' },
                      'attributes'
                    ),
                    'model.findOne called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler calls update.post if it exists
      .then(function() {
        return t.test(
          'handler-helper.updateHandler calls update.post if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const deferred = Q.defer()
            const postSpy = sandbox.spy(function() {
              return deferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                update: {
                  post: postSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return Q.when({ _id: {} })
            })
            userModel.findOne = sandbox.spy(function() {
              return {
                lean: function() {
                  return Q.when('TEST')
                }
              }
            })

            const request = { query: {}, params: { _id: '_id' }, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.updateHandler(userModel, '_id', request, Log)
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(
                    postSpy.calledWithExactly(request, 'TEST', Log),
                    'update.post called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler returns result
      .then(function() {
        return t.test('handler-helper.updateHandler returns result', function(
          t
        ) {
          // <editor-fold desc="Arrange">
          const sandbox = sinon.sandbox.create()
          const Log = logger.bind('handler-helper')
          const server = sandbox.spy()
          const queryHelperStub = sandbox.stub(
            require('../../utilities/query-helper')
          )

          const handlerHelper = proxyquire('../../utilities/handler-helper', {
            './query-helper': queryHelperStub
          })
          sandbox.stub(Log, 'error').callsFake(function() {})

          const userSchema = new mongoose.Schema({})

          const userModel = mongoose.model('user', userSchema)
          userModel.findByIdAndUpdate = sandbox.spy(function() {
            return Q.when({ _id: {} })
          })
          userModel.findOne = sandbox.spy(function() {
            return {
              lean: function() {
                return Q.when('3')
              }
            }
          })

          const request = { query: {}, params: { _id: '_id' }, payload: {} }
          // </editor-fold>

          // <editor-fold desc="Act">
          const promise = handlerHelper.updateHandler(
            userModel,
            '_id',
            request,
            Log
          )
          // </editor-fold>

          // <editor-fold desc="Assert">
          return (
            promise
              .then(function(result) {
                t.equal(result, '3', 'returned result')
              })
              // </editor-fold>

              // <editor-fold desc="Restore">
              .then(function() {
                sandbox.restore()
                delete mongoose.models.user
                delete mongoose.modelSchemas.user
              })
          )
          // </editor-fold>
        })
      })

      // handler-helper.updateHandler throws a generic postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.updateHandler throws a generic postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                update: {
                  post: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return Q.when({ _id: {} })
            })
            userModel.findOne = sandbox.spy(function() {
              return {
                lean: function() {
                  return Q.when('TEST')
                }
              }
            })

            const request = { query: {}, params: { _id: '_id' }, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a postprocessing error updating the resource.',
                    'threw a generic postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler throws a custom postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.updateHandler throws a custom postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                update: {
                  post: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return Q.when({ _id: {} })
            })
            userModel.findOne = sandbox.spy(function() {
              return {
                lean: function() {
                  return Q.when('TEST')
                }
              }
            })

            const request = { query: {}, params: { _id: '_id' }, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler throws a not found error
      .then(function() {
        return t.test(
          'handler-helper.updateHandler throws a not found error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              return Q.when()
            })

            const request = { query: {}, params: { _id: '_id' }, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'No resource was found with that id.',
                    'threw a not found error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler throws an update error
      .then(function() {
        return t.test(
          'handler-helper.updateHandler throws an update error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            userModel.findByIdAndUpdate = sandbox.spy(function() {
              throw Boom.badRequest('error message')
            })

            const request = { query: {}, params: { _id: '_id' }, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error updating the resource.',
                    'threw an update error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler throws a generic preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.updateHandler throws a generic preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                update: {
                  pre: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a preprocessing error updating the resource.',
                    'threw a generic preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler throws a custom preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.updateHandler throws a custom preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                update: {
                  pre: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.updateHandler throws a general processing error
      .then(function() {
        return t.test(
          'handler-helper.update throws a processing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const queryHelperStub = sandbox.stub(
              require('../../utilities/query-helper')
            )
            queryHelperStub.createAttributesFilter = function() {
              return 'attributes'
            }

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              './query-helper': queryHelperStub
            })

            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            sandbox.stub(userModel, 'findByIdAndUpdate').callsFake(function() {
              return {}
            })
            sandbox.stub(userModel, 'findOne').callsFake(function() {
              throw new Error('ERROR')
            })

            const request = { query: {}, payload: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.updateHandler(
              userModel,
              '_id',
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error processing the request.',
                    'threw a general processing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })
  )
})

test('handler-helper.deleteOneHandler', function(t) {
  return (
    Q.when()

      // handler-helper.deleteOneHandler calls pre processing if it exists
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler calls pre processing if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const preDeferred = Q.defer()
            const preSpy = sandbox.spy(function() {
              preDeferred.resolve()
            })
            userSchema.statics = {
              routeOptions: {
                delete: {
                  pre: preSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)

            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {} }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.deleteOneHandler(
              userModel,
              '_id',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              preDeferred.promise
                .then(function() {
                  t.ok(
                    preSpy.calledWithExactly('_id', false, request, Log),
                    'delete.pre called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler calls model.findByIdAndRemove
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler calls model.findByIdAndRemove',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            const deferred = Q.defer()
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return deferred.resolve('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(
                    userModel.findByIdAndRemove.calledWithExactly('TEST'),
                    'model.findByIdAndRemove called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler calls model.findByIdAndUpdate when enableSoftDelete
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler calls model.findByIdAndUpdate when enableSoftDelete',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const config = { enableSoftDelete: true }
            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              '../config': config
            })
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            const deferred = Q.defer()
            sandbox.stub(userModel, 'findByIdAndUpdate').callsFake(function() {
              return deferred.resolve('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(
                    userModel.findByIdAndUpdate.calledWithExactly(
                      'TEST',
                      sinon.match({ isDeleted: true }),
                      { new: true, runValidators: false }
                    ),
                    'model.findByIdAndUpdate called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler calls create.post if it exists
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler calls delete.post if it exists',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            const deferred = Q.defer()
            const postSpy = sandbox.spy(function() {
              return deferred.resolve({})
            })
            userSchema.statics = {
              routeOptions: {
                delete: {
                  post: postSpy
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              deferred.promise
                .then(function() {
                  t.ok(
                    postSpy.calledWithExactly(false, 'DELETED', request, Log),
                    'delete.post called'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler returns true
      .then(function() {
        return t.test('handler-helper.deleteOneHandler returns true', function(
          t
        ) {
          // <editor-fold desc="Arrange">
          const sandbox = sinon.sandbox.create()
          const Log = logger.bind('handler-helper')
          const server = sandbox.spy()
          const handlerHelper = proxyquire('../../utilities/handler-helper', {})
          sandbox.stub(Log, 'error').callsFake(function() {})

          const userSchema = new mongoose.Schema({})

          const userModel = mongoose.model('user', userSchema)
          sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
            return Q.when('DELETED')
          })

          const request = { query: {}, params: { _id: 'TEST' } }
          // </editor-fold>

          // <editor-fold desc="Act">
          const promise = handlerHelper.deleteOneHandler(
            userModel,
            'TEST',
            request,
            Log
          )
          // </editor-fold>

          // <editor-fold desc="Assert">
          return (
            promise
              .then(function(result) {
                t.equal(result, true, 'returned true')
              })
              // </editor-fold>

              // <editor-fold desc="Restore">
              .then(function() {
                sandbox.restore()
                delete mongoose.models.user
                delete mongoose.modelSchemas.user
              })
          )
          // </editor-fold>
        })
      })

      // handler-helper.deleteOneHandler throws a generic postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler throws a generic postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                delete: {
                  post: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a postprocessing error deleting the resource.',
                    'threw a generic postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler throws a custom postprocessing error
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler throws a custom postprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                delete: {
                  post: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom postprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler throws a not found error
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler throws a not found error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'No resource was found with that id.',
                    'threw a not found error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler throws a generic preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler throws a generic preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                delete: {
                  pre: function() {
                    return Q.reject(new Error())
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was a preprocessing error deleting the resource.',
                    'threw a generic preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler throws a custom preprocessing error
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler calls reply with a preprocessing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const handlerHelper = proxyquire(
              '../../utilities/handler-helper',
              {}
            )
            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})
            userSchema.statics = {
              routeOptions: {
                delete: {
                  pre: function() {
                    throw Boom.badRequest('error message')
                  }
                }
              }
            }

            const userModel = mongoose.model('user', userSchema)
            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              return Q.when('DELETED')
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'error message',
                    'threw a custom preprocessing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })

      // handler-helper.deleteOneHandler throws a general processing error
      .then(function() {
        return t.test(
          'handler-helper.deleteOneHandler throws a general processing error',
          function(t) {
            // <editor-fold desc="Arrange">
            const sandbox = sinon.sandbox.create()
            const Log = logger.bind('handler-helper')
            const server = sandbox.spy()
            const qStub = sandbox.stub(Q, 'when').callsFake(function() {
              throw new Error('ERROR')
            })

            const handlerHelper = proxyquire('../../utilities/handler-helper', {
              q: qStub
            })

            sandbox.stub(Log, 'error').callsFake(function() {})

            const userSchema = new mongoose.Schema({})

            const userModel = mongoose.model('user', userSchema)

            sandbox.stub(userModel, 'findByIdAndRemove').callsFake(function() {
              throw new Error()
            })

            const request = { query: {}, params: { _id: 'TEST' } }
            // </editor-fold>

            // <editor-fold desc="Act">
            const promise = handlerHelper.deleteOneHandler(
              userModel,
              'TEST',
              false,
              request,
              Log
            )
            // </editor-fold>

            // <editor-fold desc="Assert">
            return (
              promise
                .catch(function(error) {
                  t.equals(
                    error.message,
                    'There was an error deleting the resource.',
                    'threw a general processing error'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  sandbox.restore()
                  delete mongoose.models.user
                  delete mongoose.modelSchemas.user
                })
            )
            // </editor-fold>
          }
        )
      })
  )
})

// test('handler-helper.addOne', function(t) {
//
//   return Q.when()
//
//   //handler-helper.addOne calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.addOne calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = proxyquire('../../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls setAssociation
//   .then(function() {
//     return t.test('handler-helper.addOne calls setAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let setAssociation = sandbox.spy(function(){ return deferred.resolve() });
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(setAssociation.calledWithExactly({ params: { ownerId: "ownerId", childId: "childId" }, payload: [ 'TEST' ] }, server, userModel, "ownerObject", childModel, "childId", "CHILD", {}, Log), "setAssociation called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while setting the association.", "error message"), "reply called with association error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addOne calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.addOne calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.removeOne', function(t) {
//
//   return Q.when()
//
//   //handler-helper.removeOne calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.removeOne calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = proxyquire('../../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls removeAssociation
//   .then(function() {
//     return t.test('handler-helper.removeOne calls removeAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let removeAssociation = sandbox.spy(function(){ return deferred.resolve() });
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("removeAssociation", removeAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(removeAssociation.calledWithExactly(request, server, userModel, "ownerObject", childModel, "childId", "CHILD", {}, Log), "removeAssociation called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let removeAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("removeAssociation", removeAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let removeAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("removeAssociation", removeAssociation);
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while removing the association.", "error message"), "reply called with association error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeOne calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.removeOne calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" }, payload: "TEST" };
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.removeOne(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.addMany', function(t) {
//
//   return Q.when()
//
//   //handler-helper.addMany calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.addMany calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = proxyquire('../../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls setAssociation for every childId
//   .then(function() {
//     return t.test('handler-helper.addMany calls setAssociation', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.equals(setAssociation.callCount, 3, "setAssociation called for each child");
//         t.ok(setAssociation.getCall(2).calledWithExactly(request, server, userModel, "ownerObject", childModel, "child3", "CHILD", {}, Log), "setAssociation called with correct args");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.when() });
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(reply.called, "reply called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply with an association error
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply with an association error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let setAssociation = sandbox.spy(function(){ return Q.reject("error message") });
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("setAssociation", setAssociation);
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when("ownerObject") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.gatewayTimeout.calledWithExactly("There was a database error while setting the associations.", "error message"), "reply called with association error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply with a not found error
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply with a not found error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ return Q.when() });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.notFound.calledWithExactly("No owner resource was found with that id: ownerId"), "reply called with not found error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.addMany calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.addMany calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.addMany(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.getAll', function(t) {
//
//   return Q.when()
//
//   //handler-helper.getAll calls model.findOne
//   .then(function() {
//     return t.test('handler-helper.getAll calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = proxyquire('../../utilities/handler-helper', {
//       });
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             CHILD: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy();
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(userModel.findOne.calledWithExactly({'_id': "_id"}), "model.findOne called");
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll calls QueryHelper.createMongooseQuery
//   .then(function() {
//     return t.test('handler-helper.getAll calls QueryHelper.createMongooseQuery', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       let handlerHelper = proxyquire('../../utilities/handler-helper', {
//         './query-helper': queryHelperStub,
//       });
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             CHILD: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "CHILD", model: childModel }};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let ownerRequest = { query: { $embed: "CHILD", populateSelect: "_id,foreignField" } };
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       t.ok(queryHelperStub.createMongooseQuery.calledWithExactly(userModel, ownerRequest.query, "TEST", Log), "createMongooseQuery called");
//       //</editor-fold>
//
//
//       //<editor-fold desc="Restore">
//       sandbox.restore();
//       delete mongoose.models.user;
//       delete mongoose.modelSchemas.user;
//       delete mongoose.models.child;
//       delete mongoose.modelSchemas.child;
//       return Q.when();
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll calls list
//   .then(function() {
//     return t.test('handler-helper.getAll calls list', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let handlerSpy1 = sandbox.spy(function(){ deferred.resolve() });
//       let handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){ return Q.when({ "children": [{ _id: "childId1"},{ _id: "childId2"}] }) }}};
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("QueryHelper", queryHelperStub);
//       handlerHelper.__set__("list", handlerSpy2);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child"};
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       let Object.assignedRequest = Object.assign({}, request);
//       Object.assignedRequest.query.$where = Object.assign({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       let reply = function(){};
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "list called 1");
//         t.ok(handlerSpy1.calledWithExactly(Object.assignedRequest, reply), "list called 2");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll handles MANY_MANY associations with linkingModels
//   .then(function() {
//     return t.test('handler-helper.getAll handles MANY_MANY associations with linkingModels', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
//       let handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
//         return Q.when(
//           {
//             "children": [
//               { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
//               { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
//               ]
//           })
//       }}};
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("QueryHelper", queryHelperStub);
//       handlerHelper.__set__("list", handlerSpy2);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let request = { query: {}, params: { ownerId: "_id" }, noReply: true };
//       let Object.assignedRequest = Object.assign({}, request);
//       Object.assignedRequest.query.$where = Object.assign({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "list called 1");
//         t.ok(handlerSpy1.calledWithExactly(Object.assignedRequest, reply), "list called 2");
//         t.ok(reply.calledWithExactly([{_id: "childId1", link: {value: "value1"}},{_id: "childId2", link: {value: "value2"}}]), "reply called with correct result");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll handles MANY_MANY associations without linkingModels
//   .then(function() {
//     return t.test('handler-helper.getAll handles MANY_MANY associations without linkingModels', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let deferred = Q.defer();
//       let handlerSpy1 = sandbox.spy(function(){ return Q.when([{_id: "childId1"},{_id: "childId2"}]) });
//       let handlerSpy2 = sandbox.spy(function(){ return handlerSpy1 });
//       let queryHelperStub = sandbox.stub(require('../../utilities/query-helper'));
//       queryHelperStub.createMongooseQuery = function(){ return { exec: function(){
//         return Q.when(
//           {
//             "children": [
//               { child: { _id: "childId1"}, value: "value1", toJSON: function(){return { child: { _id: "childId1"}, value: "value1"}}},
//               { child: { _id: "childId2"}, value: "value2", toJSON: function(){return { child: { _id: "childId2"}, value: "value2"}}},
//             ]
//           })
//       }}};
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("QueryHelper", queryHelperStub);
//       handlerHelper.__set__("list", handlerSpy2);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){return "TEST"});
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let request = { query: {}, params: { ownerId: "_id" }, noReply: true };
//       let Object.assignedRequest = Object.assign({}, request);
//       Object.assignedRequest.query.$where = Object.assign({'_id': { $in: ["childId1","childId2"] }}, request.query.$where);
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(handlerSpy2.calledWithExactly(childModel, {}, Log), "list called 1");
//         t.ok(handlerSpy1.calledWithExactly(Object.assignedRequest, reply), "list called 2");
//         t.ok(reply.calledWithExactly([{_id: "childId1"},{_id: "childId2"}]), "reply called with correct result");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.getAll calls reply with a processing error
//   .then(function() {
//     return t.test('handler-helper.getAll calls reply with a processing error', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let boomStub = sandbox.stub(require('@hapi/boom'));
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       handlerHelper.__set__("Boom", boomStub);
//       handlerHelper = handlerHelper(mongoose, server);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               foreignField: "foreignField"
//             }
//           }
//         }
//       };
//
//       let userModel = mongoose.model("user", userSchema);
//       userModel.findOne = sandbox.spy(function(){ throw("error message") });
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let request = { params: { ownerId: "ownerId", childId: "childId" } };
//       request.payload = ["child1", "child2", "child3"];
//       let deferred = Q.defer();
//       let reply = sandbox.spy(function(){ return deferred.resolve() });
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       handlerHelper.getAll(userModel, association, {}, Log)(request, reply);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(boomStub.badRequest.calledWithExactly("There was an error processing the request.", "error message"), "reply called with processing error");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       });
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.setAssociation', function(t) {
//
//   return Q.when()
//
//   //handler-helper.setAssociation calls model.findOne
//   .then(function() {
//     return t.test('setAssociation calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let setAssociation = handlerHelper.__get__("setAssociation");
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = {};
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//       let deferred = Q.defer();
//       childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(childModel.findOne.calledWithExactly({'_id': childId}), "model.findOne called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation handles ONE_MANY relationships
//   .then(function() {
//     return t.test('setAssociation handles ONE_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let setAssociation = handlerHelper.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "ONE_MANY",
//               foreignField: "parent"
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = { _id: "_id" };
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, parent: {} };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.equals(childObject.parent, "_id", "childObject updated");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation creates a MANY_MANY association instance if it doesn't exist
//   .then(function() {
//     return t.test('setAssociation creates a MANY_MANY association instance if it doesn\'t exist', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let setAssociation = handlerHelper.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "MANY_MANY",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "2", users: [] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [""] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.ok(userObject.save.called, "userObject.save called");
//         t.deepEqual(userObject.children, [{child: "2"}], "association added to userObject");
//         t.deepEqual(childObject.users, [{user: "1"}], "association added to childObject");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation updates a MANY_MANY association instance if it exists
//   .then(function() {
//     return t.test('setAssociation updates a MANY_MANY association instance if it exists', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let setAssociation = handlerHelper.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "MANY_MANY",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.ok(userObject.save.called, "userObject.save called");
//         t.deepEqual(userObject.children, [{ _id: "_id", child: "3", value: "no"}], "userObject updated");
//         t.deepEqual(childObject.users, [{ _id: "_id", user: "1", value: "no"}], "childObject updated");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation rejects a promise if the association type is invalid
//   .then(function() {
//     return t.test('setAssociation rejects a promise if the association type is invalid', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let setAssociation = handlerHelper.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Association type incorrectly defined.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.setAssociation rejects a promise if the child isn't found
//   .then(function() {
//     return t.test('setAssociation rejects a promise if the child isn\'t found', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let setAssociation = handlerHelper.__get__("setAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       setAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Child object not found.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
// });
//
// test('handler-helper.removeAssociation', function(t) {
//
//   return Q.when()
//
//   //handler-helper.removeAssociation calls model.findOne
//   .then(function() {
//     return t.test('removeAssociation calls model.findOne', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let removeAssociation = handlerHelper.__get__("removeAssociation");
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = {};
//
//       let childSchema = new mongoose.Schema({});
//
//       let childModel = mongoose.model("child", childSchema);
//       let deferred = Q.defer();
//       childModel.findOne = sandbox.spy(function(){ deferred.resolve(); return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "MANY_MANY", linkingModel: "link"};
//
//       let associationName = association.include.as;
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(childModel.findOne.calledWithExactly({'_id': childId}), "model.findOne called");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeAssociation handles ONE_MANY relationships
//   .then(function() {
//     return t.test('removeAssociation handles ONE_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let removeAssociation = handlerHelper.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       handlerHelper.__set__("Q", Qstub);
//       sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "ONE_MANY",
//               foreignField: "parent"
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let userObject = { _id: "_id" };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "ONE_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, parent: "_id" };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let associationName = "children";
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.notOk(childObject.parent, "association removed");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//
//   //handler-helper.removeAssociation handles MANY_MANY relationships
//   .then(function() {
//     return t.test('removeAssociation handles MANY_MANY relationships', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let removeAssociation = handlerHelper.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { resolve: sandbox.spy(function(){ deferred.resolve() }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "MANY_MANY",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { _id: "2", save: saveUser, children: [{child: "1"},{child: "2"}] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { _id: "1", save: saveChild, users: [{user: "1"},{user: "2"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let associationName = "children";
//
//       let childId = "1";
//
//       let request = { query: {}, params: { ownerId: "_id" } };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function() {
//         t.ok(deferredSpy.resolve.called, "deferred.resolve called");
//         t.ok(childObject.save.called, "childObject.save called");
//         t.ok(userObject.save.called, "userObject.save called");
//         t.deepEqual(userObject.children, [{child: "2"}], "association removed from userObject");
//         t.deepEqual(childObject.users, [{user: "1"}], "association removed from childObject");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeAssociation rejects a promise if the association type is invalid
//   .then(function() {
//     return t.test('removeAssociation rejects a promise if the association type is invalid', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let removeAssociation = handlerHelper.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(childObject); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Association type incorrectly defined.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
//   //handler-helper.removeAssociation rejects a promise if the child isn't found
//   .then(function() {
//     return t.test('removeAssociation rejects a promise if the child isn\'t found', function (t) {
//       //<editor-fold desc="Arrange">
//       let sandbox = sinon.sandbox.create();
//       let Log = logger.bind("handler-helper");
//       let server = sandbox.spy();
//       let handlerHelper = rewire('../../utilities/handler-helper');
//       let removeAssociation = handlerHelper.__get__("removeAssociation");
//       let Qstub = {};
//       let deferred = Q.defer();
//       let deferredSpy = { reject: sandbox.spy(function(error){ deferred.resolve(error) }) };
//       Qstub.defer = function(){ return deferredSpy };
//       Qstub.all = function(){ return Q.when() };
//       handlerHelper.__set__("Q", Qstub);
//       // sandbox.stub(Log, 'error').callsFake(function(){});
//
//       let userSchema = new mongoose.Schema({});
//       userSchema.statics = {
//         routeOptions: {
//           associations: {
//             children: {
//               type: "BAD",
//             }
//           }
//         }
//       }
//
//       let userModel = mongoose.model("user", userSchema);
//
//       let saveUser = sandbox.spy(function(){ return Q.when() });
//       let userObject = { save: saveUser, _id: "1", children: [{ _id: "_id", child: "3", value: "yes"}] };
//
//       let childSchema = new mongoose.Schema({});
//       childSchema.statics = {
//         routeOptions: {
//           associations: {
//             users: {
//               type: "MANY_MANY",
//               model: "user",
//               include: {
//                 as: "users"
//               }
//             }
//           }
//         }
//       }
//
//       let childModel = mongoose.model("child", childSchema);
//
//       let saveChild = sandbox.spy(function(){ return Q.when() });
//       let childObject = { save: saveChild, _id: "3", users: [{ _id: "_id", user: "1", value: "yes"}] };
//       childModel.findOne = sandbox.spy(function(){ return Q.when(); });
//
//       let association = { include: { as: "children", model: childModel }, model: "child", type: "BAD"};
//
//       let associationName = association.include.as;
//
//       let childId = "3";
//
//       let request = { query: {}, params: { ownerId: "_id" }, payload: [{ childId: "3", value: "no"}] };
//       //</editor-fold>
//
//       //<editor-fold desc="Act">
//       removeAssociation(request, server, userModel, userObject, childModel, childId, associationName, {}, Log);
//       //</editor-fold>
//
//       //<editor-fold desc="Assert">
//       return deferred.promise.then(function(error) {
//         t.equal(error, "Child object not found.", "error returned");
//       })
//       //</editor-fold>
//
//       //<editor-fold desc="Restore">
//       .then(function() {
//         sandbox.restore();
//         delete mongoose.models.user;
//         delete mongoose.modelSchemas.user;
//         delete mongoose.models.child;
//         delete mongoose.modelSchemas.child;
//       })
//       //</editor-fold>
//     });
//   })
//
// });
