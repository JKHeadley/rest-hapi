'use strict';

const test = require('tape');
const _ = require('lodash');
const sinon = require('sinon');
const sinonTestFactory = require('sinon-test');
const sinonTest = sinonTestFactory(sinon);
const rewire = require('rewire');
const proxyquire = require('proxyquire');
const assert = require('assert');
const mongoose = require('mongoose');
const Types = mongoose.Schema.Types;
const logging = require('loggin');
const testHelper = require("../utilities/test-helper");
const Joi = require('joi');
const Boom = require('boom');
const Q = require('q');

let Log = logging.getLogger("tests");
Log.logLevel = "NONE";
Log = Log.bind("enforce-document-scope");

sinon.test = sinonTest;

test('enforce-document-scope exists and has expected members', function (t) {
  //<editor-fold desc="Arrange">
  let enforceDocumentScope = require('../policies/enforce-document-scope');

  t.plan(3);
  //</editor-fold>

  //<editor-fold desc="Assert">
  t.ok(enforceDocumentScope, "enforce-document-scope exists.");
  t.ok(enforceDocumentScope.enforceDocumentScopePre, "enforce-document-scope.enforceDocumentScopePre exists.");
  t.ok(enforceDocumentScope.enforceDocumentScopePost, "enforce-document-scope.enforceDocumentScopePost exists.");
  //</editor-fold>
});

test('enforce-document-scope.compareScopes', function (t) {
  t.test('enforce-document-scope.compareScopes fails if user scope contains forbidden values.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");
    
    let userScope = ['allowed', 'forbidden'];

    let documentScope = ['allowed', '!forbidden'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notok(authorizedForDocument, "compareScopes failed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes passes if user scope does not contain forbidden values.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['allowed'];

    let documentScope = ['allowed', '!forbidden'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(authorizedForDocument, "compareScopes passes");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes fails if user scope does not contain required values.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['allowed'];

    let documentScope = ['allowed', '!forbidden', '+required'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notok(authorizedForDocument, "compareScopes failed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes passes if user scope does contain required values.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['allowed', 'required'];

    let documentScope = ['allowed', '!forbidden', '+required'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(authorizedForDocument, "compareScopes passes");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes fails if user scope does not contain any of the general scope values.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['test'];

    let documentScope = ['allowed'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notok(authorizedForDocument, "compareScopes failed");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes passes if user scope contains at least one general scope value.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['test', 'allowed'];

    let documentScope = ['allowed', 'also_allowed'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(authorizedForDocument, "compareScopes passes");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes passes if user scope contains at least one general scope value.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['test', 'allowed'];

    let documentScope = ['allowed', 'also_allowed'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(authorizedForDocument, "compareScopes passes");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes passes a complex scope.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['test', 'allowed', 'required'];

    let documentScope = ['allowed', '+required', '!forbidden', 'extra'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(authorizedForDocument, "compareScopes passes");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.compareScopes fails a complex scope.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = enforceDocumentScope.__get__("internals.compareScopes");

    let userScope = ['test', 'required', 'nothing'];

    let documentScope = ['allowed', '+required', '!forbidden', 'extra'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let authorizedForDocument = compareScopes(userScope, documentScope);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.notok(authorizedForDocument, "compareScopes fails");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.end();
});

test('enforce-document-scope.verifyScope', function (t) {
  t.test('enforce-document-scope.verifyScope calls compareScope with correct read scope.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot'],
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'read', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(compareScopes.calledWithExactly(userScope, ['testRoot', 'testRead'], Log), "read scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope calls compareScope with correct update scope.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot'],
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'update', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(compareScopes.calledWithExactly(userScope, ['testRoot', 'testUpdate'], Log), "update scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope calls compareScope with correct delete scope.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot'],
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'delete', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(compareScopes.calledWithExactly(userScope, ['testRoot', 'testDelete'], Log), "delete scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope calls compareScope with correct associate scope.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot'],
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'associate', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(compareScopes.calledWithExactly(userScope, ['testRoot', 'testAssociate'], Log), "associate scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope calls compareScope with just action scope if no root scope exists.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'associate', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(compareScopes.calledWithExactly(userScope, ['testAssociate'], Log), "scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope calls compareScope with just root scope if no action scope exists.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'associate', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(compareScopes.calledWithExactly(userScope, ['testRoot'], Log), "scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope returns authorized if no document scope is defined.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return true });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'associate', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(result.authorized === true, "user authorized");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope returns authorized false with no docs if compareScopes fails and config.enableDocumentScopeFail is true.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return false });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", true);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot'],
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'associate', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(result, { authorized: false, unauthorizedDocs: [] }, "return value correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope returns authorized false with unauthorized docs if compareScopes fails and config.enableDocumentScopeFail is false.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let compareScopes = this.spy(function(){ return false });
    enforceDocumentScope.__set__("internals.compareScopes", compareScopes);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", false);
    let verifyScope = this.spy(enforceDocumentScope.__get__("internals.verifyScope"));

    let document = {
      scope: {
        rootScope: ['testRoot'],
        readScope: ['testRead'],
        updateScope: ['testUpdate'],
        deleteScope: ['testDelete'],
        associateScope: ['testAssociate']
      }
    };

    let userScope = ['testUserScope'];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScope([document], 'associate', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(result, { authorized: false, unauthorizedDocs: [document] }, "return value correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.end();
});

test('enforce-document-scope.verifyScopeById', function (t) {
  t.test('enforce-document-scope.verifyScopeById calls model.find with the list of document ids.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() { return true });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    let verifyScopeById = this.spy(enforceDocumentScope.__get__("internals.verifyScopeById"));

    let model = {
      find: this.spy(function() { return Q.when() })
    };

    let userScope = ['testUserScope'];

    let documentIds = ['id1', 'id2'];

    const query = {
      _id: {
        $in: documentIds
      },
    };

    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScopeById(model, documentIds, 'read', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.ok(model.find.calledWithExactly(query, 'scope'), "model.find called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));


  t.test('enforce-document-scope.verifyScopeById calls verifyScope with correct args.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let deferred = Q.defer();
    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      deferred.resolve();
      return true
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    let verifyScopeById = this.spy(enforceDocumentScope.__get__("internals.verifyScopeById"));

    let docs = ['doc1', 'doc2'];
    let model = {
      find: this.spy(function() { return Q.when(docs) })
    };

    let userScope = ['testUserScope'];

    let documentIds = ['id1', 'id2'];

    //</editor-fold>

    //<editor-fold desc="Act">
    let result = verifyScopeById(model, documentIds, 'read', userScope, Log);
    //</editor-fold>

    //<editor-fold desc="Assert">
    deferred.promise
        .then(function(response) {
          t.ok(verifyScope.calledWithExactly(docs, 'read', userScope, Log), "verifyScope called with correct args");
        });
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));
  t.end();
});

test('enforce-document-scope.enforceDocumentScopePostForModel', function (t) {
  t.test('enforce-document-scope.enforceDocumentScopePostForModel returns authorized if request method is not "get".', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() { throw "ERROR" });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' };

    let request = {
      auth: {
        credentials: {
          scope: []
        }
      },
      method: "not_get"
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePostForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.equals(result, 'test', "h.continue returned");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePostForModel calls verifyScope if request method is get and "_id" is in request params (a "find" endpoint).', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      return { authorized: true }
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePost");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
        _id: "mock _id"
      },
      response: {
        source: "mock source"
      }
    };

    const userScope = request.auth.credentials.scope;

    const source = request.response.source;
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePostForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScope.args[0], [[source], "read", userScope, mockLog], "verifyScope called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePostForModel calls verifyScope if request method is get and "_id" is not in request params (a "list" endpoint).', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      return { authorized: true }
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' };
    let mockLog = Log.bind("enforceDocumentScopePost");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
      },
      response: {
        source: {
          docs: ["mock docs"]
        }
      }
    };

    const userScope = request.auth.credentials.scope;

    const docs = request.response.source.docs;
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePostForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScope.args[0], [docs, "read", userScope, mockLog], "verifyScope called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePostForModel returns authorized if verifyScope returns authorized.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      return { authorized: true }
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' };
    let mockLog = Log.bind("enforceDocumentScopePost");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
      },
      response: {
        source: {
          docs: ["mock docs"]
        }
      }
    };

    const userScope = request.auth.credentials.scope;

    const docs = request.response.source.docs;
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePostForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
      t.equals(result, 'test', "h.continue returned");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePostForModel returns forbidden error if verifyScope returns not authorized and "request.params._id" exists.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      return { authorized: false }
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", false);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePost");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
        _id: "mock _id"
      },
      response: {
        source: {
          docs: ["mock docs"]
        }
      }
    };

    const userScope = request.auth.credentials.scope;

    const docs = request.response.source.docs;
    //</editor-fold>

    //<editor-fold desc="Act">
      let result
      try {
        result = enforceDocumentScopePostForModel(request, h);
      }
      catch (err) {
        result = err;
      }
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(result, Boom.forbidden("Insufficient document scope."), "boom error thrown");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePostForModel returns forbidden error if verifyScope returns not authorized and "config.enableDocumentScopeFail" is true.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      return { authorized: false }
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", true);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePost");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
      },
      response: {
        source: {
          docs: ["mock docs"]
        }
      }
    };

    const userScope = request.auth.credentials.scope;

    const docs = request.response.source.docs;
    //</editor-fold>

    //<editor-fold desc="Act">
      let result
      try {
         result = enforceDocumentScopePostForModel(request, h);
      } catch (err) {
        result = err
      }
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(result, Boom.forbidden("Insufficient document scope."), "boom error thrown");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePostForModel replaces unauthorized docs for "list" requests that fail if "config.enableDocumentScopeFail" is false.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(2);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScope = this.spy(function() {
      return { authorized: false, unauthorizedDocs: [{ _id: "failed doc" }] }
    });
    enforceDocumentScope.__set__("internals.verifyScope", verifyScope);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", false);
    let model = {};
    let enforceDocumentScopePostForModel = enforceDocumentScope.enforceDocumentScopePost(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePost");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
      },
      response: {
        source: {
          docs: [{ _id: "failed doc" }, { _id: "authorized doc" }]
        }
      }
    };

    const userScope = request.auth.credentials.scope;

    //</editor-fold>

    //<editor-fold desc="Act">
      let result
      try {
        result = enforceDocumentScopePostForModel(request, h);
      } catch (err) {
        result = err
      }
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(request.response.source.docs, [{ "error": "Insufficient document scope." }, { _id: "authorized doc" }], "unauthorized docs replaced");
    t.deepEqual(result, 'test', "h.continue returned");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.end();
});

test('enforce-document-scope.enforceDocumentScopePreForModel', function (t) {
  t.test('enforce-document-scope.enforceDocumentScopePreForModel returns authorized if request is not an update, association call, or a delete.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() { throw "ERROR" });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }

    let request = {
      auth: {
        credentials: {
          scope: []
        }
      },
      method: "not_relevant",
      params: {}
    };
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
      t.deepEqual(result, 'test', "h.continue returned");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls verifyScopeById with "update" action if relevant.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: true })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "put",
      params: {
        _id: "mock _id"
      }
    };

    const userScope = request.auth.credentials.scope;

    const ids = [request.params._id];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScopeById.args[0], [model, ids, "update", userScope, mockLog], "verifyScopeById called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls verifyScopeById with "read" action if relevant.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: true })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "get",
      params: {
        ownerId: "mock _id"
      }
    };

    const userScope = request.auth.credentials.scope;

    const ids = [request.params.ownerId];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScopeById.args[0], [model, ids, "read", userScope, mockLog], "verifyScopeById called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls verifyScopeById with "associate" action if relevant.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: true })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "put",
      params: {
        ownerId: "mock _id"
      }
    };

    const userScope = request.auth.credentials.scope;

    const ids = [request.params.ownerId];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScopeById.args[0], [model, ids, "associate", userScope, mockLog], "verifyScopeById called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls verifyScopeById with "delete" action and "_id" param if relevant.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: true })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "delete",
      params: {
        _id: "mock _id"
      }
    };

    const userScope = request.auth.credentials.scope;

    const ids = [request.params._id];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScopeById.args[0], [model, ids, "delete", userScope, mockLog], "verifyScopeById called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls verifyScopeById with "delete" action and payload _ids if relevant.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: true })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "delete",
      params: {
      },
      payload: [{ _id: "testId1" }, { _id: "testId2" }]
    };

    const userScope = request.auth.credentials.scope;

    const ids = ["testId1", "testId2"];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    t.deepEqual(verifyScopeById.args[0], [model, ids, "delete", userScope, mockLog], "verifyScopeById called with correct args");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls returns authorized if verifyScopeById returns authorized.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let deferred = Q.defer();
    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: true })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "delete",
      params: {
      },
      payload: [{ _id: "testId1" }, { _id: "testId2" }]
    };

    const userScope = request.auth.credentials.scope;

    const ids = ["testId1", "testId2"];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    result
        .then(function(result) {
            t.deepEqual(result, 'test', "h.continue returned");
        });
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls returns forbidden error if verifyScopeById returns unauthorized and config.enableDocumentScopeFail is true.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let deferred = Q.defer();
    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: false })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", true);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "delete",
      params: {
      },
      payload: [{ _id: "testId1" }, { _id: "testId2" }]
    };

    const userScope = request.auth.credentials.scope;

    const ids = ["testId1", "testId2"];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    result
        .catch(function (err) {
            t.deepEqual(err, Boom.forbidden("Insufficient document scope."), "boom error thrown");
        });
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls returns forbidden error if verifyScopeById returns unauthorized and action is not "delete".', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let deferred = Q.defer();
    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: false })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", false);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "put",
      params: {
        _id: "testId"
      },
    };

    const userScope = request.auth.credentials.scope;

    const ids = ["testId1", "testId2"];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
      result
          .catch(function (err) {
              t.deepEqual(err, Boom.forbidden("Insufficient document scope."), "boom error thrown");
          });
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel calls returns forbidden error if verifyScopeById returns unauthorized and request.params._id exists', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let deferred = Q.defer();
    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: false })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", false);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "delete",
      params: {
        _id: "testId"
      },
    };

    const userScope = request.auth.credentials.scope;

    const ids = ["testId1", "testId2"];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
      result
          .catch(function (err) {
              t.deepEqual(err, Boom.forbidden("Insufficient document scope."), "boom error thrown");
          });
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.enforceDocumentScopePreForModel modifies payload if verifyScopeById returns unauthorized and action is "delete" and config.enableDocumentScopeFail is false.', sinon.test(function (t) {
    //<editor-fold desc="Arrange">
    t.plan(1);

    let deferred = Q.defer();
    let enforceDocumentScope = rewire('../policies/enforce-document-scope');
    let verifyScopeById = this.spy(function() {
      return Q.when({ authorized: false, unauthorizedDocs: [{ _id: "failedId" }] })
    });
    enforceDocumentScope.__set__("internals.verifyScopeById", verifyScopeById);
    enforceDocumentScope.__set__("config.enableDocumentScopeFail", false);
    let model = {};
    let enforceDocumentScopePreForModel = enforceDocumentScope.enforceDocumentScopePre(model, Log);
    let h = { continue: 'test' }
    let mockLog = Log.bind("enforceDocumentScopePre");

    let request = {
      auth: {
        credentials: {
          scope: ['mock user scope']
        }
      },
      method: "delete",
      params: {
      },
      payload: [{ _id: "failedId" }, { _id: "authorizedId" }]
    };

    const userScope = request.auth.credentials.scope;

    const ids = ["testId1", "testId2"];
    //</editor-fold>

    //<editor-fold desc="Act">
    let result = enforceDocumentScopePreForModel(request, h);
    //</editor-fold>

    //<editor-fold desc="Assert">
    result
        .then(function(result) {
          t.deepEqual(request.payload, [{ _id: "authorizedId" }], "payload correctly filtered");
        });
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.end();
});