'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

const path = require('path')
const test = require('tape')
const _ = require('lodash')
const sinon = require('sinon')
const sinonTestFactory = require('sinon-test')
const sinonTest = sinonTestFactory(sinon)
const rewire = require('rewire')
const proxyquire = require('proxyquire')
const assert = require('assert')
const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const logging = require('loggin')
const Q = require('q')
let Log = logging.getLogger('tests')
Log.logLevel = 'DEBUG'
Log = Log.bind('model-helper')

sinon.test = sinonTest

// TODO: update createModel tests

test('model-helper exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  const modelHelper = require('../../utilities/model-helper')

  t.plan(4)
  // </editor-fold>

  // <editor-fold desc="Assert">
  t.ok(modelHelper, 'model-helper exists.')
  t.ok(modelHelper.createModel, 'model-helper.createModel exists.')
  t.ok(
    modelHelper.extendSchemaAssociations,
    'model-helper.extendSchemaAssociations exists.'
  )
  t.ok(modelHelper.associateModels, 'model-helper.associateModels exists.')
  // </editor-fold>
})

test('model-helper.createModel', function(t) {
  t.test(
    'model-helper.createModel calls mongoose.model with correct arguments.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const mongooseStub = this.stub(mongoose)
      const modelHelper = proxyquire('../../utilities/model-helper', {})

      const collectionName = 'user'
      const Schema = {
        add: function() {},
        statics: { collectionName: collectionName }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = modelHelper.createModel(Schema, mongooseStub)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(mongooseStub.model.called, 'mongoose.model called')
      t.ok(
        mongooseStub.model.calledWithExactly(collectionName, Schema),
        'mongoose.model called with correct args'
      )
      // </editor-fold>
    })
  )

  t.test(
    'model-helper.createModel adds metadata properties if enabled.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(7)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        enableCreatedAt: true,
        enableUpdatedAt: true,
        enableDeletedAt: true,
        enableCreatedBy: true,
        enableUpdatedBy: true,
        enableDeletedBy: true,
        enableSoftDelete: true
      }
      modelHelper.__set__('config', config)

      const mongooseStub = this.stub(mongoose)

      const createdAt = {
        createdAt: {
          type: mongoose.Schema.Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      const updatedAt = {
        updatedAt: {
          type: mongoose.Schema.Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      const deletedAt = {
        deletedAt: {
          type: mongoose.Schema.Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      const isDeleted = {
        isDeleted: {
          type: mongoose.Schema.Types.Boolean,
          allowOnCreate: false,
          allowOnUpdate: false,
          default: false
        }
      }

      const createdBy = {
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      const updatedBy = {
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      const deletedBy = {
        deletedBy: {
          type: mongoose.Schema.Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }

      const collectionName = 'user'
      const Schema = {
        add: this.spy(),
        statics: { collectionName: collectionName }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = modelHelper.createModel(Schema, mongooseStub)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        Schema.add.calledWithExactly(createdAt),
        'Schema.add called with createdAt'
      )
      t.ok(
        Schema.add.calledWithExactly(updatedAt),
        'Schema.add called with updatedAt'
      )
      t.ok(
        Schema.add.calledWithExactly(deletedAt),
        'Schema.add called with deletedAt'
      )
      t.ok(
        Schema.add.calledWithExactly(isDeleted),
        'Schema.add called with isDeleted'
      )
      t.ok(
        Schema.add.calledWithExactly(createdBy),
        'Schema.add called with createdBy'
      )
      t.ok(
        Schema.add.calledWithExactly(updatedBy),
        'Schema.add called with updatedBy'
      )
      t.ok(
        Schema.add.calledWithExactly(deletedBy),
        'Schema.add called with deletedBy'
      )
      // </editor-fold>
    })
  )

  t.test(
    'model-helper.createModel does not add metadata properties if disabled.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(1)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        enableCreatedAt: false,
        enableUpdatedAt: false,
        enableSoftDelete: false
      }
      modelHelper.__set__('config', config)

      const mongooseStub = this.stub(mongoose)

      const collectionName = 'user'
      const Schema = {
        add: this.spy(),
        statics: { collectionName: collectionName }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = modelHelper.createModel(Schema, mongooseStub)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notok(Schema.add.called, 'Schema.add not called')
      // </editor-fold>
    })
  )

  t.end()
})

test('model-helper.extendSchemaAssociations', function(t) {
  t.test(
    'model-helper.extendSchemaAssociations extends the original schema if the MANY_MANY association is embedded.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        embedAssociations: true
      }
      modelHelper.__set__('config', config)
      const mongooseStub = this.stub(mongoose)

      const userSchema = {}

      userSchema.statics = {
        routeOptions: {
          associations: {
            groups: {
              type: 'MANY_MANY',
              model: 'group'
            }
          }
        }
      }

      userSchema.add = sinon.spy()

      const extendObject = {
        groups: [
          {
            group: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'group'
            }
          }
        ]
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      modelHelper.extendSchemaAssociations(userSchema, mongooseStub, 'testPath')
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(userSchema.add.called, 'Schema.add was called')
      t.ok(
        userSchema.add.calledWithExactly(extendObject),
        'Schema.add was called with extendObject'
      )
      // </editor-fold>
    })
  )

  t.test(
    'model-helper.extendSchemaAssociations uses linkingModel to extend schema if it exists and the association is embedded.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        embedAssociations: true
      }
      modelHelper.__set__('config', config)
      const mongooseStub = this.stub(mongoose)

      const userSchema = {}

      userSchema.statics = {
        routeOptions: {
          associations: {
            groups: {
              type: 'MANY_MANY',
              model: 'group',
              linkingModel: 'test_linking'
            }
          }
        }
      }

      userSchema.add = sinon.spy()

      const linkingModelFile =
        "let mongoose = require('mongoose');\n\n" +
        'module.exports = function () {\n\n' +
        '  let Types = mongoose.Schema.Types;\n\n' +
        '  let Model = {\n' +
        '      Schema: {\n' +
        '        linkingModel: {\n' +
        '          type: Types.String\n' +
        '        }\n' +
        '      },\n' +
        "      modelName: 'test_linking'\n" +
        '  };\n' +
        '  return Model;\n' +
        '};\n'

      const extendObject = {
        groups: [
          {
            group: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'group'
            },
            linkingModel: {
              type: mongoose.Schema.Types.String
            }
          }
        ]
      }

      const fs = require('fs')
      const mkdirp = require('mkdirp')
      const rmdir = require('rmdir')
      const linkingModelPath = path.join(
        __dirname,
        '/../models_test/linking-models/'
      )
      const linkingModelfileName = linkingModelPath + 'test_linking.model.js'

      mkdirp(linkingModelPath).then(() => {
        const deferred = Q.defer()

        fs.openSync(linkingModelfileName, 'w')

        fs.writeFile(linkingModelfileName, linkingModelFile, function(err) {
          if (err) {
            Log.error(err)
            deferred.reject(err)
          }
          deferred.resolve()
        })

        let linkingModel = {
          Schema: {
            linkingModel: {
              type: Types.ObjectId
            }
          },
          modelName: 'test_linking'
        }

        const linkingModelSchema = new mongoose.Schema(linkingModel.Schema, {
          collection: linkingModel.modelName
        })

        linkingModel = mongoose.model(
          linkingModel.modelName,
          linkingModelSchema
        )
        // </editor-fold>

        deferred.promise.then(function() {
          // <editor-fold desc="Act">
          try {
            modelHelper.extendSchemaAssociations(
              userSchema,
              mongoose,
              path.join(__dirname, '/../models_test')
            )
          } catch (error) {
            Log.error(error)
            throw error
          }
          // </editor-fold>

          // <editor-fold desc="Assert">
          t.ok(
            userSchema.add.calledWithExactly(extendObject),
            'Schema.add was called with extendObject'
          )
          t.deepEqual(
            userSchema.statics.routeOptions.associations.groups.include.through
              .schema,
            linkingModel.schema,
            'linking model schema valid'
          )
          // </editor-fold>

          // <editor-fold desc="Restore">
          // rmdir(path.join(__dirname, "/../models_test");
          // fs.unlinkSync(linkingModelPath);
          delete mongoose.models.test_linking
          delete mongoose.modelSchemas.test_linking
          // </editor-fold>
        })
      })
    })
  )

  t.test(
    'model-helper.extendSchemaAssociations creates a basic linking collection if the MANY_MANY association is not embedded and no linking model is defined.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        embedAssociations: false
      }
      modelHelper.__set__('config', config)

      const userSchema = {}

      userSchema.statics = {
        collectionName: 'user',
        routeOptions: {
          associations: {
            groups: {
              type: 'MANY_MANY',
              model: 'group'
            }
          }
        }
      }

      userSchema.virtual = this.spy()

      const virtualArg = {
        ref: 'user_group',
        localField: '_id',
        foreignField: 'user'
      }

      let linkingModel = { Schema: {} }

      linkingModel.Schema.user = {
        type: Types.ObjectId,
        ref: 'user'
      }
      linkingModel.Schema.group = {
        type: Types.ObjectId,
        ref: 'group'
      }
      const linkingModelSchema = new mongoose.Schema(linkingModel.Schema, {
        collection: 'user_group'
      })

      linkingModel = mongoose.model('user_group', linkingModelSchema)

      // </editor-fold>

      // <editor-fold desc="Act">
      modelHelper.extendSchemaAssociations(userSchema, mongoose, 'testPath')
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        userSchema.virtual.calledWithExactly('groups', virtualArg),
        'Schema.virtual was called with correct args'
      )
      t.deepEqual(
        userSchema.statics.routeOptions.associations.groups.include.through
          .schema,
        linkingModel.schema,
        'linking model schema valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user_group
      delete mongoose.modelSchemas.user_group
      // </editor-fold>
    })
  )

  t.test(
    'model-helper.extendSchemaAssociations creates a linking collection using linking model data if the MANY_MANY association is not embedded and a linking model is defined.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        embedAssociations: false
      }
      modelHelper.__set__('config', config)

      const userSchema = {
        statics: {
          collectionName: 'user'
        }
      }

      userSchema.virtual = this.spy()

      const virtualArg = {
        ref: 'test_linking',
        localField: '_id',
        foreignField: 'user'
      }

      let linkingModel = { Schema: {} }

      linkingModel.Schema.user = {
        type: Types.ObjectId,
        ref: 'user'
      }
      linkingModel.Schema.group = {
        type: Types.ObjectId,
        ref: 'group'
      }
      linkingModel.Schema.linkingModel = {
        type: Types.ObjectId
      }

      const linkingModelSchema = new mongoose.Schema(linkingModel.Schema, {
        collection: 'test_linking'
      })

      linkingModel = mongoose.model('test_linking', linkingModelSchema)

      userSchema.statics = {
        collectionName: 'user',
        routeOptions: {
          associations: {
            groups: {
              type: 'MANY_MANY',
              model: 'group',
              linkingModel: 'test_linking'
            }
          }
        }
      }

      userSchema.add = sinon.spy()

      const rmdir = require('rmdir')
      // </editor-fold>

      // <editor-fold desc="Act">
      try {
        modelHelper.extendSchemaAssociations(
          userSchema,
          mongoose,
          path.join(__dirname, '/../models_test')
        )
      } catch (error) {
        Log.error(error)
        throw error
      }
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        userSchema.virtual.calledWithExactly('groups', virtualArg),
        'Schema.virtual was called with correct args'
      )
      t.deepEqual(
        userSchema.statics.routeOptions.associations.groups.include.through
          .schema,
        linkingModel.schema,
        'linking model schema valid'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      rmdir(path.join(__dirname, '/../models_test'))
      delete mongoose.models.test_linking
      delete mongoose.modelSchemas.test_linking
      // </editor-fold>
    })
  )

  t.test(
    'model-helper.extendSchemaAssociations calls Schema.virtual with correct args if association is ONE_MANY and has a foreignField.',
    function(t) {
      // <editor-fold desc="Arrange">
      const modelHelper = require('../../utilities/model-helper')

      t.plan(3)

      const userSchemaForeignField = {}

      userSchemaForeignField.statics = {
        routeOptions: {
          associations: {
            employees: {
              type: 'ONE_MANY',
              model: 'user',
              foreignField: 'boss'
            }
          }
        }
      }

      const userSchemaNoForeignField = {}

      userSchemaNoForeignField.statics = {
        routeOptions: {
          associations: {
            employees: {
              type: 'ONE_MANY',
              model: 'user'
            }
          }
        }
      }

      userSchemaForeignField.virtual = sinon.spy()
      userSchemaNoForeignField.virtual = sinon.spy()

      const virtualObject = {
        ref: 'user',
        localField: '_id',
        foreignField: 'boss'
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      modelHelper.extendSchemaAssociations(userSchemaForeignField)
      modelHelper.extendSchemaAssociations(userSchemaNoForeignField)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(userSchemaForeignField.virtual.called, 'Schema.virtual was called')
      t.ok(
        userSchemaForeignField.virtual.calledWithExactly(
          'employees',
          virtualObject
        ),
        'Schema.virtual was called with virtualObject'
      )
      t.notOk(
        userSchemaNoForeignField.virtual.called,
        'Schema.virtual was not called'
      )
      // </editor-fold>
    }
  )

  t.test(
    'model-helper.extendSchemaAssociations extends the original schema if the association is _MANY.',
    sinon.test(function(t) {
      // <editor-fold desc="Arrange">
      t.plan(2)

      const modelHelper = rewire('../../utilities/model-helper')
      const config = {
        embedAssociations: true
      }
      modelHelper.__set__('config', config)
      const mongooseStub = this.stub(mongoose)

      const userSchema = {}

      userSchema.statics = {
        routeOptions: {
          associations: {
            hashTags: {
              type: '_MANY',
              model: 'hashTag'
            }
          }
        }
      }

      userSchema.add = sinon.spy()

      const extendObject = {
        hashTags: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: 'hashTag'
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      modelHelper.extendSchemaAssociations(userSchema, mongooseStub, 'testPath')
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(userSchema.add.called, 'Schema.add was called')
      t.ok(
        userSchema.add.calledWithExactly(extendObject),
        'Schema.add was called with extendObject'
      )
      // </editor-fold>
    })
  )

  t.end()
})

test('model-helper.associateModels', function(t) {
  t.test(
    'model-helper.associateModels builds association.include property.',
    function(t) {
      // <editor-fold desc="Arrange">
      const modelHelper = require('../../utilities/model-helper')

      t.plan(6)

      const userSchema = {}

      const groups = {
        type: 'MANY_MANY',
        model: 'group'
      }

      const title = {
        type: 'MANY_ONE',
        model: 'role'
      }

      userSchema.statics = {
        routeOptions: {
          associations: {
            groups: groups,
            title: title
          }
        }
      }

      const models = {
        group: 'testGroup',
        role: 'testRole'
      }

      // </editor-fold>

      // <editor-fold desc="Act">
      modelHelper.associateModels(userSchema, models)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(groups.include, 'groups.include exists')
      t.equals(
        groups.include.model,
        models.group,
        'groups.include.model is correct'
      )
      t.equals(groups.include.as, 'groups', 'groups.include.as is correct')
      t.ok(title.include, 'title.include exists')
      t.equals(
        title.include.model,
        models.role,
        'title.include.model is correct'
      )
      t.equals(title.include.as, 'title', 'title.include.as is correct')
      // </editor-fold>
    }
  )

  t.end()
})
