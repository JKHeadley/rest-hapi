'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

let test = require('tape')
let _ = require('lodash')
let sinon = require('sinon')
let sinonTestFactory = require('sinon-test')
let sinonTest = sinonTestFactory(sinon)
let rewire = require('rewire')
let proxyquire = require('proxyquire')
let assert = require('assert')
let mongoose = require('mongoose')
let Types = mongoose.Schema.Types
let logging = require('loggin')
let Log = logging.getLogger('tests')
Log.logLevel = 'ERROR'
Log = Log.bind('rest-helper-factory')
let testHelper = require('../../utilities/test-helper')
let Joi = require('joi')
let fs = require('fs')

sinon.test = sinonTest

// EXPL: Temporarily create config file for testing.
// fs.createReadStream(__dirname + '/../config.js').pipe(fs.createWriteStream(__dirname + '/../config.js'));

// TODO: test DeleteMany endpoint
// TODO: test scope functionality

test('rest-helper-factory exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )

  t.plan(13)
  // </editor-fold>

  // <editor-fold desc="Assert">
  t.ok(restHelperFactory, 'rest-helper-factory exists.')
  t.ok(
    restHelperFactory.generateRoutes,
    'rest-helper-factory.generateRoutes exists.'
  )
  t.ok(
    restHelperFactory.generateListEndpoint,
    'rest-helper-factory.generateListEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateFindEndpoint,
    'rest-helper-factory.generateFindEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateCreateEndpoint,
    'rest-helper-factory.generateCreateEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateDeleteOneEndpoint,
    'rest-helper-factory.generateDeleteOneEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateDeleteManyEndpoint,
    'rest-helper-factory.generateDeleteManyEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateUpdateEndpoint,
    'rest-helper-factory.generateUpdateEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateAssociationAddOneEndpoint,
    'rest-helper-factory.generateAssociationAddOneEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateAssociationRemoveOneEndpoint,
    'rest-helper-factory.generateAssociationRemoveOneEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateAssociationAddManyEndpoint,
    'rest-helper-factory.generateAssociationAddManyEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateAssociationRemoveManyEndpoint,
    'rest-helper-factory.generateAssociationRemoveManyEndpoint exists.'
  )
  t.ok(
    restHelperFactory.generateAssociationGetAllEndpoint,
    'rest-helper-factory.generateAssociationGetAllEndpoint exists.'
  )
  // </editor-fold>
})

test('rest-helper-factory.defaultHeadersValidation', function(t) {
  t.test(
    'rest-helper-factory.defaultHeadersValidation requires authorization property if auth is enabled',
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let config = { authStrategy: 'token' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(2)

      let header1 = {}
      let header2 = { authorization: 'test' }
      // </editor-fold>

      // <editor-fold desc="Act">
      let defaultHeadersValidation = restHelperFactory.defaultHeadersValidation
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate(header1, defaultHeadersValidation).error !== null,
        'no authorization fails validation'
      )
      t.ok(
        Joi.validate(header2, defaultHeadersValidation).error === null,
        'authorization valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.test(
    "rest-helper-factory.defaultHeadersValidation doesn't require authorization property if auth is disabled",
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let config = { authStrategy: null }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let header1 = {}
      let header2 = { authorization: 'test' }
      // </editor-fold>

      // <editor-fold desc="Act">
      let defaultHeadersValidation = restHelperFactory.defaultHeadersValidation
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate(header2, defaultHeadersValidation).error === null,
        'authorization valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.test(
    'rest-helper-factory.defaultHeadersValidation allows unknown header properties',
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let restHelperFactory = require('../../utilities/rest-helper-factory')(
        Log,
        mongoose,
        server
      )

      t.plan(1)

      let header = { authorization: 'test', unknown: 'test' }
      // </editor-fold>

      // <editor-fold desc="Act">
      let defaultHeadersValidation = restHelperFactory.defaultHeadersValidation
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate(header, defaultHeadersValidation).error === null,
        'unknown property valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.end()
})

test('rest-helper-factory.generateRoutes', function(t) {
  let server = sinon.spy()
  sinon.stub(Log, 'error').callsFake(function() {})
  sinon.stub(Log, 'bind').callsFake(function() {
    return Log
  })
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateRoutes,
    'restHelperFactory.generateRoutes',
    ['server', 'model', 'options'],
    Log
  )

  t.test(
    'rest-helper-factory.generateRoutes calls CRUD endpoint generators by default',
    function(t) {
      // <editor-fold desc="Arrange">
      Log.error.restore()
      Log.bind.restore()
      let server = sinon.spy()
      let restHelperFactory = require('../../utilities/rest-helper-factory')(
        Log,
        mongoose,
        server
      )

      t.plan(6)

      let userSchema = new mongoose.Schema()
      userSchema.statics = {
        routeOptions: {}
      }
      let userModel = mongoose.model('user', userSchema)

      sinon
        .stub(restHelperFactory, 'generateListEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateFindEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateCreateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateUpdateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteManyEndpoint')
        .callsFake(sinon.spy())
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateRoutes(server, userModel, {})
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        restHelperFactory.generateListEndpoint.called,
        'generateListEndpoint called'
      )
      t.ok(
        restHelperFactory.generateFindEndpoint.called,
        'generateFindEndpoint called'
      )
      t.ok(
        restHelperFactory.generateCreateEndpoint.called,
        'generateCreateEndpoint called'
      )
      t.ok(
        restHelperFactory.generateUpdateEndpoint.called,
        'generateUpdateEndpoint called'
      )
      t.ok(
        restHelperFactory.generateDeleteOneEndpoint.called,
        'generateDeleteOneEndpoint called'
      )
      t.ok(
        restHelperFactory.generateDeleteManyEndpoint.called,
        'generateDeleteManyEndpoint called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      restHelperFactory.generateListEndpoint.restore()
      restHelperFactory.generateFindEndpoint.restore()
      restHelperFactory.generateCreateEndpoint.restore()
      restHelperFactory.generateUpdateEndpoint.restore()
      restHelperFactory.generateDeleteOneEndpoint.restore()
      restHelperFactory.generateDeleteManyEndpoint.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'rest-helper-factory.generateRoutes does not call CRUD endpoint generators if not allowed',
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let restHelperFactory = require('../../utilities/rest-helper-factory')(
        Log,
        mongoose,
        server
      )

      t.plan(6)

      let userSchema = new mongoose.Schema()
      userSchema.statics = {
        routeOptions: {
          allowRead: false,
          allowCreate: false,
          allowUpdate: false,
          allowDelete: false
        }
      }
      let userModel = mongoose.model('user', userSchema)

      sinon
        .stub(restHelperFactory, 'generateListEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateFindEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateCreateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateUpdateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteManyEndpoint')
        .callsFake(sinon.spy())
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateRoutes(server, userModel, {})
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        restHelperFactory.generateListEndpoint.called,
        'generateListEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateFindEndpoint.called,
        'generateFindEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateCreateEndpoint.called,
        'generateCreateEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateUpdateEndpoint.called,
        'generateUpdateEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateDeleteOneEndpoint.called,
        'generateDeleteOneEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateDeleteManyEndpoint.called,
        'generateDeleteManyEndpoint not called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      restHelperFactory.generateListEndpoint.restore()
      restHelperFactory.generateFindEndpoint.restore()
      restHelperFactory.generateCreateEndpoint.restore()
      restHelperFactory.generateUpdateEndpoint.restore()
      restHelperFactory.generateDeleteOneEndpoint.restore()
      restHelperFactory.generateDeleteManyEndpoint.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'rest-helper-factory.generateRoutes calls association endpoint generators for MANY_MANY and ONE_MANY associations',
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let restHelperFactory = require('../../utilities/rest-helper-factory')(
        Log,
        mongoose,
        server
      )

      t.plan(20)

      let userSchema = new mongoose.Schema()
      userSchema.statics = {
        routeOptions: {
          associations: {
            title: {
              type: 'MANY_ONE'
            },
            profileImage: {
              type: 'ONE_ONE'
            },
            groups: {
              type: 'MANY_MANY'
            },
            permissions: {
              type: 'ONE_MANY'
            }
          }
        }
      }
      let userModel = mongoose.model('user', userSchema)
      let title = userModel.routeOptions.associations.title
      let profileImage = userModel.routeOptions.associations.profileImage
      let groups = userModel.routeOptions.associations.groups
      let permissions = userModel.routeOptions.associations.permissions

      sinon
        .stub(restHelperFactory, 'generateListEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateFindEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateCreateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateUpdateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteManyEndpoint')
        .callsFake(sinon.spy())

      sinon
        .stub(restHelperFactory, 'generateAssociationAddOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationRemoveOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationAddManyEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationRemoveManyEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationGetAllEndpoint')
        .callsFake(sinon.spy())
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateRoutes(server, userModel, {})
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        restHelperFactory.generateAssociationAddOneEndpoint.calledWith(
          server,
          userModel,
          title,
          {}
        ),
        'generateAssociationAddOneEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationAddOneEndpoint.calledWith(
          server,
          userModel,
          profileImage,
          {}
        ),
        'generateAssociationAddOneEndpoint not called'
      )
      t.ok(
        restHelperFactory.generateAssociationAddOneEndpoint.calledWith(
          server,
          userModel,
          groups,
          {}
        ),
        'generateAssociationAddOneEndpoint called'
      )
      t.ok(
        restHelperFactory.generateAssociationAddOneEndpoint.calledWith(
          server,
          userModel,
          permissions,
          {}
        ),
        'generateAssociationAddOneEndpoint called'
      )
      t.notOk(
        restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(
          server,
          userModel,
          title,
          {}
        ),
        'generateAssociationRemoveOneEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(
          server,
          userModel,
          profileImage,
          {}
        ),
        'generateAssociationRemoveOneEndpoint not called'
      )
      t.ok(
        restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(
          server,
          userModel,
          groups,
          {}
        ),
        'generateAssociationRemoveOneEndpoint called'
      )
      t.ok(
        restHelperFactory.generateAssociationRemoveOneEndpoint.calledWith(
          server,
          userModel,
          permissions,
          {}
        ),
        'generateAssociationRemoveOneEndpoint called'
      )
      t.notOk(
        restHelperFactory.generateAssociationAddManyEndpoint.calledWith(
          server,
          userModel,
          title,
          {}
        ),
        'generateAssociationAddManyEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationAddManyEndpoint.calledWith(
          server,
          userModel,
          profileImage,
          {}
        ),
        'generateAssociationAddManyEndpoint not called'
      )
      t.ok(
        restHelperFactory.generateAssociationAddManyEndpoint.calledWith(
          server,
          userModel,
          groups,
          {}
        ),
        'generateAssociationAddManyEndpoint called'
      )
      t.ok(
        restHelperFactory.generateAssociationAddManyEndpoint.calledWith(
          server,
          userModel,
          permissions,
          {}
        ),
        'generateAssociationAddManyEndpoint called'
      )
      t.notOk(
        restHelperFactory.generateAssociationRemoveManyEndpoint.calledWith(
          server,
          userModel,
          title,
          {}
        ),
        'generateAssociationRemoveManyEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationRemoveManyEndpoint.calledWith(
          server,
          userModel,
          profileImage,
          {}
        ),
        'generateAssociationRemoveManyEndpoint not called'
      )
      t.ok(
        restHelperFactory.generateAssociationRemoveManyEndpoint.calledWith(
          server,
          userModel,
          groups,
          {}
        ),
        'generateAssociationRemoveManyEndpoint called'
      )
      t.ok(
        restHelperFactory.generateAssociationRemoveManyEndpoint.calledWith(
          server,
          userModel,
          permissions,
          {}
        ),
        'generateAssociationRemoveManyEndpoint called'
      )
      t.notOk(
        restHelperFactory.generateAssociationGetAllEndpoint.calledWith(
          server,
          userModel,
          title,
          {}
        ),
        'generateAssociationGetAllEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationGetAllEndpoint.calledWith(
          server,
          userModel,
          profileImage,
          {}
        ),
        'generateAssociationGetAllEndpoint not called'
      )
      t.ok(
        restHelperFactory.generateAssociationGetAllEndpoint.calledWith(
          server,
          userModel,
          groups,
          {}
        ),
        'generateAssociationGetAllEndpoint called'
      )
      t.ok(
        restHelperFactory.generateAssociationGetAllEndpoint.calledWith(
          server,
          userModel,
          permissions,
          {}
        ),
        'generateAssociationGetAllEndpoint called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      restHelperFactory.generateListEndpoint.restore()
      restHelperFactory.generateFindEndpoint.restore()
      restHelperFactory.generateCreateEndpoint.restore()
      restHelperFactory.generateUpdateEndpoint.restore()
      restHelperFactory.generateDeleteOneEndpoint.restore()
      restHelperFactory.generateDeleteManyEndpoint.restore()

      restHelperFactory.generateAssociationAddOneEndpoint.restore()
      restHelperFactory.generateAssociationRemoveOneEndpoint.restore()
      restHelperFactory.generateAssociationAddManyEndpoint.restore()
      restHelperFactory.generateAssociationRemoveManyEndpoint.restore()
      restHelperFactory.generateAssociationGetAllEndpoint.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'rest-helper-factory.generateRoutes does not call association endpoint generators if not allowed',
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let restHelperFactory = require('../../utilities/rest-helper-factory')(
        Log,
        mongoose,
        server
      )

      t.plan(5)

      let userSchema = new mongoose.Schema()
      userSchema.statics = {
        routeOptions: {
          associations: {
            groups: {
              type: 'MANY_MANY',
              allowAdd: false,
              allowRemove: false,
              allowRead: false
            }
          }
        }
      }
      let userModel = mongoose.model('user', userSchema)

      sinon
        .stub(restHelperFactory, 'generateListEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateFindEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateCreateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateUpdateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteManyEndpoint')
        .callsFake(sinon.spy())

      sinon
        .stub(restHelperFactory, 'generateAssociationAddOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationRemoveOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationAddManyEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationRemoveManyEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateAssociationGetAllEndpoint')
        .callsFake(sinon.spy())
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateRoutes(server, userModel, {})
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        restHelperFactory.generateAssociationAddOneEndpoint.called,
        'generateAssociationAddOneEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationRemoveOneEndpoint.called,
        'generateAssociationRemoveOneEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationAddManyEndpoint.called,
        'generateAssociationAddManyEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationAddManyEndpoint.called,
        'generateAssociationRemoveManyEndpoint not called'
      )
      t.notOk(
        restHelperFactory.generateAssociationGetAllEndpoint.called,
        'generateAssociationGetAllEndpoint not called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      restHelperFactory.generateListEndpoint.restore()
      restHelperFactory.generateFindEndpoint.restore()
      restHelperFactory.generateCreateEndpoint.restore()
      restHelperFactory.generateUpdateEndpoint.restore()
      restHelperFactory.generateDeleteOneEndpoint.restore()
      restHelperFactory.generateDeleteManyEndpoint.restore()

      restHelperFactory.generateAssociationAddOneEndpoint.restore()
      restHelperFactory.generateAssociationRemoveOneEndpoint.restore()
      restHelperFactory.generateAssociationAddManyEndpoint.restore()
      restHelperFactory.generateAssociationRemoveManyEndpoint.restore()
      restHelperFactory.generateAssociationGetAllEndpoint.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'rest-helper-factory.generateRoutes creates extra endpoints if they exist.',
    function(t) {
      // <editor-fold desc="Arrange">
      let server = sinon.spy()
      let restHelperFactory = require('../../utilities/rest-helper-factory')(
        Log,
        mongoose,
        server
      )

      t.plan(2)

      let userSchema = new mongoose.Schema()
      userSchema.statics = {
        routeOptions: {
          extraEndpoints: [sinon.spy(), sinon.spy()]
        }
      }
      let userModel = mongoose.model('user', userSchema)
      let extraEndpoints = userModel.routeOptions.extraEndpoints

      sinon
        .stub(restHelperFactory, 'generateListEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateFindEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateCreateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateUpdateEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteOneEndpoint')
        .callsFake(sinon.spy())
      sinon
        .stub(restHelperFactory, 'generateDeleteManyEndpoint')
        .callsFake(sinon.spy())
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateRoutes(server, userModel, {})
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(extraEndpoints[0].called, 'extraEndpoint[0] called')
      t.ok(extraEndpoints[1].called, 'extraEndpoint[1] called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      restHelperFactory.generateListEndpoint.restore()
      restHelperFactory.generateFindEndpoint.restore()
      restHelperFactory.generateCreateEndpoint.restore()
      restHelperFactory.generateUpdateEndpoint.restore()
      restHelperFactory.generateDeleteOneEndpoint.restore()
      restHelperFactory.generateDeleteManyEndpoint.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.end()
})

test('rest-helper-factory.generateListEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateListEndpoint,
    'restHelperFactory.generateListEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls handlerHelper.generateListHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateListHandler.called,
        'generateListHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls joiMongooseHelper.generateJoiReadModel and generateJoiListQueryModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiListQueryModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiReadModel.called,
        'generateJoiReadModel called'
      )
      t.ok(
        joiMongooseHelperStub.generateJoiListQueryModel.called,
        'generateJoiListQueryModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route with "GET" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'GET', 'GET method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route with correct resourceAliasForRoute',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateListEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1', 'correct route')
      t.equal(serverObject2.path, '/PEEPS', 'correct route alias')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateListHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route with correct collectionName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {},
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateListEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        'Get a list of user1s',
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        'Get a list of Users',
        'correct description'
      )
      t.deepEqual(serverObject1.config.tags, ['api', 'user1'], 'correct tags')
      t.deepEqual(serverObject2.config.tags, ['api', 'User'], 'correct tags')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route using correct queryModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">//<editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let queryModel = Joi.any().valid('TEST')
      joiMongooseHelperStub.generateJoiListQueryModel = this.spy(function() {
        return queryModel
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      t.deepEqual(
        serverObject.config.validate.query,
        queryModel,
        'correct queryModel'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({
        test: {
          type: Types.String
        }
      })
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({
        test: {
          type: Types.String
        }
      })
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateListEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let readModel = Joi.any().valid(['test'])
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return readModel
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({
        test: {
          type: Types.String
        }
      })
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let collectionName = 'userModelName'

      userModel.modelName = collectionName

      let responseSchema = Joi.alternatives()
        .try(
          Joi.object({
            docs: Joi.array()
              .items(readModel)
              .label(collectionName + 'ArrayModel'),
            pages: Joi.any(),
            items: Joi.any()
          }),
          Joi.number()
        )
        .label(collectionName + 'ListModel')
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateListEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response.schema,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateFindEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateFindEndpoint,
    'restHelperFactory.generateFindEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls handlerHelper.generateFindHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateFindHandler.called,
        'generateFindHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls queryHelper.getReadableFields',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(queryHelperStub.getReadableFields.called, 'getReadableFields called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls joiMongooseHelper.generateJoiReadModel and generateJoiFindQueryModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiFindQueryModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiReadModel.called,
        'generateJoiReadModel called'
      )
      t.ok(
        joiMongooseHelperStub.generateJoiFindQueryModel.called,
        'generateJoiFindQueryModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route with "GET" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'GET', 'GET method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route with correct resourceAliasForRoute',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateFindEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1/{_id}', 'correct route')
      t.equal(serverObject2.path, '/PEEPS/{_id}', 'correct route alias')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateFindHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route with correct collectionName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {},
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateFindEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        'Get a specific user1',
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        'Get a specific User',
        'correct description'
      )
      t.deepEqual(serverObject1.config.tags, ['api', 'user1'], 'correct tags')
      t.deepEqual(serverObject2.config.tags, ['api', 'User'], 'correct tags')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route using correct queryModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">//<editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let queryModel = Joi.any().valid('TEST')
      joiMongooseHelperStub.generateJoiFindQueryModel = this.spy(function() {
        return queryModel
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      t.deepEqual(
        serverObject.config.validate.query,
        queryModel,
        'correct queryModel'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route using correct params validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let joiStub = require('joi')
      let joiObjectIdStub = function() {
        return function() {
          return {
            required: function() {
              return 'TEST'
            }
          }
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let params = {
        _id: 'TEST'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.params,
        params,
        'params validated'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateFindEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let readModel = Joi.any().valid(['test'])
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return readModel
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let responseSchema = readModel
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateFindEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response.schema,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateCreateEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateCreateEndpoint,
    'restHelperFactory.generateCreateEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls handlerHelper.generateCreateHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateCreateHandler.called,
        'generateCreateHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls joiMongooseHelper.generateJoiReadModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiReadModel.called,
        'generateJoiReadModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls joiMongooseHelper.generateJoiCreateModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiReadModel = this.spy(function() {
        return Joi.any().label('TES')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiCreateModel.called,
        'generateJoiCreateModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route with "POST" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'POST', 'POST method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route with correct resourceAliasForRoute',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = function() {
        return Joi.any()
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateCreateEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1', 'correct route')
      t.equal(serverObject2.path, '/PEEPS', 'correct route alias')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateCreateHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route with correct collectionName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {},
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateCreateEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        'Create one or more new user1s',
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        'Create one or more new Users',
        'correct description'
      )
      t.deepEqual(serverObject1.config.tags, ['api', 'user1'], 'correct tags')
      t.deepEqual(serverObject2.config.tags, ['api', 'User'], 'correct tags')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route using correct payload validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = function() {
        return Joi.any().valid('TEST')
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.payload,
        Joi.alternatives().try(
          Joi.array().items(Joi.any().valid('TEST')),
          Joi.any().valid('TEST')
        ),
        'correct payload validation'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any().label('TEST')
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateCreateEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({ route: function() {} })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let readModel = Joi.any()
        .valid(['test'])
        .label('TEST')
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return readModel
      })
      joiMongooseHelperStub.generateJoiCreateModel = this.spy(function() {
        return Joi.any().label('TEST')
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let label = readModel._flags.label

      let responseSchema = Joi.alternatives()
        .try(Joi.array().items(readModel), readModel)
        .label(label)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateCreateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response.schema,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateDeleteOneEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateDeleteOneEndpoint,
    'restHelperFactory.generateDeleteOneEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls handlerHelper.generateDeleteOneHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateDeleteHandler.called,
        'generateDeleteHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route with "DELETE" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'DELETE', 'DELETE method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route with correct resourceAliasForRoute',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateDeleteOneEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1/{_id}', 'correct route')
      t.equal(serverObject2.path, '/PEEPS/{_id}', 'correct route alias')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateDeleteHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route with correct collectionName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {},
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateDeleteOneEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        'Delete a user1',
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        'Delete a User',
        'correct description'
      )
      t.deepEqual(serverObject1.config.tags, ['api', 'user1'], 'correct tags')
      t.deepEqual(serverObject2.config.tags, ['api', 'User'], 'correct tags')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route using correct params validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let joiStub = require('joi')

      let joiObjectIdStub = function() {
        return function() {
          return {
            required: function() {
              return 'TEST'
            }
          }
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let params = {
        _id: 'TEST'
      }

      // let params =  {
      //   _id: Joi.objectId().required()
      // };
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.params,
        params,
        'params validated'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateDeleteOneEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateDeleteOneEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateUpdateEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateUpdateEndpoint,
    'restHelperFactory.generateUpdateEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls handlerHelper.generateUpdateHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateUpdateHandler.called,
        'generateUpdateHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls joiMongooseHelper.generateJoiReadModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiReadModel.called,
        'generateJoiReadModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls joiMongooseHelper.generateJoiUpdateModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiUpdateModel.called,
        'generateJoiUpdateModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route with "PUT" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'PUT', 'PUT method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route with correct resourceAliasForRoute',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = function() {
        return Joi.any()
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateUpdateEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1/{_id}', 'correct route')
      t.equal(serverObject2.path, '/PEEPS/{_id}', 'correct route alias')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateUpdateHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route with correct collectionName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {},
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel1, {}, Log)
      restHelperFactory.generateUpdateEndpoint(server, userModel2, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        'Update a user1',
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        'Update a User',
        'correct description'
      )
      t.deepEqual(serverObject1.config.tags, ['api', 'user1'], 'correct tags')
      t.deepEqual(serverObject2.config.tags, ['api', 'User'], 'correct tags')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route using correct payload validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = function() {
        return Joi.any().valid('TEST')
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.payload,
        Joi.any().valid('TEST'),
        'correct payload validation'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route using correct params validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let joiStub = require('joi')

      let joiObjectIdStub = function() {
        return function() {
          return {
            required: function() {
              return 'TEST'
            }
          }
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let params = {
        _id: 'TEST'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.params,
        params,
        'params validated'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateUpdateEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let readModel = Joi.any().valid(['test'])
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return readModel
      })
      joiMongooseHelperStub.generateJoiUpdateModel = this.spy(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)

      let responseSchema = readModel
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateUpdateEndpoint(server, userModel, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response.schema,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateAssociationAddOneEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateAssociationAddOneEndpoint,
    'restHelperFactory.generateAssociationAddOneEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint asserts routeOptions.associations exist',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {}
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationAddOneEndpoint(
          server,
          userModel,
          {},
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('associations') > -1,
          "assertion message contains 'associations' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint asserts association input exists',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationAddOneEndpoint(
          server,
          userModel,
          null,
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('association input') > -1,
          "assertion message contains 'association input' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls handlerHelper.generateAssociationAddOneHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateAssociationAddOneHandler.called,
        'generateAssociationAddOneHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with "PUT" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'PUT', 'PUT method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct ownerAlias and childAlias',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = function() {
        return Joi.any()
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {},
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let association1 = {
        include: { model: { modelName: 'TEST1', schema: { methods: {} } } }
      }
      let association2 = {
        include: { model: { schema: { methods: {} } } },
        alias: 'TEST2'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.path,
        '/user1/{ownerId}/TEST1/{childId}',
        'correct route'
      )
      t.equal(
        serverObject2.path,
        '/PEEPS/{ownerId}/TEST2/{childId}',
        'correct route alias'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateAssociationAddOneHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct associationName and ownerModelName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {}
        },
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let childSchema1 = new mongoose.Schema({})
      childSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let childSchema2 = new mongoose.Schema({})
      childSchema2.statics = {
        routeOptions: {
          associations: {}
        },
        collectionDisplayName: 'Child'
      }

      let childModel1 = mongoose.model('child1', childSchema1)
      let childModel2 = mongoose.model('child2', childSchema2)

      let association1 = { include: { model: childModel1 } }
      let association2 = { include: { model: childModel2, as: 'Children' } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        "Add a single child1 to a user1's list of child1",
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        "Add a single Child to a User's list of Children",
        'correct description'
      )
      t.deepEqual(
        serverObject1.config.tags,
        ['api', 'child1', 'user1'],
        'correct tags'
      )
      t.deepEqual(
        serverObject2.config.tags,
        ['api', 'Children', 'User'],
        'correct tags'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      delete mongoose.models.child1
      delete mongoose.modelSchemas.child1
      delete mongoose.models.child2
      delete mongoose.modelSchemas.child2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using correct payload validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiCreateModel = function() {
        return Joi.object({ test: 'test' })
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let association1 = {
        include: { model: { modelName: 'TEST1', schema: { methods: {} } } }
      }
      let association2 = {
        include: { model: { schema: { methods: {} } }, through: {} },
        alias: 'TEST2'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject1.config.validate.payload,
        null,
        'correct payload validation'
      )
      t.deepEqual(
        serverObject2.config.validate.payload,
        Joi.object({ test: 'test' }),
        'correct payload validation'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using correct params validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let joiStub = require('joi')
      let joiObjectIdStub = function() {
        return function() {
          return {
            required: function() {
              return 'TEST'
            }
          }
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let params = {
        ownerId: 'TEST',
        childId: 'TEST'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.params,
        params,
        'params validated'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddOneEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiCreateModel'
      ).callsFake(function() {
        return {}
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let responseSchema = {}
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateAssociationRemoveOneEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateAssociationRemoveOneEndpoint,
    'restHelperFactory.generateAssociationRemoveOneEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint asserts routeOptions.associations exist',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {}
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationRemoveOneEndpoint(
          server,
          userModel,
          {},
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('associations') > -1,
          "assertion message contains 'associations' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint asserts association input exists',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationRemoveOneEndpoint(
          server,
          userModel,
          null,
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('association input') > -1,
          "assertion message contains 'association input' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls handlerHelper.generateAssociationRemoveOneHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateAssociationRemoveOneHandler.called,
        'generateAssociationRemoveOneHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route with "DELETE" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'DELETE', 'DELETE method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route with correct ownerAlias and childAlias',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = function() {
        return Joi.any()
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {},
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let association1 = {
        include: { model: { modelName: 'TEST1', schema: { methods: {} } } }
      }
      let association2 = {
        include: { model: { schema: { methods: {} } } },
        alias: 'TEST2'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.path,
        '/user1/{ownerId}/TEST1/{childId}',
        'correct route'
      )
      t.equal(
        serverObject2.path,
        '/PEEPS/{ownerId}/TEST2/{childId}',
        'correct route alias'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateAssociationRemoveOneHandler = this.spy(
        function() {
          return 'HANDLER'
        }
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route with correct associationName and ownerModelName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {}
        },
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let childSchema1 = new mongoose.Schema({})
      childSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let childSchema2 = new mongoose.Schema({})
      childSchema2.statics = {
        routeOptions: {
          associations: {}
        },
        collectionDisplayName: 'Child'
      }

      let childModel1 = mongoose.model('child1', childSchema1)
      let childModel2 = mongoose.model('child2', childSchema2)

      let association1 = { include: { model: childModel1 } }
      let association2 = { include: { model: childModel2, as: 'Children' } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        "Remove a single child1 from a user1's list of child1",
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        "Remove a single Child from a User's list of Children",
        'correct description'
      )
      t.deepEqual(
        serverObject1.config.tags,
        ['api', 'child1', 'user1'],
        'correct tags'
      )
      t.deepEqual(
        serverObject2.config.tags,
        ['api', 'Children', 'User'],
        'correct tags'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      delete mongoose.models.child1
      delete mongoose.modelSchemas.child1
      delete mongoose.models.child2
      delete mongoose.modelSchemas.child2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route using correct params validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let joiStub = require('joi')
      let joiObjectIdStub = function() {
        return function() {
          return {
            required: function() {
              return 'TEST'
            }
          }
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let params = {
        ownerId: 'TEST',
        childId: 'TEST'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.params,
        params,
        'params validated'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'token auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationRemoveOneEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return {}
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let responseSchema = {}
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationRemoveOneEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateAssociationAddManyEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateAssociationAddManyEndpoint,
    'restHelperFactory.generateAssociationAddManyEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint asserts routeOptions.associations exist',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {}
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationAddManyEndpoint(
          server,
          userModel,
          {},
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('associations') > -1,
          "assertion message contains 'associations' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint asserts association input exists',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationAddManyEndpoint(
          server,
          userModel,
          null,
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('association input') > -1,
          "assertion message contains 'association input' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls handlerHelper.generateAssociationAddManyHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateAssociationAddManyHandler.called,
        'generateAssociationAddManyHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route with "POST" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'POST', 'POST method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route with correct ownerAlias and childAlias',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = function() {
        return Joi.any()
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {},
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let association1 = { include: { model: { modelName: 'TEST1' } } }
      let association2 = { include: { model: {} }, alias: 'TEST2' }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1/{ownerId}/TEST1', 'correct route')
      t.equal(
        serverObject2.path,
        '/PEEPS/{ownerId}/TEST2',
        'correct route alias'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateAssociationAddManyHandler = this.spy(
        function() {
          return 'HANDLER'
        }
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route with correct associationName and ownerModelName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {}
        },
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let association1 = { include: { model: { modelName: 'TEST1' } } }
      let association2 = {
        include: { model: { modelName: 'test2' }, as: 'TEST2' }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        "Add multiple TEST1s to a user1's list of TEST1",
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        "Add multiple test2s to a User's list of TEST2",
        'correct description'
      )
      t.deepEqual(
        serverObject1.config.tags,
        ['api', 'TEST1', 'user1'],
        'correct tags'
      )
      t.deepEqual(
        serverObject2.config.tags,
        ['api', 'TEST2', 'User'],
        'correct tags'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route using correct payload validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiCreateModel = function() {
        return Joi.object({ test: 'test' }).unknown()
      }
      let joiStub = require('joi')

      let joiObjectIdStub = function() {
        return function() {
          return Joi.any().valid('objectId')
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let association1 = {
        include: { model: { modelName: 'TEST1', schema: { methods: {} } } }
      }
      let association2 = {
        include: {
          model: { modelName: 'TEST2', schema: { methods: {} } },
          through: {}
        },
        alias: 'TEST2'
      }

      let payloadValidation1 = Joi.array()
        .items(
          Joi.object({ test: 'test' })
            .unknown()
            .keys({
              childId: Joi.any()
                .valid('objectId')
                .description('the ' + 'TEST2' + "'s _id")
            })
            .label('undefined_many')
        )
        .required()

      payloadValidation1 = Joi.alternatives()
        .try(payloadValidation1, Joi.array().items(Joi.any().valid('objectId')))
        .label('undefined_many')
        .required()
      let payloadValidation2 = Joi.array()
        .items(Joi.any().valid('objectId'))
        .required()
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject1.config.validate.payload,
        payloadValidation2,
        'correct payload validation'
      )
      t.deepEqual(
        serverObject2.config.validate.payload.toString(),
        payloadValidation1.toString(),
        'correct payload validation'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route using correct params validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let joiStub = require('joi')

      let joiObjectIdStub = function() {
        return function() {
          return Joi.any().valid('objectId')
        }
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub,
          'joi-objectid': joiObjectIdStub
        }
      )(Log, mongoose, server)

      t.plan(3)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let params = {
        ownerId: Joi.any()
          .valid('objectId')
          .required()
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      let validParam = serverObject.config.validate.params.ownerId
      t.ok(
        Joi.validate('objectId', validParam).error === null,
        'params accept valid input'
      )
      t.ok(
        Joi.validate('object', validParam).error !== null,
        'params reject invalid input'
      )
      t.ok(Joi.validate('', validParam).error !== null, 'params require input')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'headerValidation correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationAddManyEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return {}
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = {
        include: {
          model: { schema: { methods: {} }, modelName: 'testAssociation' }
        }
      }

      let responseSchema = {}
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationAddManyEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEquals(
        serverObject.config.response,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.end()
})

test('rest-helper-factory.generateAssociationGetAllEndpoint', function(t) {
  let server = sinon.spy()
  let restHelperFactory = require('../../utilities/rest-helper-factory')(
    Log,
    mongoose,
    server
  )
  testHelper.testModelParameter(
    t,
    restHelperFactory.generateAssociationGetAllEndpoint,
    'restHelperFactory.generateAssociationGetAllEndpoint',
    ['server', 'model', 'options', 'Log'],
    Log
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint asserts routeOptions.associations exist',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {}
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationGetAllEndpoint(
          server,
          userModel,
          {},
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('associations') > -1,
          "assertion message contains 'associations' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint asserts association input exists',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let association = { include: {} }
      // </editor-fold>

      try {
        // <editor-fold desc="Act">
        restHelperFactory.generateAssociationGetAllEndpoint(
          server,
          userModel,
          null,
          {},
          Log
        )
        t.fail('No error was thrown.')
        // </editor-fold>
      } catch (error) {
        // <editor-fold desc="Assert">
        t.ok(/^AssertionError/.test(error.name), 'error is an AssertionError')
        t.ok(
          error.message.indexOf('association input') > -1,
          "assertion message contains 'association input' text."
        )
        // </editor-fold>
      }

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls handlerHelper.generateAssociationGetAllHandler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        handlerHelperStub.generateAssociationGetAllHandler.called,
        'generateAssociationGetAllHandler called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls queryHelper.getQueryableFields, getReadableFields, and getSortableFields',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(3)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryHelperStub.getQueryableFields.called,
        'getQueryableFields called'
      )
      t.ok(queryHelperStub.getReadableFields.called, 'getReadableFields called')
      t.ok(queryHelperStub.getSortableFields.called, 'getSortableFields called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls joiMongooseHelper.generateJoiReadModel',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        joiMongooseHelperStub.generateJoiReadModel.called,
        'generateJoiReadModel called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(server.route.called, 'server.route called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route with "GET" method',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.method, 'GET', 'GET method used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route with correct ownerAlias and childAlias',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      joiMongooseHelperStub.generateJoiUpdateModel = function() {
        return Joi.any()
      }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(2)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {},
          alias: 'PEEPS'
        }
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let childModel1 = mongoose.model('child1', userSchema1)
      let childModel2 = mongoose.model('child2', userSchema2)

      let association1 = { include: { model: childModel1 } }
      let association2 = { include: { model: childModel2 }, alias: 'TEST2' }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject1.path, '/user1/{ownerId}/child1', 'correct route')
      t.equal(
        serverObject2.path,
        '/PEEPS/{ownerId}/TEST2',
        'correct route alias'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.child1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      delete mongoose.models.child2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route with correct handler',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      handlerHelperStub.generateAssociationGetAllHandler = this.spy(function() {
        return 'HANDLER'
      })
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(serverObject.config.handler, 'HANDLER', 'correct handler used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route using authentication defined by config',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.auth,
        { strategy: config.authStrategy },
        'config auth used'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route with correct associationName and ownerModelName',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(4)

      let userSchema1 = new mongoose.Schema({})
      userSchema1.statics = { routeOptions: {} }
      userSchema1.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userSchema2 = new mongoose.Schema({})
      userSchema2.statics = {
        routeOptions: {
          associations: {}
        },
        collectionDisplayName: 'User'
      }

      let userModel1 = mongoose.model('user1', userSchema1)
      let userModel2 = mongoose.model('user2', userSchema2)

      let childModel1 = mongoose.model('child1', userSchema1)
      let childModel2 = mongoose.model('child2', userSchema2)

      let association1 = { include: { model: childModel1 } }
      let association2 = { include: { model: childModel2, as: 'TEST2' } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel1,
        association1,
        {},
        Log
      )
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel2,
        association2,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject1 = server.route.args[0][0]
      let serverObject2 = server.route.args[1][0]
      // Log.debug(JSON.stringify(serverObject));
      t.equal(
        serverObject1.config.description,
        'Get all of the child1 for a user1',
        'correct description'
      )
      t.equal(
        serverObject2.config.description,
        'Get all of the TEST2 for a User',
        'correct description'
      )
      t.deepEqual(
        serverObject1.config.tags,
        ['api', 'child1', 'user1'],
        'correct tags'
      )
      t.deepEqual(
        serverObject2.config.tags,
        ['api', 'TEST2', 'User'],
        'correct tags'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user1
      delete mongoose.modelSchemas.user1
      delete mongoose.models.child1
      delete mongoose.models.user2
      delete mongoose.modelSchemas.user2
      delete mongoose.models.child2
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route using cors',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      let cors = {
        additionalHeaders: [],
        additionalExposedHeaders: []
      }
      t.deepEqual(serverObject.config.cors, cors, 'cors used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route using correct queryValidation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['test']
      })
      let readableFields = ['readable']
      let sortableFields = ['sortable']
      queryHelperStub.getReadableFields = this.spy(function() {
        return readableFields
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return sortableFields
      })
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let queryModel = Joi.any().valid('TEST')
      joiMongooseHelperStub.generateJoiListQueryModel = this.spy(function() {
        return queryModel
      })
      let joiStub = require('joi')
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          joi: joiStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({
        test: {
          type: Types.String
        }
      })
      userSchema.statics = { routeOptions: { associations: {} } }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }

      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      t.deepEqual(
        serverObject.config.validate.query,
        queryModel,
        'correct queryModel'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route using correct header validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let config = { authStrategy: 'TEST_AUTH' }
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub,
          '../config': config
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }

      let headerValidation = Joi.object({
        authorization: Joi.string().required()
      }).options({ allowUnknown: true })
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.deepEqual(
        serverObject.config.validate.headers,
        headerValidation,
        'headerValidation correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route using hapi-swagger plugin',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return Joi.any()
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)

      let childModel = mongoose.model('child', userSchema)
      let association = { include: { model: childModel } }
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      // Log.debug(JSON.stringify(serverObject));
      t.ok(serverObject.config.plugins['hapi-swagger'], 'hapi-swagger used')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.test(
    'rest-helper-factory.generateAssociationGetAllEndpoint calls server.route with correct response schema validation',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      let server = this.stub({
        route: function() {}
      })

      let handlerHelperStub = this.stub(
        require('../../utilities/handler-helper-factory')(this.spy(), server)
      )
      let handlerHelperStubWrapper = this.stub()
      handlerHelperStubWrapper.returns(handlerHelperStub)
      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let readModel = Joi.any().valid(['test'])
      let joiMongooseHelperStub = this.stub(
        require('../../utilities/joi-mongoose-helper'),
        'generateJoiReadModel'
      ).callsFake(function() {
        return readModel
      })
      let restHelperFactory = proxyquire(
        '../../utilities/rest-helper-factory',
        {
          './handler-helper-factory': handlerHelperStubWrapper,
          './query-helper': queryHelperStub,
          './joi-mongoose-helper': joiMongooseHelperStub
        }
      )(Log, mongoose, server)

      t.plan(1)

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }
      userSchema.statics = {
        routeOptions: {
          associations: {}
        }
      }

      let userModel = mongoose.model('user', userSchema)
      let ownerModelName = 'userModelName'
      userModel.modelName = ownerModelName

      let childModel = mongoose.model('child', userSchema)
      let associationName = 'childModelName'
      childModel.modelName = associationName

      let association = { include: { model: childModel } }

      let responseSchema = Joi.alternatives()
        .try(
          Joi.object({
            docs: Joi.array()
              .items(
                readModel.label(
                  ownerModelName + '_' + associationName + 'ReadModel'
                )
              )
              .label(ownerModelName + '_' + associationName + 'ArrayModel'),
            pages: Joi.any(),
            items: Joi.any()
          }),
          Joi.number()
        )
        .label(ownerModelName + '_' + associationName + 'ListModel')
      // </editor-fold>

      // <editor-fold desc="Act">
      restHelperFactory.generateAssociationGetAllEndpoint(
        server,
        userModel,
        association,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      let serverObject = server.route.args[0][0]
      t.deepEquals(
        serverObject.config.response.schema,
        responseSchema,
        'response schema correct'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      delete mongoose.models.child
      delete mongoose.modelSchemas.child
      // </editor-fold>
    })
  )

  t.end()
})

// test('remove config', function(t) {
//   fs.unlinkSync(__dirname + '/../config.js');
//   t.end();
// });
