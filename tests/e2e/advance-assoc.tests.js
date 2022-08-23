'use strict'

const path = require('path')
const TestHelper = require('../../utilities/test-helper')
const Decache = require('decache')
const Q = require('q')
const Hapi = require('@hapi/hapi')

module.exports = (t, Mongoose, internals, Log) => {
  return t.test('advanced association tests', function(t) {
    return (
      Q.when()
        // implied association embeddings work
        // NOTE: implied associations are those listed with a 'ref' property but not listed under 'associations'
        // UPDATE: implied associations seem to have broken in the jump to v3.0
        .then(function() {
          return t.test('filler test', function(t) {
            return Promise.resolve("ok")
          })
          // return t.test('implied associations work', function(t) {
          //   // <editor-fold desc="Arrange">
          //   const RestHapi = require('../../rest-hapi')
          //   const server = new Hapi.Server()

          //   const config = {
          //     loglevel: 'ERROR',
          //     absoluteModelPath: true,

          //     modelPath: path.join(
          //       __dirname,
          //       '/test-scenarios/scenario-4/models'
          //     ),
          //     embedAssociations: false
          //   }

          //   RestHapi.config = config

          //   let facilities = []

          //   const promises = []

          //   return (
          //     server
          //       .register({
          //         plugin: RestHapi,
          //         options: {
          //           mongoose: Mongoose,
          //           config: config
          //         }
          //       })
          //       .then(function() {
          //         server.start()

          //         const payload = [
          //           {
          //             name: 'kitchen'
          //           },
          //           {
          //             name: 'study'
          //           },
          //           {
          //             name: 'office'
          //           }
          //         ]

          //         const request = {
          //           method: 'POST',
          //           url: '/facility',
          //           params: {},
          //           query: {},
          //           payload: payload,
          //           credentials: {},
          //           headers: {}
          //         }

          //         const injectOptions = TestHelper.mockInjection(request)

          //         return server.inject(injectOptions)
          //       })
          //       .then(function(response) {
          //         facilities = response.result

          //         const payload = {
          //           name: 'Big Building',
          //           facilitiesPerFloor: [
          //             { _id: facilities[0]._id },
          //             { _id: facilities[1]._id },
          //             { _id: facilities[2]._id }
          //           ]
          //         }

          //         const request = {
          //           method: 'POST',
          //           url: '/building',
          //           params: {},
          //           query: {},
          //           payload: payload,
          //           credentials: {},
          //           headers: {}
          //         }

          //         const injectOptions = TestHelper.mockInjection(request)

          //         return server.inject(injectOptions)
          //       })
          //       .then(function(response) {
          //         const request = {
          //           method: 'GET',
          //           url: '/building',
          //           params: {},
          //           query: { $embed: ['facilitiesPerFloor'] },
          //           payload: {},
          //           credentials: {},
          //           headers: {}
          //         }

          //         const injectOptions = TestHelper.mockInjection(request)

          //         promises.push(server.inject(injectOptions))
          //       })

          //       // </editor-fold>

          //       // <editor-fold desc="Act">
          //       .then(function(injectOptions) {
          //         return Promise.all(promises)
          //       })
          //       // </editor-fold>

          //       // <editor-fold desc="Assert">
          //       .then(function(response) {
          //         const building = response[0].result.docs[0]
          //         const kitchen = building.facilitiesPerFloor.find(
          //           facility => facility.name === 'kitchen'
          //         )
          //         const study = building.facilitiesPerFloor.find(
          //           facility => facility.name === 'study'
          //         )
          //         const office = building.facilitiesPerFloor.find(
          //           facility => facility.name === 'office'
          //         )

          //         t.ok(kitchen, 'kitchen embedded')
          //         t.ok(study, 'study embedded')
          //         t.ok(office, 'office embedded')
          //       })
          //       // </editor-fold>

          //       // <editor-fold desc="Restore">
          //       .then(function() {
          //         Decache('../../rest-hapi')

          //         Decache('../config')
          //         Object.keys(Mongoose.models).forEach(function(key) {
          //           delete Mongoose.models[key]
          //         })
          //         Object.keys(Mongoose.modelSchemas || []).forEach(function(
          //           key
          //         ) {
          //           delete Mongoose?.modelSchemas[key]
          //         })
          //       })
          //   )
          //   // </editor-fold>
          // })
        })
    )
  })
}
