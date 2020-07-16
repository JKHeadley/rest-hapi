'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

const test = require('tape')
const _ = require('lodash')
const sinon = require('sinon')
const sinonTestFactory = require('sinon-test')
const sinonTest = sinonTestFactory(sinon)
const rewire = require('rewire')
const proxyquire = require('proxyquire')
const assert = require('assert')
const Mongoose = require('mongoose')
const Types = Mongoose.Schema.Types
const logging = require('loggin')
let Log = logging.getLogger('tests')
Log.logLevel = 'DEBUG'
Log = Log.bind('joi-mongoose-helper')
const testHelper = require('../../utilities/test-helper')
const Joi = require('@hapi/joi')

sinon.test = sinonTest

test('joi-mongoose-helper exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  const joiMongooseHelper = require('../../utilities/joi-mongoose-helper')

  t.plan(8)
  // </editor-fold>

  // <editor-fold desc="Assert">
  t.ok(joiMongooseHelper, 'joi-mongoose-helper exists.')
  t.ok(
    joiMongooseHelper.generateJoiReadModel,
    'joi-mongoose-helper.generateJoiReadModel exists.'
  )
  t.ok(
    joiMongooseHelper.generateJoiUpdateModel,
    'joi-mongoose-helper.generateJoiUpdateModel exists.'
  )
  t.ok(
    joiMongooseHelper.generateJoiCreateModel,
    'joi-mongoose-helper.generateJoiCreateModel exists.'
  )
  t.ok(
    joiMongooseHelper.generateJoiListQueryModel,
    'joi-mongoose-helper.generateJoiListQueryModel exists.'
  )
  t.ok(
    joiMongooseHelper.generateJoiFindQueryModel,
    'joi-mongoose-helper.generateJoiFindQueryModel exists.'
  )
  t.ok(
    joiMongooseHelper.generateJoiFieldModel,
    'joi-mongoose-helper.generateJoiFieldModel exists.'
  )
  t.ok(
    joiMongooseHelper.generateJoiModelFromFieldType,
    'joi-mongoose-helper.generateJoiModelFromFieldType exists.'
  )
  // </editor-fold>
})

test('joi-mongoose-helper.generateJoiReadModel', function(t) {
  const joiMongooseHelper = require('../../utilities/joi-mongoose-helper')
  testHelper.testModelParameter(
    t,
    joiMongooseHelper.generateJoiReadModel,
    'joiMongooseHelper.generateJoiReadModel',
    ['model', 'Log'],
    Log
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel calls generateJoiFieldModel for regular readable fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const emailField = userModel.schema.tree.email
      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      // NOTE: should use "calledWith(emailField)" instead, but not working for some reason
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          emailField,
          'email',
          'read',
          Log
        ),
        'generateJoiFieldModel called on email field'
      )
      t.ok(
        readModel.validate({ email: 'test' }).error === undefined,
        'email field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel uses readModel if it exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String,
          readModel: Joi.string().valid('test')
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const emailField = userModel.schema.tree.email
      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          emailField,
          'email',
          'read',
          Log
        ),
        'generateJoiFieldModel not called on email field'
      )
      t.ok(
        readModel.validate({ email: 'wrong' }).error !== undefined,
        'wrong field value not valid'
      )
      t.ok(
        readModel.validate({ email: 'test' }).error === undefined,
        'correct field value valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel ignores fields where exclude is true or allowOnRead is false.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        firstName: {
          type: Types.String,
          allowOnRead: false
        },
        lastName: {
          type: Types.String,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const firstNameField = userModel.schema.tree.firstName
      const lastNameField = userModel.schema.tree.lastName
      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          firstNameField,
          'firstName',
          'read',
          Log
        ),
        'generateJoiFieldModel not called on firstName field'
      )
      t.notOk(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          lastNameField,
          'lastName',
          'read',
          Log
        ),
        'generateJoiFieldModel not called on lastName field'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel ignores fields that are invalid.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )
      joiMongooseHelper.__set__(
        'internals.isValidField',
        sinon.spy(function() {
          return false
        })
      )

      const userSchema = new Mongoose.Schema({
        firstName: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const firstNameField = userModel.schema.tree.firstName
      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          firstNameField,
          'firstName',
          'read',
          Log
        ),
        'generateJoiFieldModel not called on firstName field'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel returns Joi object that rejects excluded fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(4)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String
        },
        firstName: {
          type: Types.String,
          allowOnRead: false
        },
        lastName: {
          type: Types.String,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        readModel.validate({ email: 'test' }).error === undefined,
        'email field valid'
      )
      t.ok(
        readModel.validate({ firstName: 'test' }).error !== undefined,
        'firstName field not valid'
      )
      t.ok(
        readModel.validate({ lastName: 'test' }).error !== undefined,
        'lastName field not valid'
      )
      t.ok(
        readModel.validate({ notAField: 'test' }).error !== undefined,
        'fields not listed not valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel returns Joi object that requires fields with "requireOnRead" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String,
          requireOnRead: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(readModel.validate({}).error !== undefined, 'email field required')
      t.ok(
        readModel.validate({ email: 'test' }).error === undefined,
        'email field valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel includes associations.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(19)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const generateJoiReadModel = sinon.spy(function() {
        return Joi.object()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )
      joiMongooseHelper.__set__(
        'internals.generateJoiReadModel',
        generateJoiReadModel
      )

      const userSchema = new Mongoose.Schema({})

      userSchema.statics = {
        routeOptions: {
          associations: {
            title: {
              type: 'MANY_ONE',
              model: 'title'
            },
            profileImage: {
              type: 'ONE_ONE',
              model: 'profileImage'
            },
            groups: {
              type: 'ONE_MANY',
              model: 'group',
              foreignField: 'user'
            },
            friends: {
              type: 'MANY_MANY',
              model: 'user'
            },
            hashTags: {
              type: '_MANY',
              model: 'hashTag'
            },
            permissions: {
              type: 'MANY_MANY',
              model: 'permission',
              linkingModel: 'link',
              include: { through: {} }
            }
          }
        }
      }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiFieldModel.callCount === 1,
        'generateJoiFieldModel not called on association fields'
      )
      t.ok(
        readModel.validate({ title: {} }).error === undefined,
        'title field valid'
      )
      t.ok(
        readModel.validate({ title: null }).error !== undefined,
        'null title field not valid'
      )
      t.ok(
        readModel.validate({ title: '' }).error !== undefined,
        'non-object title field not valid'
      )
      t.ok(
        readModel.validate({ profileImage: {} }).error === undefined,
        'profileImage field valid'
      )
      t.ok(
        readModel.validate({ profileImage: null }).error !== undefined,
        'null profileImage note field valid'
      )
      t.ok(
        readModel.validate({ profileImage: '' }).error !== undefined,
        'non-object profileImage field not valid'
      )
      t.ok(
        readModel.validate({ groups: [{}, {}] }).error === undefined,
        'groups field valid'
      )
      t.ok(
        readModel.validate({ groups: null }).error !== undefined,
        'null groups field not valid'
      )
      t.ok(
        readModel.validate({ groups: ['', 3, {}] }).error !== undefined,
        'groups field must be array of objects'
      )
      t.ok(
        readModel.validate({ friends: [{}, {}] }).error === undefined,
        'friends field valid'
      )
      t.ok(
        readModel.validate({ friends: null }).error !== undefined,
        'null friends field not valid'
      )
      t.ok(
        readModel.validate({ friends: ['', 3, {}] }).error !== undefined,
        'friends field must be array of objects'
      )
      t.ok(
        readModel.validate({ hashTags: [{}, {}] }).error === undefined,
        'hashTags field valid'
      )
      t.ok(
        readModel.validate({ hashTags: null }).error !== undefined,
        'null hashTags field not valid'
      )
      t.ok(
        readModel.validate({ hashTags: ['', 3, {}] }).error !== undefined,
        'hashTags field must be array of objects'
      )
      t.ok(
        readModel.validate({ permissions: [{}, {}] }).error === undefined,
        'permissions field valid'
      )
      t.ok(
        readModel.validate({ permissions: null }).error !== undefined,
        'null permissions field not valid'
      )
      t.ok(
        readModel.validate({ permissions: ['', 3, {}] }).error !== undefined,
        'permissions field must be array of objects'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel returns Joi object with appropriate className.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({})

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(readModel._flags.label === 'userReadModel', 'className correct')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiUpdateModel', function(t) {
  const joiMongooseHelper = require('../../utilities/joi-mongoose-helper')
  testHelper.testModelParameter(
    t,
    joiMongooseHelper.generateJoiUpdateModel,
    'joiMongooseHelper.generateJoiUpdateModel',
    ['model', 'Log'],
    Log
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel calls generateJoiFieldModel for regular fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const emailField = userModel.schema.tree.email
      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          emailField,
          'email',
          'update',
          Log
        ),
        'generateJoiFieldModel called on email field'
      )
      t.ok(
        updateModel.validate({ email: 'test' }).error === undefined,
        'email field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel uses updateModel if it exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String,
          updateModel: Joi.string().valid('test')
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const emailField = userModel.schema.tree.email
      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          emailField,
          'email',
          'update',
          Log
        ),
        'generateJoiFieldModel called on email field'
      )
      t.ok(
        updateModel.validate({ email: 'wrong' }).error !== undefined,
        'wrong field value not valid'
      )
      t.ok(
        updateModel.validate({ email: 'test' }).error === undefined,
        'correct field value valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel ignores fields where allowOnUpdate is false.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        firstName: {
          type: Types.String,
          allowOnUpdate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const firstNameField = userModel.schema.tree.firstName
      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          firstNameField,
          'firstName',
          'update',
          Log
        ),
        'generateJoiFieldModel not called on firstName field'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel returns Joi object that rejects fields not listed.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String
        },
        firstName: {
          type: Types.String,
          allowOnUpdate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        updateModel.validate({ email: 'test' }).error === undefined,
        'email field valid'
      )
      t.ok(
        updateModel.validate({ firstName: 'test' }).error !== undefined,
        'firstName field not valid'
      )
      t.ok(
        updateModel.validate({ notAField: 'test' }).error !== undefined,
        'fields not listed not valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel returns Joi object that requires fields with "requireOnUpdate" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String,
          requireOnUpdate: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(updateModel.validate({}).error !== undefined, 'email field required')
      t.ok(
        updateModel.validate({ email: 'test' }).error === undefined,
        'email field valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel includes associations.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        title: {
          type: Types.ObjectId
        },
        profileImage: {
          type: Types.ObjectId
        },
        groups: {
          type: [Types.Object]
        },
        permissions: {
          type: [Types.Object]
        },
        hashTags: {
          type: [Types.ObjectId]
        }
      })

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
              type: 'ONE_MANY'
            },
            permissions: {
              type: 'MANY_MANY'
            },
            hashTags: {
              type: '_MANY'
            }
          }
        }
      }

      const userModel = Mongoose.model('user', userSchema)

      const titleField = userModel.schema.tree.title
      const profileImageField = userModel.schema.tree.profileImage
      const groupsField = userModel.schema.tree.groups
      const permissionsField = userModel.schema.tree.permissions
      const hashTagsField = userModel.schema.tree.hashTags

      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          titleField,
          'title',
          'update',
          Log
        ),
        'generateJoiFieldModel called on titleField field'
      )
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          profileImageField,
          'profileImage',
          'update',
          Log
        ),
        'generateJoiFieldModel called on profileImageField field'
      )
      t.notok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          groupsField,
          'groups',
          'update',
          Log
        ),
        'generateJoiFieldModel not called on groups field'
      )
      t.notok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          permissionsField,
          'permissions',
          'update',
          Log
        ),
        'generateJoiFieldModel not called on permissions field'
      )
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          hashTagsField,
          'hashTags',
          'update',
          Log
        ),
        'generateJoiFieldModel called on hashTags field'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel returns Joi object with appropriate className.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({})

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const updateModel = joiMongooseHelper.generateJoiUpdateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(updateModel._flags.label === 'userUpdateModel', 'className correct')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiCreateModel', function(t) {
  const joiMongooseHelper = require('../../utilities/joi-mongoose-helper')
  testHelper.testModelParameter(
    t,
    joiMongooseHelper.generateJoiCreateModel,
    'joiMongooseHelper.generateJoiCreateModel',
    ['model', 'Log'],
    Log
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel calls generateJoiFieldModel for regular fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const emailField = userModel.schema.tree.email
      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          emailField,
          'email',
          'create',
          Log
        ),
        'generateJoiFieldModel called on email field'
      )
      t.ok(
        createModel.validate({ email: 'test' }).error === undefined,
        'email field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel uses createModel if it exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String,
          createModel: Joi.string().valid('test')
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const emailField = userModel.schema.tree.email
      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          emailField,
          'email',
          'create',
          Log
        ),
        'generateJoiFieldModel not called on email field'
      )
      t.ok(
        createModel.validate({ email: 'wrong' }).error !== undefined,
        'wrong field value not valid'
      )
      t.ok(
        createModel.validate({ email: 'test' }).error === undefined,
        'correct field value valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel ignores fields where allowOnCreate is false.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        firstName: {
          type: Types.String,
          allowOnCreate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const firstNameField = userModel.schema.tree.firstName
      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          firstNameField,
          'firstName',
          'create',
          Log
        ),
        'generateJoiFieldModel not called on firstName field'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel returns Joi object that rejects fields not listed.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String
        },
        firstName: {
          type: Types.String,
          allowOnCreate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        createModel.validate({ email: 'test' }).error === undefined,
        'email field valid'
      )
      t.ok(
        createModel.validate({ firstName: 'test' }).error !== undefined,
        'firstName field not valid'
      )
      t.ok(
        createModel.validate({ notAField: 'test' }).error !== undefined,
        'fields not listed not valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel returns Joi object that requires fields with "required" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        email: {
          type: Types.String,
          required: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(createModel.validate({}).error !== undefined, 'email field required')
      t.ok(
        createModel.validate({ email: 'test' }).error === undefined,
        'email field valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel includes associations.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      const generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      const userSchema = new Mongoose.Schema({
        title: {
          type: Types.ObjectId
        },
        profileImage: {
          type: Types.ObjectId
        },
        groups: {
          type: [Types.Object]
        },
        permissions: {
          type: [Types.Object]
        },
        hashTags: {
          type: [Types.ObjectId]
        }
      })

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
              type: 'ONE_MANY'
            },
            permissions: {
              type: 'MANY_MANY'
            },
            hashTags: {
              type: '_MANY'
            }
          }
        }
      }

      const userModel = Mongoose.model('user', userSchema)

      const titleField = userModel.schema.tree.title
      const profileImageField = userModel.schema.tree.profileImage
      const groupsField = userModel.schema.tree.groups
      const permissionsField = userModel.schema.tree.permissions
      const hashTagsField = userModel.schema.tree.hashTags

      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          titleField,
          'title',
          'create',
          Log
        ),
        'generateJoiFieldModel called on titleField field'
      )
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          profileImageField,
          'profileImage',
          'create',
          Log
        ),
        'generateJoiFieldModel called on profileImageField field'
      )
      t.notok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          groupsField,
          'groups',
          'create',
          Log
        ),
        'generateJoiFieldModel not called on groups field'
      )
      t.notok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          permissionsField,
          'permissions',
          'create',
          Log
        ),
        'generateJoiFieldModel not called on permissions field'
      )
      t.ok(
        generateJoiFieldModel.calledWithExactly(
          userModel,
          hashTagsField,
          'hashTags',
          'create',
          Log
        ),
        'generateJoiFieldModel called on hashTags field'
      )
      // t.ok(createModel.validate({title: {}}).error !== undefined, "title field not valid format");
      // t.ok(createModel.validate({title: "test"}).error === undefined, "title field valid format");
      // t.ok(createModel.validate({profileImage: {}}).error !== undefined, "profileImage field not valid format");
      // t.ok(createModel.validate({profileImage: "test"}).error === undefined, "profileImage field valid format");
      // t.ok(createModel.validate({groups: "test"}).error !== undefined, "groups field not allowed");
      // t.ok(createModel.validate({permissions: "test"}).error !== undefined, "permissions field not allowed");
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel returns Joi object with appropriate className.',
    function(t) {
      // <editor-fold desc="Arrange">
      const joiMongooseHelper = require('../../utilities/joi-mongoose-helper')

      t.plan(1)

      const userSchema = new Mongoose.Schema({})

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const createModel = joiMongooseHelper.generateJoiCreateModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(createModel._flags.label === 'userCreateModel', 'className correct')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiModelFromFieldType', function(t) {
  t.test(
    'joi-mongoose-helper.generateJoiModelFromFieldType returns correct models for types.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(16)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const joiObjectId = sinon.spy(
        joiMongooseHelper.__get__('internals.joiObjectId')
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      const generateJoiModelFromFieldType = joiMongooseHelper.__get__(
        'internals.generateJoiModelFromFieldType'
      )

      const testSchema = {
        idType: {
          type: {
            schemaName: 'ObjectId'
          }
        },
        booleanType: {
          type: {
            schemaName: 'Boolean'
          }
        },
        numberType: {
          type: {
            schemaName: 'Number'
          }
        },
        dateType: {
          type: {
            schemaName: 'Date'
          }
        },
        stringType: {
          type: {
            schemaName: 'String'
          }
        },
        enumType: {
          type: {
            schemaName: 'String'
          },
          enum: ['test1', 'test2']
        },
        regexType: {
          type: {
            schemaName: 'String'
          },
          regex: /^[0-9A-F]{6}$/i
        },
        invertedRegexType: {
          type: {
            schemaName: 'String'
          },
          regex: {
            pattern: /^[0-9A-F]{6}$/i,
            options: {
              invert: true
            }
          }
        },
        allowNullType: {
          type: {
            schemaName: 'String'
          },
          allowNull: true
        }
      }

      // </editor-fold>

      // <editor-fold desc="Act">
      const idModel = generateJoiModelFromFieldType(testSchema.idType, Log)
      const booleanModel = generateJoiModelFromFieldType(
        testSchema.booleanType,
        Log
      )
      const numberModel = generateJoiModelFromFieldType(
        testSchema.numberType,
        Log
      )
      const dateModel = generateJoiModelFromFieldType(testSchema.dateType, Log)
      const stringModel = generateJoiModelFromFieldType(
        testSchema.stringType,
        Log
      )
      const enumModel = generateJoiModelFromFieldType(testSchema.enumType, Log)
      const regexModel = generateJoiModelFromFieldType(
        testSchema.regexType,
        Log
      )
      const invertedRegexModel = generateJoiModelFromFieldType(
        testSchema.invertedRegexType,
        Log
      )
      const allowNullModel = generateJoiModelFromFieldType(
        testSchema.allowNullType,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(joiObjectId.called, 'idModel calls joiObjectId')
      t.ok(
        booleanModel.validate(true).error === undefined,
        'booleanModel validates a bool'
      )
      t.ok(
        booleanModel.validate('').error !== undefined,
        'booleanModel rejects non bools'
      )
      t.ok(
        numberModel.validate(3).error === undefined,
        'numberModel validates a number'
      )
      t.ok(
        numberModel.validate('').error !== undefined,
        'numberModel rejects non numbers'
      )
      t.ok(
        dateModel.validate(new Date()).error === undefined,
        'dateModel validates a date'
      )
      t.ok(
        dateModel.validate('').error !== undefined,
        'dateModel rejects non dates'
      )
      t.ok(
        stringModel.validate('test').error === undefined,
        'stringModel validates a string'
      )
      t.ok(
        stringModel.validate(0).error !== undefined,
        'stringModel rejects non strings'
      )
      t.ok(
        enumModel.validate('test2').error === undefined,
        'enumModel validates an allowed value'
      )
      t.ok(
        enumModel.validate('test').error !== undefined,
        'enumModel rejects a not allowed value'
      )
      t.ok(
        regexModel.validate('abe129').error === undefined,
        'regexModel validates an allowed value'
      )
      t.ok(
        regexModel.validate('apml129').error !== undefined,
        'regexModel rejects a not allowed value'
      )
      t.ok(
        invertedRegexModel.validate('nothexidecimal').error === undefined,
        'invertedRegexModel validates an allowed value'
      )
      t.ok(
        invertedRegexModel.validate('abe129').error !== undefined,
        'invertedRegexModel rejects a not allowed value'
      )
      t.ok(
        allowNullModel.validate(null).error === undefined,
        'allowNullModel validates a null value'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.joiObjectId', function(t) {
  t.test(
    'joi-mongoose-helper.joiObjectId returns correct models for objectIds.',
    function(t) {
      // <editor-fold desc="Arrange">
      const joiMongooseHelper = require('../../utilities/joi-mongoose-helper')

      t.plan(4)

      const testSchema = {
        idType: {
          type: {
            schemaName: 'ObjectId'
          }
        }
      }

      // </editor-fold>

      // <editor-fold desc="Act">
      const idModel = joiMongooseHelper.generateJoiModelFromFieldType(
        testSchema.idType,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        idModel.validate('57d8752088ac2472a7d04863').error === undefined,
        'idModel validates an _id as a string'
      )
      t.ok(
        idModel.validate(Mongoose.Types.ObjectId()).error === undefined,
        'idModel validates an _id object'
      )
      t.ok(
        idModel.validate('57d8752088ac2472a7d04863Z').error !== undefined,
        'idModel rejects a _id with wrong format'
      )
      t.ok(
        idModel.validate({}).error !== undefined,
        'idModel rejects a _id object with wrong format'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.isValidField', function(t) {
  t.test(
    'joi-mongoose-helper.isValidField returns false for non-objects.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const isValidField = sinon.spy(
        joiMongooseHelper.__get__('internals.isValidField')
      )

      // </editor-fold>

      // <editor-fold desc="Act">
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        isValidField('test', 'test', {}) === false,
        'isValidField returns false for strings'
      )
      t.ok(
        isValidField('test', 2, {}) === false,
        'isValidField returns false for numbers'
      )
      t.ok(
        isValidField('test', true, {}) === false,
        'isValidField returns false for booleans'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.isValidField returns false for mongoose "type" fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const isValidField = sinon.spy(
        joiMongooseHelper.__get__('internals.isValidField')
      )

      // </editor-fold>

      // <editor-fold desc="Act">
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        isValidField('type', Mongoose.Schema.Types.String, {}) === false,
        'isValidField returns false for mongoose types'
      )
      t.ok(
        isValidField('type', {}, {}) === true,
        "isValidField returns true for other 'type' fields"
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.test(
    "joi-mongoose-helper.isValidField returns false for nested _id fields that aren't in an array.",
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const isValidField = sinon.spy(
        joiMongooseHelper.__get__('internals.isValidField')
      )

      // </editor-fold>

      // <editor-fold desc="Act">
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        isValidField('_id', {}, { fakeModel: true }) === false,
        'isValidField returns false for nested _id fields'
      )
      t.ok(
        isValidField('_id', {}, { fakeModel: true, isArray: true }) === true,
        'isValidField returns true for _id fields in arrays'
      )
      t.ok(
        isValidField('_id', {}, {}) === true,
        'isValidField returns true for base level _id fields'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.isValidField returns false for pre-defined invalid fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(4)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const isValidField = sinon.spy(
        joiMongooseHelper.__get__('internals.isValidField')
      )

      // </editor-fold>

      // <editor-fold desc="Act">
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        isValidField('__t', {}, {}) === false,
        'isValidField returns false for __t field'
      )
      t.ok(
        isValidField('__v', {}, {}) === false,
        'isValidField returns false for __v field'
      )
      t.ok(
        isValidField('id', {}, { schema: { virtuals: { id: {} } } }) === false,
        'isValidField returns false for id field if it is virtual'
      )
      t.ok(
        isValidField('id', {}, {}) === true,
        'isValidField returns true for id field if it is a user defined property'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiFieldModel', function(t) {
  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiReadModel on a nested field with the "read" modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiReadModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiReadModel',
        generateJoiReadModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'read',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(generateJoiReadModel.called, 'generateJoiReadModel called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiCreateModel on a nested field with the "create" modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiCreateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiCreateModel',
        generateJoiCreateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'create',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(generateJoiCreateModel.called, 'generateJoiCreateModel called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiUpdateModel on a nested field with the "create" modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(generateJoiUpdateModel.called, 'generateJoiUpdateModel called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel throws an error with an incorrect modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name

      let error = ''
      // </editor-fold>

      // <editor-fold desc="Act">
      try {
        const fieldModel = generateJoiFieldModel(
          userModel,
          nameField,
          'name',
          'wrong',
          Log
        )
      } catch (err) {
        error = err
      }
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.equal(
        error.message,
        "modelType must be either 'read', 'create', or 'update'",
        'error thrown'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    "joi-mongoose-helper.generateJoiFieldModel removes all properties of the nested field that aren't objects",
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String },
          type: Types.Object,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )
      const nestedModel = generateJoiUpdateModel.args[0][0]

      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(nestedModel.schema.tree.first, 'first field exists')
      t.ok(nestedModel.schema.tree.last, 'last field exists')
      t.notok(nestedModel.schema.tree.exclude, 'exclude field does not exist')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    "joi-mongoose-helper.generateJoiFieldModel makes a copy of the nested field before deleting so original properties aren't affected",
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String },
          type: Types.Object,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )

      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        userModel.schema.tree.name.exclude,
        'exclude field not deleted from original model'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel creates correct nestedModel out of fields',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(9)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String },
          type: Types.Object,
          exclude: true
        },
        photos: [{ url: Types.String, position: Types.Number }],
        friends: {
          type: [Types.Object]
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      const photosField = userModel.schema.tree.photos
      const friendsField = userModel.schema.tree.friends
      // </editor-fold>

      // <editor-fold desc="Act">
      generateJoiFieldModel(userModel, nameField, 'name', 'update', Log)
      generateJoiFieldModel(userModel, photosField, 'photos', 'update', Log)
      generateJoiFieldModel(userModel, friendsField, 'friends', 'update', Log)
      const nestedModel1 = generateJoiUpdateModel.args[0][0]
      const nestedModel2 = generateJoiUpdateModel.args[1][0]
      const nestedModel3 = generateJoiUpdateModel.args[2][0]
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(nestedModel1.modelName === 'user.name', 'correct modelName')
      t.ok(nestedModel1.fakeModel, 'fakeModel set to true')
      t.notok(nestedModel1.isArray, 'isArray set to false')
      t.ok(nestedModel2.modelName === 'user.photos', 'correct modelName')
      t.ok(nestedModel2.fakeModel, 'fakeModel set to true')
      t.ok(nestedModel2.isArray, 'isArray set to true')
      t.ok(nestedModel3.modelName === 'user.friends', 'correct modelName')
      t.ok(nestedModel3.fakeModel, 'fakeModel set to true')
      t.ok(nestedModel3.isArray, 'isArray set to true')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel creates correct joi model for nested fields',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(6)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any().valid('test')
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String },
          type: Types.Object,
          exclude: true
        },
        photos: [{ url: Types.String, position: Types.Number }],
        friends: {
          type: [Types.Object]
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      const photosField = userModel.schema.tree.photos
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel1 = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )
      const fieldModel2 = generateJoiFieldModel(
        userModel,
        photosField,
        'photos',
        'update',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        fieldModel1.validate('test').error === undefined,
        'fieldModel1 validates allowed string'
      )
      t.ok(
        fieldModel1.validate('wrong').error !== undefined,
        'fieldModel1 fails wrong string'
      )
      t.ok(
        fieldModel2.validate(['test', 'test']).error === undefined,
        'fieldModel2 validates array of allowed strings'
      )
      t.ok(
        fieldModel2.validate(['test', 'wrong']).error !== undefined,
        'fieldModel2 fails array containing wrong string'
      )
      t.ok(
        fieldModel2.validate('test').error !== undefined,
        'fieldModel1 fails non-array'
      )
      t.equal(
        fieldModel2._flags.label,
        'undefinedArray',
        "fieldModel2 adds 'Array' to model name"
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiModelFromFieldType for non-nested fields',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiModelFromFieldType = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        name: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.name
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiModelFromFieldType.called,
        'generateJoiModelFromFieldType called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiModelFromFieldType for "Object" field types',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      const generateJoiModelFromFieldType = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      const generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      const userSchema = new Mongoose.Schema({
        test: {
          type: Types.Object,
          required: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = Mongoose.model('user', userSchema)

      const nameField = userModel.schema.tree.test
      // </editor-fold>

      // <editor-fold desc="Act">
      const fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'test',
        'create',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiModelFromFieldType.called,
        'generateJoiModelFromFieldType called'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiListQueryModel', function(t) {
  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel calls queryHelper.getQueryableFields, getReadableFields, and getSortableFields',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      const joiMongooseHelper = proxyquire(
        '../../utilities/joi-mongoose-helper',
        {
          './query-helper': queryHelperStub
        }
      )

      const userSchema = new Mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      joiMongooseHelper.generateJoiListQueryModel(userModel, Log)
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
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(30)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $skip: 0 }).error === undefined,
        '$skip: 0 allowed'
      )
      t.ok(
        queryModel.validate({ $skip: -1 }).error !== undefined,
        '$skip: -1 not allowed'
      )
      t.ok(
        queryModel.validate({ $skip: 'notint' }).error !== undefined,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        queryModel.validate({ $page: 0 }).error === undefined,
        '$page: 0 allowed'
      )
      t.ok(
        queryModel.validate({ $page: -1 }).error !== undefined,
        '$page: -1 not allowed'
      )
      t.ok(
        queryModel.validate({ $page: 'notint' }).error !== undefined,
        "$page: 'notint' not allowed"
      )

      t.ok(
        queryModel.validate({ $limit: 0 }).error === undefined,
        '$skip: 0 allowed'
      )
      t.ok(
        queryModel.validate({ $limit: -1 }).error !== undefined,
        '$skip: -1 not allowed'
      )
      t.ok(
        queryModel.validate({ $limit: 'notint' }).error !== undefined,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        queryModel.validate({ $select: 'readable' }).error === undefined,
        "$select: 'readable' allowed"
      )
      t.ok(
        queryModel.validate({ $select: ['readable'] }).error === undefined,
        "$select: ['readable'] allowed"
      )
      t.ok(
        queryModel.validate({ $select: 'notreadable' }).error !== undefined,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        queryModel.validate({ $text: 'text' }).error === undefined,
        '$text field allowed'
      )
      t.ok(
        queryModel.validate({ $term: 'text' }).error === undefined,
        '$term field allowed'
      )

      t.ok(
        queryModel.validate({ $searchFields: 'queryable' }).error === undefined,
        "$searchFields: 'queryable' allowed"
      )
      t.ok(
        queryModel.validate({ $searchFields: ['queryable'] }).error ===
          undefined,
        "$searchFields: ['queryable'] allowed"
      )
      t.ok(
        queryModel.validate({ $searchFields: 'notqueryable' }).error !==
          undefined,
        "$searchFields: 'notqueryable' not allowed"
      )

      t.ok(
        queryModel.validate({ $sort: 'sortable' }).error === undefined,
        "$sort: 'sortable' allowed"
      )
      t.ok(
        queryModel.validate({ $sort: ['sortable'] }).error === undefined,
        "$sort: ['sortable'] allowed"
      )
      t.ok(
        queryModel.validate({ $sort: 'notsortable' }).error !== undefined,
        "$sort: 'notsortable' not allowed"
      )

      t.ok(
        queryModel.validate({ $exclude: 'objectId' }).error === undefined,
        "$exclude: 'objectId' allowed"
      )
      t.ok(
        queryModel.validate({ $exclude: ['objectId'] }).error === undefined,
        "$exclude: ['objectId'] allowed"
      )
      t.ok(
        queryModel.validate({ $exclude: 'notobjectId' }).error !== undefined,
        "$exclude: 'notobjectId' not allowed"
      )

      t.ok(
        queryModel.validate({ $count: true }).error === undefined,
        '$count: true allowed'
      )
      t.ok(
        queryModel.validate({ $count: 'notbool' }).error !== undefined,
        "$count: 'notbool' not allowed"
      )

      t.ok(
        queryModel.validate({ $where: 'text' }).error !== undefined,
        '$where field not allowed'
      )

      t.ok(
        queryModel.validate({ queryable: 'text' }).error === undefined,
        'queryable field allowed'
      )
      t.ok(
        queryModel.validate({ notafield: 'text' }).error !== undefined,
        'notafield field not allowed'
      )

      t.ok(
        queryModel.validate({ $embed: 'text' }).error !== undefined,
        '$embed field not allowed'
      )
      t.ok(
        queryModel.validate({ $flatten: true }).error !== undefined,
        '$flatten field not allowed'
      )

      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and $where queries enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', {
        enableQueryValidation: true,
        enableWhereQueries: true
      })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $where: 'text' }).error === undefined,
        '$where field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and queryValidation disabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(28)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: false })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $skip: 0 }).error === undefined,
        '$skip: 0 allowed'
      )
      t.ok(
        queryModel.validate({ $skip: -1 }).error !== undefined,
        '$skip: -1 not allowed'
      )
      t.ok(
        queryModel.validate({ $skip: 'notint' }).error !== undefined,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        queryModel.validate({ $page: 0 }).error === undefined,
        '$page: 0 allowed'
      )
      t.ok(
        queryModel.validate({ $page: -1 }).error !== undefined,
        '$page: -1 not allowed'
      )
      t.ok(
        queryModel.validate({ $page: 'notint' }).error !== undefined,
        "$page: 'notint' not allowed"
      )

      t.ok(
        queryModel.validate({ $limit: 0 }).error === undefined,
        '$skip: 0 allowed'
      )
      t.ok(
        queryModel.validate({ $limit: -1 }).error !== undefined,
        '$skip: -1 not allowed'
      )
      t.ok(
        queryModel.validate({ $limit: 'notint' }).error !== undefined,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        queryModel.validate({ $select: 'readable' }).error === undefined,
        "$select: 'readable' allowed"
      )
      t.ok(
        queryModel.validate({ $select: ['readable'] }).error === undefined,
        "$select: ['readable'] allowed"
      )
      t.ok(
        queryModel.validate({ $select: 'notreadable' }).error !== undefined,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        queryModel.validate({ $text: 'text' }).error === undefined,
        '$text field allowed'
      )
      t.ok(
        queryModel.validate({ $term: 'text' }).error === undefined,
        '$term field allowed'
      )

      t.ok(
        queryModel.validate({ $searchFields: 'queryable' }).error === undefined,
        "$searchFields: 'queryable' allowed"
      )
      t.ok(
        queryModel.validate({ $searchFields: ['queryable'] }).error ===
          undefined,
        "$searchFields: ['queryable'] allowed"
      )
      t.ok(
        queryModel.validate({ $searchFields: 'notqueryable' }).error !==
          undefined,
        "$searchFields: 'notqueryable' not allowed"
      )

      t.ok(
        queryModel.validate({ $sort: 'sortable' }).error === undefined,
        "$sort: 'sortable' allowed"
      )
      t.ok(
        queryModel.validate({ $sort: ['sortable'] }).error === undefined,
        "$sort: ['sortable'] allowed"
      )
      t.ok(
        queryModel.validate({ $sort: 'notsortable' }).error !== undefined,
        "$sort: 'notsortable' not allowed"
      )

      t.ok(
        queryModel.validate({ $exclude: 'objectId' }).error === undefined,
        "$exclude: 'objectId' allowed"
      )
      t.ok(
        queryModel.validate({ $exclude: ['objectId'] }).error === undefined,
        "$exclude: ['objectId'] allowed"
      )
      t.ok(
        queryModel.validate({ $exclude: 'notobjectId' }).error !== undefined,
        "$exclude: 'notobjectId' not allowed"
      )

      t.ok(
        queryModel.validate({ $count: true }).error === undefined,
        '$count: true allowed'
      )
      t.ok(
        queryModel.validate({ $count: 'notbool' }).error !== undefined,
        "$count: 'notbool' not allowed"
      )

      t.ok(
        queryModel.validate({ $where: 'text' }).error === undefined,
        '$where field allowed'
      )

      t.ok(
        queryModel.validate({ queryable: 'text' }).error === undefined,
        'queryable field allowed'
      )
      t.ok(
        queryModel.validate({ notafield: 'text' }).error === undefined,
        'notafield field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: { associations: {} } }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $embed: 'text' }).error === undefined,
        "$embed: 'text' allowed"
      )
      t.ok(
        queryModel.validate({ $embed: ['text'] }).error === undefined,
        "$embed: ['text'] allowed"
      )
      t.ok(
        queryModel.validate({ $embed: 0 }).error !== undefined,
        '$embed: 0 not allowed'
      )
      t.ok(
        queryModel.validate({ $flatten: true }).error === undefined,
        '$flatten: true allowed'
      )
      t.ok(
        queryModel.validate({ $flatten: 'text' }).error !== undefined,
        "$flatten: 'text' not allowed"
      )

      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiFindQueryModel', function(t) {
  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel calls queryHelper.getReadableFields',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      const joiMongooseHelper = proxyquire(
        '../../utilities/joi-mongoose-helper',
        {
          './query-helper': queryHelperStub
        }
      )

      const userSchema = new Mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      joiMongooseHelper.generateJoiFindQueryModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(queryHelperStub.getReadableFields.called, 'getReadableFields called')
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(6)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiFindQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $select: 'readable' }).error === undefined,
        "$select: 'readable' allowed"
      )
      t.ok(
        queryModel.validate({ $select: ['readable'] }).error === undefined,
        "$select: ['readable'] allowed"
      )
      t.ok(
        queryModel.validate({ $select: 'notreadable' }).error !== undefined,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        queryModel.validate({ notafield: 'text' }).error !== undefined,
        'notafield field not allowed'
      )

      t.ok(
        queryModel.validate({ $embed: 'text' }).error !== undefined,
        '$embed field not allowed'
      )
      t.ok(
        queryModel.validate({ $flatten: true }).error !== undefined,
        '$flatten field not allowed'
      )

      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel returns correct queryModel for model with no associations and queryValidation disabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(4)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: false })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiFindQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $select: 'readable' }).error === undefined,
        "$select: 'readable' allowed"
      )
      t.ok(
        queryModel.validate({ $select: ['readable'] }).error === undefined,
        "$select: ['readable'] allowed"
      )
      t.ok(
        queryModel.validate({ $select: 'notreadable' }).error !== undefined,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        queryModel.validate({ notafield: 'text' }).error === undefined,
        'notafield field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      const queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      const generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      const joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      const joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      const userSchema = new Mongoose.Schema({
        queryable: {
          type: Types.String
        },
        readable: {
          type: Types.String
        },
        sortable: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: { associations: {} } }

      const userModel = Mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      const queryModel = joiMongooseHelper.generateJoiFindQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryModel.validate({ $embed: 'text' }).error === undefined,
        "$embed: 'text' allowed"
      )
      t.ok(
        queryModel.validate({ $embed: ['text'] }).error === undefined,
        "$embed: ['text'] allowed"
      )
      t.ok(
        queryModel.validate({ $embed: 0 }).error !== undefined,
        '$embed: 0 not allowed'
      )
      t.ok(
        queryModel.validate({ $flatten: true }).error === undefined,
        '$flatten: true allowed'
      )
      t.ok(
        queryModel.validate({ $flatten: 'text' }).error !== undefined,
        "$flatten: 'text' not allowed"
      )

      // </editor-fold>

      // <editor-fold desc="Restore">
      Object.keys(Mongoose.models).forEach(function(key) {
        delete Mongoose.models[key]
      })
      Object.keys(Mongoose.modelSchemas).forEach(function(key) {
        delete Mongoose.modelSchemas[key]
      })
      // </editor-fold>
    })
  )

  t.end()
})
