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

  Q.when()
      .then(function() {
        return t.test('basic CRUD tests', function (t) {
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
                        delete Mongoose.models.role;
                        delete Mongoose.modelSchemas.role;
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
                        delete Mongoose.models.role;
                        delete Mongoose.modelSchemas.role;
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
                        delete Mongoose.models.role;
                        delete Mongoose.modelSchemas.role;
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
                        delete Mongoose.models.role;
                        delete Mongoose.modelSchemas.role;
                      });
                  //</editor-fold>
                });
              })
        })
      })
      .then(function() {
        return t.test('document authorization tests', function (t) {
          return mockgoose.prepareStorage()
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
                            user: { _id: 'testId' }
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
                        delete Mongoose.models.role;
                        delete Mongoose.modelSchemas.role;
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
                        delete Mongoose.models.role;
                        delete Mongoose.modelSchemas.role;
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

