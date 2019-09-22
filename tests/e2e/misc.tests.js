'use strict'

const path = require('path')
const Decache = require('decache')
const Q = require('q')
const TestHelper = require('../../utilities/test-helper')
const Hapi = require('@hapi/hapi')

module.exports = (t, Mongoose, internals, Log) => {
  return t.test('miscellaneous tests', function(t) {
    return (
      Q.when()
        // restCall = true throws and error if no server
        .then(function() {
          return t.test(
            'restCall = true throws an error if no server',
            function(t) {
              // <editor-fold desc="Arrange">
              const RestHapi = require('../../rest-hapi')

              const config = {
                loglevel: 'ERROR',
                absoluteModelPath: true,

                modelPath: path.join(
                  __dirname,
                  '/test-scenarios/scenario-3/models'
                )
              }

              let error = {}

              RestHapi.config = config

              return (
                RestHapi.generateModels(Mongoose)
                  .then(models => {
                    return RestHapi.create({
                      model: 'user',
                      payload: {
                        email: 'test@user.com',
                        password: 'root'
                      },
                      restCall: true
                    })
                  })
                  .catch(e => (error = e))
                  // </editor-fold>

                  // <editor-fold desc="Assert">
                  .then(function(response) {
                    t.deepEquals(
                      error.type,
                      'no-server',
                      'no-server error thrown'
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
        // $flatten works on nested embeds
        .then(function() {
          return t.test('$flatten works on nested embeds', function(t) {
            // <editor-fold desc="Arrange">

            const RestHapi = require('../../rest-hapi')
            const server = new Hapi.Server()

            const authStrategy = 'testStrategy'

            TestHelper.mockStrategy(server, authStrategy)

            const config = {
              loglevel: 'ERROR',
              authStrategy: authStrategy,
              absoluteModelPath: true,
              modelPath: path.join(
                __dirname,
                '/test-scenarios/scenario-5/models'
              )
            }

            const videoPayload = [{ title: 'vid1' }, { title: 'vid2' }]
            let segmentPayload
            const tagPayload = [
              { name: 'tag1' },
              { name: 'tag2' },
              { name: 'tag3' },
              { name: 'tag4' },
              { name: 'tag5' },
              { name: 'tag6' },
              { name: 'tag7' },
              { name: 'tag8' }
            ]

            let videos
            let segments
            let tags

            const results = []

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
                  return RestHapi.create({
                    model: 'video',
                    payload: videoPayload,
                    restCall: true
                  })
                })
                .then(result => {
                  videos = result
                  segmentPayload = [
                    { title: 'seg1', video: videos[0]._id },
                    { title: 'seg2', video: videos[0]._id },
                    { title: 'seg3', video: videos[1]._id },
                    { title: 'seg4', video: videos[1]._id }
                  ]
                  return RestHapi.create({
                    model: 'segment',
                    payload: segmentPayload,
                    restCall: true
                  })
                })
                .then(result => {
                  segments = result
                  return RestHapi.create({
                    model: 'tag',
                    payload: tagPayload,
                    restCall: true
                  })
                })
                .then(result => {
                  tags = result
                  return RestHapi.addMany({
                    ownerModel: 'segment',
                    ownerId: segments[0]._id,
                    childModel: 'tag',
                    associationName: 'tags',
                    payload: [
                      {
                        childId: tags[0]._id,
                        rank: 0
                      }
                    ],
                    restCall: true
                  })
                })
                .then(result => {
                  Log.debug('addmany:', result)
                  return RestHapi.addMany({
                    ownerModel: 'segment',
                    ownerId: segments[1]._id,
                    childModel: 'tag',
                    associationName: 'tags',
                    payload: [
                      {
                        childId: tags[1]._id,
                        rank: 1
                      },
                      {
                        childId: tags[2]._id,
                        rank: 2
                      }
                    ],
                    restCall: true
                  })
                })
                .then(result => {
                  return RestHapi.addMany({
                    ownerModel: 'segment',
                    ownerId: segments[2]._id,
                    childModel: 'tag',
                    associationName: 'tags',
                    payload: [
                      {
                        childId: tags[3]._id,
                        rank: 3
                      },
                      {
                        childId: tags[4]._id,
                        rank: 4
                      },
                      {
                        childId: tags[5]._id,
                        rank: 5
                      }
                    ],
                    restCall: true
                  })
                })
                .then(result => {
                  return RestHapi.addMany({
                    ownerModel: 'segment',
                    ownerId: segments[3]._id,
                    childModel: 'tag',
                    associationName: 'tags',
                    payload: [
                      {
                        childId: tags[6]._id,
                        rank: 6
                      },
                      {
                        childId: tags[7]._id,
                        rank: 7
                      }
                    ],
                    restCall: true
                  })
                })
                .then(result => {
                  return RestHapi.list({
                    model: 'video',
                    query: {
                      $embed: 'segments.tags'
                    },
                    restCall: true
                  })
                })
                .then(result => {
                  results.push(result.docs)
                  return RestHapi.list({
                    model: 'video',
                    query: {
                      $embed: 'segments.tags',
                      $flatten: true
                    },
                    restCall: true
                  })
                })
                .then(result => {
                  results.push(result.docs)
                  return RestHapi.find({
                    model: 'video',
                    _id: videos[0]._id,
                    query: {
                      $embed: 'segments.tags',
                      $flatten: true
                    },
                    restCall: true
                  })
                })
                // </editor-fold>

                // <editor-fold desc="Assert">
                .then(function(response) {
                  results.push(response)
                  t.ok(
                    results[0][0].segments[0].tags[0].tag,
                    'non-flattened tag exists'
                  )
                  t.ok(
                    results[0][0].segments[0].tags[0].rank,
                    'linking-model data exists'
                  )
                  t.ok(
                    results[1][1].segments[0].tags[0].name,
                    'tags flattened with list call'
                  )
                  t.ok(
                    results[2].segments[0].tags[0].name,
                    'tags flattened with find call'
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
    )
  })
}
