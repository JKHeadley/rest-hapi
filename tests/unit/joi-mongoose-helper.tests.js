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
Log.logLevel = 'DEBUG'
Log = Log.bind('joi-mongoose-helper')
let testHelper = require('../../utilities/test-helper')
let Joi = require('joi')

sinon.test = sinonTest

test('joi-mongoose-helper exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  let joiMongooseHelper = require('../../utilities/joi-mongoose-helper')

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
  let joiMongooseHelper = require('../../utilities/joi-mongoose-helper')
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

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let emailField = userModel.schema.tree['email']
      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
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
        Joi.validate({ email: 'test' }, readModel).error === null,
        'email field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel uses readModel if it exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          readModel: Joi.any().only('test')
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let emailField = userModel.schema.tree['email']
      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
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
        Joi.validate({ email: 'wrong' }, readModel).error !== null,
        'wrong field value not valid'
      )
      t.ok(
        Joi.validate({ email: 'test' }, readModel).error === null,
        'correct field value valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel ignores fields where exclude is true or allowOnRead is false.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
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
      let userModel = mongoose.model('user', userSchema)

      let firstNameField = userModel.schema.tree['firstName']
      let lastNameField = userModel.schema.tree['lastName']
      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel ignores fields that are invalid.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
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

      let userSchema = new mongoose.Schema({
        firstName: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let firstNameField = userModel.schema.tree['firstName']
      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel returns Joi object that rejects excluded fields.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(4)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
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
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ email: 'test' }, readModel).error === null,
        'email field valid'
      )
      t.ok(
        Joi.validate({ firstName: 'test' }, readModel).error !== null,
        'firstName field not valid'
      )
      t.ok(
        Joi.validate({ lastName: 'test' }, readModel).error !== null,
        'lastName field not valid'
      )
      t.ok(
        Joi.validate({ notAField: 'test' }, readModel).error !== null,
        'fields not listed not valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel returns Joi object that requires fields with "requireOnRead" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          requireOnRead: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(Joi.validate({}, readModel).error !== null, 'email field required')
      t.ok(
        Joi.validate({ email: 'test' }, readModel).error === null,
        'email field valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel includes associations.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(19)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let generateJoiReadModel = sinon.spy(function() {
        return Joi.object()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )
      joiMongooseHelper.__set__(
        'internals.generateJoiReadModel',
        generateJoiReadModel
      )

      let userSchema = new mongoose.Schema({})

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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        generateJoiFieldModel.callCount === 1,
        'generateJoiFieldModel not called on association fields'
      )
      t.ok(
        Joi.validate({ title: {} }, readModel).error === null,
        'title field valid'
      )
      t.ok(
        Joi.validate({ title: null }, readModel).error !== null,
        'null title field not valid'
      )
      t.ok(
        Joi.validate({ title: '' }, readModel).error !== null,
        'non-object title field not valid'
      )
      t.ok(
        Joi.validate({ profileImage: {} }, readModel).error === null,
        'profileImage field valid'
      )
      t.ok(
        Joi.validate({ profileImage: null }, readModel).error !== null,
        'null profileImage note field valid'
      )
      t.ok(
        Joi.validate({ profileImage: '' }, readModel).error !== null,
        'non-object profileImage field not valid'
      )
      t.ok(
        Joi.validate({ groups: [{}, {}] }, readModel).error === null,
        'groups field valid'
      )
      t.ok(
        Joi.validate({ groups: null }, readModel).error !== null,
        'null groups field not valid'
      )
      t.ok(
        Joi.validate({ groups: ['', 3, {}] }, readModel).error !== null,
        'groups field must be array of objects'
      )
      t.ok(
        Joi.validate({ friends: [{}, {}] }, readModel).error === null,
        'friends field valid'
      )
      t.ok(
        Joi.validate({ friends: null }, readModel).error !== null,
        'null friends field not valid'
      )
      t.ok(
        Joi.validate({ friends: ['', 3, {}] }, readModel).error !== null,
        'friends field must be array of objects'
      )
      t.ok(
        Joi.validate({ hashTags: [{}, {}] }, readModel).error === null,
        'hashTags field valid'
      )
      t.ok(
        Joi.validate({ hashTags: null }, readModel).error !== null,
        'null hashTags field not valid'
      )
      t.ok(
        Joi.validate({ hashTags: ['', 3, {}] }, readModel).error !== null,
        'hashTags field must be array of objects'
      )
      t.ok(
        Joi.validate({ permissions: [{}, {}] }, readModel).error === null,
        'permissions field valid'
      )
      t.ok(
        Joi.validate({ permissions: null }, readModel).error !== null,
        'null permissions field not valid'
      )
      t.ok(
        Joi.validate({ permissions: ['', 3, {}] }, readModel).error !== null,
        'permissions field must be array of objects'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiReadModel returns Joi object with appropriate className.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({})

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let readModel = joiMongooseHelper.generateJoiReadModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(readModel._flags.label === 'userReadModel', 'className correct')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiUpdateModel', function(t) {
  let joiMongooseHelper = require('../../utilities/joi-mongoose-helper')
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

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let emailField = userModel.schema.tree['email']
      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
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
        Joi.validate({ email: 'test' }, updateModel).error === null,
        'email field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel uses updateModel if it exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          updateModel: Joi.any().only('test')
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let emailField = userModel.schema.tree['email']
      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
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
        Joi.validate({ email: 'wrong' }, updateModel).error !== null,
        'wrong field value not valid'
      )
      t.ok(
        Joi.validate({ email: 'test' }, updateModel).error === null,
        'correct field value valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel ignores fields where allowOnUpdate is false.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        firstName: {
          type: Types.String,
          allowOnUpdate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let firstNameField = userModel.schema.tree['firstName']
      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel returns Joi object that rejects fields not listed.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String
        },
        firstName: {
          type: Types.String,
          allowOnUpdate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ email: 'test' }, updateModel).error === null,
        'email field valid'
      )
      t.ok(
        Joi.validate({ firstName: 'test' }, updateModel).error !== null,
        'firstName field not valid'
      )
      t.ok(
        Joi.validate({ notAField: 'test' }, updateModel).error !== null,
        'fields not listed not valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel returns Joi object that requires fields with "requireOnUpdate" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          requireOnUpdate: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(Joi.validate({}, updateModel).error !== null, 'email field required')
      t.ok(
        Joi.validate({ email: 'test' }, updateModel).error === null,
        'email field valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel includes associations.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      let titleField = userModel.schema.tree['title']
      let profileImageField = userModel.schema.tree['profileImage']
      let groupsField = userModel.schema.tree['groups']
      let permissionsField = userModel.schema.tree['permissions']
      let hashTagsField = userModel.schema.tree['hashTags']

      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiUpdateModel returns Joi object with appropriate className.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({})

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let updateModel = joiMongooseHelper.generateJoiUpdateModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(updateModel._flags.label === 'userUpdateModel', 'className correct')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.end()
})

test('joi-mongoose-helper.generateJoiCreateModel', function(t) {
  let joiMongooseHelper = require('../../utilities/joi-mongoose-helper')
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

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let emailField = userModel.schema.tree['email']
      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
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
        Joi.validate({ email: 'test' }, createModel).error === null,
        'email field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel uses createModel if it exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          createModel: Joi.any().only('test')
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let emailField = userModel.schema.tree['email']
      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
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
        Joi.validate({ email: 'wrong' }, createModel).error !== null,
        'wrong field value not valid'
      )
      t.ok(
        Joi.validate({ email: 'test' }, createModel).error === null,
        'correct field value valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel ignores fields where allowOnCreate is false.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        firstName: {
          type: Types.String,
          allowOnCreate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let firstNameField = userModel.schema.tree['firstName']
      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel returns Joi object that rejects fields not listed.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String
        },
        firstName: {
          type: Types.String,
          allowOnCreate: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ email: 'test' }, createModel).error === null,
        'email field valid'
      )
      t.ok(
        Joi.validate({ firstName: 'test' }, createModel).error !== null,
        'firstName field not valid'
      )
      t.ok(
        Joi.validate({ notAField: 'test' }, createModel).error !== null,
        'fields not listed not valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel returns Joi object that requires fields with "required" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          required: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(Joi.validate({}, createModel).error !== null, 'email field required')
      t.ok(
        Joi.validate({ email: 'test' }, createModel).error === null,
        'email field valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel includes associations.',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      let generateJoiFieldModel = sinon.spy(function() {
        return Joi.any()
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiFieldModel',
        generateJoiFieldModel
      )

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      let titleField = userModel.schema.tree['title']
      let profileImageField = userModel.schema.tree['profileImage']
      let groupsField = userModel.schema.tree['groups']
      let permissionsField = userModel.schema.tree['permissions']
      let hashTagsField = userModel.schema.tree['hashTags']

      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
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
      // t.ok(Joi.validate({title: {}}, createModel).error !== null, "title field not valid format");
      // t.ok(Joi.validate({title: "test"}, createModel).error === null, "title field valid format");
      // t.ok(Joi.validate({profileImage: {}}, createModel).error !== null, "profileImage field not valid format");
      // t.ok(Joi.validate({profileImage: "test"}, createModel).error === null, "profileImage field valid format");
      // t.ok(Joi.validate({groups: "test"}, createModel).error !== null, "groups field not allowed");
      // t.ok(Joi.validate({permissions: "test"}, createModel).error !== null, "permissions field not allowed");
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiCreateModel returns Joi object with appropriate className.',
    function(t) {
      // <editor-fold desc="Arrange">
      let joiMongooseHelper = require('../../utilities/joi-mongoose-helper')

      t.plan(1)

      let userSchema = new mongoose.Schema({})

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let createModel = joiMongooseHelper.generateJoiCreateModel(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(createModel._flags.label === 'userCreateModel', 'className correct')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
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

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let joiObjectId = sinon.spy(
        joiMongooseHelper.__get__('internals.joiObjectId')
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      let generateJoiModelFromFieldType = joiMongooseHelper.__get__(
        'internals.generateJoiModelFromFieldType'
      )

      let testSchema = {
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
      let idModel = generateJoiModelFromFieldType(testSchema.idType, Log)
      let booleanModel = generateJoiModelFromFieldType(
        testSchema.booleanType,
        Log
      )
      let numberModel = generateJoiModelFromFieldType(
        testSchema.numberType,
        Log
      )
      let dateModel = generateJoiModelFromFieldType(testSchema.dateType, Log)
      let stringModel = generateJoiModelFromFieldType(
        testSchema.stringType,
        Log
      )
      let enumModel = generateJoiModelFromFieldType(testSchema.enumType, Log)
      let regexModel = generateJoiModelFromFieldType(testSchema.regexType, Log)
      let invertedRegexModel = generateJoiModelFromFieldType(
        testSchema.invertedRegexType,
        Log
      )
      let allowNullModel = generateJoiModelFromFieldType(
        testSchema.allowNullType,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(joiObjectId.called, 'idModel calls joiObjectId')
      t.ok(
        booleanModel.validate(true).error === null,
        'booleanModel validates a bool'
      )
      t.ok(
        booleanModel.validate('').error !== null,
        'booleanModel rejects non bools'
      )
      t.ok(
        numberModel.validate(3).error === null,
        'numberModel validates a number'
      )
      t.ok(
        numberModel.validate('').error !== null,
        'numberModel rejects non numbers'
      )
      t.ok(
        dateModel.validate(new Date()).error === null,
        'dateModel validates a date'
      )
      t.ok(dateModel.validate('').error !== null, 'dateModel rejects non dates')
      t.ok(
        stringModel.validate('test').error === null,
        'stringModel validates a string'
      )
      t.ok(
        stringModel.validate(0).error !== null,
        'stringModel rejects non strings'
      )
      t.ok(
        enumModel.validate('test2').error === null,
        'enumModel validates an allowed value'
      )
      t.ok(
        enumModel.validate('test').error !== null,
        'enumModel rejects a not allowed value'
      )
      t.ok(
        regexModel.validate('abe129').error === null,
        'regexModel validates an allowed value'
      )
      t.ok(
        regexModel.validate('apml129').error !== null,
        'regexModel rejects a not allowed value'
      )
      t.ok(
        invertedRegexModel.validate('nothexidecimal').error === null,
        'invertedRegexModel validates an allowed value'
      )
      t.ok(
        invertedRegexModel.validate('abe129').error !== null,
        'invertedRegexModel rejects a not allowed value'
      )
      t.ok(
        allowNullModel.validate(null).error === null,
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
      let joiMongooseHelper = require('../../utilities/joi-mongoose-helper')

      t.plan(4)

      let testSchema = {
        idType: {
          type: {
            schemaName: 'ObjectId'
          }
        }
      }

      // </editor-fold>

      // <editor-fold desc="Act">
      let idModel = joiMongooseHelper.generateJoiModelFromFieldType(
        testSchema.idType,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        idModel.validate('57d8752088ac2472a7d04863').error === null,
        'idModel validates an _id as a string'
      )
      t.ok(
        idModel.validate(mongoose.Types.ObjectId()).error === null,
        'idModel validates an _id object'
      )
      t.ok(
        idModel.validate('57d8752088ac2472a7d04863Z').error !== null,
        'idModel rejects a _id with wrong format'
      )
      t.ok(
        idModel.validate({}).error !== null,
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

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let isValidField = sinon.spy(
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

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let isValidField = sinon.spy(
        joiMongooseHelper.__get__('internals.isValidField')
      )

      // </editor-fold>

      // <editor-fold desc="Act">
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        isValidField('type', mongoose.Schema.Types.String, {}) === false,
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

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let isValidField = sinon.spy(
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
      t.plan(3)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let isValidField = sinon.spy(
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

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiReadModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiReadModel',
        generateJoiReadModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiCreateModel on a nested field with the "create" modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiCreateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiCreateModel',
        generateJoiCreateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiUpdateModel on a nested field with the "create" modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel throws an error with an incorrect modelType parameter',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String }
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']

      let error = ''
      // </editor-fold>

      // <editor-fold desc="Act">
      try {
        let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    "joi-mongoose-helper.generateJoiFieldModel removes all properties of the nested field that aren't objects",
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(3)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String },
          type: Types.Object,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )
      let nestedModel = generateJoiUpdateModel.args[0][0]

      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(nestedModel.schema.tree.first, 'first field exists')
      t.ok(nestedModel.schema.tree.last, 'last field exists')
      t.notok(nestedModel.schema.tree.exclude, 'exclude field does not exist')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    "joi-mongoose-helper.generateJoiFieldModel makes a copy of the nested field before deleting so original properties aren't affected",
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          first: { type: Types.String },
          last: { type: Types.String },
          type: Types.Object,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel creates correct nestedModel out of fields',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(9)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
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
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      let photosField = userModel.schema.tree['photos']
      let friendsField = userModel.schema.tree['friends']
      // </editor-fold>

      // <editor-fold desc="Act">
      generateJoiFieldModel(userModel, nameField, 'name', 'update', Log)
      generateJoiFieldModel(userModel, photosField, 'photos', 'update', Log)
      generateJoiFieldModel(userModel, friendsField, 'friends', 'update', Log)
      let nestedModel1 = generateJoiUpdateModel.args[0][0]
      let nestedModel2 = generateJoiUpdateModel.args[1][0]
      let nestedModel3 = generateJoiUpdateModel.args[2][0]
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel creates correct joi model for nested fields',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(6)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiUpdateModel = sinon.spy(function() {
        return Joi.any().valid('test')
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiUpdateModel',
        generateJoiUpdateModel
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
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
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      let photosField = userModel.schema.tree['photos']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel1 = generateJoiFieldModel(
        userModel,
        nameField,
        'name',
        'update',
        Log
      )
      let fieldModel2 = generateJoiFieldModel(
        userModel,
        photosField,
        'photos',
        'update',
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        fieldModel1.validate('test').error === null,
        'fieldModel1 validates allowed string'
      )
      t.ok(
        fieldModel1.validate('wrong').error !== null,
        'fieldModel1 fails wrong string'
      )
      t.ok(
        fieldModel2.validate(['test', 'test']).error === null,
        'fieldModel2 validates array of allowed strings'
      )
      t.ok(
        fieldModel2.validate(['test', 'wrong']).error !== null,
        'fieldModel2 fails array containing wrong string'
      )
      t.ok(
        fieldModel2.validate('test').error !== null,
        'fieldModel1 fails non-array'
      )
      t.equal(
        fieldModel2._flags.label,
        'undefinedArray',
        "fieldModel2 adds 'Array' to model name"
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiModelFromFieldType for non-nested fields',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiModelFromFieldType = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        name: {
          type: Types.String
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['name']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'joi-mongoose-helper.generateJoiFieldModel calls generateJoiModelFromFieldType for "Object" field types',
    function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      let generateJoiModelFromFieldType = sinon.spy(function() {
        return Joi.any()
      })
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      let generateJoiFieldModel = joiMongooseHelper.__get__(
        'internals.generateJoiFieldModel'
      )

      let userSchema = new mongoose.Schema({
        test: {
          type: Types.Object,
          required: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      let userModel = mongoose.model('user', userSchema)

      let nameField = userModel.schema.tree['test']
      // </editor-fold>

      // <editor-fold desc="Act">
      let fieldModel = generateJoiFieldModel(
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
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

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelper = proxyquire(
        '../../utilities/joi-mongoose-helper',
        {
          './query-helper': queryHelperStub
        }
      )

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
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
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(30)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $skip: 0 }, queryModel).error === null,
        '$skip: 0 allowed'
      )
      t.ok(
        Joi.validate({ $skip: -1 }, queryModel).error !== null,
        '$skip: -1 not allowed'
      )
      t.ok(
        Joi.validate({ $skip: 'notint' }, queryModel).error !== null,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        Joi.validate({ $page: 0 }, queryModel).error === null,
        '$page: 0 allowed'
      )
      t.ok(
        Joi.validate({ $page: -1 }, queryModel).error !== null,
        '$page: -1 not allowed'
      )
      t.ok(
        Joi.validate({ $page: 'notint' }, queryModel).error !== null,
        "$page: 'notint' not allowed"
      )

      t.ok(
        Joi.validate({ $limit: 0 }, queryModel).error === null,
        '$skip: 0 allowed'
      )
      t.ok(
        Joi.validate({ $limit: -1 }, queryModel).error !== null,
        '$skip: -1 not allowed'
      )
      t.ok(
        Joi.validate({ $limit: 'notint' }, queryModel).error !== null,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        Joi.validate({ $select: 'readable' }, queryModel).error === null,
        "$select: 'readable' allowed"
      )
      t.ok(
        Joi.validate({ $select: ['readable'] }, queryModel).error === null,
        "$select: ['readable'] allowed"
      )
      t.ok(
        Joi.validate({ $select: 'notreadable' }, queryModel).error !== null,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        Joi.validate({ $text: 'text' }, queryModel).error === null,
        '$text field allowed'
      )
      t.ok(
        Joi.validate({ $term: 'text' }, queryModel).error === null,
        '$term field allowed'
      )

      t.ok(
        Joi.validate({ $searchFields: 'queryable' }, queryModel).error === null,
        "$searchFields: 'queryable' allowed"
      )
      t.ok(
        Joi.validate({ $searchFields: ['queryable'] }, queryModel).error ===
          null,
        "$searchFields: ['queryable'] allowed"
      )
      t.ok(
        Joi.validate({ $searchFields: 'notqueryable' }, queryModel).error !==
          null,
        "$searchFields: 'notqueryable' not allowed"
      )

      t.ok(
        Joi.validate({ $sort: 'sortable' }, queryModel).error === null,
        "$sort: 'sortable' allowed"
      )
      t.ok(
        Joi.validate({ $sort: ['sortable'] }, queryModel).error === null,
        "$sort: ['sortable'] allowed"
      )
      t.ok(
        Joi.validate({ $sort: 'notsortable' }, queryModel).error !== null,
        "$sort: 'notsortable' not allowed"
      )

      t.ok(
        Joi.validate({ $exclude: 'objectId' }, queryModel).error === null,
        "$exclude: 'objectId' allowed"
      )
      t.ok(
        Joi.validate({ $exclude: ['objectId'] }, queryModel).error === null,
        "$exclude: ['objectId'] allowed"
      )
      t.ok(
        Joi.validate({ $exclude: 'notobjectId' }, queryModel).error !== null,
        "$exclude: 'notobjectId' not allowed"
      )

      t.ok(
        Joi.validate({ $count: true }, queryModel).error === null,
        '$count: true allowed'
      )
      t.ok(
        Joi.validate({ $count: 'notbool' }, queryModel).error !== null,
        "$count: 'notbool' not allowed"
      )

      t.ok(
        Joi.validate({ $where: 'text' }, queryModel).error !== null,
        '$where field not allowed'
      )

      t.ok(
        Joi.validate({ queryable: 'text' }, queryModel).error === null,
        'queryable field allowed'
      )
      t.ok(
        Joi.validate({ notafield: 'text' }, queryModel).error !== null,
        'notafield field not allowed'
      )

      t.ok(
        Joi.validate({ $embed: 'text' }, queryModel).error !== null,
        '$embed field not allowed'
      )
      t.ok(
        Joi.validate({ $flatten: true }, queryModel).error !== null,
        '$flatten field not allowed'
      )

      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and $where queries enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
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

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $where: 'text' }, queryModel).error === null,
        '$where field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and queryValidation disabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(28)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: false })

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $skip: 0 }, queryModel).error === null,
        '$skip: 0 allowed'
      )
      t.ok(
        Joi.validate({ $skip: -1 }, queryModel).error !== null,
        '$skip: -1 not allowed'
      )
      t.ok(
        Joi.validate({ $skip: 'notint' }, queryModel).error !== null,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        Joi.validate({ $page: 0 }, queryModel).error === null,
        '$page: 0 allowed'
      )
      t.ok(
        Joi.validate({ $page: -1 }, queryModel).error !== null,
        '$page: -1 not allowed'
      )
      t.ok(
        Joi.validate({ $page: 'notint' }, queryModel).error !== null,
        "$page: 'notint' not allowed"
      )

      t.ok(
        Joi.validate({ $limit: 0 }, queryModel).error === null,
        '$skip: 0 allowed'
      )
      t.ok(
        Joi.validate({ $limit: -1 }, queryModel).error !== null,
        '$skip: -1 not allowed'
      )
      t.ok(
        Joi.validate({ $limit: 'notint' }, queryModel).error !== null,
        "$skip: 'notint' not allowed"
      )

      t.ok(
        Joi.validate({ $select: 'readable' }, queryModel).error === null,
        "$select: 'readable' allowed"
      )
      t.ok(
        Joi.validate({ $select: ['readable'] }, queryModel).error === null,
        "$select: ['readable'] allowed"
      )
      t.ok(
        Joi.validate({ $select: 'notreadable' }, queryModel).error !== null,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        Joi.validate({ $text: 'text' }, queryModel).error === null,
        '$text field allowed'
      )
      t.ok(
        Joi.validate({ $term: 'text' }, queryModel).error === null,
        '$term field allowed'
      )

      t.ok(
        Joi.validate({ $searchFields: 'queryable' }, queryModel).error === null,
        "$searchFields: 'queryable' allowed"
      )
      t.ok(
        Joi.validate({ $searchFields: ['queryable'] }, queryModel).error ===
          null,
        "$searchFields: ['queryable'] allowed"
      )
      t.ok(
        Joi.validate({ $searchFields: 'notqueryable' }, queryModel).error !==
          null,
        "$searchFields: 'notqueryable' not allowed"
      )

      t.ok(
        Joi.validate({ $sort: 'sortable' }, queryModel).error === null,
        "$sort: 'sortable' allowed"
      )
      t.ok(
        Joi.validate({ $sort: ['sortable'] }, queryModel).error === null,
        "$sort: ['sortable'] allowed"
      )
      t.ok(
        Joi.validate({ $sort: 'notsortable' }, queryModel).error !== null,
        "$sort: 'notsortable' not allowed"
      )

      t.ok(
        Joi.validate({ $exclude: 'objectId' }, queryModel).error === null,
        "$exclude: 'objectId' allowed"
      )
      t.ok(
        Joi.validate({ $exclude: ['objectId'] }, queryModel).error === null,
        "$exclude: ['objectId'] allowed"
      )
      t.ok(
        Joi.validate({ $exclude: 'notobjectId' }, queryModel).error !== null,
        "$exclude: 'notobjectId' not allowed"
      )

      t.ok(
        Joi.validate({ $count: true }, queryModel).error === null,
        '$count: true allowed'
      )
      t.ok(
        Joi.validate({ $count: 'notbool' }, queryModel).error !== null,
        "$count: 'notbool' not allowed"
      )

      t.ok(
        Joi.validate({ $where: 'text' }, queryModel).error === null,
        '$where field allowed'
      )

      t.ok(
        Joi.validate({ queryable: 'text' }, queryModel).error === null,
        'queryable field allowed'
      )
      t.ok(
        Joi.validate({ notafield: 'text' }, queryModel).error === null,
        'notafield field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiListQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiListQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $embed: 'text' }, queryModel).error === null,
        "$embed: 'text' allowed"
      )
      t.ok(
        Joi.validate({ $embed: ['text'] }, queryModel).error === null,
        "$embed: ['text'] allowed"
      )
      t.ok(
        Joi.validate({ $embed: 0 }, queryModel).error !== null,
        '$embed: 0 not allowed'
      )
      t.ok(
        Joi.validate({ $flatten: true }, queryModel).error === null,
        '$flatten: true allowed'
      )
      t.ok(
        Joi.validate({ $flatten: 'text' }, queryModel).error !== null,
        "$flatten: 'text' not allowed"
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

test('joi-mongoose-helper.generateJoiFindQueryModel', function(t) {
  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel calls queryHelper.getReadableFields',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      let joiMongooseHelper = proxyquire(
        '../../utilities/joi-mongoose-helper',
        {
          './query-helper': queryHelperStub
        }
      )

      let userSchema = new mongoose.Schema({})
      userSchema.statics = { routeOptions: {} }

      let userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      joiMongooseHelper.generateJoiFindQueryModel(userModel, Log)
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
    'joi-mongoose-helper.generateJoiFindQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(6)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiFindQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $select: 'readable' }, queryModel).error === null,
        "$select: 'readable' allowed"
      )
      t.ok(
        Joi.validate({ $select: ['readable'] }, queryModel).error === null,
        "$select: ['readable'] allowed"
      )
      t.ok(
        Joi.validate({ $select: 'notreadable' }, queryModel).error !== null,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        Joi.validate({ notafield: 'text' }, queryModel).error !== null,
        'notafield field not allowed'
      )

      t.ok(
        Joi.validate({ $embed: 'text' }, queryModel).error !== null,
        '$embed field not allowed'
      )
      t.ok(
        Joi.validate({ $flatten: true }, queryModel).error !== null,
        '$flatten field not allowed'
      )

      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel returns correct queryModel for model with no associations and queryValidation disabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(4)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: false })

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiFindQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $select: 'readable' }, queryModel).error === null,
        "$select: 'readable' allowed"
      )
      t.ok(
        Joi.validate({ $select: ['readable'] }, queryModel).error === null,
        "$select: ['readable'] allowed"
      )
      t.ok(
        Joi.validate({ $select: 'notreadable' }, queryModel).error !== null,
        "$select: 'notreadable' not allowed"
      )

      t.ok(
        Joi.validate({ notafield: 'text' }, queryModel).error === null,
        'notafield field allowed'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    })
  )

  t.test(
    'joi-mongoose-helper.generateJoiFindQueryModel returns correct queryModel for model with no associations and queryValidation enabled',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(5)

      let queryHelperStub = this.stub(require('../../utilities/query-helper'))
      queryHelperStub.getQueryableFields = this.spy(function() {
        return ['queryable']
      })
      queryHelperStub.getReadableFields = this.spy(function() {
        return ['readable']
      })
      queryHelperStub.getSortableFields = this.spy(function() {
        return ['sortable']
      })

      let generateJoiModelFromFieldType = sinon.spy(function(test) {
        return Joi.any()
      })
      let joiObjectId = sinon.spy(function() {
        return Joi.any().valid('objectId')
      })
      let joiMongooseHelper = rewire('../../utilities/joi-mongoose-helper')
      joiMongooseHelper.__set__(
        'internals.generateJoiModelFromFieldType',
        generateJoiModelFromFieldType
      )
      joiMongooseHelper.__set__('internals.joiObjectId', joiObjectId)
      joiMongooseHelper.__set__('queryHelper', queryHelperStub)
      joiMongooseHelper.__set__('config', { enableQueryValidation: true })

      let userSchema = new mongoose.Schema({
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

      let userModel = mongoose.model('user', userSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      let queryModel = joiMongooseHelper.generateJoiFindQueryModel(
        userModel,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Joi.validate({ $embed: 'text' }, queryModel).error === null,
        "$embed: 'text' allowed"
      )
      t.ok(
        Joi.validate({ $embed: ['text'] }, queryModel).error === null,
        "$embed: ['text'] allowed"
      )
      t.ok(
        Joi.validate({ $embed: 0 }, queryModel).error !== null,
        '$embed: 0 not allowed'
      )
      t.ok(
        Joi.validate({ $flatten: true }, queryModel).error === null,
        '$flatten: true allowed'
      )
      t.ok(
        Joi.validate({ $flatten: 'text' }, queryModel).error !== null,
        "$flatten: 'text' not allowed"
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
