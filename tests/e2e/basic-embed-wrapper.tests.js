'use strict'

const path = require('path')
const TestHelper = require('../../utilities/test-helper')
const Decache = require('decache')
const Q = require('q')
const Hapi = require('@hapi/hapi')
const { payload } = require('@hapi/hapi/lib/validation')
const { enableResponseFail } = require('../../config')

module.exports = (t, Mongoose, internals, Log) => {
  return t.test('basic embedded association tests (WRAPPER)', function(t) {
    let users = []
    let userProfiles = []
    let roles = []
    let permissions = []
    let hashtags = []
    return (
      Q.when()
        // ONE_ONE associations work
        .then(function() {
          // For some reason the models don't always get deleted properly on the previous tests
          Object.keys(Mongoose.models).forEach(function(key) {
            delete Mongoose.models[key]
          })

          return t.test('ONE_ONE associations work', function(t) {
            // <editor-fold desc="Arrange">
            const RestHapi = require('../../rest-hapi')
            const server = Hapi.Server()

            const config = {
              loglevel: 'ERROR',
              absoluteModelPath: true,

              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-3/models'
              ),
              embedAssociations: true
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

                  return RestHapi.create({
                    model: 'user',
                    payload: {
                      email: 'test@user.com',
                      password: 'root'
                    },
                    restCall: false
                  })
                })
                .then(function(response) {
                  user = response

                  return RestHapi.create({
                    model: 'userProfile',
                    payload: {
                      status: 'Enabled',
                      user: user._id
                    },
                    restCall: false
                  })
                })
                .then(function(response) {
                  userProfile = response
                  userProfiles.push(userProfiles)

                  return RestHapi.update({
                    model: 'user',
                    _id: user._id,
                    payload: {
                      profile: userProfile._id
                    },
                    restCall: false
                  })
                })
                .then(function(response) {
                  user = response
                  users.push(user)

                  return RestHapi.list({
                    model: 'user',
                    query: { $embed: ['profile'] },
                    restCall: false
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  t.deepEquals(
                    response.docs[0].profile,
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
        // // adding and retrieving ONE_MANY/MANY_ONE associations works
        // .then(function() {
        //   return t.test(
        //     'adding and retrieving ONE_MANY/MANY_ONE associations works',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-3/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       const promises = []

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function() {
        //             server.start()

        //             const payload = [
        //               {
        //                 name: 'User',
        //                 description: 'A standard user account.'
        //               },
        //               {
        //                 name: 'Admin',
        //                 description: 'A user with advanced permissions.'
        //               },
        //               {
        //                 name: 'SuperAdmin',
        //                 description: 'A user with full permissions.'
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'role',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             roles = roles.concat(response)

        //             const payload = [
        //               {
        //                 email: 'test@user2.com',
        //                 password: 'root'
        //               },
        //               {
        //                 email: 'test@user3.com',
        //                 password: 'root'
        //               },
        //               {
        //                 email: 'test@admin.com',
        //                 password: 'root',
        //                 title: roles[1]._id
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'user',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             users = users.concat(response)

        //             return RestHapi.addOne({
        //               ownerModel: 'role',
        //               childModel: 'user',
        //               associationName: 'users',
        //               ownerId: roles[0]._id,
        //               childId: users[0]._id,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const payload = [users[1]._id, users[2]._id]

        //             return RestHapi.addMany({
        //               ownerModel: 'role',
        //               childModel: 'user',
        //               associationName: 'users',
        //               ownerId: roles[0]._id,
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             promises.push(
        //               RestHapi.find({
        //                 model: 'role',
        //                 _id: roles[0]._id,
        //                 query: { $embed: ['users'] },
        //                 restCall: false
        //               })
        //             )
        //           })
        //           .then(function(response) {
        //             promises.push(
        //               RestHapi.getAll({
        //                 ownerModel: 'role',
        //                 childModel: 'user',
        //                 associationName: 'users',
        //                 ownerId: roles[0]._id,
        //                 query: { $embed: ['title'] },
        //                 restCall: false
        //               })
        //             )
        //           })
        //           .then(function(response) {
        //             promises.push(
        //               RestHapi.list({
        //                 model: 'user',
        //                 _id: roles[0]._id,
        //                 query: {
        //                   $embed: ['title'],
        //                   email: [
        //                     users[0].email,
        //                     users[1].email,
        //                     users[2].email
        //                   ]
        //                 },
        //                 restCall: false
        //               })
        //             )
        //           })
        //           .then(function(response) {
        //             promises.push(
        //               RestHapi.list({
        //                 model: 'user',
        //                 _id: roles[0]._id,
        //                 query: {
        //                   email: [
        //                     users[0].email,
        //                     users[1].email,
        //                     users[2].email
        //                   ]
        //                 },
        //                 restCall: false
        //               })
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Act">
        //           .then(function() {
        //             return Promise.all(promises)
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Assert">
        //           .then(function(response) {
        //             // EXPL: rearrange results to match order
        //             const result1 = []
        //             response[0].users.forEach(function(user) {
        //               result1.push(
        //                 response[3].docs.find(function(u) {
        //                   return u.email === user.email
        //                 })
        //               )
        //             })
        //             const result2 = []
        //             response[1].docs.forEach(function(user) {
        //               result2.push(
        //                 response[2].docs.find(function(u) {
        //                   return u.email === user.email
        //                 })
        //               )
        //             })
        //             t.equals(
        //               response[0].users.length,
        //               3,
        //               'users length correct 1'
        //             )
        //             t.equals(
        //               response[1].docs.length,
        //               3,
        //               'users length correct 2'
        //             )
        //             t.equals(
        //               response[2].docs.length,
        //               3,
        //               'users length correct 3'
        //             )
        //             t.equals(
        //               response[3].docs.length,
        //               3,
        //               'users length correct 4'
        //             )
        //             t.deepEquals(
        //               response[0].users,
        //               result1,
        //               'ONE_MANY association correct'
        //             )
        //             t.deepEquals(
        //               response[1].docs,
        //               result2,
        //               'MANY_ONE association correct'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')

        //             // NOTE: We decache mongoose here instead of clearing the schemas to prevent an
        //             // undefined schema bug in mongoose arrays that only seems to appear in the next
        //             // test.
        //             Decache('mongoose')
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // adding and retrieving MANY_MANY associations works
        // .then(function() {
        //   return t.test(
        //     'adding and retrieving MANY_MANY associations works',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       Mongoose = require('mongoose')
        //       Mongoose.Promise = Promise
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-3/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       const promises = []

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function() {
        //             server.start()

        //             const payload = [
        //               {
        //                 name: 'root',
        //                 description: 'Access to all endpoints'
        //               },
        //               {
        //                 name: 'create',
        //                 description: 'Access to all create endpoints'
        //               },
        //               {
        //                 name: 'read',
        //                 description: 'Access to all read endpoints'
        //               },
        //               {
        //                 name: 'update',
        //                 description: 'Access to all update endpoints'
        //               },
        //               {
        //                 name: 'delete',
        //                 description: 'Access to all delete endpoints'
        //               },
        //               {
        //                 name: 'associate',
        //                 description: 'Access to all association endpoints'
        //               },
        //               {
        //                 name: 'nothing',
        //                 description: 'Permission with no use.'
        //               }
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/permission',
        //               params: {},
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             permissions = permissions.concat(response.result)

        //             const payload = [
        //               permissions.find(function(p) {
        //                 return p.name === 'create'
        //               })._id,
        //               permissions.find(function(p) {
        //                 return p.name === 'read'
        //               })._id,
        //               permissions.find(function(p) {
        //                 return p.name === 'update'
        //               })._id,
        //               permissions.find(function(p) {
        //                 return p.name === 'delete'
        //               })._id
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/role/{ownerId}/permission',
        //               params: { ownerId: roles[1]._id },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               {
        //                 enabled: true,
        //                 childId: permissions.find(function(p) {
        //                   return p.name === 'nothing'
        //                 })._id
        //               },
        //               {
        //                 enabled: false,
        //                 childId: permissions.find(function(p) {
        //                   return p.name === 'associate'
        //                 })._id
        //               }
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/user/{ownerId}/permissions',
        //               params: { ownerId: users[0]._id },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const childId = permissions.find(function(p) {
        //               return p.name === 'root'
        //             })._id

        //             const request = {
        //               method: 'PUT',
        //               url: '/role/{ownerId}/permission/{childId}',
        //               params: { ownerId: roles[1]._id, childId: childId },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const childId = permissions.find(function(p) {
        //               return p.name === 'root'
        //             })._id
        //             const payload = { enabled: false }
        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{ownerId}/permissions/{childId}',
        //               params: { ownerId: users[0]._id, childId: childId },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role/{_id}',
        //               params: { _id: roles[1]._id },
        //               query: { $embed: ['permissions'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role/{ownerId}/permission',
        //               params: { ownerId: roles[1]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: { $embed: ['permissions'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{ownerId}/permissions',
        //               params: { ownerId: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           .then(function(response) {
        //             promises.push(
        //               Mongoose.model('user')
        //                 .find({ _id: users[0]._id })
        //                 .exec()
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Act">
        //           .then(function() {
        //             return Promise.all(promises)
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Assert">
        //           .then(function(response) {
        //             const result1Orig = response[0].result.permissions.map(
        //               function(obj) {
        //                 return obj.permission
        //               }
        //             )
        //             const result2Orig = response[2].result.permissions.map(
        //               function(obj) {
        //                 obj.permission.user_permission = {
        //                   enabled: obj.enabled
        //                 }
        //                 return obj.permission
        //               }
        //             )
        //             // EXPL: rearrange results to match order
        //             const result1 = []
        //             response[1].result.docs.forEach(function(permission) {
        //               result1.push(
        //                 result1Orig.find(function(perm) {
        //                   return perm.name === permission.name
        //                 })
        //               )
        //             })
        //             const result2 = []
        //             response[3].result.docs.forEach(function(permission) {
        //               result2.push(
        //                 result2Orig.find(function(perm) {
        //                   return perm.name === permission.name
        //                 })
        //               )
        //             })
        //             t.deepEquals(
        //               response[1].result.docs,
        //               result1,
        //               'MANY_MANY association correct'
        //             )
        //             t.deepEquals(
        //               response[3].result.docs,
        //               result2,
        //               'MANY_MANY association correct'
        //             )
        //             t.deepEquals(
        //               response[4][0].permissions[0].enabled,
        //               true,
        //               'MANY_MANY associations embedded'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // adding and retrieving _MANY associations works
        // .then(function() {
        //   return t.test(
        //     'adding and retrieving _MANY associations works',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-3/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       const promises = []

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function() {
        //             server.start()

        //             const payload = [
        //               {
        //                 text: '#cool'
        //               },
        //               {
        //                 text: '#notcool'
        //               },
        //               {
        //                 text: '#soso'
        //               },
        //               {
        //                 text: '#ilovetags'
        //               },
        //               {
        //                 text: '#enough'
        //               }
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/hashtag',
        //               params: {},
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             hashtags = hashtags.concat(response.result)

        //             const payload = {
        //               tags: [hashtags[0]._id, hashtags[1]._id]
        //             }

        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const payload = {
        //               tags: [hashtags[0]._id, hashtags[2]._id, hashtags[4]._id]
        //             }

        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{_id}',
        //               params: { _id: users[1]._id },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{ownerId}/hashtag/{childId}',
        //               params: {
        //                 ownerId: users[0]._id,
        //                 childId: hashtags[2]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               hashtags[2]._id, // NOTE: duplicate, should only be added once
        //               hashtags[3]._id
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/user/{ownerId}/hashtag',
        //               params: { ownerId: users[0]._id },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: { $embed: ['tags'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{ownerId}/hashtag',
        //               params: { ownerId: users[1]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Act">
        //           .then(function() {
        //             return Promise.all(promises)
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Assert">
        //           .then(function(response) {
        //             const result1 = [
        //               hashtags[0],
        //               hashtags[1],
        //               hashtags[2],
        //               hashtags[3]
        //             ]
        //             const result2 = [hashtags[0], hashtags[2], hashtags[4]]
        //             t.deepEquals(
        //               response[0].result.tags,
        //               result1,
        //               '_MANY association correct'
        //             )
        //             t.deepEquals(
        //               response[1].result.docs,
        //               result2,
        //               '_MANY association correct'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // removing ONE_MANY/MANY_ONE associations works
        // .then(function() {
        //   return t.test(
        //     'removing ONE_MANY/MANY_ONE associations works',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-3/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       const promises = []

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             return RestHapi.removeOne({
        //               ownerModel: 'role',
        //               ownerId: roles[0]._id,
        //               childModel: 'user',
        //               childId: users[0]._id,
        //               associationName: 'users',
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               users[1]._id,
        //               users[2]._id,
        //               users[3]._id // NOTE: this user doesn't belong to the role, so the association shouldn't be removed from the user
        //             ]

        //             return RestHapi.removeMany({
        //               ownerModel: 'role',
        //               ownerId: roles[0]._id,
        //               childModel: 'user',
        //               associationName: 'users',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role/{ownerId}/people',
        //               params: { ownerId: roles[0]._id },
        //               query: { $embed: ['title'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user',
        //               params: {},
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Act">
        //           .then(function() {
        //             return Promise.all(promises)
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Assert">
        //           .then(function(response) {
        //             let result2 = true
        //             let result3 = false
        //             response[1].result.docs.forEach(function(user) {
        //               if (
        //                 user.title &&
        //                 user.title.toString() !== roles[1]._id.toString()
        //               ) {
        //                 result2 = false
        //               }
        //               if (
        //                 user.title &&
        //                 user.title.toString() === roles[1]._id.toString()
        //               ) {
        //                 result3 = true
        //               }
        //             })
        //             t.deepEquals(
        //               response[0].result.docs,
        //               [],
        //               'ONE_MANY associations removed'
        //             )
        //             t.ok(result2, 'MANY_ONE associations removed')
        //             t.ok(result3, 'Admin role not removed')
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             delete Mongoose.models.role
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // removing MANY_MANY associations works
        // .then(function() {
        //   return t.test('removing MANY_MANY associations works', function(t) {
        //     // <editor-fold desc="Arrange">
        //     const RestHapi = require('../../rest-hapi')
        //     const server = new Hapi.Server()

        //     const config = {
        //       loglevel: 'ERROR',
        //       absoluteModelPath: true,

        //       modelPath: path.join(
        //         __dirname,
        //         '/test-scenarios/scenario-3/models'
        //       ),
        //       embedAssociations: true
        //     }

        //     const promises = []

        //     RestHapi.config = config

        //     return (
        //       server
        //         .register({
        //           plugin: RestHapi,
        //           options: {
        //             mongoose: Mongoose,
        //             config: config
        //           }
        //         })
        //         .then(function(response) {
        //           const childId = permissions.find(function(p) {
        //             return p.name === 'root'
        //           })._id

        //           const request = {
        //             method: 'DELETE',
        //             url: '/role/{ownerId}/permission/{childId}',
        //             params: { ownerId: roles[1]._id, childId: childId },
        //             query: {},
        //             payload: {},
        //             credentials: {},
        //             headers: {}
        //           }

        //           const injectOptions = TestHelper.mockInjection(request)

        //           return server.inject(injectOptions)
        //         })
        //         .then(function(response) {
        //           const childId = permissions.find(function(p) {
        //             return p.name === 'root'
        //           })._id
        //           const payload = { enabled: false }
        //           const request = {
        //             method: 'DELETE',
        //             url: '/user/{ownerId}/permissions/{childId}',
        //             params: { ownerId: users[0]._id, childId: childId },
        //             query: {},
        //             payload: payload,
        //             credentials: {},
        //             headers: {}
        //           }

        //           const injectOptions = TestHelper.mockInjection(request)

        //           return server.inject(injectOptions)
        //         })
        //         .then(function(response) {
        //           const payload = [
        //             permissions.find(function(p) {
        //               return p.name === 'create'
        //             })._id,
        //             permissions.find(function(p) {
        //               return p.name === 'read'
        //             })._id,
        //             permissions.find(function(p) {
        //               return p.name === 'update'
        //             })._id,
        //             permissions.find(function(p) {
        //               return p.name === 'delete'
        //             })._id
        //           ]

        //           const request = {
        //             method: 'DELETE',
        //             url: '/role/{ownerId}/permission',
        //             params: { ownerId: roles[1]._id },
        //             query: {},
        //             payload: payload,
        //             credentials: {},
        //             headers: {}
        //           }

        //           const injectOptions = TestHelper.mockInjection(request)

        //           return server.inject(injectOptions)
        //         })
        //         .then(function(response) {
        //           const payload = [
        //             permissions.find(function(p) {
        //               return p.name === 'nothing'
        //             })._id,
        //             permissions.find(function(p) {
        //               return p.name === 'associate'
        //             })._id
        //           ]

        //           const request = {
        //             method: 'DELETE',
        //             url: '/user/{ownerId}/permissions',
        //             params: { ownerId: users[0]._id },
        //             query: {},
        //             payload: payload,
        //             credentials: {},
        //             headers: {}
        //           }

        //           const injectOptions = TestHelper.mockInjection(request)

        //           return server.inject(injectOptions)
        //         })
        //         .then(function(response) {
        //           const request = {
        //             method: 'GET',
        //             url: '/role/{ownerId}/permission',
        //             params: { ownerId: roles[1]._id },
        //             query: {},
        //             payload: {},
        //             credentials: {},
        //             headers: {}
        //           }

        //           const injectOptions = TestHelper.mockInjection(request)

        //           promises.push(server.inject(injectOptions))
        //         })
        //         .then(function(response) {
        //           const request = {
        //             method: 'GET',
        //             url: '/user/{ownerId}/permissions',
        //             params: { ownerId: users[0]._id },
        //             query: {},
        //             payload: {},
        //             credentials: {},
        //             headers: {}
        //           }

        //           const injectOptions = TestHelper.mockInjection(request)

        //           promises.push(server.inject(injectOptions))
        //         })
        //         // </editor-fold>

        //         // <editor-fold desc="Act">
        //         .then(function() {
        //           return Promise.all(promises)
        //         })
        //         // </editor-fold>

        //         // <editor-fold desc="Assert">
        //         .then(function(response) {
        //           t.deepEquals(
        //             response[0].result.docs,
        //             [],
        //             'MANY_MANY associations removed'
        //           )
        //           t.deepEquals(
        //             response[1].result.docs,
        //             [],
        //             'MANY_MANY associations removed'
        //           )
        //         })
        //         // </editor-fold>

        //         // <editor-fold desc="Restore">
        //         .then(function() {
        //           Decache('../../rest-hapi')

        //           Decache('../config')
        //           Object.keys(Mongoose.models).forEach(function(key) {
        //             delete Mongoose.models[key]
        //           })
        //           Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //             key
        //           ) {
        //             delete Mongoose?.modelSchemas[key]
        //           })
        //         })
        //     )
        //     // </editor-fold>
        //   })
        // })
        // // removing _MANY associations works
        // .then(function() {
        //   return t.test(
        //     'removing ONE_MANY/MANY_ONE associations works',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-3/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       const promises = []

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/user/{ownerId}/hashtag/{childId}',
        //               params: {
        //                 ownerId: users[0]._id,
        //                 childId: hashtags[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               hashtags[1]._id,
        //               hashtags[2]._id,
        //               hashtags[3]._id
        //             ]

        //             const request = {
        //               method: 'DELETE',
        //               url: '/user/{ownerId}/hashtag',
        //               params: { ownerId: users[0]._id },
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{ownerId}/hashtag',
        //               params: { ownerId: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             promises.push(server.inject(injectOptions))
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Act">
        //           .then(function() {
        //             return Promise.all(promises)
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Assert">
        //           .then(function(response) {
        //             t.deepEquals(
        //               response[0].result.docs,
        //               [],
        //               '_MANY associations removed'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })

        //             // return Mongoose.connection.db.dropDatabase()
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete defaults to 'RESTRICT' for required ONE_MANY foreign keys
        // .then(function() {
        //   return t.test(
        //     'onDelete defaults to "RESTRICT" for required ONE_MANY foreign keys',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-7/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'PUT',
        //               url: '/role/{ownerId}/people/{childId}',
        //               params: {
        //                 ownerId: roles[0]._id,
        //                 childId: users[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/role/{_id}',
        //               params: {
        //                 _id: roles[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             t.deepEquals(
        //               response.result,
        //               {
        //                 statusCode: 400,
        //                 error: 'Bad Request',
        //                 message:
        //                   'Cannot delete document due to referrential restrictions.'
        //               },
        //               'restrict causes error on delete'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete defaults to 'SET_NULL' for optional ONE_MANY foreign keys
        // .then(function() {
        //   return t.test(
        //     'onDelete defaults to "SET_NULL" for optional ONE_MANY foreign keys',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-3/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role',
        //               params: {
        //                 // _id: roles[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/role/{_id}',
        //               params: {
        //                 _id: roles[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{_id}',
        //               params: {
        //                 _id: users[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             t.deepEquals(
        //               response.result.title,
        //               null,
        //               'title is set to null'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete defaults to 'RESTRICT' for required ONE_ONE references
        // .then(function() {
        //   return t.test(
        //     'onDelete defaults to "RESTRICT" for required ONE_ONE references',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-7/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const secondProfile = {
        //               status: 'foo',
        //               user: users[0]._id
        //             }
        //             const request = {
        //               method: 'POST',
        //               url: '/user-profile',
        //               params: {},
        //               query: {},
        //               payload: { ...secondProfile },
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             t.deepEquals(
        //               response.result,
        //               {
        //                 statusCode: 400,
        //                 error: 'Bad Request',
        //                 message:
        //                   'Cannot delete document due to referrential restrictions.'
        //               },
        //               'error from restriction on delete'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete defaults to 'SET_NULL' for optional ONE_ONE references
        // .then(function() {
        //   return t.test(
        //     'onDelete defaults to "SET_NULL" for optional ONE_ONE references',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-7/models'
        //         ),
        //         embedAssociations: true
        //       }

        //       RestHapi.config = config

        //       let userProfile

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user-profile',
        //               params: {},
        //               query: { status: 'foo' },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             userProfile = response.result.docs[0]

        //             // NOTE: We add a title here as well since it is required in this scenario

        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {
        //                 title: roles[1]._id,
        //                 secondProfile: userProfile._id
        //               },
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/user-profile/{_id}',
        //               params: { _id: userProfile._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             t.deepEquals(
        //               response.result.secondProfile,
        //               null,
        //               'secondProfile set to null'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete 'CASCADE' for ONE_ONE references deletes the referrent document (soft delete)
        // .then(function() {
        //   return t.test(
        //     'onDelete "CASCADE" for ONE_ONE references deletes the referrent document (soft delete)',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-8/models'
        //         ),
        //         embedAssociations: true,
        //         enableSoftDelete: true
        //       }

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user',
        //               params: {},
        //               query: {
        //                 $embed: [
        //                   'firstProfile',
        //                   'secondProfile',
        //                   'thirdProfile'
        //                 ]
        //               },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             users = response.result.docs

        //             const request = {
        //               method: 'POST',
        //               url: '/user-profile',
        //               params: {},
        //               query: {},
        //               payload: [
        //                 {
        //                   status: 'foo',
        //                   user: users[0]._id
        //                 },
        //                 {
        //                   status: 'bar',
        //                   user: users[0]._id
        //                 },
        //                 {
        //                   status: 'baz',
        //                   user: users[1]._id
        //                 }
        //               ],
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user-profile',
        //               params: {},
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             userProfiles = response.result.docs
        //             // assert that 4 user profiles exist
        //             t.equals(response.result.docs.length, 4, '4 profiles exist')
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {
        //                 firstProfile: userProfiles[0]._id,
        //                 secondProfile: userProfiles[1]._id,
        //                 thirdProfile: userProfiles[2]._id
        //               },
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{_id}',
        //               params: { _id: users[1]._id },
        //               query: {},
        //               payload: {
        //                 firstProfile: userProfiles[3]._id
        //               },
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user-profile',
        //               params: {},
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             userProfiles = response.result.docs
        //             // assert that at least 1 user profile has been soft deleted
        //             t.ok(
        //               userProfiles.some(x => x.isDeleted),
        //               'at least 1 user profile has been soft deleted'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete 'CASCADE' for ONE_ONE references deletes the referrent document (hard delete)
        // .then(function() {
        //   return t.test(
        //     'onDelete "CASCADE" for ONE_ONE references deletes the referrent document (hard delete)',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-8/models'
        //         ),
        //         embedAssociations: true,
        //         enableSoftDelete: false
        //       }

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user',
        //               params: {},
        //               query: {
        //                 $embed: [
        //                   'firstProfile',
        //                   'secondProfile',
        //                   'thirdProfile'
        //                 ]
        //               },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             users = response.result.docs
        //             const request = {
        //               method: 'GET',
        //               url: '/user-profile',
        //               params: {},
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             userProfiles = response.result.docs
        //             // assert that 4 user profiles exist
        //             t.equals(
        //               response.result.docs.length,
        //               4,
        //               '4 user profiles exist'
        //             )
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'PUT',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: { firstProfile: userProfiles[0]._id },
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/user/{_id}',
        //               params: { _id: users[0]._id },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/user-profile',
        //               params: {},
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             userProfiles = response.result.docs
        //             // assert that only 3 user profiles exist
        //             t.equals(
        //               response.result.docs.length,
        //               3,
        //               'only 3 user profiles exist'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })

        //             return Mongoose.connection.db.dropDatabase()
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete 'CASCADE' for ONE_MANY references deletes the referrent documents and any cascading documents (soft delete)
        // .then(function() {
        //   return t.test(
        //     'onDelete "CASCADE" for ONE_MANY references deletes the referrent documents and any cascading documents (soft delete)',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-8/models'
        //         ),
        //         embedAssociations: true,
        //         enableSoftDelete: true
        //       }

        //       RestHapi.config = config

        //       let users, roles, profiles, roleId, userId, profileId

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               {
        //                 name: 'User',
        //                 description: 'A standard user account.'
        //               },
        //               {
        //                 name: 'Admin',
        //                 description: 'A user with advanced permissions.'
        //               },
        //               {
        //                 name: 'SuperAdmin',
        //                 description: 'A user with full permissions.'
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'role',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             roles = response

        //             const payload = [
        //               {
        //                 email: 'test@user2.com',
        //                 password: 'root',
        //                 title: roles[0]._id
        //               },
        //               {
        //                 email: 'test@user3.com',
        //                 password: 'root',
        //                 title: roles[0]._id
        //               },
        //               {
        //                 email: 'test@admin.com',
        //                 password: 'root',
        //                 title: roles[1]._id
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'user',
        //               payload,
        //               restCall: false
        //             })
        //           })

        //           .then(function(response) {
        //             users = response
        //             userId = users[0]._id
        //             // console.log('users', users)
        //             const payload = [
        //               {
        //                 status: 'foo',
        //                 user: userId
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'userProfile',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const profiles = response
        //             const payload = {
        //               firstProfile: profiles[0]._id
        //             }

        //             return RestHapi.update({
        //               model: 'user',
        //               _id: userId,
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               {
        //                 name: 'root',
        //                 description: 'Access to all endpoints'
        //               },
        //               {
        //                 name: 'create',
        //                 description: 'Access to all create endpoints'
        //               },
        //               {
        //                 name: 'read',
        //                 description: 'Access to all read endpoints'
        //               },
        //               {
        //                 name: 'update',
        //                 description: 'Access to all update endpoints'
        //               },
        //               {
        //                 name: 'delete',
        //                 description: 'Access to all delete endpoints'
        //               },
        //               {
        //                 name: 'associate',
        //                 description: 'Access to all association endpoints'
        //               },
        //               {
        //                 name: 'nothing',
        //                 description: 'Permission with no use.'
        //               }
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/permission',
        //               params: {},
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             permissions = response.result

        //             const payload = [
        //               {
        //                 childId: permissions[0]._id,
        //                 enabled: true
        //               },
        //               {
        //                 childId: permissions[1]._id,
        //                 enabled: false
        //               },
        //               {
        //                 childId: permissions[2]._id,
        //                 enabled: true
        //               }
        //             ]

        //             return RestHapi.addMany({
        //               ownerModel: 'role',
        //               childModel: 'permission',
        //               associationName: 'permissions',
        //               ownerId: roles[0]._id,
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role',
        //               params: {},
        //               query: { $embed: ['permissions', 'users.firstProfile'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             roles = response.result.docs
        //             // console.log('ROLES: ', roles)
        //           })
        //           .then(function(response) {
        //             const Role = Mongoose.model('role')
        //             return Role.findById(roles[0]._id)
        //           })
        //           .then(function(rawRole) {
        //             // console.log('ROLE: ', rawRole)
        //             // assert that the role has 3 permissions
        //             t.equals(
        //               rawRole.permissions.length,
        //               3,
        //               'role has 3 permissions'
        //             )
        //           })
        //           .then(function(response) {
        //             const Permission = Mongoose.model('permission')
        //             return Permission.find()
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/role/{_id}',
        //               params: {
        //                 _id: roles[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const User = Mongoose.model('user')
        //             return User.find()
        //           })
        //           .then(function(rawUsers) {
        //             // console.log('rawUsers: ', rawUsers)
        //             // assert that at least 2 users have isDeleted = true
        //             t.ok(
        //               rawUsers.filter(u => u.isDeleted === true).length >= 2,
        //               'at least  2 users have isDeleted = true'
        //             )
        //           })
        //           .then(function(response) {
        //             const UserProfile = Mongoose.model('userProfile')
        //             return UserProfile.find()
        //           })
        //           .then(function(rawUserProfiles) {
        //             // console.log('rawUserProfiles: ', rawUserProfiles)
        //             // assert that at least 1 user profile has isDeleted = true
        //             t.ok(
        //               rawUserProfiles.filter(up => up.isDeleted === true)
        //                 .length >= 1,
        //               'at least 1 user profile has isDeleted = true'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })

        //             return Mongoose.connection.db.dropDatabase()
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete 'CASCADE' for ONE_MANY references deletes the referrent documents and any cascading documents (hard delete)
        // .then(function() {
        //   return t.test(
        //     'onDelete "CASCADE" for ONE_MANY references deletes the referrent documents and any cascading documents (hard delete)',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-8/models'
        //         ),
        //         embedAssociations: true,
        //         enableSoftDelete: false
        //       }

        //       let users, roles, profiles, roleId, userId, permissionId

        //       RestHapi.config = config

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               {
        //                 name: 'User',
        //                 description: 'A standard user account.'
        //               },
        //               {
        //                 name: 'Admin',
        //                 description: 'A user with advanced permissions.'
        //               },
        //               {
        //                 name: 'SuperAdmin',
        //                 description: 'A user with full permissions.'
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'role',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             roles = response

        //             roleId = roles[0]._id

        //             const payload = [
        //               {
        //                 email: 'test@user2.com',
        //                 password: 'root',
        //                 title: roles[0]._id
        //               },
        //               {
        //                 email: 'test@user3.com',
        //                 password: 'root',
        //                 title: roles[0]._id
        //               },
        //               {
        //                 email: 'test@admin.com',
        //                 password: 'root',
        //                 title: roles[1]._id
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'user',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             users = response

        //             userId = users.filter(u => u.email === 'test@user2.com')[0]
        //               ._id

        //             // console.log('USERID:', userId)
        //             // console.log('users', users)
        //             const payload = [
        //               {
        //                 status: 'foo',
        //                 user: userId
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'userProfile',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const profiles = response
        //             const payload = {
        //               firstProfile: profiles[0]._id
        //             }

        //             return RestHapi.update({
        //               model: 'user',
        //               _id: users[0]._id,
        //               payload,
        //               restCall: false
        //             })
        //           })

        //           .then(function() {
        //             const payload = [
        //               {
        //                 name: 'root',
        //                 description: 'Access to all endpoints'
        //               },
        //               {
        //                 name: 'create',
        //                 description: 'Access to all create endpoints'
        //               },
        //               {
        //                 name: 'read',
        //                 description: 'Access to all read endpoints'
        //               },
        //               {
        //                 name: 'update',
        //                 description: 'Access to all update endpoints'
        //               },
        //               {
        //                 name: 'delete',
        //                 description: 'Access to all delete endpoints'
        //               },
        //               {
        //                 name: 'associate',
        //                 description: 'Access to all association endpoints'
        //               },
        //               {
        //                 name: 'nothing',
        //                 description: 'Permission with no use.'
        //               }
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/permission',
        //               params: {},
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             permissions = response.result

        //             const payload = [
        //               {
        //                 childId: permissions[0]._id,
        //                 enabled: true
        //               },
        //               {
        //                 childId: permissions[1]._id,
        //                 enabled: false
        //               },
        //               {
        //                 childId: permissions[2]._id,
        //                 enabled: true
        //               }
        //             ]

        //             return RestHapi.addMany({
        //               ownerModel: 'role',
        //               childModel: 'permission',
        //               associationName: 'permissions',
        //               ownerId: roles[0]._id,
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role',
        //               params: {},
        //               query: { $embed: ['permissions', 'users.firstProfile'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             roles = response.result.docs
        //             // console.log('ROLES: ', roles)
        //           })
        //           .then(function(response) {
        //             const Role = Mongoose.model('role')
        //             return Role.findById(roles[0]._id)
        //           })
        //           .then(function(rawRole) {
        //             // console.log('ROLE: ', rawRole)
        //             // assert that the role has 3 permissions
        //             t.equals(
        //               rawRole.permissions.length,
        //               3,
        //               'role has 3 permissions'
        //             )
        //           })
        //           .then(function(response) {
        //             const Permission = Mongoose.model('permission')
        //             return Permission.find()
        //           })
        //           .then(function(rawPermissions) {
        //             // console.log('PERMISSIONS: ', rawPermissions)
        //             // assert that at least 3 permissions have roles
        //             t.ok(
        //               rawPermissions.filter(p => p.roles.length > 0).length >=
        //                 3,
        //               'at least 3 permissions have roles'
        //             )
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/role/{_id}',
        //               params: {
        //                 _id: roles[0]._id
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const User = Mongoose.model('user')
        //             return User.find()
        //           })
        //           .then(function(rawUsers) {
        //             // console.log('rawUsers: ', rawUsers)
        //             // assert that only 1 user is left
        //             t.equals(rawUsers.length, 1, 'only 1 user is left')
        //           })
        //           .then(function(response) {
        //             const UserProfile = Mongoose.model('userProfile')
        //             return UserProfile.find()
        //           })
        //           .then(function(rawUserProfiles) {
        //             // console.log('rawUserProfiles: ', rawUserProfiles)
        //             // assert that no profiles exist
        //             t.equals(rawUserProfiles.length, 0, 'no profiles exist')
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })

        //             return Mongoose.connection.db.dropDatabase()
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // // onDelete 'CASCADE' for MANY_MANY references results in no action (soft delete)
        // .then(function() {
        //   return t.test(
        //     'onDelete "CASCADE" for MANY_MANY references results in no action (soft delete)',
        //     function(t) {
        //       // <editor-fold desc="Arrange">
        //       const RestHapi = require('../../rest-hapi')
        //       const server = new Hapi.Server()

        //       const config = {
        //         loglevel: 'ERROR',
        //         absoluteModelPath: true,

        //         modelPath: path.join(
        //           __dirname,
        //           '/test-scenarios/scenario-8/models'
        //         ),
        //         embedAssociations: true,
        //         enableSoftDelete: true
        //       }

        //       RestHapi.config = config

        //       let users, roles, profiles, roleId, userId, permissionId

        //       return (
        //         server
        //           .register({
        //             plugin: RestHapi,
        //             options: {
        //               mongoose: Mongoose,
        //               config: config
        //             }
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               {
        //                 name: 'User',
        //                 description: 'A standard user account.'
        //               },
        //               {
        //                 name: 'Admin',
        //                 description: 'A user with advanced permissions.'
        //               },
        //               {
        //                 name: 'SuperAdmin',
        //                 description: 'A user with full permissions.'
        //               }
        //             ]

        //             return RestHapi.create({
        //               model: 'role',
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             roles = response
        //             roleId = roles[0]._id
        //           })
        //           .then(function(response) {
        //             const payload = [
        //               {
        //                 name: 'root',
        //                 description: 'Access to all endpoints'
        //               },
        //               {
        //                 name: 'create',
        //                 description: 'Access to all create endpoints'
        //               },
        //               {
        //                 name: 'read',
        //                 description: 'Access to all read endpoints'
        //               },
        //               {
        //                 name: 'update',
        //                 description: 'Access to all update endpoints'
        //               },
        //               {
        //                 name: 'delete',
        //                 description: 'Access to all delete endpoints'
        //               },
        //               {
        //                 name: 'associate',
        //                 description: 'Access to all association endpoints'
        //               },
        //               {
        //                 name: 'nothing',
        //                 description: 'Permission with no use.'
        //               }
        //             ]

        //             const request = {
        //               method: 'POST',
        //               url: '/permission',
        //               params: {},
        //               query: {},
        //               payload: payload,
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             permissions = response.result

        //             const payload = [
        //               {
        //                 childId: permissions[0]._id,
        //                 enabled: true
        //               },
        //               {
        //                 childId: permissions[1]._id,
        //                 enabled: false
        //               },
        //               {
        //                 childId: permissions[2]._id,
        //                 enabled: true
        //               }
        //             ]

        //             return RestHapi.addMany({
        //               ownerModel: 'role',
        //               childModel: 'permission',
        //               associationName: 'permissions',
        //               ownerId: roleId,
        //               payload,
        //               restCall: false
        //             })
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'GET',
        //               url: '/role',
        //               params: {},
        //               query: { $embed: ['permissions', 'users.firstProfile'] },
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             roles = response.result.docs
        //           })
        //           .then(function(response) {
        //             const Role = Mongoose.model('role')
        //             return Role.findById(roleId)
        //           })
        //           .then(function(rawRole) {
        //             // assert that the role has 3 permissions
        //             t.equals(
        //               rawRole.permissions.length,
        //               3,
        //               'role has 3 permissions'
        //             )
        //           })
        //           .then(function(response) {
        //             const Permission = Mongoose.model('permission')
        //             return Permission.find()
        //           })
        //           .then(function(rawPermissions) {
        //             // assert that at least 3 permissions have one role
        //             t.ok(
        //               rawPermissions.filter(p => p.roles.length >= 1).length >=
        //                 3,
        //               'at least 3 permissions have 1 role'
        //             )
        //           })
        //           .then(function(response) {
        //             const request = {
        //               method: 'DELETE',
        //               url: '/role/{_id}',
        //               params: {
        //                 _id: roleId
        //               },
        //               query: {},
        //               payload: {},
        //               credentials: {},
        //               headers: {}
        //             }

        //             const injectOptions = TestHelper.mockInjection(request)

        //             return server.inject(injectOptions)
        //           })
        //           .then(function(response) {
        //             const Role = Mongoose.model('role')
        //             return Role.findById(roleId)
        //           })
        //           .then(function(rawRole) {
        //             // assert that role has isDeleted set to true
        //             t.ok(rawRole.isDeleted, 'role isDeleted set to true')
        //             // assert that the role has 3 permissions
        //             t.equals(
        //               rawRole.permissions.length,
        //               3,
        //               'the role has 3 permissions'
        //             )
        //           })
        //           .then(function(response) {
        //             const Permission = Mongoose.model('permission')
        //             return Permission.find()
        //           })
        //           .then(function(rawPermissions) {
        //             // assert that at least 3 permissions have one role
        //             t.ok(
        //               rawPermissions.filter(p => p.roles.length >= 1).length >=
        //                 3,
        //               'at least 3 permissions have one role'
        //             )
        //           })
        //           // </editor-fold>

        //           // <editor-fold desc="Restore">
        //           .then(function() {
        //             Decache('../../rest-hapi')

        //             Decache('../config')
        //             Object.keys(Mongoose.models).forEach(function(key) {
        //               delete Mongoose.models[key]
        //             })
        //             Object.keys(Mongoose.modelSchemas || []).forEach(function(
        //               key
        //             ) {
        //               delete Mongoose?.modelSchemas[key]
        //             })

        //             return Mongoose.connection.db.dropDatabase()
        //           })
        //       )
        //       // </editor-fold>
        //     }
        //   )
        // })
        // onDelete 'CASCADE' for MANY_MANY references deletes the referrent embedded docs (hard delete)
        .then(function() {
          return t.test(
            'onDelete "CASCADE" for MANY_MANY references deletes the referrent embedded docs (hard delete)',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-8/models'
                ),
                embedAssociations: true,
                enableSoftDelete: false
              }

              RestHapi.config = config

              let users, roles, profiles, roleId, userId, permissionId

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
                    const payload = [
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

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
                    roleId = roles[0]._id
                  })
                  .then(function(response) {
                    const payload = [
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
                    permissions = response.result

                    const payload = [
                      {
                        childId: permissions[0]._id,
                        enabled: true
                      },
                      {
                        childId: permissions[1]._id,
                        enabled: false
                      },
                      {
                        childId: permissions[2]._id,
                        enabled: true
                      }
                    ]

                    return RestHapi.addMany({
                      ownerModel: 'role',
                      childModel: 'permission',
                      associationName: 'permissions',
                      ownerId: roleId,
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/role',
                      params: {},
                      query: { $embed: ['permissions', 'users.firstProfile'] },
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    const Role = Mongoose.model('role')
                    return Role.findById(roleId)
                  })
                  .then(function(rawRole) {
                    // assert that the role has 3 permissions
                    t.equals(
                      rawRole.permissions.length,
                      3,
                      'role has 3 permissions'
                    )
                  })
                  .then(function(response) {
                    const Permission = Mongoose.model('permission')
                    return Permission.find()
                  })
                  .then(function(rawPermissions) {
                    // assert that at least 3 permissions have one role
                    t.ok(
                      rawPermissions.filter(p => p.roles.length >= 1).length >=
                        3,
                      'at least 3 permissions have one role'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/role/{_id}',
                      params: {
                        _id: roleId
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
                    const Role = Mongoose.model('role')
                    return Role.findById(roleId)
                  })
                  .then(function(rawRole) {
                    // assert that role was not found
                    t.equals(rawRole, null, 'role was not found')
                  })
                  .then(function(response) {
                    const Permission = Mongoose.model('permission')
                    return Permission.find()
                  })
                  .then(function(rawPermissions) {
                    // assert that no permissions have a role
                    t.ok(
                      rawPermissions.filter(p => p.roles.length >= 1).length ===
                        0,
                      'no permissions have a role'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete 'SET_NULL' for ONE_ONE references sets the referrent document to null
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for ONE_ONE references sets the referrent document to null',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-8/models'
                ),
                embedAssociations: true,
                enableSoftDelete: true
              }

              RestHapi.config = config

              let users, roles, profiles, roleId, userId, permissionId

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
                    const payload = [
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

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        email: 'test@user2.com',
                        password: 'root',
                        title: roles[0]._id
                      },
                      {
                        email: 'test@user3.com',
                        password: 'root',
                        title: roles[0]._id
                      },
                      {
                        email: 'test@admin.com',
                        password: 'root',
                        title: roles[1]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'user',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    users = response

                    const payload = [
                      {
                        status: 'foo',
                        user: users[0]._id
                      },
                      {
                        status: 'bar',
                        user: users[0]._id
                      },
                      {
                        status: 'baz',
                        user: users[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'userProfile',
                      payload,
                      Log,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    profiles = response

                    const payload = {
                      firstProfile: profiles[0]._id,
                      secondProfile: profiles[1]._id,
                      thirdProfile: profiles[2]._id
                    }

                    const request = {
                      method: 'PUT',
                      url: '/user/{_id}',
                      params: {
                        _id: users[0]._id
                      },
                      query: {},
                      payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    // Fetch user profiles using mongoose
                    const UserProfile = Mongoose.model('userProfile')
                    return UserProfile.find()
                  })
                  .then(function(rawProfiles) {
                    // assert all profiles have users
                    t.ok(
                      rawProfiles.filter(p => p.user).length === 3,
                      'all profiles have users'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/user/{_id}',
                      params: { _id: users[0]._id },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    // Fetch user profiles using mongoose
                    const UserProfile = Mongoose.model('userProfile')
                    return UserProfile.find({ _id: profiles[1]._id })
                  })
                  .then(function(rawProfile) {
                    // assert profile has null user
                    t.ok(rawProfile[0].user === null, 'profile has null user')
                  })
                  // </editor-fold>

                  // <editor-fold desc="Restore">
                  .then(function() {
                    Decache('../../rest-hapi')

                    Decache('../config')
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
            }
          )
        })
        // onDelete 'SET_NULL' for ONE_ONE references throws an error if the reference is required
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for ONE_ONE references throws an error if the reference is required',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'NONE',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-9/models'
                ),
                embedAssociations: true,
                enableSoftDelete: true
              }

              RestHapi.config = config

              let users, roles, profiles, roleId, userId, permissionId, error, businesses

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
                    const payload = [
                      {
                        name: 'biz1'
                      }
                    ]

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        name: 'User',
                        description: 'A standard user account.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'Admin',
                        description: 'A user with advanced permissions.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'SuperAdmin',
                        description: 'A user with full permissions.',
                        company: businesses[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        email: 'test@user2.com',
                        password: 'root',
                        title: roles[0]._id
                      },
                      {
                        email: 'test@user3.com',
                        password: 'root',
                        title: roles[0]._id
                      },
                      {
                        email: 'test@admin.com',
                        password: 'root',
                        title: roles[1]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'user',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    users = response

                    const payload = [
                      {
                        status: 'foo',
                        user: users[0]._id
                      },
                      {
                        status: 'bar',
                        user: users[0]._id
                      },
                      {
                        status: 'baz',
                        user: users[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'userProfile',
                      payload,
                      Log,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    profiles = response

                    const payload = {
                      firstProfile: profiles[0]._id,
                      secondProfile: profiles[1]._id,
                      thirdProfile: profiles[2]._id
                    }

                    const request = {
                      method: 'PUT',
                      url: '/user/{_id}',
                      params: {
                        _id: users[0]._id
                      },
                      query: {},
                      payload,
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    // Fetch user profiles using mongoose
                    const UserProfile = Mongoose.model('userProfile')
                    return UserProfile.find()
                  })
                  .then(function(rawProfiles) {
                    // assert all profiles have users
                    t.ok(
                      rawProfiles.filter(p => p.user).length === 3,
                      'all profiles have users'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/user/{_id}',
                      params: { _id: users[0]._id },
                      query: {},
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    error = response.result

                    // assert that an error was thrown
                    t.ok(error, 'an error was thrown')

                    // assert that the error message is correct
                    t.equals(
                      error.message,
                      'userProfile validation failed: user: Path `user` is required.',
                      'the error message is correct'
                    )

                    // assert that the error status is correct
                    t.equals(
                      error.statusCode,
                      400,
                      'the error status is correct'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })
                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete "SET_NULL" for ONE_MANY references sets all references to null (hard delete)
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for ONE_MANY references sets all references to null  (hard delete)',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-8/models'
                ),
                embedAssociations: true,
                enableSoftDelete: false
              }

              let users,
                roles,
                profiles,
                roleId,
                userId,
                permissionId,
                businesses

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
                    const payload = [
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

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response

                    const payload = {
                      name: 'testBiz'
                    }

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = [response]

                    const payload = [roles[0]._id, roles[1]._id, roles[2]._id]

                    return RestHapi.addMany({
                      ownerModel: 'business',
                      ownerId: businesses[0]._id,
                      childModel: 'role',
                      associationName: 'roles',
                      payload
                    })
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

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    // assert that each role has a 'company' reference
                    t.ok(
                      roles.filter(r => r.company).length === 3,
                      'each role has a company reference'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/business/{_id}',
                      params: {
                        _id: businesses[0]._id
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
                    const Role = Mongoose.model('role')
                    return Role.find()
                  })
                  .then(function(rawRoles) {
                    // assert that each user has a null 'company' reference
                    t.ok(
                      rawRoles.filter(r => r.company === null).length === 3,
                      'each role has a null company reference'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete "SET_NULL" for ONE_MANY references sets all references to null (soft delete)
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for ONE_MANY references sets all references to null (soft delete)',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-8/models'
                ),
                embedAssociations: true,
                enableSoftDelete: true
              }

              let users,
                roles,
                profiles,
                roleId,
                userId,
                permissionId,
                businesses

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
                    const payload = [
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

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response

                    const payload = {
                      name: 'testBiz'
                    }

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = [response]

                    const payload = [roles[0]._id, roles[1]._id, roles[2]._id]

                    return RestHapi.addMany({
                      ownerModel: 'business',
                      ownerId: businesses[0]._id,
                      childModel: 'role',
                      associationName: 'roles',
                      payload
                    })
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

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    // assert that each role has a 'company' reference
                    t.ok(
                      roles.filter(r => r.company).length === 3,
                      'each role has a company reference'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/business/{_id}',
                      params: {
                        _id: businesses[0]._id
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
                    const Role = Mongoose.model('role')
                    return Role.find()
                  })
                  .then(function(rawRoles) {
                    // assert that each user has a null 'company' reference
                    t.ok(
                      rawRoles.filter(r => r.company === null).length === 3,
                      'each role has a null company reference'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete 'SET_NULL' for MANY_MANY references results in no action (soft delete)
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for MANY_MANY references results in no action (soft delete)',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-9/models'
                ),
                embedAssociations: true,
                enableSoftDelete: true
              }

              RestHapi.config = config

              let users,
                roles,
                profiles,
                roleId,
                userId,
                permissionId,
                businesses

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
                    const payload = [
                      {
                        name: 'biz1'
                      }
                    ]

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        name: 'User',
                        description: 'A standard user account.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'Admin',
                        description: 'A user with advanced permissions.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'SuperAdmin',
                        description: 'A user with full permissions.',
                        company: businesses[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
                    roleId = roles[0]._id
                  })
                  .then(function(response) {
                    const payload = [
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
                    permissions = response.result

                    const payload = [
                      {
                        childId: permissions[0]._id,
                        enabled: true
                      },
                      {
                        childId: permissions[1]._id,
                        enabled: false
                      },
                      {
                        childId: permissions[2]._id,
                        enabled: true
                      }
                    ]

                    return RestHapi.addMany({
                      ownerModel: 'role',
                      childModel: 'permission',
                      associationName: 'permissions',
                      ownerId: roleId,
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/role',
                      params: {},
                      query: { $embed: ['permissions', 'users.firstProfile'] },
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    const Role = Mongoose.model('role')
                    return Role.findById(roleId)
                  })
                  .then(function(rawRole) {
                    // assert that the role has 3 permissions
                    t.equals(
                      rawRole.permissions.length,
                      3,
                      'role has 3 permissions'
                    )
                  })
                  .then(function(response) {
                    const Permission = Mongoose.model('permission')
                    return Permission.find()
                  })
                  .then(function(rawPermissions) {
                    // assert that at least 3 permissions have one role
                    t.ok(
                      rawPermissions.filter(p => p.roles.length >= 1).length >=
                        3,
                      'at least 3 permissions have 1 role'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/role/{_id}',
                      params: {
                        _id: roleId
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
                    const Role = Mongoose.model('role')
                    return Role.findById(roleId)
                  })
                  .then(function(rawRole) {
                    // assert that role has isDeleted set to true
                    t.ok(rawRole.isDeleted, 'role isDeleted set to true')
                    // assert that the role has 3 permissions
                    t.equals(
                      rawRole.permissions.length,
                      3,
                      'the role has 3 permissions'
                    )
                  })
                  .then(function(response) {
                    const Permission = Mongoose.model('permission')
                    return Permission.find()
                  })
                  .then(function(rawPermissions) {
                    // assert that at least 3 permissions have one role
                    t.ok(
                      rawPermissions.filter(p => p.roles.length >= 1).length >=
                        3,
                      'at least 3 permissions have one role'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete 'SET_NULL' for MANY_MANY references deletes the referrent embedded docs (hard delete)
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for MANY_MANY references deletes the referrent embedded docs (hard delete)',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-9/models'
                ),
                embedAssociations: true,
                enableSoftDelete: false
              }

              RestHapi.config = config

              let users,
                roles,
                profiles,
                roleId,
                userId,
                permissionId,
                businesses

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
                    const payload = [
                      {
                        name: 'biz1'
                      }
                    ]

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        name: 'User',
                        description: 'A standard user account.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'Admin',
                        description: 'A user with advanced permissions.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'SuperAdmin',
                        description: 'A user with full permissions.',
                        company: businesses[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
                    roleId = roles[0]._id
                  })
                  .then(function(response) {
                    const payload = [
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
                    permissions = response.result

                    const payload = [
                      {
                        childId: permissions[0]._id,
                        enabled: true
                      },
                      {
                        childId: permissions[1]._id,
                        enabled: false
                      },
                      {
                        childId: permissions[2]._id,
                        enabled: true
                      }
                    ]

                    return RestHapi.addMany({
                      ownerModel: 'role',
                      childModel: 'permission',
                      associationName: 'permissions',
                      ownerId: roleId,
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    const request = {
                      method: 'GET',
                      url: '/role',
                      params: {},
                      query: { $embed: ['permissions', 'users.firstProfile'] },
                      payload: {},
                      credentials: {},
                      headers: {}
                    }

                    const injectOptions = TestHelper.mockInjection(request)

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    const Role = Mongoose.model('role')
                    return Role.findById(roleId)
                  })
                  .then(function(rawRole) {
                    // assert that the role has 3 permissions
                    t.equals(
                      rawRole.permissions.length,
                      3,
                      'role has 3 permissions'
                    )
                  })
                  .then(function(response) {
                    const Permission = Mongoose.model('permission')
                    return Permission.find()
                  })
                  .then(function(rawPermissions) {
                    // assert that at least 3 permissions have one role
                    t.ok(
                      rawPermissions.filter(p => p.roles.length >= 1).length >=
                        3,
                      'at least 3 permissions have one role'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/role/{_id}',
                      params: {
                        _id: roleId
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
                    const Role = Mongoose.model('role')
                    return Role.findById(roleId)
                  })
                  .then(function(rawRole) {
                    // assert that role was not found
                    t.equals(rawRole, null, 'role was not found')
                  })
                  .then(function(response) {
                    const Permission = Mongoose.model('permission')
                    return Permission.find()
                  })
                  .then(function(rawPermissions) {
                    // assert that no permissions have a role
                    t.ok(
                      rawPermissions.filter(p => p.roles.length >= 1).length ===
                        0,
                      'no permissions have a role'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete "SET_NULL" for ONE_MANY references throws an error if the reference is required
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for ONE_MANY references throws an error if the reference is required',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'NONE',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-9/models'
                ),
                embedAssociations: true,
                enableSoftDelete: true
                // enableResponseFail: false
              }

              let users,
                roles,
                profiles,
                roleId,
                userId,
                permissionId,
                businesses,
                error

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
                    const payload = [
                      {
                        name: 'biz1'
                      }
                    ]

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        name: 'User',
                        description: 'A standard user account.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'Admin',
                        description: 'A user with advanced permissions.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'SuperAdmin',
                        description: 'A user with full permissions.',
                        company: businesses[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
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

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    // assert that each role has a 'company' reference
                    t.ok(
                      roles.filter(r => r.company).length === 3,
                      'each role has a company reference'
                    )
                  })
                  .then(function(response) {
                    const request = {
                      method: 'DELETE',
                      url: '/business/{_id}',
                      params: {
                        _id: businesses[0]._id
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
                    error = response.result

                    // assert that an error was thrown
                    t.ok(error, 'an error was thrown')

                    // assert that the error message is correct
                    t.equals(
                      error.message,
                      'role validation failed: company: Path `company` is required.',
                      'the error message is correct'
                    )

                    // assert that the error status is correct
                    t.equals(
                      error.statusCode,
                      400,
                      'the error status is correct'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
                    })

                    return Mongoose.connection.db.dropDatabase()
                  })
              )
              // </editor-fold>
            }
          )
        })
        // onDelete "SET_NULL" for ONE_MANY references allows deleting a required reference if the reference has been soft deleted'
        .then(function() {
          return t.test(
            'onDelete "SET_NULL" for ONE_MANY references allows deleting a required reference if the reference has been soft deleted',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')
              const server = new Hapi.Server()

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-9/models'
                ),
                embedAssociations: true,
                enableSoftDelete: true
              }

              let users,
                roles,
                profiles,
                roleId,
                userId,
                permissionId,
                businesses,
                error

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
                    const payload = [
                      {
                        name: 'biz1'
                      }
                    ]

                    return RestHapi.create({
                      model: 'business',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    businesses = response
                  })
                  .then(function(response) {
                    const payload = [
                      {
                        name: 'User',
                        description: 'A standard user account.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'Admin',
                        description: 'A user with advanced permissions.',
                        company: businesses[0]._id
                      },
                      {
                        name: 'SuperAdmin',
                        description: 'A user with full permissions.',
                        company: businesses[0]._id
                      }
                    ]

                    return RestHapi.create({
                      model: 'role',
                      payload,
                      restCall: false
                    })
                  })
                  .then(function(response) {
                    roles = response
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

                    return server.inject(injectOptions)
                  })
                  .then(function(response) {
                    roles = response.result.docs
                  })
                  .then(function(response) {
                    // assert that each role has a 'company' reference
                    t.ok(
                      roles.filter(r => r.company).length === 3,
                      'each role has a company reference'
                    )
                  })
                  .then(function(response) {
                    return RestHapi.deleteMany({
                      model: 'role',
                      query: {},
                      payload: roles.map(r => r._id.toString())
                    })
                  })
                  .then(function(response) {
                    const Role = Mongoose.model('role')
                    return Role.find()
                  })
                  .then(function(rawRoles) {
                    // assert that all roles have isDeleted set to true
                    t.ok(
                      rawRoles.filter(r => r.isDeleted).length === 3,
                      'all roles have isDeleted set to true'
                    )
                  })
                  .then(function(response) {
                    return RestHapi.deleteOne({
                      model: 'business',
                      _id: businesses[0]._id
                    })
                  })
                  .then(function(response) {
                    const Business = Mongoose.model('business')
                    return Business.find()
                  })
                  .then(function(rawBusinesses) {
                    // assert that the business has isDeleted set to true
                    t.ok(
                      rawBusinesses.filter(b => b.isDeleted).length === 1,
                      'the business has isDeleted set to true'
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
                    Object.keys(Mongoose.modelSchemas || []).forEach(function(
                      key
                    ) {
                      delete Mongoose?.modelSchemas[key]
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
