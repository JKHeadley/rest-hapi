'use strict'

const path = require('path')
const Decache = require('decache')
const Q = require('q')

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
    )
  })
}
