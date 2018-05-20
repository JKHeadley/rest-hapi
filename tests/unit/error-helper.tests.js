'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

let test = require('blue-tape')
let sinon = require('sinon')
let proxyquire = require('proxyquire')
let logging = require('loggin')
let logger = logging.getLogger('tests')

test('error-helper exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  let Log = logger.bind('error-helper')
  let errorHelper = require('../../utilities/error-helper')

  t.plan(8)
  // </editor-fold>

  // <editor-fold desc="Assert">
  t.ok(errorHelper, 'error-helper exists.')
  t.ok(errorHelper.types, 'error-helper.types exists.')
  t.ok(errorHelper.types.BAD_REQUEST, 'error-helper.types.BAD_REQUEST exists.')
  t.ok(
    errorHelper.types.BAD_IMPLEMENTATION,
    'error-helper.types.BAD_IMPLEMENTATION exists.'
  )
  t.ok(errorHelper.types.NOT_FOUND, 'error-helper.types.NOT_FOUND exists.')
  t.ok(
    errorHelper.types.GATEWAY_TIMEOUT,
    'error-helper.types.GATEWAY_TIMEOUT exists.'
  )
  t.ok(errorHelper.handleError, 'error-helper.handleError exists.')
  t.ok(errorHelper.formatResponse, 'error-helper.formatResponse exists.')
  // </editor-fold>
})

test('error-helper.handleError', function(t) {
  t.plan(2)

  t.test('error-helper.handleError throws an error', function(t) {
    // <editor-fold desc="Arrange">
    t.plan(2)

    let sandbox = sinon.sandbox.create()
    let Log = logger.bind('error-helper')
    let errorHelper = require('../../utilities/error-helper')
    let logErrorSpy = sandbox.spy()
    sandbox.stub(Log, 'error').callsFake(logErrorSpy)

    let message = 'An error occurred'
    let errorType = errorHelper.types.BAD_REQUEST
    let error = new Error()
    let restHapiError = new Error(message)
    restHapiError.type = errorType
    // </editor-fold>

    // <editor-fold desc="Act">
    let thrown

    try {
      errorHelper.handleError(error, message, errorType, Log)
    } catch (e) {
      thrown = e
    }
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.deepEqual(thrown, restHapiError, 'threw a rest-hapi error')
    t.ok(logErrorSpy.calledWith(error), 'called Log.error')
    // </editor-fold>

    // <editor-fold desc="Restore">
    sandbox.restore()
    // </editor-fold>
  })

  t.test('error-helper.handleError rethrows an error', function(t) {
    // <editor-fold desc="Arrange">
    t.plan(2)

    let sandbox = sinon.sandbox.create()
    let Log = logger.bind('error-helper')
    let errorHelper = require('../../utilities/error-helper')
    let logErrorSpy = sandbox.spy()
    sandbox.stub(Log, 'error').callsFake(logErrorSpy)

    let message = 'An error occurred'
    let errorType = errorHelper.types.BAD_REQUEST
    // </editor-fold>

    // <editor-fold desc="Act">
    let thrown

    try {
      errorHelper.handleError(
        { message: message, type: errorType },
        message,
        errorType,
        Log
      )
    } catch (e) {
      thrown = e
    }
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.deepEqual(
      thrown,
      { message: message, type: errorType },
      'rethrew an error'
    )
    t.ok(logErrorSpy.notCalled, 'did not call Log.error')
    // </editor-fold>

    // <editor-fold desc="Restore">
    sandbox.restore()
    // </editor-fold>
  })
})

test('handle-error.formatResponse', function(t) {
  t.test(
    'handle-error.formatResponse handles a BAD_IMPLEMENTATION error',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let Log = logger.bind('error-helper')
      let errorHelper = require('../../utilities/error-helper')

      let message = 'An error occurred'
      let errorType = errorHelper.types.BAD_IMPLEMENTATION
      // </editor-fold>

      // <editor-fold desc="Act">
      let response = errorHelper.formatResponse(
        { message: message, type: errorType },
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(response instanceof Error, 'returned an error')
      t.deepEqual(
        response.output.payload,
        // Boom hides actual error message for 500 error
        {
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'An internal server error occurred'
        },
        'returned a BAD_IMPLEMENTATION error response'
      )
      // </editor-fold>
    }
  )

  t.test(
    'handle-error.formatResponse handles a GATEWAY_TIMEOUT error',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let Log = logger.bind('error-helper')
      let errorHelper = require('../../utilities/error-helper')

      let message = 'An error occurred'
      let errorType = errorHelper.types.GATEWAY_TIMEOUT
      // </editor-fold>

      // <editor-fold desc="Act">
      let response = errorHelper.formatResponse(
        { message: message, type: errorType },
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(response instanceof Error, 'returned an error')
      t.deepEqual(
        response.output.payload,
        { statusCode: 504, error: 'Gateway Time-out', message: message },
        'returned a GATEWAY_TIMEOUT error response'
      )
      // </editor-fold>
    }
  )

  t.test('handle-error.formatResponse handles a NOT_FOUND error', function(t) {
    // <editor-fold desc="Arrange">
    t.plan(2)

    let Log = logger.bind('error-helper')
    let errorHelper = require('../../utilities/error-helper')

    let message = 'An error occurred'
    let errorType = errorHelper.types.NOT_FOUND
    // </editor-fold>

    // <editor-fold desc="Act">
    let response = errorHelper.formatResponse(
      { message: message, type: errorType },
      Log
    )
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.ok(response instanceof Error, 'returned an error')
    t.deepEqual(
      response.output.payload,
      { statusCode: 404, error: 'Not Found', message: message },
      'returned a NOT_FOUND error response'
    )
    // </editor-fold>
  })

  t.test('handle-error.formatResponse handles a BAD_REQUEST error', function(
    t
  ) {
    // <editor-fold desc="Arrange">
    t.plan(2)

    let Log = logger.bind('error-helper')
    let errorHelper = require('../../utilities/error-helper')

    let message = 'An error occurred'
    let errorType = errorHelper.types.BAD_REQUEST
    // </editor-fold>

    // <editor-fold desc="Act">
    let response = errorHelper.formatResponse(
      { message: message, type: errorType },
      Log
    )
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.ok(response instanceof Error, 'returned an error')
    t.deepEqual(
      response.output.payload,
      { statusCode: 400, error: 'Bad Request', message: message },
      'returned a BAD_REQUEST error response'
    )
    // </editor-fold>
  })

  t.test(
    'handle-error.formatResponse handles an error with an unknown type',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let Log = logger.bind('error-helper')
      let errorHelper = require('../../utilities/error-helper')

      let message = 'An error occurred'
      let errorType = 'UNKNOWN'
      // </editor-fold>

      // <editor-fold desc="Act">
      let response = errorHelper.formatResponse(
        { message: message, type: errorType },
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(response instanceof Error, 'returned an error')
      t.deepEqual(
        response.output.payload,
        { statusCode: 400, error: 'Bad Request', message: message },
        'returned a BAD_REQUEST error response'
      )
      // </editor-fold>
    }
  )

  t.end()
})
