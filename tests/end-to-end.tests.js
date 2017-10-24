'use strict';

const Test = require('blue-tape');
const _ = require('lodash');
const Logging = require('loggin');
const TestHelper = require("./test-helper");
const Decache = require('decache');
const Joi = require('joi');
const Q = require('q');
const QueryString = require('query-string');
const Hapi = require('hapi');

const Mongoose = require('mongoose');
Mongoose.Promise = Q.Promise;
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(Mongoose);

let Log = Logging.getLogger("tests");
Log.logLevel = "DEBUG";
Log = Log.bind("end-to-end");

const internals = {
  previous: {}
};

internals.onFinish = function() {
  process.exit();
};


Test.onFinish(internals.onFinish);

Test('end to end tests', function (t) {

  mockgoose.prepareStorage()
      .then(function() {
        return t.test('basic CRUD tests', function (t) {
          return Q.when()
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
                    modelPath: __dirname + '/test-scenarios/scenario-1/models'
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
                        fullUrl = fullUrl + '?' + QueryString.stringify(query);

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
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //basic "List" works
              .then(function () {
                return t.test('basic "List" works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-1/models'
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
                        fullUrl = fullUrl + '?' + QueryString.stringify(query);

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
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //basic "Find" works
              .then(function () {
                return t.test('basic "Find" works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-1/models'
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
                        const url = '/role/{_id}';
                        const params = {
                          _id: internals.previous.docs[0]._id
                        };
                        const query = {};
                        const payload = {};
                        const credentials = {};


                        let fullUrl = url;
                        for (const key in params) {
                          fullUrl = fullUrl.replace('{' + key + '}', params[key]);
                        }
                        fullUrl = fullUrl + '?' + QueryString.stringify(query);

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
                        t.equals(response.result.name, 'test', 'role with name "test" retrieved');
                        internals.previous = response.result;
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
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
                    modelPath: __dirname + '/test-scenarios/scenario-1/models'
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
                          _id: internals.previous._id
                        };
                        const query = {};
                        const payload = {
                          name: 'test_updated'
                        };
                        const credentials = {};


                        let fullUrl = url;
                        for (const key in params) {
                          fullUrl = fullUrl.replace('{' + key + '}', params[key]);
                        }
                        fullUrl = fullUrl + '?' + QueryString.stringify(query);

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
                        internals.previous = response.result;
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function (response) {
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //basic "Soft Delete" works
              .then(function () {
                return t.test('basic "Delete" works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: "ERROR",
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-1/models'
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

                        const method = 'DELETE';
                        const url = '/role/{_id}';
                        const params = {
                          _id: internals.previous._id
                        };
                        const query = {};
                        const payload = {
                        };
                        const credentials = {};


                        let fullUrl = url;
                        for (const key in params) {
                          fullUrl = fullUrl.replace('{' + key + '}', params[key]);
                        }
                        fullUrl = fullUrl + '?' + QueryString.stringify(query);

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
                        return Mongoose.model('role').find()
                            .then(function(response) {
                              t.deepEquals(response, [], 'role deleted');
                            })
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function (response) {
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });

                        return mockgoose.helper.reset();
                      });
                  //</editor-fold>
                });
              })
        })
      })
      .then(function() {
        return t.test('document authorization tests', function (t) {
          const userId = new Mongoose.Types.ObjectId();
          return Q.when()
              //average user unauthorized
              .then(function () {
                return t.test('average user unauthorized', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'ERROR',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-2/models'
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

                        const request = {
                          method: 'POST',
                          url: '/role',
                          params: {},
                          query: {},
                          payload: {
                            name: 'test'
                          },
                          credentials: {
                            user: { _id: userId }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        internals.previous = response.result;

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: {
                            _id: response.result._id
                          },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

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
                        t.equals(response.result.statusCode, 403, 'access denied');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //root user authorized
              .then(function () {
                return t.test('root user authorized', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'ERROR',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-2/models'
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

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: {
                            _id: internals.previous._id
                          },
                          query: {},
                          payload: {},
                          credentials: {
                            scope: ['root']
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

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
                        t.equals(response.result.name, 'test', 'user authorized');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //owner user authorized
              .then(function () {
                return t.test('owner user authorized', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'ERROR',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-2/models'
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

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: {
                            _id: internals.previous._id
                          },
                          query: {},
                          payload: {},
                          credentials: {
                            scope: ['user-' + userId.toString()]
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

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
                        t.equals(response.result.name, 'test', 'user authorized');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });

                        return mockgoose.helper.reset();
                      });
                  //</editor-fold>
                });
              })
        })
      })
      .then(function() {
        return t.test('basic embedded association tests', function (t) {
          let users = [];
          let userProfiles = [];
          let roles = [];
          let permissions = [];
          let hashtags = [];
          return Q.when()
              //ONE_ONE associations work
              .then(function () {
                return t.test('ONE_ONE associations work', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  RestHapi.config = config;

                  let user = {};
                  let userProfile = {};

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        let payload = {
                          email: 'test@user.com',
                          password: 'root'
                        };

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        user = response.result;

                        let payload = {
                          status: "Enabled",
                          user: user._id
                        };

                        const request = {
                          method: 'POST',
                          url: '/user-profile',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        userProfile = response.result;
                        userProfiles.push(userProfiles);

                        let payload = {
                          profile: userProfile._id
                        };

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: user._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        user = response.result;
                        users.push(user);

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: { $embed: ['profile'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

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
                        t.deepEquals(response.result.docs[0].profile, userProfile, 'ONE_ONE association correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //adding and retrieving ONE_MANY/MANY_ONE associations works
              .then(function () {
                return t.test('adding and retrieving ONE_MANY/MANY_ONE associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        let payload = [
                          {
                            name: 'User',
                            description: 'A standard user account.'
                          },
                          {
                            name: "Admin",
                            description: "A user with advanced permissions."
                          },
                          {
                            name: "SuperAdmin",
                            description: "A user with full permissions."
                          }
                        ];

                        const request = {
                          method: 'POST',
                          url: '/role',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        roles = roles.concat(response.result);

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
                        ];

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        users = users.concat(response.result);

                        const request = {
                          method: 'PUT',
                          url: '/role/{ownerId}/people/{childId}',
                          params: { ownerId: roles[0]._id, childId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          users[1]._id,
                          users[2]._id
                        ];

                        const request = {
                          method: 'POST',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: { _id: roles[0]._id },
                          query: { $embed: ['users'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: { $embed: ['title'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: { $embed: ['title'], email: [users[0].email, users[1].email, users[2].email] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: { email: [users[0].email, users[1].email, users[2].email] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {

                        //EXPL: rearrange results to match order
                        let result1 = [];
                        response[0].result.users.forEach(function(user) {
                          result1.push(response[3].result.docs.find(function(u) { return u.email === user.email }));
                        });
                        let result2 = [];
                        response[1].result.docs.forEach(function(user) {
                          result2.push(response[2].result.docs.find(function(u) { return u.email === user.email }));
                        });
                        t.equals(response[0].result.users.length, 3, "users length correct 1");
                        t.equals(response[1].result.docs.length, 3, "users length correct 2");
                        t.equals(response[2].result.docs.length, 3, "users length correct 3");
                        t.equals(response[3].result.docs.length, 3, "users length correct 4");
                        t.deepEquals(response[0].result.users, result1, 'ONE_MANY association correct');
                        t.deepEquals(response[1].result.docs, result2, 'MANY_ONE association correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //adding and retrieving MANY_MANY associations works
              .then(function () {
                return t.test('adding and retrieving MANY_MANY associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        let payload = [
                          {
                            name: "root",
                            description: "Access to all endpoints"
                          },
                          {
                            name: "create",
                            description: "Access to all create endpoints"
                          },
                          {
                            name: "read",
                            description: "Access to all read endpoints"
                          },
                          {
                            name: "update",
                            description: "Access to all update endpoints"
                          },
                          {
                            name: "delete",
                            description: "Access to all delete endpoints"
                          },
                          {
                            name: "associate",
                            description: "Access to all association endpoints"
                          },
                          {
                            name: "nothing",
                            description: "Permission with no use."
                          }
                        ];

                        const request = {
                          method: 'POST',
                          url: '/permission',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        permissions = permissions.concat(response.result);

                        let payload = [
                          permissions.find(function (p) { return p.name === 'create'; })._id,
                          permissions.find(function (p) { return p.name === 'read'; })._id,
                          permissions.find(function (p) { return p.name === 'update'; })._id,
                          permissions.find(function (p) { return p.name === 'delete'; })._id
                        ];

                        const request = {
                          method: 'POST',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          { enabled: true, childId: permissions.find(function (p) { return p.name === 'nothing'; })._id },
                          { enabled: false, childId: permissions.find(function (p) { return p.name === 'associate'; })._id }
                        ];

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;

                        const request = {
                          method: 'PUT',
                          url: '/role/{ownerId}/permission/{childId}',
                          params: { ownerId: roles[1]._id, childId: childId },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;
                        let payload = { enabled: false };
                        const request = {
                          method: 'PUT',
                          url: '/user/{ownerId}/permissions/{childId}',
                          params: { ownerId: users[0]._id, childId: childId },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: { _id: roles[1]._id },
                          query: { $embed: ['permissions'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: { $embed: ['permissions'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        promises.push(Mongoose.model('user').find({ _id: users[0]._id }).exec());

                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let result1_orig = response[0].result.permissions.map(function(obj) {
                          return obj.permission;
                        });
                        let result2_orig = response[2].result.permissions.map(function(obj) {
                          obj.permission.user_permission = { enabled: obj.enabled };
                          return obj.permission;
                        });
                        //EXPL: rearrange results to match order
                        let result1 = [];
                        response[1].result.docs.forEach(function(permission) {
                          result1.push(result1_orig.find(function(perm) { return perm.name === permission.name }));
                        });
                        let result2 = [];
                        response[3].result.docs.forEach(function(permission) {
                          result2.push(result2_orig.find(function(perm) { return perm.name === permission.name }));
                        });
                        t.deepEquals(response[1].result.docs, result1, 'MANY_MANY association correct');
                        t.deepEquals(response[3].result.docs, result2, 'MANY_MANY association correct');
                        t.deepEquals(response[4][0].permissions[0].enabled, true, 'MANY_MANY associations embedded')
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //adding and retrieving _MANY associations works
              .then(function () {
                return t.test('adding and retrieving _MANY associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

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
                          },
                        ];

                        const request = {
                          method: 'POST',
                          url: '/hashtag',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        hashtags = hashtags.concat(response.result);

                        let payload =
                          {
                            tags: [hashtags[0]._id, hashtags[1]._id]
                          };

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload =
                        {
                          tags: [hashtags[0]._id, hashtags[2]._id, hashtags[4]._id]
                        };

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: users[1]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'PUT',
                          url: '/user/{ownerId}/hashtag/{childId}',
                          params: { ownerId: users[0]._id, childId: hashtags[2]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          hashtags[2]._id, //NOTE: duplicate, should only be added once
                          hashtags[3]._id
                        ];

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: { $embed: ['tags'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[1]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let result1 = [hashtags[0], hashtags[1], hashtags[2], hashtags[3]];
                        let result2 = [hashtags[0], hashtags[2], hashtags[4]];
                        t.deepEquals(response[0].result.tags, result1, '_MANY association correct');
                        t.deepEquals(response[1].result.docs, result2, '_MANY association correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //removing ONE_MANY/MANY_ONE associations works
              .then(function () {
                return t.test('removing ONE_MANY/MANY_ONE associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/people/{childId}',
                          params: { ownerId: roles[0]._id, childId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          users[1]._id,
                          users[2]._id,
                          users[3]._id //NOTE: this user doesn't belong to the role, so the association shouldn't be removed from the user
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: { $embed: ['title'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let result2 = true;
                        let result3 = false;
                        response[1].result.docs.forEach(function(user) {
                          if (user.title && user.title.toString() !== roles[1]._id.toString()) {
                            result2 = false;
                          }
                          if (user.title && user.title.toString() === roles[1]._id.toString()) {
                            result3 = true;
                          }
                        });
                        t.deepEquals(response[0].result.docs, [], 'ONE_MANY associations removed');
                        t.ok(result2, "MANY_ONE associations removed");
                        t.ok(result3, "Admin role not removed")
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        delete Mongoose.models.role;
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //removing MANY_MANY associations works
              .then(function () {
                return t.test('removing MANY_MANY associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/permission/{childId}',
                          params: { ownerId: roles[1]._id, childId: childId},
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;
                        let payload = { enabled: false };
                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/permissions/{childId}',
                          params: { ownerId: users[0]._id, childId: childId },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          permissions.find(function (p) { return p.name === 'create'; })._id,
                          permissions.find(function (p) { return p.name === 'read'; })._id,
                          permissions.find(function (p) { return p.name === 'update'; })._id,
                          permissions.find(function (p) { return p.name === 'delete'; })._id
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          permissions.find(function (p) { return p.name === 'nothing'; })._id,
                          permissions.find(function (p) { return p.name === 'associate'; })._id
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        t.deepEquals(response[0].result.docs, [], 'MANY_MANY associations removed');
                        t.deepEquals(response[1].result.docs, [], 'MANY_MANY associations removed');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //removing _MANY associations works
              .then(function () {
                return t.test('removing ONE_MANY/MANY_ONE associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: true
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag/{childId}',
                          params: { ownerId: users[0]._id, childId: hashtags[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          hashtags[1]._id,
                          hashtags[2]._id,
                          hashtags[3]._id
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        t.deepEquals(response[0].result.docs, [], '_MANY associations removed');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });

                        return mockgoose.helper.reset();
                      });
                  //</editor-fold>
                });
              })
        })
      })
      .then(function() {
        return t.test('basic non-embedded association tests', function (t) {
          let users = [];
          let userProfiles = [];
          let roles = [];
          let permissions = [];
          let hashtags = [];
          return Q.when()
          //ONE_ONE associations work
              .then(function () {
                return t.test('ONE_ONE associations work', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  RestHapi.config = config;

                  let user = {};
                  let userProfile = {};

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        let payload = {
                          email: 'test@user.com',
                          password: 'root'
                        };

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        user = response.result;

                        let payload = {
                          status: "Enabled",
                          user: user._id
                        };

                        const request = {
                          method: 'POST',
                          url: '/user-profile',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        userProfile = response.result;
                        userProfiles.push(userProfiles);

                        let payload = {
                          profile: userProfile._id
                        };

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: user._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        user = response.result;
                        users.push(user);

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: { $embed: ['profile'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

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
                        t.deepEquals(response.result.docs[0].profile, userProfile, 'ONE_ONE association correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //adding and retrieving ONE_MANY/MANY_ONE associations works
              .then(function () {
                return t.test('adding and retrieving ONE_MANY/MANY_ONE associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        let payload = [
                          {
                            name: 'User',
                            description: 'A standard user account.'
                          },
                          {
                            name: "Admin",
                            description: "A user with advanced permissions."
                          },
                          {
                            name: "SuperAdmin",
                            description: "A user with full permissions."
                          }
                        ];

                        const request = {
                          method: 'POST',
                          url: '/role',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        roles = roles.concat(response.result);

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
                        ];

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        users = users.concat(response.result);

                        const request = {
                          method: 'PUT',
                          url: '/role/{ownerId}/people/{childId}',
                          params: { ownerId: roles[0]._id, childId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          users[1]._id,
                          users[2]._id
                        ];

                        const request = {
                          method: 'POST',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: { _id: roles[0]._id },
                          query: { $embed: ['users'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: { $embed: ['title'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: { $embed: ['title'], email: [users[0].email, users[1].email, users[2].email] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: { email: [users[0].email, users[1].email, users[2].email] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {

                        //EXPL: rearrange results to match order
                        let result1 = [];
                        response[0].result.users.forEach(function(user) {
                          result1.push(response[3].result.docs.find(function(u) { return u.email === user.email }));
                        });
                        let result2 = [];
                        response[1].result.docs.forEach(function(user) {
                          result2.push(response[2].result.docs.find(function(u) { return u.email === user.email }));
                        });
                        t.equals(response[0].result.users.length, 3, "users length correct 1");
                        t.equals(response[1].result.docs.length, 3, "users length correct 2");
                        t.equals(response[2].result.docs.length, 3, "users length correct 3");
                        t.equals(response[3].result.docs.length, 3, "users length correct 4");
                        t.deepEquals(response[0].result.users, result1, 'ONE_MANY association correct');
                        t.deepEquals(response[1].result.docs, result2, 'MANY_ONE association correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //adding and retrieving MANY_MANY associations works
              .then(function () {
                return t.test('adding and retrieving MANY_MANY associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        let payload = [
                          {
                            name: "root",
                            description: "Access to all endpoints"
                          },
                          {
                            name: "create",
                            description: "Access to all create endpoints"
                          },
                          {
                            name: "read",
                            description: "Access to all read endpoints"
                          },
                          {
                            name: "update",
                            description: "Access to all update endpoints"
                          },
                          {
                            name: "delete",
                            description: "Access to all delete endpoints"
                          },
                          {
                            name: "associate",
                            description: "Access to all association endpoints"
                          },
                          {
                            name: "nothing",
                            description: "Permission with no use."
                          }
                        ];

                        const request = {
                          method: 'POST',
                          url: '/permission',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        permissions = permissions.concat(response.result);

                        let payload = [
                          permissions.find(function (p) { return p.name === 'create'; })._id,
                          permissions.find(function (p) { return p.name === 'read'; })._id,
                          permissions.find(function (p) { return p.name === 'update'; })._id,
                          permissions.find(function (p) { return p.name === 'delete'; })._id
                        ];

                        const request = {
                          method: 'POST',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          { enabled: true, childId: permissions.find(function (p) { return p.name === 'nothing'; })._id },
                          { enabled: false, childId: permissions.find(function (p) { return p.name === 'associate'; })._id }
                        ];

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;

                        const request = {
                          method: 'PUT',
                          url: '/role/{ownerId}/permission/{childId}',
                          params: { ownerId: roles[1]._id, childId: childId },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;
                        let payload = { enabled: false };
                        const request = {
                          method: 'PUT',
                          url: '/user/{ownerId}/permissions/{childId}',
                          params: { ownerId: users[0]._id, childId: childId },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{_id}',
                          params: { _id: roles[1]._id },
                          query: { $embed: ['permissions'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: { $embed: ['permissions'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        promises.push(Mongoose.model('user_permission').find({ user: users[0]._id, permission: permissions[0]._id }).exec());

                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let result1_orig = response[0].result.permissions.map(function(obj) {
                          return obj.permission;
                        });
                        let result2_orig = response[2].result.permissions.map(function(obj) {
                          obj.permission.user_permission = { user: response[2].result._id, enabled: obj.enabled };
                          return obj.permission;
                        });
                        //EXPL: rearrange results to match order
                        let result1 = [];
                        response[1].result.docs.forEach(function(permission) {
                          result1.push(result1_orig.find(function(perm) { return perm.name === permission.name }));
                        });
                        let result2 = [];
                        response[3].result.docs.forEach(function(permission) {
                          result2.push(result2_orig.find(function(perm) { return perm.name === permission.name }));
                        });
                        t.deepEquals(response[1].result.docs, result1, 'MANY_MANY association correct');
                        t.deepEquals(response[3].result.docs, result2, 'MANY_MANY association correct');
                        t.deepEquals(response[4][0].enabled, false, 'MANY_MANY associations in linking collection')
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        delete Mongoose.models.role;
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //adding and retrieving _MANY associations works
              .then(function () {
                return t.test('adding and retrieving _MANY associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

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
                          },
                        ];

                        const request = {
                          method: 'POST',
                          url: '/hashtag',
                          params: {},
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        hashtags = hashtags.concat(response.result);

                        let payload =
                        {
                          tags: [hashtags[0]._id, hashtags[1]._id]
                        };

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload =
                        {
                          tags: [hashtags[0]._id, hashtags[2]._id, hashtags[4]._id]
                        };

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: users[1]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'PUT',
                          url: '/user/{ownerId}/hashtag/{childId}',
                          params: { ownerId: users[0]._id, childId: hashtags[2]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          hashtags[2]._id, //NOTE: duplicate, should only be added once
                          hashtags[3]._id
                        ];

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: { $embed: ['tags'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[1]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let result1 = [hashtags[0], hashtags[1], hashtags[2], hashtags[3]];
                        let result2 = [hashtags[0], hashtags[2], hashtags[4]];
                        t.deepEquals(response[0].result.tags, result1, '_MANY association correct');
                        t.deepEquals(response[1].result.docs, result2, '_MANY association correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //removing ONE_MANY/MANY_ONE associations works
              .then(function () {
                return t.test('removing ONE_MANY/MANY_ONE associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/people/{childId}',
                          params: { ownerId: roles[0]._id, childId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          users[1]._id,
                          users[2]._id,
                          users[3]._id //NOTE: this user doesn't belong to the role, so the association shouldn't be removed from the user
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: { $embed: ['title'] },
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let result2 = true;
                        let result3 = false;
                        response[1].result.docs.forEach(function(user) {
                          if (user.title && user.title.toString() !== roles[1]._id.toString()) {
                            result2 = false;
                          }
                          if (user.title && user.title.toString() === roles[1]._id.toString()) {
                            result3 = true;
                          }
                        });
                        t.deepEquals(response[0].result.docs, [], 'ONE_MANY associations removed');
                        t.ok(result2, "MANY_ONE associations removed");
                        t.ok(result3, "Admin role not removed")
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //removing MANY_MANY associations works
              .then(function () {
                return t.test('removing MANY_MANY associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/permission/{childId}',
                          params: { ownerId: roles[1]._id, childId: childId},
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let childId = permissions.find(function (p) { return p.name === 'root'; })._id;
                        let payload = { enabled: false };
                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/permissions/{childId}',
                          params: { ownerId: users[0]._id, childId: childId },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          permissions.find(function (p) { return p.name === 'create'; })._id,
                          permissions.find(function (p) { return p.name === 'read'; })._id,
                          permissions.find(function (p) { return p.name === 'update'; })._id,
                          permissions.find(function (p) { return p.name === 'delete'; })._id
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          permissions.find(function (p) { return p.name === 'nothing'; })._id,
                          permissions.find(function (p) { return p.name === 'associate'; })._id
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        t.deepEquals(response[0].result.docs, [], 'MANY_MANY associations removed');
                        t.deepEquals(response[1].result.docs, [], 'MANY_MANY associations removed');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //removing _MANY associations works
              .then(function () {
                return t.test('removing ONE_MANY/MANY_ONE associations works', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'ERROR',
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models',
                    embedAssociations: false
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag/{childId}',
                          params: { ownerId: users[0]._id, childId: hashtags[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        let payload = [
                          hashtags[1]._id,
                          hashtags[2]._id,
                          hashtags[3]._id
                        ];

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: payload,
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })
                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        t.deepEquals(response[0].result.docs, [], '_MANY associations removed');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });

                        return mockgoose.helper.reset();
                      });
                  //</editor-fold>
                });
              })
        })
      })
      .then(function() {
        return t.test('audit log tests', function (t) {
          let users = [];
          let userProfiles = [];
          let roles = [];
          let permissions = [];
          let hashtags = [];
          return Q.when()
          //create action logged
              .then(function () {
                return t.test('create action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server({ debug: false });
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'NONE',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const userId = new Mongoose.Types.ObjectId();

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: [{
                            email: 'test@user.com',
                            password: 'root'
                          }, {
                            email: 'test@user2.com',
                            password: 'root'
                          }, {
                            email: 'test@user3.com',
                            password: 'root'
                          }, {
                            email: 'test@user4.com',
                            password: 'root'
                          }, {
                            email: 'test@user5.com',
                            password: 'root'
                          }, {
                            email: 'test@user6.com',
                            password: 'root'
                          }, {
                            email: 'test@user7.com',
                            password: 'root'
                          }],
                          credentials: {
                            user: { _id: userId }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        users = users.concat(response.result);

                        const request = {
                          method: 'POST',
                          url: '/role',
                          params: {},
                          query: {},
                          payload: {
                            name: 'User'
                          },
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {
                        roles = roles.concat(response.result);

                        const request = {
                          method: 'POST',
                          url: '/role',
                          params: {},
                          query: {},
                          payload: [{
                            name: 'Admin'
                          }, {
                            name: 'SuperAdmin'
                          }],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {
                        roles = roles.concat(response.result);

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: {
                            email: 'test@user.com',
                            password: 'duplicate_user'
                          },
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[1];
                        let log2 = response[0].result.docs[2];
                        let log3 = response[0].result.docs[3];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        log3.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'POST', 'method correct');
                        t.deepEqual(log1.action, 'Create', 'action correct');
                        t.deepEqual(log1.endpoint, '/role', 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log1.params, null, 'params correct');
                        t.deepEqual(log1.result, roles[0], 'result correct');
                        t.deepEqual(log1.payload, { name: 'User' }, 'payload correct');
                        t.deepEqual(log1.documents, [ roles[0]._id ], 'documents correct');
                        t.deepEqual(log1.user, users[0]._id, 'user correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 201, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'POST', 'method correct');
                        t.deepEqual(log2.action, 'Create', 'action correct');
                        t.deepEqual(log2.endpoint, '/role', 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log2.params, null, 'params correct');
                        t.deepEqual(log2.result, [roles[1], roles[2]], 'result correct');
                        t.deepEqual(log2.payload, [{ name: 'Admin' }, { name: 'SuperAdmin'}], 'payload correct');
                        t.deepEqual(log2.documents, [ roles[1]._id, roles[2]._id ], 'documents correct');
                        t.deepEqual(log2.user, users[0]._id, 'user correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, false, 'isError correct');
                        t.deepEqual(log2.statusCode, 201, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log3.method, 'POST', 'method correct');
                        t.deepEqual(log3.action, 'Create', 'action correct');
                        t.deepEqual(log3.endpoint, '/user', 'endpoint correct');
                        t.deepEqual(log3.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log3.params, null, 'params correct');
                        t.deepEqual(log3.result, null, 'result correct');
                        t.deepEqual(log3.payload, { email: 'test@user.com', password: "duplicate_user" }, 'payload correct');
                        t.deepEqual(log3.documents, null, 'documents correct');
                        t.deepEqual(log3.user, users[0]._id, 'user correct');
                        t.deepEqual(log3.date, now, 'date correct');
                        t.deepEqual(log3.isError, true, 'isError correct');
                        t.deepEqual(log3.statusCode, 500, 'statusCode correct');
                        t.deepEqual(log3.responseMessage, 'An internal server error occurred', 'responseMessage correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //update action logged
              .then(function () {
                return t.test('update action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server({ debug: false });
                  server.connection(RestHapi.config.server.connection);

                  const config = {
                    loglevel: 'NONE',
                    authStrategy: null,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: {},
                          payload: {
                            email: 'test@user1.com'
                          },
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {
                        users[0] = response.result;

                        const request = {
                          method: 'PUT',
                          url: '/user/{_id}',
                          params: { _id: users[0]._id },
                          query: {},
                          payload: {
                            email: 'error@user.com'
                          },
                          credentials: {},
                          headers: {}
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[4];
                        let log2 = response[0].result.docs[5];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'PUT', 'method correct');
                        t.deepEqual(log1.action, 'Update', 'action correct');
                        t.deepEqual(log1.endpoint, '/user/' + users[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log1.params, { _id: users[0]._id.toString() }, 'params correct');
                        t.deepEqual(log1.result, users[0], 'result correct');
                        t.deepEqual(log1.payload, { email: 'test@user1.com' }, 'payload correct');
                        t.deepEqual(log1.documents, [ users[0]._id ], 'documents correct');
                        t.deepEqual(log1.user, null, 'user correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 200, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'PUT', 'method correct');
                        t.deepEqual(log2.action, 'Update', 'action correct');
                        t.deepEqual(log2.endpoint, '/user/' + users[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log2.params, { _id: users[0]._id.toString() }, 'params correct');
                        t.deepEqual(log2.result, null, 'result correct');
                        t.deepEqual(log2.payload, { email: 'error@user.com' }, 'payload correct');
                        t.deepEqual(log2.documents, [ users[0]._id ], 'documents correct');
                        t.deepEqual(log2.user, null, 'user correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, true, 'isError correct');
                        t.deepEqual(log2.statusCode, 400, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, 'user error', 'responseMessage correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //regular delete action logged
              .then(function () {
                return t.test('regular delete action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'NONE',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'Delete',
                          url: '/user/{_id}',
                          params: { _id: users[1]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'Delete',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: [users[2]._id, users[3]._id],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'Delete',
                          url: '/user/{_id}',
                          params: { _id: users[1]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[6];
                        let log2 = response[0].result.docs[7];
                        let log3 = response[0].result.docs[8];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        log3.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'DELETE', 'method correct');
                        t.deepEqual(log1.action, 'Delete', 'action correct');
                        t.deepEqual(log1.endpoint, '/user/' + users[1]._id.toString(), 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log1.params, { _id: users[1]._id.toString() }, 'params correct');
                        t.deepEqual(log1.result, null, 'result correct');
                        t.deepEqual(log1.payload, null, 'payload correct');
                        t.deepEqual(log1.documents, [ users[1]._id ], 'documents correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'DELETE', 'method correct');
                        t.deepEqual(log2.action, 'Delete', 'action correct');
                        t.deepEqual(log2.endpoint, '/user', 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log2.params, null, 'params correct');
                        t.deepEqual(log2.result, null, 'result correct');
                        t.deepEqual(log2.payload, [users[2]._id.toString(), users[3]._id.toString()], 'payload correct');
                        t.deepEqual(log2.documents, [ users[2]._id, users[3]._id ], 'documents correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, false, 'isError correct');
                        t.deepEqual(log2.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log3.method, 'DELETE', 'method correct');
                        t.deepEqual(log3.action, 'Delete', 'action correct');
                        t.deepEqual(log3.endpoint, '/user/' + users[1]._id.toString(), 'endpoint correct');
                        t.deepEqual(log3.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log3.params, { _id: users[1]._id.toString() }, 'params correct');
                        t.deepEqual(log3.result, null, 'result correct');
                        t.deepEqual(log3.payload, null, 'payload correct');
                        t.deepEqual(log3.documents, [ users[1]._id ], 'documents correct');
                        t.deepEqual(log3.date, now, 'date correct');
                        t.deepEqual(log3.isError, true, 'isError correct');
                        t.deepEqual(log3.statusCode, 404, 'statusCode correct');
                        t.deepEqual(log3.responseMessage, 'No resource was found with that id.', 'responseMessage correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //soft delete action logged
              .then(function () {
                return t.test('soft delete action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'ERROR',
                    authStrategy: authStrategy,
                    enableSoftDelete: true,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'Delete',
                          url: '/user/{_id}',
                          params: { _id: users[4]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'Delete',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: [users[5]._id, users[6]._id],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[9];
                        let log2 = response[0].result.docs[10];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'DELETE', 'method correct');
                        t.deepEqual(log1.action, 'Delete', 'action correct');
                        t.deepEqual(log1.endpoint, '/user/' + users[4]._id.toString(), 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log1.params, { _id: users[4]._id.toString() }, 'params correct');
                        t.deepEqual(log1.result, null, 'result correct');
                        t.deepEqual(log1.payload, null, 'payload correct');
                        t.deepEqual(log1.documents, [ users[4]._id ], 'documents correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'DELETE', 'method correct');
                        t.deepEqual(log2.action, 'Delete', 'action correct');
                        t.deepEqual(log2.endpoint, '/user', 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log2.params, null, 'params correct');
                        t.deepEqual(log2.result, null, 'result correct');
                        t.deepEqual(log2.payload, [users[5]._id.toString(), users[6]._id.toString()], 'payload correct');
                        t.deepEqual(log2.documents, [ users[5]._id, users[6]._id ], 'documents correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, false, 'isError correct');
                        t.deepEqual(log2.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, null, 'responseMessage correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //hard delete action logged
              .then(function () {
                return t.test('hard delete action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'NONE',
                    authStrategy: authStrategy,
                    enableSoftDelete: true,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'Delete',
                          url: '/user/{_id}',
                          params: { _id: users[4]._id },
                          query: {},
                          payload: { hardDelete: true },
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'Delete',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: [{ _id: users[5]._id, hardDelete: true }, { _id: users[6]._id, hardDelete: true}],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[11];
                        let log2 = response[0].result.docs[12];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'DELETE', 'method correct');
                        t.deepEqual(log1.action, 'Delete', 'action correct');
                        t.deepEqual(log1.endpoint, '/user/' + users[4]._id.toString(), 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log1.params, { _id: users[4]._id.toString() }, 'params correct');
                        t.deepEqual(log1.result, null, 'result correct');
                        t.deepEqual(log1.payload, { hardDelete: true }, 'payload correct');
                        t.deepEqual(log1.documents, [ users[4]._id ], 'documents correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'DELETE', 'method correct');
                        t.deepEqual(log2.action, 'Delete', 'action correct');
                        t.deepEqual(log2.endpoint, '/user', 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log2.params, null, 'params correct');
                        t.deepEqual(log2.result, null, 'result correct');
                        t.deepEqual(log2.payload, [{ _id: users[5]._id.toString(), hardDelete: true }, { _id: users[6]._id.toString(), hardDelete: true }], 'payload correct');
                        t.deepEqual(log2.documents, [ users[5]._id, users[6]._id ], 'documents correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, false, 'isError correct');
                        t.deepEqual(log2.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, null, 'responseMessage correct');
                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //add action logged
              .then(function () {
                return t.test('add action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'NONE',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const userId = new Mongoose.Types.ObjectId();

                        const request = {
                          method: 'POST',
                          url: '/user',
                          params: {},
                          query: {},
                          payload: [{
                            email: 'test@user2.com',
                            password: 'root'
                          }, {
                            email: 'test@user3.com',
                            password: 'root'
                          }, {
                            email: 'test@user4.com',
                            password: 'root'
                          }, {
                            email: 'test@user5.com',
                            password: 'root'
                          }, {
                            email: 'test@admin.com',
                            password: 'root'
                          }, {
                            email: 'test@superadmin.com',
                            password: 'root'
                          }],
                          credentials: {
                            user: { _id: userId }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        users = [users[0]].concat(response.result);

                        const userId = new Mongoose.Types.ObjectId();

                        const request = {
                          method: 'POST',
                          url: '/permission',
                          params: {},
                          query: {},
                          payload: [{
                            name: 'root'
                          }, {
                            name: 'read'
                          }, {
                            name: 'create'
                          }, {
                            name: 'update'
                          }, {
                            name: 'delete'
                          }, {
                            name: 'nothing'
                          }],
                          credentials: {
                            user: { _id: userId }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        permissions = permissions.concat(response.result);

                        const userId = new Mongoose.Types.ObjectId();

                        const request = {
                          method: 'POST',
                          url: '/hashtag',
                          params: {},
                          query: {},
                          payload: [
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
                            },
                          ],
                          credentials: {
                            user: { _id: userId }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        hashtags = hashtags.concat(response.result);

                        const request = {
                          method: 'PUT',
                          url: '/role/{ownerId}/people/{childId}',
                          params: { ownerId: roles[0]._id, childId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'POST',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: [ users[1]._id, users[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'PUT',
                          url: '/role/{ownerId}/permission/{childId}',
                          params: { ownerId: roles[0]._id, childId: permissions[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'POST',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: [ { childId: permissions[1]._id }, { childId: permissions[2]._id } ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'PUT',
                          url: '/user/{ownerId}/permissions/{childId}',
                          params: { ownerId: users[0]._id, childId: permissions[0]._id },
                          query: {},
                          payload: { enabled: false },
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[5]._id },
                          query: {},
                          payload: [ { childId: permissions[1]._id, enabled: true }, { childId: permissions[2]._id, enabled: true } ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'PUT',
                          url: '/user/{ownerId}/hashtag/{childId}',
                          params: { ownerId: users[0]._id, childId: hashtags[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: [ hashtags[1]._id, hashtags[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'POST',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: [ hashtags[1]._id, hashtags[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[16];
                        let log2 = response[0].result.docs[17];
                        let log3 = response[0].result.docs[18];
                        let log4 = response[0].result.docs[19];
                        let log5 = response[0].result.docs[20];
                        let log6 = response[0].result.docs[21];
                        let log7 = response[0].result.docs[22];
                        let log8 = response[0].result.docs[23];
                        let log9 = response[0].result.docs[24];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        log3.date.setUTCMinutes(0, 0, 0);
                        log4.date.setUTCMinutes(0, 0, 0);
                        log5.date.setUTCMinutes(0, 0, 0);
                        log6.date.setUTCMinutes(0, 0, 0);
                        log7.date.setUTCMinutes(0, 0, 0);
                        log8.date.setUTCMinutes(0, 0, 0);
                        log9.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'PUT', 'method correct');
                        t.deepEqual(log1.action, 'Add', 'action correct');
                        t.deepEqual(log1.endpoint, '/role/' + roles[0]._id.toString() + '/people/' + users[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log1.childCollectionName, 'user', 'childCollectionName correct');
                        t.deepEqual(log1.associationType, 'ONE_MANY', 'associationType correct');
                        t.deepEqual(log1.params, { ownerId: roles[0]._id.toString(), childId: users[0]._id.toString() }, 'params correct');
                        t.deepEqual(log1.result, null, 'result correct');
                        t.deepEqual(log1.payload, null, 'payload correct');
                        t.deepEqual(log1.documents, [ roles[0]._id, users[0]._id ], 'documents correct');
                        t.deepEqual(log1.user, users[0]._id, 'user correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'POST', 'method correct');
                        t.deepEqual(log2.action, 'Add', 'action correct');
                        t.deepEqual(log2.endpoint, '/role/' + roles[0]._id.toString() + '/people', 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log2.childCollectionName, 'user', 'childCollectionName correct');
                        t.deepEqual(log2.associationType, 'ONE_MANY', 'associationType correct');
                        t.deepEqual(log2.params, { ownerId: roles[0]._id.toString() }, 'params correct');
                        t.deepEqual(log2.result, null, 'result correct');
                        t.deepEqual(log2.payload, [ users[1]._id.toString(), users[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log2.documents, [ roles[0]._id, users[1]._id, users[2]._id ], 'documents correct');
                        t.deepEqual(log2.user, users[0]._id, 'user correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, false, 'isError correct');
                        t.deepEqual(log2.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log3.method, 'PUT', 'method correct');
                        t.deepEqual(log3.action, 'Add', 'action correct');
                        t.deepEqual(log3.endpoint, '/role/' + roles[0]._id.toString() + '/permission/' + permissions[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log3.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log3.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log3.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log3.params, { ownerId: roles[0]._id.toString(), childId: permissions[0]._id.toString() }, 'params correct');
                        t.deepEqual(log3.result, null, 'result correct');
                        t.deepEqual(log3.payload, null, 'payload correct');
                        t.deepEqual(log3.documents, [ roles[0]._id, permissions[0]._id ], 'documents correct');
                        t.deepEqual(log3.user, users[0]._id, 'user correct');
                        t.deepEqual(log3.date, now, 'date correct');
                        t.deepEqual(log3.isError, false, 'isError correct');
                        t.deepEqual(log3.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log3.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log4.method, 'POST', 'method correct');
                        t.deepEqual(log4.action, 'Add', 'action correct');
                        t.deepEqual(log4.endpoint, '/role/' + roles[1]._id.toString() + '/permission', 'endpoint correct');
                        t.deepEqual(log4.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log4.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log4.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log4.params, { ownerId: roles[1]._id.toString() }, 'params correct');
                        t.deepEqual(log4.result, null, 'result correct');
                        t.deepEqual(log4.payload, [ { childId: permissions[1]._id.toString() }, { childId: permissions[2]._id.toString() } ], 'payload correct');
                        t.deepEqual(log4.documents, [ roles[1]._id, permissions[1]._id, permissions[2]._id ], 'documents correct');
                        t.deepEqual(log4.user, users[0]._id, 'user correct');
                        t.deepEqual(log4.date, now, 'date correct');
                        t.deepEqual(log4.isError, false, 'isError correct');
                        t.deepEqual(log4.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log4.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log5.method, 'PUT', 'method correct');
                        t.deepEqual(log5.action, 'Add', 'action correct');
                        t.deepEqual(log5.endpoint, '/user/' + users[0]._id.toString() + '/permissions/' + permissions[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log5.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log5.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log5.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log5.params, { ownerId: users[0]._id.toString(), childId: permissions[0]._id.toString() }, 'params correct');
                        t.deepEqual(log5.result, null, 'result correct');
                        t.deepEqual(log5.payload, { enabled: false }, 'payload correct');
                        t.deepEqual(log5.documents, [ users[0]._id, permissions[0]._id ], 'documents correct');
                        t.deepEqual(log5.user, users[0]._id, 'user correct');
                        t.deepEqual(log5.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log6.method, 'POST', 'method correct');
                        t.deepEqual(log6.action, 'Add', 'action correct');
                        t.deepEqual(log6.endpoint, '/user/' + users[5]._id.toString() + '/permissions', 'endpoint correct');
                        t.deepEqual(log6.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log6.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log6.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log6.params, { ownerId: users[5]._id.toString() }, 'params correct');
                        t.deepEqual(log6.result, null, 'result correct');
                        t.deepEqual(log6.payload, [ { childId: permissions[1]._id.toString(), enabled: true }, { childId: permissions[2]._id.toString(), enabled: true } ], 'payload correct');
                        t.deepEqual(log6.documents, [ users[5]._id, permissions[1]._id, permissions[2]._id ], 'documents correct');
                        t.deepEqual(log6.user, users[0]._id, 'user correct');
                        t.deepEqual(log6.date, now, 'date correct');
                        t.deepEqual(log6.isError, false, 'isError correct');
                        t.deepEqual(log6.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log6.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log7.method, 'PUT', 'method correct');
                        t.deepEqual(log7.action, 'Add', 'action correct');
                        t.deepEqual(log7.endpoint, '/user/' + users[0]._id.toString() + '/hashtag/' + hashtags[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log7.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log7.childCollectionName, 'hashtag', 'childCollectionName correct');
                        t.deepEqual(log7.associationType, '_MANY', 'associationType correct');
                        t.deepEqual(log7.params, { ownerId: users[0]._id.toString(), childId: hashtags[0]._id.toString() }, 'params correct');
                        t.deepEqual(log7.result, null, 'result correct');
                        t.deepEqual(log7.payload, null, 'payload correct');
                        t.deepEqual(log7.documents, [ users[0]._id, hashtags[0]._id ], 'documents correct');
                        t.deepEqual(log7.user, users[0]._id, 'user correct');
                        t.deepEqual(log7.date, now, 'date correct');
                        t.deepEqual(log7.isError, false, 'isError correct');
                        t.deepEqual(log7.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log7.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log8.method, 'POST', 'method correct');
                        t.deepEqual(log8.action, 'Add', 'action correct');
                        t.deepEqual(log8.endpoint, '/user/' + users[0]._id.toString() + '/hashtag', 'endpoint correct');
                        t.deepEqual(log8.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log8.childCollectionName, 'hashtag', 'childCollectionName correct');
                        t.deepEqual(log8.associationType, '_MANY', 'associationType correct');
                        t.deepEqual(log8.params, { ownerId: users[0]._id.toString() }, 'params correct');
                        t.deepEqual(log8.result, null, 'result correct');
                        t.deepEqual(log8.payload, [ hashtags[1]._id.toString(), hashtags[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log8.documents, [ users[0]._id, hashtags[1]._id, hashtags[2]._id ], 'documents correct');
                        t.deepEqual(log8.user, users[0]._id, 'user correct');
                        t.deepEqual(log8.date, now, 'date correct');
                        t.deepEqual(log8.isError, false, 'isError correct');
                        t.deepEqual(log8.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log8.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log9.method, 'POST', 'method correct');
                        t.deepEqual(log9.action, 'Add', 'action correct');
                        t.deepEqual(log9.endpoint, '/user/' + roles[0]._id.toString() + '/hashtag', 'endpoint correct');
                        t.deepEqual(log9.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log9.childCollectionName, 'hashtag', 'childCollectionName correct');
                        t.deepEqual(log9.associationType, '_MANY', 'associationType correct');
                        t.deepEqual(log9.params, { ownerId: roles[0]._id.toString() }, 'params correct');
                        t.deepEqual(log9.result, null, 'result correct');
                        t.deepEqual(log9.payload, [ hashtags[1]._id.toString(), hashtags[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log9.documents, [ roles[0]._id, hashtags[1]._id, hashtags[2]._id ], 'documents correct');
                        t.deepEqual(log9.user, users[0]._id, 'user correct');
                        t.deepEqual(log9.date, now, 'date correct');
                        t.deepEqual(log9.isError, true, 'isError correct');
                        t.deepEqual(log9.statusCode, 404, 'statusCode correct');
                        t.deepEqual(log9.responseMessage, 'No owner resource was found with that id.', 'responseMessage correct');
                        

                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
              //remove action logged
              .then(function () {
                return t.test('remove action logged', function (t) {
                  //<editor-fold desc="Arrange">
                  const RestHapi = require('../rest-hapi');
                  const server = new Hapi.Server();
                  server.connection(RestHapi.config.server.connection);

                  const authStrategy = 'testStrategy';

                  TestHelper.mockStrategy(server, authStrategy);

                  const config = {
                    loglevel: 'NONE',
                    authStrategy: authStrategy,
                    absoluteModelPath: true,
                    modelPath: __dirname + '/test-scenarios/scenario-3/models'
                  };

                  let promises = [];

                  RestHapi.config = config;

                  return server.register({
                    register: RestHapi,
                    options: {
                      mongoose: Mongoose
                    }
                  })
                      .then(function () {
                        server.start();

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/people/{childId}',
                          params: { ownerId: roles[0]._id, childId: users[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/people',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: [ users[1]._id, users[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/permission/{childId}',
                          params: { ownerId: roles[0]._id, childId: permissions[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/role/{ownerId}/permission',
                          params: { ownerId: roles[1]._id },
                          query: {},
                          payload: [ permissions[1]._id, permissions[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/permissions/{childId}',
                          params: { ownerId: users[0]._id, childId: permissions[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/permissions',
                          params: { ownerId: users[5]._id },
                          query: {},
                          payload: [ permissions[1]._id, permissions[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag/{childId}',
                          params: { ownerId: users[0]._id, childId: hashtags[0]._id },
                          query: {},
                          payload: {},
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: users[0]._id },
                          query: {},
                          payload: [ hashtags[1]._id, hashtags[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'DELETE',
                          url: '/user/{ownerId}/hashtag',
                          params: { ownerId: roles[0]._id },
                          query: {},
                          payload: [ hashtags[1]._id, hashtags[2]._id ],
                          credentials: {
                            user: { _id: users[0]._id }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        return server.inject(injectOptions);
                      })
                      .then(function (response) {

                        const request = {
                          method: 'GET',
                          url: '/auditLog',
                          params: {},
                          query: { $sort: '_id' },
                          payload: {},
                          credentials: {
                            user: { _id: 'testId' }
                          },
                          headers: {
                            authorization: "testAuth"
                          }
                        };

                        const injectOptions = TestHelper.mockInjection(request);

                        promises.push(server.inject(injectOptions));
                      })

                      //</editor-fold>

                      //<editor-fold desc="Act">
                      .then(function () {
                        return Q.all(promises)
                      })
                      //</editor-fold>

                      //<editor-fold desc="Assert">
                      .then(function (response) {
                        let now = new Date();
                        now.setUTCMinutes(0, 0, 0);
                        let log1 = response[0].result.docs[25];
                        let log2 = response[0].result.docs[26];
                        let log3 = response[0].result.docs[27];
                        let log4 = response[0].result.docs[28];
                        let log5 = response[0].result.docs[29];
                        let log6 = response[0].result.docs[30];
                        let log7 = response[0].result.docs[31];
                        let log8 = response[0].result.docs[32];
                        let log9 = response[0].result.docs[33];
                        log1.date.setUTCMinutes(0, 0, 0);
                        log2.date.setUTCMinutes(0, 0, 0);
                        log3.date.setUTCMinutes(0, 0, 0);
                        log4.date.setUTCMinutes(0, 0, 0);
                        log5.date.setUTCMinutes(0, 0, 0);
                        log6.date.setUTCMinutes(0, 0, 0);
                        log7.date.setUTCMinutes(0, 0, 0);
                        log8.date.setUTCMinutes(0, 0, 0);
                        log9.date.setUTCMinutes(0, 0, 0);
                        t.deepEqual(log1.method, 'DELETE', 'method correct');
                        t.deepEqual(log1.action, 'Remove', 'action correct');
                        t.deepEqual(log1.endpoint, '/role/' + roles[0]._id.toString() + '/people/' + users[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log1.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log1.childCollectionName, 'user', 'childCollectionName correct');
                        t.deepEqual(log1.associationType, 'ONE_MANY', 'associationType correct');
                        t.deepEqual(log1.params, { ownerId: roles[0]._id.toString(), childId: users[0]._id.toString() }, 'params correct');
                        t.deepEqual(log1.result, null, 'result correct');
                        t.deepEqual(log1.payload, null, 'payload correct');
                        t.deepEqual(log1.documents, [ roles[0]._id, users[0]._id ], 'documents correct');
                        t.deepEqual(log1.user, users[0]._id, 'user correct');
                        t.deepEqual(log1.date, now, 'date correct');
                        t.deepEqual(log1.isError, false, 'isError correct');
                        t.deepEqual(log1.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log1.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log2.method, 'DELETE', 'method correct');
                        t.deepEqual(log2.action, 'Remove', 'action correct');
                        t.deepEqual(log2.endpoint, '/role/' + roles[0]._id.toString() + '/people', 'endpoint correct');
                        t.deepEqual(log2.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log2.childCollectionName, 'user', 'childCollectionName correct');
                        t.deepEqual(log2.associationType, 'ONE_MANY', 'associationType correct');
                        t.deepEqual(log2.params, { ownerId: roles[0]._id.toString() }, 'params correct');
                        t.deepEqual(log2.result, null, 'result correct');
                        t.deepEqual(log2.payload, [ users[1]._id.toString(), users[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log2.documents, [ roles[0]._id, users[1]._id, users[2]._id ], 'documents correct');
                        t.deepEqual(log2.user, users[0]._id, 'user correct');
                        t.deepEqual(log2.date, now, 'date correct');
                        t.deepEqual(log2.isError, false, 'isError correct');
                        t.deepEqual(log2.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log2.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log3.method, 'DELETE', 'method correct');
                        t.deepEqual(log3.action, 'Remove', 'action correct');
                        t.deepEqual(log3.endpoint, '/role/' + roles[0]._id.toString() + '/permission/' + permissions[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log3.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log3.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log3.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log3.params, { ownerId: roles[0]._id.toString(), childId: permissions[0]._id.toString() }, 'params correct');
                        t.deepEqual(log3.result, null, 'result correct');
                        t.deepEqual(log3.payload, null, 'payload correct');
                        t.deepEqual(log3.documents, [ roles[0]._id, permissions[0]._id ], 'documents correct');
                        t.deepEqual(log3.user, users[0]._id, 'user correct');
                        t.deepEqual(log3.date, now, 'date correct');
                        t.deepEqual(log3.isError, false, 'isError correct');
                        t.deepEqual(log3.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log3.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log4.method, 'DELETE', 'method correct');
                        t.deepEqual(log4.action, 'Remove', 'action correct');
                        t.deepEqual(log4.endpoint, '/role/' + roles[1]._id.toString() + '/permission', 'endpoint correct');
                        t.deepEqual(log4.collectionName, 'role', 'collectionName correct');
                        t.deepEqual(log4.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log4.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log4.params, { ownerId: roles[1]._id.toString() }, 'params correct');
                        t.deepEqual(log4.result, null, 'result correct');
                        t.deepEqual(log4.payload, [ permissions[1]._id.toString(), permissions[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log4.documents, [ roles[1]._id, permissions[1]._id, permissions[2]._id ], 'documents correct');
                        t.deepEqual(log4.user, users[0]._id, 'user correct');
                        t.deepEqual(log4.date, now, 'date correct');
                        t.deepEqual(log4.isError, false, 'isError correct');
                        t.deepEqual(log4.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log4.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log5.method, 'DELETE', 'method correct');
                        t.deepEqual(log5.action, 'Remove', 'action correct');
                        t.deepEqual(log5.endpoint, '/user/' + users[0]._id.toString() + '/permissions/' + permissions[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log5.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log5.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log5.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log5.params, { ownerId: users[0]._id.toString(), childId: permissions[0]._id.toString() }, 'params correct');
                        t.deepEqual(log5.result, null, 'result correct');
                        t.deepEqual(log5.payload, null, 'payload correct');
                        t.deepEqual(log5.documents, [ users[0]._id, permissions[0]._id ], 'documents correct');
                        t.deepEqual(log5.user, users[0]._id, 'user correct');
                        t.deepEqual(log5.date, now, 'date correct');
                        t.deepEqual(log5.isError, false, 'isError correct');
                        t.deepEqual(log5.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log5.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log6.method, 'DELETE', 'method correct');
                        t.deepEqual(log6.action, 'Remove', 'action correct');
                        t.deepEqual(log6.endpoint, '/user/' + users[5]._id.toString() + '/permissions', 'endpoint correct');
                        t.deepEqual(log6.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log6.childCollectionName, 'permission', 'childCollectionName correct');
                        t.deepEqual(log6.associationType, 'MANY_MANY', 'associationType correct');
                        t.deepEqual(log6.params, { ownerId: users[5]._id.toString() }, 'params correct');
                        t.deepEqual(log6.result, null, 'result correct');
                        t.deepEqual(log6.payload, [ permissions[1]._id.toString(), permissions[2]._id.toString()], 'payload correct');
                        t.deepEqual(log6.documents, [ users[5]._id, permissions[1]._id, permissions[2]._id ], 'documents correct');
                        t.deepEqual(log6.user, users[0]._id, 'user correct');
                        t.deepEqual(log6.date, now, 'date correct');
                        t.deepEqual(log6.isError, false, 'isError correct');
                        t.deepEqual(log6.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log6.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log7.method, 'DELETE', 'method correct');
                        t.deepEqual(log7.action, 'Remove', 'action correct');
                        t.deepEqual(log7.endpoint, '/user/' + users[0]._id.toString() + '/hashtag/' + hashtags[0]._id.toString(), 'endpoint correct');
                        t.deepEqual(log7.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log7.childCollectionName, 'hashtag', 'childCollectionName correct');
                        t.deepEqual(log7.associationType, '_MANY', 'associationType correct');
                        t.deepEqual(log7.params, { ownerId: users[0]._id.toString(), childId: hashtags[0]._id.toString() }, 'params correct');
                        t.deepEqual(log7.result, null, 'result correct');
                        t.deepEqual(log7.payload, null, 'payload correct');
                        t.deepEqual(log7.documents, [ users[0]._id, hashtags[0]._id ], 'documents correct');
                        t.deepEqual(log7.user, users[0]._id, 'user correct');
                        t.deepEqual(log7.date, now, 'date correct');
                        t.deepEqual(log7.isError, false, 'isError correct');
                        t.deepEqual(log7.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log7.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log8.method, 'DELETE', 'method correct');
                        t.deepEqual(log8.action, 'Remove', 'action correct');
                        t.deepEqual(log8.endpoint, '/user/' + users[0]._id.toString() + '/hashtag', 'endpoint correct');
                        t.deepEqual(log8.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log8.childCollectionName, 'hashtag', 'childCollectionName correct');
                        t.deepEqual(log8.associationType, '_MANY', 'associationType correct');
                        t.deepEqual(log8.params, { ownerId: users[0]._id.toString() }, 'params correct');
                        t.deepEqual(log8.result, null, 'result correct');
                        t.deepEqual(log8.payload, [ hashtags[1]._id.toString(), hashtags[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log8.documents, [ users[0]._id, hashtags[1]._id, hashtags[2]._id ], 'documents correct');
                        t.deepEqual(log8.user, users[0]._id, 'user correct');
                        t.deepEqual(log8.date, now, 'date correct');
                        t.deepEqual(log8.isError, false, 'isError correct');
                        t.deepEqual(log8.statusCode, 204, 'statusCode correct');
                        t.deepEqual(log8.responseMessage, null, 'responseMessage correct');

                        t.deepEqual(log9.method, 'DELETE', 'method correct');
                        t.deepEqual(log9.action, 'Remove', 'action correct');
                        t.deepEqual(log9.endpoint, '/user/' + roles[0]._id.toString() + '/hashtag', 'endpoint correct');
                        t.deepEqual(log9.collectionName, 'user', 'collectionName correct');
                        t.deepEqual(log9.childCollectionName, 'hashtag', 'childCollectionName correct');
                        t.deepEqual(log9.associationType, '_MANY', 'associationType correct');
                        t.deepEqual(log9.params, { ownerId: roles[0]._id.toString() }, 'params correct');
                        t.deepEqual(log9.result, null, 'result correct');
                        t.deepEqual(log9.payload, [ hashtags[1]._id.toString(), hashtags[2]._id.toString() ], 'payload correct');
                        t.deepEqual(log9.documents, [ roles[0]._id, hashtags[1]._id, hashtags[2]._id ], 'documents correct');
                        t.deepEqual(log9.user, users[0]._id, 'user correct');
                        t.deepEqual(log9.date, now, 'date correct');
                        t.deepEqual(log9.isError, true, 'isError correct');
                        t.deepEqual(log9.statusCode, 404, 'statusCode correct');
                        t.deepEqual(log9.responseMessage, 'No owner resource was found with that id.', 'responseMessage correct');


                      })
                      //</editor-fold>

                      //<editor-fold desc="Restore">
                      .then(function () {
                        Decache('../rest-hapi');
                        Decache('../config');
                        Object.keys(Mongoose.models).forEach(function(key) { delete Mongoose.models[key]; });
                        Object.keys(Mongoose.modelSchemas).forEach(function(key) { delete Mongoose.modelSchemas[key]; });
                      });
                  //</editor-fold>
                });
              })
        })
      })
      .then(function() {
        return t.test('clearing cache', function (t) {
          return Q.when()
              .then(function() {
                Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })

                t.ok(true, "DONE");
              })
        })
      })

});

