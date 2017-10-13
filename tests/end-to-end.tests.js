const Test = require('blue-tape');
const _ = require('lodash');
const Sinon = require('sinon');
const SinonTestFactory = require('sinon-test');
const SinonTest = SinonTestFactory(Sinon);
const rewire = require('rewire');
const Proxyquire = require('proxyquire');
const Assert = require('assert');
const Logging = require('loggin');
const TestHelper = require("./test-helper");
const Joi = require('joi');
const Q = require('q');
const QueryString = require('query-string');
const Hapi = require('hapi');

const Mongoose = require('mongoose');
Mongoose.Promise = Q.Promise;
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(Mongoose);

const Types = Mongoose.Schema.Types;

let Log = Logging.getLogger("tests");
Log.logLevel = "DEBUG";
Log = Log.bind("end-to-end");

Sinon.test = SinonTest;

const internals = {};

Test('Test basic CRUD', function (t) {

  return mockgoose.prepareStorage()

  //basic "Create" works
      .then(function () {
        return t.test('basic "Create" works', function (t) {
          //<editor-fold desc="Arrange">
          const RestHapi = require('../rest-hapi');
          const server = new Hapi.Server();
          server.connection(RestHapi.config.server.connection);

          const config = {
            loglevel: 'ERROR',
            absoluteModelPath: true,
            modelPath: __dirname + '/test-models/scenario-1'
          };

          RestHapi.config = config;

          return server.register({
            register: RestHapi,
            options: {
              mongoose: Mongoose
            }
          })
              .then(function () {
                server.start();

                const method = 'POST';
                const url = '/role';
                const params = {};
                const query = {};
                const payload = {
                  name: 'test'
                };
                const credentials = {};


                let fullUrl = url;
                for (const key in params) {
                  fullUrl = fullUrl.replace('{' + key + '}', params[key]);
                }
                fullUrl = fullUrl +  '?' + QueryString.stringify(query);

                const injectOptions = {
                  method: method,
                  url: fullUrl,
                  payload: payload,
                  credentials: credentials
                };

                return injectOptions;
              })

              //</editor-fold>

              //<editor-fold desc="Act">
              .then(function (injectOptions) {
                return server.inject(injectOptions)
              })
              //</editor-fold>

              //<editor-fold desc="Assert">
              .then(function (response) {
                t.equals(response.result.name, 'test', 'role with name "test" created');
              })
              //</editor-fold>

              //<editor-fold desc="Restore">
              .then(function () {
                //EXPL: reset rest-hapi
                delete require.cache[require.resolve('../rest-hapi.js')];
                delete require.cache[require.resolve('../config.js')];
                //EXPL: reset mrhorse policies
                delete server.plugins.mrhorse.reset();
                //EXPL: reset mongoose models
                delete Mongoose.models.role;
                delete Mongoose.modelSchemas.role;
              });
          //</editor-fold>
        });
      })
      //basic "Read" works
      .then(function () {
        return t.test('basic "Read" works', function (t) {
          //<editor-fold desc="Arrange">
          const RestHapi = require('../rest-hapi');
          const server = new Hapi.Server();
          server.connection(RestHapi.config.server.connection);

          const config = {
            loglevel: 'ERROR',
            absoluteModelPath: true,
            modelPath: __dirname + '/test-models/scenario-1'
          };

          RestHapi.config = config;

          return server.register({
            register: RestHapi,
            options: {
              mongoose: Mongoose
            }
          })
              .then(function () {
                server.start();

                const method = 'GET';
                const url = '/role';
                const params = {};
                const query = {};
                const payload = {};
                const credentials = {};


                let fullUrl = url;
                for (const key in params) {
                  fullUrl = fullUrl.replace('{' + key + '}', params[key]);
                }
                fullUrl = fullUrl +  '?' + QueryString.stringify(query);

                const injectOptions = {
                  method: method,
                  url: fullUrl,
                  payload: payload,
                  credentials: credentials
                };

                return injectOptions;
              })

              //</editor-fold>

              //<editor-fold desc="Act">
              .then(function (injectOptions) {
                return server.inject(injectOptions)
              })
              //</editor-fold>

              //<editor-fold desc="Assert">
              .then(function (response) {
                t.equals(response.result.docs[0].name, 'test', 'role with name "test" retrieved');
                internals.previous = response.result;
              })
          //</editor-fold>

          //<editor-fold desc="Restore">
              .then(function () {
                //EXPL: reset rest-hapi
                delete require.cache[require.resolve('../rest-hapi.js')];
                delete require.cache[require.resolve('../config.js')];
                //EXPL: reset mrhorse policies
                delete server.plugins.mrhorse.reset();
                //EXPL: reset mongoose models
                delete Mongoose.models.role;
                delete Mongoose.modelSchemas.role;
              });
          //</editor-fold>
        });
      })
      //basic "Update" works
      .then(function () {
        return t.test('basic "Update" works', function (t) {
          //<editor-fold desc="Arrange">
          const RestHapi = require('../rest-hapi');
          const server = new Hapi.Server();
          server.connection(RestHapi.config.server.connection);

          const config = {
            loglevel: "ERROR",
            absoluteModelPath: true,
            modelPath: __dirname + '/test-models/scenario-1'
          };

          RestHapi.config = config;


          return server.register({
            register: RestHapi,
            options: {
              mongoose: Mongoose
            }
          })
              .then(function () {
                server.start();

                const method = 'PUT';
                const url = '/role/{_id}';
                const params = {
                  _id: internals.previous.docs[0]._id
                };
                const query = {
                };
                const payload = {
                  name: 'test_updated'
                };
                const credentials = {};


                let fullUrl = url;
                for (const key in params) {
                  fullUrl = fullUrl.replace('{' + key + '}', params[key]);
                }
                fullUrl = fullUrl +  '?' + QueryString.stringify(query);

                const injectOptions = {
                  method: method,
                  url: fullUrl,
                  payload: payload,
                  credentials: credentials
                };

                return injectOptions;
              })

              //</editor-fold>

              //<editor-fold desc="Act">
              .then(function (injectOptions) {
                return server.inject(injectOptions)
              })
              //</editor-fold>

              //<editor-fold desc="Assert">
              .then(function (response) {
                t.equals(response.result.name, 'test_updated', 'role with name "test_updated" returned');
              })
          //</editor-fold>

          //<editor-fold desc="Restore">
              .then(function (response) {
                //EXPL: reset rest-hapi
                delete require.cache[require.resolve('../rest-hapi.js')];
                delete require.cache[require.resolve('../config.js')];
                //EXPL: reset mrhorse policies
                delete server.plugins.mrhorse.reset();
                //EXPL: reset mongoose models
                delete Mongoose.models.role;
                delete Mongoose.modelSchemas.role;
              });
          //</editor-fold>
        });
      })
});