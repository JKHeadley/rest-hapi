'use strict'

const path = require('path')
const TestHelper = require('../../utilities/test-helper')
const Decache = require('decache')
const Q = require('q')
const Hapi = require('@hapi/hapi')

module.exports = (t, Mongoose, internals, Log) => {
  return t.test('duplicate field tests', function(t) {
    let users = []
    const userProfiles = []
    let roles = []
    let businesses = []
    return (
      Q.when()
        // duplicate fields populate upon creation
        .then(function() {
          return t.test('duplicate fields populate upon creation', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              enableDuplicateFields: true,
              trackDuplicatedFields: true,
              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-3/models'
              )
            }

            const promises = []

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

                  const payload = [
                    {
                      name: 'testBiz1',
                      description: 'A test business1.'
                    },
                    {
                      name: 'testBiz2',
                      description: 'A test business2.'
                    }
                  ]

                  const request = {
                    method: 'POST',
                    url: '/business',
                    params: {},
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  businesses = response.result

                  const payload = [
                    {
                      name: 'User',
                      description: 'A standard user account.',
                      company: businesses[0]._id
                    },
                    {
                      name: 'Admin',
                      description: 'A user with advanced permissions.',
                      company: businesses[1]._id
                    },
                    {
                      name: 'SuperAdmin',
                      description: 'A user with full permissions.'
                    }
                  ]

                  const request = {
                    method: 'POST',
                    url: '/role',
                    params: {},
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  roles = response.result

                  const payload = [
                    {
                      email: 'test@user.com',
                      password: 'root',
                      title: roles[0]._id
                    },
                    {
                      email: 'test@admin1.com',
                      password: 'root',
                      title: roles[1]._id
                    },
                    {
                      email: 'test@admin2.com',
                      password: 'root',
                      title: roles[1]._id
                    },
                    {
                      email: 'test@superadmin.com',
                      password: 'root',
                      title: roles[2]._id
                    }
                  ]

                  const request = {
                    method: 'POST',
                    url: '/user',
                    params: {},
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  users = response.result

                  const payload = {
                    status: 'Enabled',
                    user: users[0]._id
                  }

                  const request = {
                    method: 'POST',
                    url: '/user-profile',
                    params: {},
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  userProfiles.push(response.result)

                  const request = {
                    method: 'GET',
                    url: '/user',
                    params: {},
                    query: { $sort: '_id' },
                    payload: {},
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  promises.push(server.inject(injectOptions))
                })
                .then(function(response) {
                  const request = {
                    method: 'GET',
                    url: '/user-profile',
                    params: {},
                    query: { $sort: '_id' },
                    payload: {},
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  promises.push(server.inject(injectOptions))
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function() {
                  return Promise.all(promises)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.deepEquals(
                    response[0].result.docs[0].titleName,
                    'User',
                    'role:name field populated for user 1'
                  )
                  t.deepEquals(
                    response[0].result.docs[0].summary,
                    roles[0].description,
                    'role:description field populated for user 1'
                  )
                  t.deepEquals(
                    response[0].result.docs[0].businessName,
                    'testBiz1',
                    'role:companyName field populated for user 1'
                  )
                  t.deepEquals(
                    response[0].result.docs[1].titleName,
                    'Admin',
                    'role:name field populated for user 2'
                  )
                  t.deepEquals(
                    response[0].result.docs[1].summary,
                    roles[1].description,
                    'role:description field populated for user 2'
                  )
                  t.deepEquals(
                    response[0].result.docs[1].businessName,
                    'testBiz2',
                    'role:companyName field populated for user 2'
                  )
                  t.deepEquals(
                    response[0].result.docs[2].titleName,
                    'Admin',
                    'role:name field populated for user 3'
                  )
                  t.deepEquals(
                    response[0].result.docs[2].summary,
                    roles[1].description,
                    'role:description field populated for user 3'
                  )
                  t.deepEquals(
                    response[0].result.docs[2].businessName,
                    'testBiz2',
                    'role:companyName field populated for user 3'
                  )
                  t.deepEquals(
                    response[0].result.docs[3].titleName,
                    'SuperAdmin',
                    'role:name field populated for user 4'
                  )
                  t.deepEquals(
                    response[0].result.docs[3].summary,
                    roles[2].description,
                    'role:description field populated for user 4'
                  )
                  t.deepEquals(
                    response[0].result.docs[3].businessName,
                    undefined,
                    'role:companyName field not populated for user 4'
                  )
                  t.deepEquals(
                    response[1].result.docs[0].userEmail,
                    users[0].email,
                    'user:email field populated for user profile'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Decache('../config')
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
        // duplicate fields populate upon update
        .then(function() {
          return t.test('duplicate fields populate upon update', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              enableDuplicateFields: true,
              trackDuplicatedFields: true,
              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-3/models'
              )
            }

            const promises = []

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

                  const payload = {
                    company: businesses[0]._id
                  }

                  const request = {
                    method: 'PUT',
                    url: '/role/{_id}',
                    params: { _id: roles[2]._id },
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  const promise = server.inject(injectOptions)
                  promises.push(promise)
                  return promise
                })
                .then(function() {
                  const payload = {
                    profile: userProfiles[0]._id
                  }

                  const request = {
                    method: 'PUT',
                    url: '/user/{_id}',
                    params: { _id: users[0]._id },
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  const promise = server.inject(injectOptions)
                  promises.push(promise)
                  return promise
                })
                .then(function(response) {
                  const request = {
                    method: 'GET',
                    url: '/user/{_id}',
                    params: { _id: users[3]._id },
                    query: {},
                    payload: {},
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  promises.push(server.inject(injectOptions))
                })

                // </editor-fold>

                // <editor-fold desc="Act">
                .then(function() {
                  return Promise.all(promises)
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.deepEquals(
                    response[0].result.companyName,
                    'testBiz1',
                    'business:name field populated for role 3'
                  )
                  t.deepEquals(
                    response[1].result.state,
                    'Enabled',
                    'userProfile:status field populated for user 1'
                  )
                  t.deepEquals(
                    response[2].result.businessName,
                    'testBiz1',
                    'role:companyName field populated for user 4'
                  )
                })
                // </editor-fold>

                // <editor-fold desc="Restore">
                .then(function() {
                  Decache('../../rest-hapi')

                  Decache('../config')
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
        // duplicated fields track original field upon update
        .then(function() {
          return t.test(
            'duplicated fields track original field upon update',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                enableDuplicateFields: true,
                trackDuplicatedFields: true,
                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                )
              }

              const promises = []

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

                    const payload = {
                      description: 'TEST'
                    }

                    const request = {
                      method: 'PUT',
                      url: '/role/{_id}',
                      params: { _id: roles[1]._id },
                      query: {},
                      payload: payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    const payload = {
                      name: 'testBizChanged'
                    }

                    const request = {
                      method: 'PUT',
                      url: '/business/{_id}',
                      params: { _id: businesses[0]._id },
                      query: {},
                      payload: payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/user',
                      params: {},
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    promises.push(server.inject(injectOptions))
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/role',
                      params: {},
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    promises.push(server.inject(injectOptions))
                  })

                  // </editor-fold>

                  // <editor-fold desc="Act">
                  .then(function() {
                    return Promise.all(promises)
                  })
                  // </editor-fold>

                  // <editor-fold desc="Assert">
                  .then(function(response) {
                    // rearrange results to match original order
                    const result1 = []
                    roles.forEach(function(role) {
                      result1.push(
                        response[1].result.docs.find(function(doc) {
                          return doc._id.toString() === role._id.toString()
                        })
                      )
                    })

                    const result2 = []
                    users.forEach(function(user) {
                      result2.push(
                        response[0].result.docs.find(function(doc) {
                          return doc._id.toString() === user._id.toString()
                        })
                      )
                    })

                    t.deepEquals(
                      result1[0].companyName,
                      'testBizChanged',
                      'business:name field updated for role 1'
                    )
                    t.deepEquals(
                      result1[1].companyName,
                      'testBiz2',
                      'business:name field unchanged for role 2'
                    )

                    t.deepEquals(
                      result2[0].summary,
                      roles[0].description,
                      'role:description field unchanged for user 1'
                    )
                    t.deepEquals(
                      result2[0].businessName,
                      'testBizChanged',
                      'role:companyName field updated for user 1'
                    )
                    t.deepEquals(
                      result2[1].summary,
                      'TEST',
                      'role:description field updated for user 2'
                    )
                    t.deepEquals(
                      result2[1].businessName,
                      'testBiz2',
                      'role:companyName field unchanged for user 2'
                    )
                    t.deepEquals(
                      result2[2].summary,
                      'TEST',
                      'role:description field updated for user 3'
                    )
                    t.deepEquals(
                      result2[2].businessName,
                      'testBiz2',
                      'role:companyName field unchanged for user 3'
                    )
                    t.deepEquals(
                      result2[3].summary,
                      roles[2].description,
                      'role:description field unchanged for user 4'
                    )
                    t.deepEquals(
                      result2[3].businessName,
                      'testBizChanged',
                      'role:companyName field updated for user 1'
                    )
                  })
                  // </editor-fold>

                  // <editor-fold desc="Restore">
                  .then(function() {
                    Decache('../../rest-hapi')

                    Decache('../config')
                    Object.keys(Mongoose.models).forEach(function(key) {
                      delete Mongoose.models[key]
                    })
                    Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                      delete Mongoose.modelSchemas[key]
                    })
                  })
              )
              // </editor-fold>
            }
          )
        })
        // duplicated fields don't track original field when tracking is disabled
        .then(function() {
          return t.test(
            "duplicated fields don't track original field when tracking is disabled",
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                enableDuplicateFields: true,
                trackDuplicatedFields: false,
                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                )
              }

              const promises = []

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

                    const payload = {
                      name: 'testBizChangedAgain'
                    }

                    const request = {
                      method: 'PUT',
                      url: '/business/{_id}',
                      params: { _id: businesses[0]._id },
                      query: {},
                      payload: payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/user',
                      params: {},
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    promises.push(server.inject(injectOptions))
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/role',
                      params: {},
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    promises.push(server.inject(injectOptions))
                  })

                  // </editor-fold>

                  // <editor-fold desc="Act">
                  .then(function() {
                    return Promise.all(promises)
                  })
                  // </editor-fold>

                  // <editor-fold desc="Assert">
                  .then(function(response) {
                    // rearrange results to match original order
                    const result1 = []
                    roles.forEach(function(role) {
                      result1.push(
                        response[1].result.docs.find(function(doc) {
                          return doc._id.toString() === role._id.toString()
                        })
                      )
                    })

                    const result2 = []
                    users.forEach(function(user) {
                      result2.push(
                        response[0].result.docs.find(function(doc) {
                          return doc._id.toString() === user._id.toString()
                        })
                      )
                    })

                    t.deepEquals(
                      result1[0].companyName,
                      'testBizChanged',
                      'business:name field unchanged for role 1'
                    )
                    t.deepEquals(
                      result1[1].companyName,
                      'testBiz2',
                      'business:name field unchanged for role 2'
                    )

                    t.deepEquals(
                      result2[0].businessName,
                      'testBizChanged',
                      'role:companyName field unchanged for user 1'
                    )
                    t.deepEquals(
                      result2[1].businessName,
                      'testBiz2',
                      'role:companyName field unchanged for user 2'
                    )
                    t.deepEquals(
                      result2[2].businessName,
                      'testBiz2',
                      'role:companyName field unchanged for user 3'
                    )
                    t.deepEquals(
                      result2[3].businessName,
                      'testBizChanged',
                      'role:companyName field unchanged for user 1'
                    )
                  })
                  // </editor-fold>

                  // <editor-fold desc="Restore">
                  .then(function() {
                    Decache('../../rest-hapi')

                    Decache('../config')
                    Object.keys(Mongoose.models).forEach(function(key) {
                      delete Mongoose.models[key]
                    })
                    Object.keys(Mongoose.modelSchemas).forEach(function(key) {
                      delete Mongoose.modelSchemas[key]
                    })
                  })
              )
              // </editor-fold>
            }
          )
        })
    )
  })
}
