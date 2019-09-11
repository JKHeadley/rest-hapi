'use strict'

const path = require('path')
const TestHelper = require('../../utilities/test-helper')
const Decache = require('decache')
const Q = require('q')
const Hapi = require('hapi')

module.exports = (t, Mongoose, internals, Log, restore) => {
  return t.test('basic non-embedded association tests', function(t) {
    let users = []
    let userProfiles = []
    let roles = []
    let permissions = []
    let hashtags = []
    return (
      Q.when()
        // ONE_ONE associations work
        .then(function() {
          restore(Mongoose)
          return t.test('ONE_ONE associations work', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-3/models'
              ),
              embedAssociations: false
            }

            RestHapi.config = config

            let user = {}
            let userProfile = {}

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

                  let payload = {
                    email: 'test@user.com',
                    password: 'root'
                  }

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
                  user = response.result

                  let payload = {
                    status: 'Enabled',
                    user: user._id
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
                  userProfile = response.result
                  userProfiles.push(userProfiles)

                  let payload = {
                    profile: userProfile._id
                  }

                  const request = {
                    method: 'PUT',
                    url: '/user/{_id}',
                    params: { _id: user._id },
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  user = response.result
                  users.push(user)

                  const request = {
                    method: 'GET',
                    url: '/user',
                    params: {},
                    query: { $embed: ['profile'] },
                    payload: {},
                    credentials: {},
                    headers: {}
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
                  t.deepEquals(
                    response.result.docs[0].profile,
                    userProfile,
                    'ONE_ONE association correct'
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
        // adding and retrieving ONE_MANY/MANY_ONE associations works
        .then(function() {
          return t.test(
            'adding and retrieving ONE_MANY/MANY_ONE associations works',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                ),
                embedAssociations: false
              }

              let promises = []

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

                    let payload = [
                      {
                        name: 'User',
                        description: 'A standard user account.'
                      },
                      {
                        name: 'Admin',
                        description: 'A user with advanced permissions.'
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
                    roles = roles.concat(response.result)

                    let payload = [
                      {
                        email: 'test@user2.com',
                        password: 'root'
                      },
                      {
                        email: 'test@user3.com',
                        password: 'root'
                      },
                      {
                        email: 'test@admin.com',
                        password: 'root',
                        title: roles[1]._id
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
                    users = users.concat(response.result)

                    const request = {
                      method: 'PUT',
                      url: '/role/{ownerId}/people/{childId}',
                      params: {
                        ownerId: roles[0]._id,
                        childId: users[0]._id
                      },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let payload = [users[1]._id, users[2]._id]

                    const request = {
                      method: 'POST',
                      url: '/role/{ownerId}/people',
                      params: { ownerId: roles[0]._id },
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
                      url: '/role/{_id}',
                      params: { _id: roles[0]._id },
                      query: { $embed: ['users'] },
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
                      url: '/role/{ownerId}/people',
                      params: { ownerId: roles[0]._id },
                      query: { $embed: ['title'] },
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
                      url: '/user',
                      params: {},
                      query: {
                        $embed: ['title'],
                        email: [users[0].email, users[1].email, users[2].email]
                      },
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
                      url: '/user',
                      params: {},
                      query: {
                        email: [users[0].email, users[1].email, users[2].email]
                      },
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
                    // EXPL: rearrange results to match order
                    let result1 = []
                    response[0].result.users.forEach(function(user) {
                      result1.push(
                        response[3].result.docs.find(function(u) {
                          return u.email === user.email
                        })
                      )
                    })
                    let result2 = []
                    response[1].result.docs.forEach(function(user) {
                      result2.push(
                        response[2].result.docs.find(function(u) {
                          return u.email === user.email
                        })
                      )
                    })
                    t.equals(
                      response[0].result.users.length,
                      3,
                      'users length correct 1'
                    )
                    t.equals(
                      response[1].result.docs.length,
                      3,
                      'users length correct 2'
                    )
                    t.equals(
                      response[2].result.docs.length,
                      3,
                      'users length correct 3'
                    )
                    t.equals(
                      response[3].result.docs.length,
                      3,
                      'users length correct 4'
                    )
                    t.deepEquals(
                      response[0].result.users,
                      result1,
                      'ONE_MANY association correct'
                    )
                    t.deepEquals(
                      response[1].result.docs,
                      result2,
                      'MANY_ONE association correct'
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
        // adding and retrieving MANY_MANY associations works
        .then(function() {
          return t.test(
            'adding and retrieving MANY_MANY associations works',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                ),
                embedAssociations: false
              }

              let promises = []

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

                    let payload = [
                      {
                        name: 'root',
                        description: 'Access to all endpoints'
                      },
                      {
                        name: 'create',
                        description: 'Access to all create endpoints'
                      },
                      {
                        name: 'read',
                        description: 'Access to all read endpoints'
                      },
                      {
                        name: 'update',
                        description: 'Access to all update endpoints'
                      },
                      {
                        name: 'delete',
                        description: 'Access to all delete endpoints'
                      },
                      {
                        name: 'associate',
                        description: 'Access to all association endpoints'
                      },
                      {
                        name: 'nothing',
                        description: 'Permission with no use.'
                      }
                    ]

                    const request = {
                      method: 'POST',
                      url: '/permission',
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
                    permissions = permissions.concat(response.result)

                    let payload = [
                      permissions.find(function(p) {
                        return p.name === 'create'
                      })._id,
                      permissions.find(function(p) {
                        return p.name === 'read'
                      })._id,
                      permissions.find(function(p) {
                        return p.name === 'update'
                      })._id,
                      permissions.find(function(p) {
                        return p.name === 'delete'
                      })._id
                    ]

                    const request = {
                      method: 'POST',
                      url: '/role/{ownerId}/permission',
                      params: { ownerId: roles[1]._id },
                      query: {},
                      payload: payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let payload = [
                      {
                        enabled: true,
                        childId: permissions.find(function(p) {
                          return p.name === 'nothing'
                        })._id
                      },
                      {
                        enabled: false,
                        childId: permissions.find(function(p) {
                          return p.name === 'associate'
                        })._id
                      }
                    ]

                    const request = {
                      method: 'POST',
                      url: '/user/{ownerId}/permissions',
                      params: { ownerId: users[0]._id },
                      query: {},
                      payload: payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let childId = permissions.find(function(p) {
                      return p.name === 'root'
                    })._id

                    const request = {
                      method: 'PUT',
                      url: '/role/{ownerId}/permission/{childId}',
                      params: { ownerId: roles[1]._id, childId: childId },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let childId = permissions.find(function(p) {
                      return p.name === 'root'
                    })._id
                    let payload = { enabled: false }
                    const request = {
                      method: 'PUT',
                      url: '/user/{ownerId}/permissions/{childId}',
                      params: { ownerId: users[0]._id, childId: childId },
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
                      url: '/role/{_id}',
                      params: { _id: roles[1]._id },
                      query: { $embed: ['permissions'] },
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
                      url: '/role/{ownerId}/permission',
                      params: { ownerId: roles[1]._id },
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
                      url: '/user/{_id}',
                      params: { _id: users[0]._id },
                      query: { $embed: ['permissions'] },
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
                      url: '/user/{ownerId}/permissions',
                      params: { ownerId: users[0]._id },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    promises.push(server.inject(injectOptions))
                  })
                  .then(function(response) {
                    promises.push(
                      Mongoose.model('user_permission')
                        .find({
                          user: users[0]._id,
                          permission: permissions[0]._id
                        })
                        .exec()
                    )
                  })
                  // </editor-fold>

                  // <editor-fold desc="Act">
                  .then(function() {
                    return Promise.all(promises)
                  })
                  // </editor-fold>

                  // <editor-fold desc="Assert">
                  .then(function(response) {
                    let result1Orig = response[0].result.permissions.map(
                      function(obj) {
                        return obj.permission
                      }
                    )
                    let result2Orig = response[2].result.permissions.map(
                      function(obj) {
                        obj.permission.user_permission = {
                          user: response[2].result._id,
                          enabled: obj.enabled
                        }
                        return obj.permission
                      }
                    )
                    // EXPL: rearrange results to match order
                    let result1 = []
                    response[1].result.docs.forEach(function(permission) {
                      result1.push(
                        result1Orig.find(function(perm) {
                          return perm.name === permission.name
                        })
                      )
                    })
                    let result2 = []
                    response[3].result.docs.forEach(function(permission) {
                      result2.push(
                        result2Orig.find(function(perm) {
                          return perm.name === permission.name
                        })
                      )
                    })
                    t.deepEquals(
                      response[1].result.docs,
                      result1,
                      'MANY_MANY association correct'
                    )
                    t.deepEquals(
                      response[3].result.docs,
                      result2,
                      'MANY_MANY association correct'
                    )
                    t.deepEquals(
                      response[4][0].enabled,
                      false,
                      'MANY_MANY associations in linking collection'
                    )
                  })
                  // </editor-fold>

                  // <editor-fold desc="Restore">
                  .then(function() {
                    Decache('../../rest-hapi')

                    delete Mongoose.models.role
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
        // adding and retrieving _MANY associations works
        .then(function() {
          return t.test(
            'adding and retrieving _MANY associations works',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                ),
                embedAssociations: false
              }

              let promises = []

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

                    let payload = [
                      {
                        text: '#cool'
                      },
                      {
                        text: '#notcool'
                      },
                      {
                        text: '#soso'
                      },
                      {
                        text: '#ilovetags'
                      },
                      {
                        text: '#enough'
                      }
                    ]

                    const request = {
                      method: 'POST',
                      url: '/hashtag',
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
                    hashtags = hashtags.concat(response.result)

                    let payload = {
                      tags: [hashtags[0]._id, hashtags[1]._id]
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

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let payload = {
                      tags: [hashtags[0]._id, hashtags[2]._id, hashtags[4]._id]
                    }

                    const request = {
                      method: 'PUT',
                      url: '/user/{_id}',
                      params: { _id: users[1]._id },
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
                      method: 'PUT',
                      url: '/user/{ownerId}/hashtag/{childId}',
                      params: {
                        ownerId: users[0]._id,
                        childId: hashtags[2]._id
                      },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let payload = [
                      hashtags[2]._id, // NOTE: duplicate, should only be added once
                      hashtags[3]._id
                    ]

                    const request = {
                      method: 'POST',
                      url: '/user/{ownerId}/hashtag',
                      params: { ownerId: users[0]._id },
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
                      url: '/user/{_id}',
                      params: { _id: users[0]._id },
                      query: { $embed: ['tags'] },
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
                      url: '/user/{ownerId}/hashtag',
                      params: { ownerId: users[1]._id },
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
                    let result1 = [
                      hashtags[0],
                      hashtags[1],
                      hashtags[2],
                      hashtags[3]
                    ]
                    let result2 = [hashtags[0], hashtags[2], hashtags[4]]
                    t.deepEquals(
                      response[0].result.tags,
                      result1,
                      '_MANY association correct'
                    )
                    t.deepEquals(
                      response[1].result.docs,
                      result2,
                      '_MANY association correct'
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
        // removing ONE_MANY/MANY_ONE associations works
        .then(function() {
          return t.test(
            'removing ONE_MANY/MANY_ONE associations works',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                ),
                embedAssociations: false
              }

              let promises = []

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
                    const request = {
                      method: 'DELETE',
                      url: '/role/{ownerId}/people/{childId}',
                      params: {
                        ownerId: roles[0]._id,
                        childId: users[0]._id
                      },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let payload = [
                      users[1]._id,
                      users[2]._id,
                      users[3]._id // NOTE: this user doesn't belong to the role, so the association shouldn't be removed from the user
                    ]

                    const request = {
                      method: 'DELETE',
                      url: '/role/{ownerId}/people',
                      params: { ownerId: roles[0]._id },
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
                      url: '/role/{ownerId}/people',
                      params: { ownerId: roles[0]._id },
                      query: { $embed: ['title'] },
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
                  // </editor-fold>

                  // <editor-fold desc="Act">
                  .then(function() {
                    return Promise.all(promises)
                  })
                  // </editor-fold>

                  // <editor-fold desc="Assert">
                  .then(function(response) {
                    let result2 = true
                    let result3 = false
                    response[1].result.docs.forEach(function(user) {
                      if (
                        user.title &&
                        user.title.toString() !== roles[1]._id.toString()
                      ) {
                        result2 = false
                      }
                      if (
                        user.title &&
                        user.title.toString() === roles[1]._id.toString()
                      ) {
                        result3 = true
                      }
                    })
                    t.deepEquals(
                      response[0].result.docs,
                      [],
                      'ONE_MANY associations removed'
                    )
                    t.ok(result2, 'MANY_ONE associations removed')
                    t.ok(result3, 'Admin role not removed')
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
        // removing MANY_MANY associations works
        .then(function() {
          return t.test('removing MANY_MANY associations works', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-3/models'
              ),
              embedAssociations: false
            }

            let promises = []

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
                  let childId = permissions.find(function(p) {
                    return p.name === 'root'
                  })._id

                  const request = {
                    method: 'DELETE',
                    url: '/role/{ownerId}/permission/{childId}',
                    params: { ownerId: roles[1]._id, childId: childId },
                    query: {},
                    payload: {},
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  let childId = permissions.find(function(p) {
                    return p.name === 'root'
                  })._id
                  let payload = { enabled: false }
                  const request = {
                    method: 'DELETE',
                    url: '/user/{ownerId}/permissions/{childId}',
                    params: { ownerId: users[0]._id, childId: childId },
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  let payload = [
                    permissions.find(function(p) {
                      return p.name === 'create'
                    })._id,
                    permissions.find(function(p) {
                      return p.name === 'read'
                    })._id,
                    permissions.find(function(p) {
                      return p.name === 'update'
                    })._id,
                    permissions.find(function(p) {
                      return p.name === 'delete'
                    })._id
                  ]

                  const request = {
                    method: 'DELETE',
                    url: '/role/{ownerId}/permission',
                    params: { ownerId: roles[1]._id },
                    query: {},
                    payload: payload,
                    credentials: {},
                    headers: {}
                  }

                  const injectOptions = TestHelper.mockInjection(request)

                  return server.inject(injectOptions)
                })
                .then(function(response) {
                  let payload = [
                    permissions.find(function(p) {
                      return p.name === 'nothing'
                    })._id,
                    permissions.find(function(p) {
                      return p.name === 'associate'
                    })._id
                  ]

                  const request = {
                    method: 'DELETE',
                    url: '/user/{ownerId}/permissions',
                    params: { ownerId: users[0]._id },
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
                    url: '/role/{ownerId}/permission',
                    params: { ownerId: roles[1]._id },
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
                    url: '/user/{ownerId}/permissions',
                    params: { ownerId: users[0]._id },
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
                    response[0].result.docs,
                    [],
                    'MANY_MANY associations removed'
                  )
                  t.deepEquals(
                    response[1].result.docs,
                    [],
                    'MANY_MANY associations removed'
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
        // removing _MANY associations works
        .then(function() {
          return t.test(
            'removing ONE_MANY/MANY_ONE associations works',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                ),
                embedAssociations: false
              }

              let promises = []

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
                    const request = {
                      method: 'DELETE',
                      url: '/user/{ownerId}/hashtag/{childId}',
                      params: {
                        ownerId: users[0]._id,
                        childId: hashtags[0]._id
                      },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    let payload = [
                      hashtags[1]._id,
                      hashtags[2]._id,
                      hashtags[3]._id
                    ]

                    const request = {
                      method: 'DELETE',
                      url: '/user/{ownerId}/hashtag',
                      params: { ownerId: users[0]._id },
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
                      url: '/user/{ownerId}/hashtag',
                      params: { ownerId: users[0]._id },
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
                      response[0].result.docs,
                      [],
                      '_MANY associations removed'
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

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
    )
  })
}
