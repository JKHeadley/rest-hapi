'use strict'

// Temporarily disabling this rule for tests
/* eslint no-unused-vars: 0 */

const test = require('tape')
const _ = require('lodash')
const sinon = require('sinon')
const rewire = require('rewire')
const mongoose = require('mongoose')
const Types = mongoose.Schema.Types
const logging = require('loggin')
let Log = logging.getLogger('tests')
Log.logLevel = 'ERROR'
Log = Log.bind('query-helper')
const testHelper = require('../../utilities/test-helper')

// TODO: add tests for text search functions
// TODO: add tests for $exclude param
// TODO: add tests for "getReference" code (implied associations)

test('query-helper exists and has expected members', function(t) {
  // <editor-fold desc="Arrange">
  const queryHelper = require('../../utilities/query-helper')

  t.plan(11)
  // </editor-fold>

  // <editor-fold desc="Assert">
  t.ok(queryHelper, 'query-helper exists.')
  t.ok(
    queryHelper.createMongooseQuery,
    'query-helper.createMongooseQuery exists.'
  )
  t.ok(queryHelper.getReadableFields, 'query-helper.getReadableFields exists.')
  t.ok(
    queryHelper.getQueryableFields,
    'query-helper.getQueryableFields exists.'
  )
  t.ok(queryHelper.setSkip, 'query-helper.setSkip exists.')
  t.ok(queryHelper.setLimit, 'query-helper.setLimit exists.')
  t.ok(queryHelper.setPage, 'query-helper.setPage exists.')
  t.ok(queryHelper.paginate, 'query-helper.setPage exists.')
  t.ok(
    queryHelper.populateEmbeddedDocs,
    'query-helper.populateEmbeddedDocs exists.'
  )
  t.ok(queryHelper.setSort, 'query-helper.setSort exists.')
  t.ok(
    queryHelper.createAttributesFilter,
    'query-helper.createAttributesFilter exists.'
  )
  // </editor-fold>
})

test('query-helper.getQueryableFields', function(t) {
  const queryHelper = require('../../utilities/query-helper')
  testHelper.testModelParameter(
    t,
    queryHelper.getQueryableFields,
    'queryHelper.getQueryableFields',
    ['model', 'logger'],
    Log
  )

  t.test(
    'query-helper.getQueryableFields doesn\'t return fields with "queryable" set to false.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(6)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: false
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.getQueryableFields(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(_.isArray(result), 'result is an array')
      t.equal(result.length, 4, 'result has four items')
      t.ok(_.indexOf(result, 'email') > -1, 'result contains email')
      t.ok(_.indexOf(result, 'firstName') > -1, 'result contains firstName')
      t.ok(_.indexOf(result, 'lastName') > -1, 'result contains lastName')
      t.ok(_.indexOf(result, 'password') < 0, "result doesn't contain password")
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.getQueryableFields doesn\'t return fields with "exclude" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(6)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.getQueryableFields(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(_.isArray(result), 'result is an array')
      t.equal(result.length, 4, 'result has four items')
      t.ok(_.indexOf(result, 'email') > -1, 'result contains email')
      t.ok(_.indexOf(result, 'firstName') > -1, 'result contains firstName')
      t.ok(_.indexOf(result, 'lastName') > -1, 'result contains lastName')
      t.ok(_.indexOf(result, 'password') < 0, "result doesn't contain password")
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.getQueryableFields doesn\'t return the fields "__v", or "__t".',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(4)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)

      const fields = userModel.schema.paths
      const fieldNames = Object.keys(fields)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.getQueryableFields(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(_.indexOf(fieldNames, '__v') > -1, 'model contains __v field')
      t.ok(_.indexOf(fieldNames, '_id') > -1, 'model contains _id field')

      t.ok(_.indexOf(result, '__v') < 0, "result doesn't contain __v")
      t.ok(_.indexOf(result, '__t') < 0, "result doesn't contain __t")
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.getQueryableFields returns association fields except for those of type "MANY_MANY".',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(4)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        },
        title: {
          type: Types.ObjectId
        },
        profileImage: {
          type: Types.ObjectId
        },
        groups: {
          type: [Types.ObjectId]
        },
        permissions: {
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
              type: 'MANY_MANY'
            },
            permissions: {
              type: 'MANY_MANY'
            }
          }
        }
      }

      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.getQueryableFields(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(_.indexOf(result, 'title') > -1, 'result contains title')
      t.ok(
        _.indexOf(result, 'profileImage') > -1,
        'result contains profileImage'
      )
      t.ok(_.indexOf(result, 'groups') < 0, "result doesn't contain groups")
      t.ok(
        _.indexOf(result, 'permissions') < 0,
        "result doesn't contain permissions"
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

test('query-helper.getReadableFields', function(t) {
  const queryHelper = require('../../utilities/query-helper')
  testHelper.testModelParameter(
    t,
    queryHelper.getReadableFields,
    'queryHelper.getReadableFields',
    ['model', 'logger'],
    Log
  )

  t.test(
    'query-helper.getReadableFields doesn\'t return fields with "exclude" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(5)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String,
          queryable: false
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.getReadableFields(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(_.isArray(result), 'result is an array')
      t.ok(_.indexOf(result, 'email') > -1, 'result contains email')
      t.ok(_.indexOf(result, 'firstName') > -1, 'result contains firstName')
      t.ok(_.indexOf(result, 'lastName') > -1, 'result contains lastName')
      t.ok(_.indexOf(result, 'password') < 0, "result doesn't contain password")
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.getReadableFields doesn\'t return the field "__v".',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(4)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)

      const fields = userModel.schema.paths
      const fieldNames = Object.keys(fields)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.getReadableFields(userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(_.indexOf(fieldNames, '__v') > -1, 'model contains __v field')
      t.ok(_.indexOf(fieldNames, '_id') > -1, 'model contains _id field')

      t.ok(_.indexOf(result, '__v') < 0, "result doesn't contain __v")
      t.ok(_.indexOf(result, '_id') > -1, 'result contains _id')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.end()
})

test('query-helper.getSortableFields', function(t) {
  const queryHelper = require('../../utilities/query-helper')
  testHelper.testModelParameter(
    t,
    queryHelper.getSortableFields,
    'queryHelper.getSortableFields',
    ['model', 'logger'],
    Log
  )

  t.test('query-helper.getSortableFields calls getReadableFields.', function(
    t
  ) {
    // <editor-fold desc="Arrange">
    const queryHelper = require('../../utilities/query-helper')

    t.plan(1)

    sinon.stub(queryHelper, 'getReadableFields').callsFake(function() {
      return []
    })

    const userSchema = new mongoose.Schema({})

    userSchema.statics = { routeOptions: {} }
    const userModel = mongoose.model('user', userSchema)
    // </editor-fold>

    // <editor-fold desc="Act">
    queryHelper.getSortableFields(userModel, Log)
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.ok(queryHelper.getReadableFields.called, 'getReadableFields called')
    // </editor-fold>

    // <editor-fold desc="Restore">
    queryHelper.getReadableFields.restore()
    delete mongoose.models.user
    delete mongoose.modelSchemas.user
    // </editor-fold>
  })

  t.test('query-helper.getSortableFields returns valid list.', function(t) {
    // <editor-fold desc="Arrange">
    const queryHelper = require('../../utilities/query-helper')

    t.plan(1)

    sinon.stub(queryHelper, 'getReadableFields').callsFake(function() {
      return ['email', 'firstName', 'lastName']
    })

    const userSchema = new mongoose.Schema({})

    userSchema.statics = { routeOptions: {} }
    const userModel = mongoose.model('user', userSchema)
    // </editor-fold>

    // <editor-fold desc="Act">
    const sortableFields = queryHelper.getSortableFields(userModel, Log)
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.deepEqual(
      sortableFields,
      ['-email', 'email', '-firstName', 'firstName', '-lastName', 'lastName'],
      'valid values'
    )
    // </editor-fold>

    // <editor-fold desc="Restore">
    queryHelper.getReadableFields.restore()
    delete mongoose.models.user
    delete mongoose.modelSchemas.user
    // </editor-fold>
  })

  t.end()
})

test('query-helper.setSkip', function(t) {
  t.test(
    'query-helper.setSkip calls the "skip" function with the "$skip" query parameter.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(3)

      const query = { $skip: 3 }
      const mongooseQuery = {}
      mongooseQuery.skip = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.setSkip(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(mongooseQuery.skip.called, 'the skip function was called')
      t.ok(
        mongooseQuery.skip.calledWith(3),
        "the skip function was called with argument '3'"
      )
      t.equals(mongooseQuery, result, 'the mongooseQuery is returned')
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.setSkip doesn\'t call the "skip" function if the "$skip" query parameter is missing.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(2)

      const query = {}
      const mongooseQuery = {}
      mongooseQuery.skip = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.setSkip(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(mongooseQuery.skip.called, 'the skip function was not called')
      t.equals(mongooseQuery, result, 'the mongooseQuery is returned')
      // </editor-fold>
    }
  )

  t.end()
})

test('query-helper.setLimit', function(t) {
  t.test(
    'query-helper.setLimit calls the "limit" function with the "$limit" query parameter.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(3)

      const query = { $limit: 3 }
      const mongooseQuery = {}
      mongooseQuery.limit = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.setLimit(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(mongooseQuery.limit.called, 'the limit function was called')
      t.ok(
        mongooseQuery.limit.calledWith(3),
        "the limit function was called with argument '3'"
      )
      t.equals(mongooseQuery, result, 'the mongooseQuery is returned')
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.setLimit doesn\'t call the "limit" function if the "$limit" query parameter is missing.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(2)

      const query = {}
      const mongooseQuery = {}
      mongooseQuery.limit = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.setLimit(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(mongooseQuery.limit.called, 'the limit function was not called')
      t.equals(mongooseQuery, result, 'the mongooseQuery is returned')
      // </editor-fold>
    }
  )

  t.end()
})

test('query-helper.populateEmbeddedDocs', function(t) {
  t.test(
    'query-helper.populateEmbeddedDocs returns immediately if "$embed" query parameter is missing.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(2)

      const attributesFilter = {}
      const mongooseQuery = {}
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.populateEmbeddedDocs(
        {},
        mongooseQuery,
        attributesFilter,
        {},
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.deepEqual(
        mongooseQuery,
        result.mongooseQuery,
        'mongooseQuery unchanged'
      )
      t.deepEqual(
        attributesFilter,
        result.attributesFilter,
        'attributesFilter unchanged'
      )
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.populateEmbeddedDocs generates populate object and calls "mongooseQuery.populate".',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = rewire('../../utilities/query-helper')

      const nestPopulate = sinon.stub()
      nestPopulate.returns({})
      queryHelper.__set__('nestPopulate', nestPopulate)

      t.plan(4)

      const attributesFilter = {}
      const mongooseQuery = {}
      mongooseQuery.populate = sinon.spy()
      const query = { $embed: ['title', 'profileImage', 'groups'] }
      // </editor-fold>

      // <editor-fold desc="Act">
      queryHelper.populateEmbeddedDocs(
        query,
        mongooseQuery,
        attributesFilter,
        {},
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(nestPopulate.called, 'nestPopulate called')
      t.equals(
        nestPopulate.callCount,
        3,
        'nestPopulate called for each embed parameter'
      )
      t.ok(mongooseQuery.populate.called, 'mongooseQuery.populate called')
      t.equals(
        mongooseQuery.populate.callCount,
        3,
        'mongooseQuery.populate called for each embed parameter'
      )
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.populateEmbeddedDocs returns updated attributesFilter.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = rewire('../../utilities/query-helper')

      const nestPopulate = sinon.stub()
      nestPopulate.returns({})
      queryHelper.__set__('nestPopulate', nestPopulate)

      t.plan(1)

      const attributesFilter = {}
      const mongooseQuery = {}
      mongooseQuery.populate = sinon.spy()
      const query = { $embed: ['title', 'profileImage', 'groups'] }
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.populateEmbeddedDocs(
        query,
        mongooseQuery,
        attributesFilter,
        {},
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notEquals(
        attributesFilter,
        result.attributesFilter,
        'attributesFilter updated'
      )
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.populateEmbeddedDocs deletes appropriate query params when finished.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = rewire('../../utilities/query-helper')

      const nestPopulate = sinon.stub()
      nestPopulate.returns({})
      queryHelper.__set__('nestPopulate', nestPopulate)

      t.plan(2)

      const attributesFilter = {}
      const mongooseQuery = {}
      mongooseQuery.populate = sinon.spy()
      const query = {
        $embed: ['title', 'profileImage', 'groups'],
        populateSelect: ''
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      queryHelper.populateEmbeddedDocs(
        query,
        mongooseQuery,
        attributesFilter,
        {},
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(query.$embed, 'query.$embed deleted')
      t.notOk(query.populateSelect, 'query.populateSelect deleted')
      // </editor-fold>
    }
  )

  t.test('nestPopulate uses query.populateSelect if it exists.', function(t) {
    // <editor-fold desc="Arrange">
    const queryHelper = rewire('../../utilities/query-helper')

    sinon.stub(queryHelper, 'createAttributesFilter').callsFake(sinon.spy())

    const nestPopulate = queryHelper.__get__('nestPopulate')

    t.plan(2)

    const query = {
      $embed: 'title.users.groups,profileImage,groups',
      populateSelect: {
        replace: sinon.spy()
      }
    }

    const embeds = ['title']
    const associations = {
      title: {
        type: {},
        model: {},
        include: {
          model: {}
        }
      }
    }
    // </editor-fold>

    // <editor-fold desc="Act">
    nestPopulate(query, {}, 0, embeds, associations, {}, Log)
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.ok(query.populateSelect.replace.called, 'populateSelect used for select')
    t.notOk(
      queryHelper.createAttributesFilter.called,
      'createAttributesFilter not used for select'
    )
    // </editor-fold>

    // <editor-fold desc="Restore">
    queryHelper.createAttributesFilter.restore()
    // </editor-fold>
  })

  t.test(
    "nestPopulate uses createAttributesFilter if query.populateSelect doesn't exist.",
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = rewire('../../utilities/query-helper')

      sinon.stub(queryHelper, 'createAttributesFilter').callsFake(sinon.spy())

      const nestPopulate = queryHelper.__get__('nestPopulate')

      t.plan(1)

      const query = {}

      const embeds = ['title']
      const associations = {
        title: {
          type: {},
          model: {},
          include: {
            model: {}
          },
          embedAssociation: true
        }
      }
      // </editor-fold>

      // <editor-fold desc="Act">
      nestPopulate(query, {}, 0, embeds, associations, {}, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        queryHelper.createAttributesFilter.called,
        'createAttributesFilter used for select'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      queryHelper.createAttributesFilter.restore()
      // </editor-fold>
    }
  )

  t.test(
    'nestPopulate uses association.model in populatePath if association.type is "MANY_MANY".',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = rewire('../../utilities/query-helper')

      sinon.stub(queryHelper, 'createAttributesFilter').callsFake(sinon.spy())

      const nestPopulate = queryHelper.__get__('nestPopulate')

      t.plan(2)

      const query = {}

      const embeds = ['title']

      const associationsMany = {
        title: {
          type: 'MANY_MANY',
          model: 'role',
          include: {
            model: {}
          },
          embedAssociation: true
        }
      }

      const associationsOne = {
        title: {
          type: 'MANY_ONE',
          model: 'role',
          include: {
            model: {}
          },
          embedAssociation: true
        }
      }

      // </editor-fold>

      // <editor-fold desc="Act">
      const resultMany = nestPopulate(
        query,
        {},
        0,
        embeds,
        associationsMany,
        {},
        Log
      )
      const resultOne = nestPopulate(
        query,
        {},
        0,
        embeds,
        associationsOne,
        {},
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.equals(resultMany.path, 'title.role', 'association.model used in path')
      t.equals(resultOne.path, 'title', 'association.model not used in path')
      // </editor-fold>

      // <editor-fold desc="Restore">
      queryHelper.createAttributesFilter.restore()
      // </editor-fold>
    }
  )

  t.test('nestPopulate handles nested embedding.', function(t) {
    // <editor-fold desc="Arrange">
    const queryHelper = rewire('../../utilities/query-helper')

    const createAttributesFilter = sinon.stub()
    createAttributesFilter.returns('test')

    sinon
      .stub(queryHelper, 'createAttributesFilter')
      .callsFake(createAttributesFilter)

    const nestPopulate = queryHelper.__get__('nestPopulate')

    t.plan(13)

    const query = {}

    const embeds = ['title', 'users', 'one', 'groups', 'teams']

    const associationsFive = {
      teams: {
        type: 'MANY_MANY',
        model: 'team',
        include: {
          model: { routeOptions: { associations: {} } },
          through: { modelName: 'user_team' }
        },
        embedAssociation: false
      }
    }

    const associationsFour = {
      groups: {
        type: 'MANY_MANY',
        model: 'group',
        include: {
          model: { routeOptions: { associations: associationsFive } }
        },
        embedAssociation: true
      }
    }

    const associationsThree = {
      one: {
        type: 'ONE_ONE',
        model: 'one',
        include: {
          model: { routeOptions: { associations: associationsFour } }
        }
      }
    }

    const associationsTwo = {
      users: {
        type: 'ONE_MANY',
        model: 'user',
        include: {
          model: { routeOptions: { associations: associationsThree } }
        }
      }
    }

    const associationsOne = {
      title: {
        type: 'MANY_ONE',
        model: 'role',
        include: {
          model: { routeOptions: { associations: associationsTwo } }
        }
      }
    }

    // </editor-fold>

    // <editor-fold desc="Act">
    const populate = nestPopulate(
      query,
      {},
      0,
      embeds,
      associationsOne,
      {},
      Log
    )
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.equals(populate.path, 'title')
    t.equals(populate.select, 'test users')
    t.equals(populate.populate.path, 'users')
    t.equals(populate.populate.select, 'test one')
    t.equals(populate.populate.populate.path, 'one')
    t.equals(populate.populate.populate.select, 'test groups.group groups')
    t.equals(populate.populate.populate.populate.path, 'groups.group')
    t.equals(populate.populate.populate.populate.select, 'test teams teams')
    t.equals(populate.populate.populate.populate.populate.path, 'teams')
    t.equals(
      populate.populate.populate.populate.populate.select,
      'test team team'
    )
    t.equals(populate.populate.populate.populate.populate.model, 'user_team')
    t.equals(populate.populate.populate.populate.populate.populate.path, 'team')
    t.equals(
      populate.populate.populate.populate.populate.populate.select,
      'test'
    )
    // </editor-fold>

    // <editor-fold desc="Restore">
    queryHelper.createAttributesFilter.restore()
    // </editor-fold>
  })
  t.end()
})

test('query-helper.setSort', function(t) {
  t.test(
    'query-helper.setSort calls the "sort" function with the "$sort" query parameter.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(4)

      const query = { $sort: ['email'] }
      const mongooseQuery = {}
      mongooseQuery.sort = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.setSort(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(mongooseQuery.sort.called, 'the sort function was called')
      t.ok(
        mongooseQuery.sort.calledWith('email'),
        "the sort function was called with argument 'email'"
      )
      t.notOk(query.$sort, "the '$sort' query parameter was deleted")
      t.equals(mongooseQuery, result, 'the mongooseQuery is returned')
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.setSort replaces an array with a space separated string in the "$sort" parameter.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(1)

      const query = { $sort: ['email', 'firstName', 'lastName'] }
      const mongooseQuery = {}
      mongooseQuery.sort = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      queryHelper.setSort(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        mongooseQuery.sort.calledWith('email firstName lastName'),
        'the $sort parameter was modified'
      )
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.setSort doesn\'t call the "sort" function if the "$sort" query parameter is missing.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(2)

      const query = {}
      const mongooseQuery = {}
      mongooseQuery.sort = sinon.spy()
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.setSort(query, mongooseQuery, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.notOk(mongooseQuery.sort.called, 'the sort function was not called')
      t.equals(mongooseQuery, result, 'the mongooseQuery is returned')
      // </editor-fold>
    }
  )

  t.end()
})

test('query-helper.createAttributesFilter', function(t) {
  const queryHelper = require('../../utilities/query-helper')
  testHelper.testModelParameter(
    t,
    queryHelper.createAttributesFilter,
    'queryHelper.createAttributesFilter',
    ['query', 'model', 'Log'],
    Log
  )

  t.test(
    'query-helper.createAttributesFilter doesn\'t return fields with "exclude" set to true.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(1)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.createAttributesFilter({}, userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.equal(result, 'email firstName lastName _id', 'password excluded')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.createAttributesFilter returns association fields except for those of type "MANY_MANY".',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(1)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        },
        title: {
          type: Types.ObjectId
        },
        profileImage: {
          type: Types.ObjectId
        },
        groups: {
          type: [Types.ObjectId]
        },
        permissions: {
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
              type: 'MANY_MANY'
            },
            permissions: {
              type: 'MANY_MANY'
            }
          }
        }
      }

      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.createAttributesFilter({}, userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.equal(
        result,
        'email firstName lastName title profileImage _id',
        'MANY_MANY associations excluded'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.createAttributesFilter only returns fields in "query.$select" if present.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      t.plan(3)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        },
        title: {
          type: Types.ObjectId
        },
        profileImage: {
          type: Types.ObjectId
        },
        groups: {
          type: [Types.ObjectId]
        },
        permissions: {
          type: [Types.ObjectId]
        }
      })

      const query1 = { $select: ['email', 'lastName'] }
      const query2 = { $select: 'email' }

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)
      // </editor-fold>

      // <editor-fold desc="Act">
      const result1 = queryHelper.createAttributesFilter(query1, userModel, Log)
      const result2 = queryHelper.createAttributesFilter(query2, userModel, Log)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.equals(result1, 'email lastName', 'selected fields returned')
      t.equals(result2, 'email', 'selected fields returned')
      t.notOk(query1.$select, '$select property deleted')
      // </editor-fold>

      // <editor-fold desc="Restore">
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.end()
})

test('query-helper.createMongooseQuery', function(t) {
  const queryHelper = require('../../utilities/query-helper')
  testHelper.testModelParameter(
    t,
    queryHelper.createMongooseQuery,
    'queryHelper.createMongooseQuery',
    ['model', 'query', 'mongooseQuery', 'Log'],
    Log
  )

  t.test('query-helper.createMongooseQuery calls correct methods.', function(
    t
  ) {
    // <editor-fold desc="Arrange">
    const queryHelper = require('../../utilities/query-helper')

    const mongooseQuery = {
      select: sinon.spy(),
      where: sinon.spy()
    }
    sinon.stub(queryHelper, 'createAttributesFilter').callsFake(function() {
      return mongooseQuery
    })
    sinon.stub(queryHelper, 'populateEmbeddedDocs').callsFake(function() {
      return mongooseQuery
    })
    sinon.stub(queryHelper, 'setSort').callsFake(function() {
      return mongooseQuery
    })

    t.plan(5)

    const userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        queryable: true
      },
      firstName: {
        type: Types.String,
        queryable: true
      },
      lastName: {
        type: Types.String
      },
      password: {
        type: Types.String,
        queryable: true,
        exclude: true
      }
    })

    userSchema.statics = { routeOptions: {} }
    const userModel = mongoose.model('user', userSchema)

    // </editor-fold>

    // <editor-fold desc="Act">
    const result = queryHelper.createMongooseQuery(
      userModel,
      {},
      mongooseQuery,
      Log
    )
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.ok(
      queryHelper.createAttributesFilter.called,
      'createAttributesFilter called'
    )
    t.ok(queryHelper.populateEmbeddedDocs.called, 'populateEmbeddedDocs called')
    t.ok(queryHelper.setSort.called, 'setSort called')
    t.ok(mongooseQuery.select.called, 'mongooseQuery.select called')
    t.ok(mongooseQuery.where.callCount === 1, 'mongooseQuery.where called once')
    // </editor-fold>

    // <editor-fold desc="Restore">
    queryHelper.createAttributesFilter.restore()
    queryHelper.populateEmbeddedDocs.restore()
    queryHelper.setSort.restore()
    delete mongoose.models.user
    delete mongoose.modelSchemas.user
    // </editor-fold>
  })

  t.test(
    'query-helper.createMongooseQuery transforms field query arrays into mongoose format.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      const mongooseQuery = {
        select: sinon.spy(),
        where: sinon.spy()
      }
      sinon.stub(queryHelper, 'setSkip').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'setLimit').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'createAttributesFilter').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'populateEmbeddedDocs').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'setSort').callsFake(function() {
        return mongooseQuery
      })

      t.plan(2)

      const userSchema = new mongoose.Schema()

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)

      const query1 = { firstName: ['bob', 'bill'] }
      const query2 = { firstName: '["bob","bill"]' }
      // </editor-fold>

      // <editor-fold desc="Act">
      queryHelper.createMongooseQuery(userModel, query1, mongooseQuery, Log)
      queryHelper.createMongooseQuery(userModel, query2, mongooseQuery, Log)
      const call1 = mongooseQuery.where.getCall(0)
      const call2 = mongooseQuery.where.getCall(1)
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        call1.calledWithExactly({ firstName: { $in: ['bob', 'bill'] } }),
        'query transformed correctly'
      )
      t.ok(
        call2.calledWithExactly({ firstName: { $in: ['bob', 'bill'] } }),
        'query transformed correctly'
      )
      // </editor-fold>

      // <editor-fold desc="Restore">
      queryHelper.setSkip.restore()
      queryHelper.setLimit.restore()
      queryHelper.createAttributesFilter.restore()
      queryHelper.populateEmbeddedDocs.restore()
      queryHelper.setSort.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.test(
    'query-helper.createMongooseQuery calls mongooseQuery.where twice if "$where" parameter exists.',
    function(t) {
      // <editor-fold desc="Arrange">
      const queryHelper = require('../../utilities/query-helper')

      const mongooseQuery = {
        select: sinon.spy(),
        where: sinon.spy()
      }
      sinon.stub(queryHelper, 'setSkip').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'setLimit').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'createAttributesFilter').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'populateEmbeddedDocs').callsFake(function() {
        return mongooseQuery
      })
      sinon.stub(queryHelper, 'setSort').callsFake(function() {
        return mongooseQuery
      })

      t.plan(2)

      const userSchema = new mongoose.Schema({
        email: {
          type: Types.String,
          queryable: true
        },
        firstName: {
          type: Types.String,
          queryable: true
        },
        lastName: {
          type: Types.String
        },
        password: {
          type: Types.String,
          queryable: true,
          exclude: true
        }
      })

      userSchema.statics = { routeOptions: {} }
      const userModel = mongoose.model('user', userSchema)

      const query = { $where: {} }
      // </editor-fold>

      // <editor-fold desc="Act">
      const result = queryHelper.createMongooseQuery(
        userModel,
        query,
        mongooseQuery,
        Log
      )
      // </editor-fold>

      // <editor-fold desc="Assert">
      t.ok(
        mongooseQuery.where.callCount === 2,
        'mongooseQuery.where called twice'
      )
      t.notOk(query.$where, 'query.$where deleted')
      // </editor-fold>

      // <editor-fold desc="Restore">
      queryHelper.setSkip.restore()
      queryHelper.setLimit.restore()
      queryHelper.createAttributesFilter.restore()
      queryHelper.populateEmbeddedDocs.restore()
      queryHelper.setSort.restore()
      delete mongoose.models.user
      delete mongoose.modelSchemas.user
      // </editor-fold>
    }
  )

  t.end()
})

test('query-helper.paginate', function(t) {
  t.test('query-helper.paginate calls correct methods.', function(t) {
    // <editor-fold desc="Arrange">
    const queryHelper = require('../../utilities/query-helper')

    const mongooseQuery = {
      select: sinon.spy(),
      where: sinon.spy()
    }
    sinon.stub(queryHelper, 'setLimit').callsFake(function() {
      return mongooseQuery
    })
    sinon.stub(queryHelper, 'setSkip').callsFake(function() {
      return mongooseQuery
    })
    sinon.stub(queryHelper, 'setPage').callsFake(function() {
      return mongooseQuery
    })

    t.plan(3)

    const userSchema = new mongoose.Schema({
      email: {
        type: Types.String,
        queryable: true
      },
      firstName: {
        type: Types.String,
        queryable: true
      },
      lastName: {
        type: Types.String
      },
      password: {
        type: Types.String,
        queryable: true,
        exclude: true
      }
    })

    userSchema.statics = { routeOptions: {} }
    const userModel = mongoose.model('user', userSchema)

    // </editor-fold>

    // <editor-fold desc="Act">
    queryHelper.paginate({ $page: 1 }, mongooseQuery, Log)
    queryHelper.paginate({}, mongooseQuery, Log)
    // </editor-fold>

    // <editor-fold desc="Assert">
    t.ok(
      queryHelper.setLimit.callCount === 2,
      'queryHelper.setLimit called twice'
    )
    t.ok(queryHelper.setSkip.callCount === 1, 'queryHelper.setSkip called once')
    t.ok(queryHelper.setPage.callCount === 1, 'queryHelper.setPage called once')
    // </editor-fold>

    // <editor-fold desc="Restore">
    queryHelper.setLimit.restore()
    queryHelper.setSkip.restore()
    queryHelper.setPage.restore()
    delete mongoose.models.user
    delete mongoose.modelSchemas.user
    // </editor-fold>
  })

  t.end()
})
