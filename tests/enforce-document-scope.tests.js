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
const testHelper = require("./test-helper");
const Joi = require('joi');
const Q = require('q');

let Log = logging.getLogger("tests");
Log.logLevel = "DEBUG";
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
        scope: ['testGlobal'],
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
    t.ok(compareScopes.calledWithExactly(userScope, ['testGlobal', 'testRead'], Log), "read scope correct");
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
        scope: ['testGlobal'],
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
    t.ok(compareScopes.calledWithExactly(userScope, ['testGlobal', 'testUpdate'], Log), "update scope correct");
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
        scope: ['testGlobal'],
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
    t.ok(compareScopes.calledWithExactly(userScope, ['testGlobal', 'testDelete'], Log), "delete scope correct");
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
        scope: ['testGlobal'],
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
    t.ok(compareScopes.calledWithExactly(userScope, ['testGlobal', 'testAssociate'], Log), "associate scope correct");
    //</editor-fold>

    //<editor-fold desc="Restore">
    //</editor-fold>
  }));

  t.test('enforce-document-scope.verifyScope calls compareScope with just action scope if no global scope exists.', sinon.test(function (t) {
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
        scope: ['testGlobal'],
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
        scope: ['testGlobal'],
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
