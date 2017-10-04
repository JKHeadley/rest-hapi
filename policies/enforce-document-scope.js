const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};


internals.enforceDocumentScopePre = function(model) {

  const enforceDocumentScopePreForModel = function enforceDocumentScopePreForModel(request, reply, next) {
    const Log = request.logger.bind("enforceDocumentScopePre");

    const userScope = request.auth.credentials.scope;

    let action = "";
    let ids = [];

    //UPDATE AUTHORIZATION
    if (request.params._id && request.method === "put") {
      action = 'update';
      ids = [request.params._id];
    }
    //ASSOCIATE AUTHORIZATION
    else if (request.params.ownerId) {
      if (request.method === "get") {
        action = 'read';
      }
      else {
        action = 'associate';
      }
      ids = [request.params.ownerId];
    }
    //DELETE AUTHORIZATION
    else if (request.method === "delete") {
      action = 'delete';
      if (request.params._id) {
        ids = [request.params._id];
      }
      else {
        ids = request.payload.map(function(item) {
          return item._id;
        });
      }
    }
    else {
      return next(null, true);
    }

    return internals.verifyScopeById(model, ids, action, userScope, Log)
        .then(function(result) {
          if (result.authorized) {
            return next(null, true);
          }
          //EXPL: only delete authorized docs
          else if (action === 'delete' && !config.enableDocumentScopeFail) {
            let unauthorizedIds = result.unauthorizedDocs.map(function(document) {
              return document._id.toString();
            });
            request.payload = request.payload.filter(function(item) {
              return unauthorizedIds.indexOf(item._id) < 0;
            });
            return next(null, true);
          }
          else {
            return next(Boom.forbidden("Insufficient document scope."), false);
          }
        })
        .catch(function(error) {
          Log.error("ERROR:", error);
          return next(Boom.badImplementation(error), false);
        })
  };

  enforceDocumentScopePreForModel.applyPoint = 'onPreHandler';

  return enforceDocumentScopePreForModel;
};

internals.enforceDocumentScopePre.applyPoint = 'onPreHandler';



internals.enforceDocumentScopePost = function(model) {

  const enforceDocumentScopePostForModel = function enforceDocumentScopePostForModel(request, reply, next) {
    const Log = request.logger.bind("enforceDocumentScopePost");

    const userScope = request.auth.credentials.scope;
    let result = {};

    //READ AUTHORIZATION
    if (request.method === "get") {
      if (request.params._id) {
        result = internals.verifyScope(model, [request.response.source], "read", userScope, Log);
      }
      else {
        result = internals.verifyScope(model, request.response.source.docs, "read", userScope, Log);
      }

      if (result.authorized) {
        return next(null, true);
      }
      else if (request.params._id || config.enableDocumentScopeFail) {
        return next(Boom.forbidden("Insufficient document scope."), false);
      }
      else {
        let unauthorizedIds = result.unauthorizedDocs.map(function(document) {
          return document._id.toString();
        });
        //EXPL: replace unauthorized docs with an error
        request.response.source.docs = request.response.source.docs.map(function(document) {
          if (unauthorizedIds.indexOf(document._id.toString()) < 0) {
            return document;
          }
          else {
            return { "error": "Insufficient document scope."}
          }
        });

        return next(null, true);
      }
    }

    return next(null, true);

  };

  enforceDocumentScopePostForModel.applyPoint = 'onPostHandler';

  return enforceDocumentScopePostForModel;
};

internals.enforceDocumentScopePost.applyPoint = 'onPostHandler';



internals.verifyScopeById = function(model, documentIds, action, userScope, Log) {
  const query = {
    _id: {
      $in: documentIds
    },
  };
  return model.find(query, 'scope')
      .then(function(documents) {
        return internals.verifyScope(model, documents, action, userScope, Log);
      })
};

internals.verifyScope = function(model, documents, action, userScope, Log) {
  let authorized = true;
  let unauthorizedDocs = [];
  try {
    unauthorizedDocs = documents.filter(function(document) {
      if (document.scope && !_.isEmpty(document.scope)) {

        let documentScope = document.scope.scope || [];
        let methodScope = [];

        switch (action) {
          case "read":
            methodScope = document.scope.readScope;
            break;
          case "update":
            methodScope = document.scope.updateScope;
            break;
          case "delete":
            methodScope = document.scope.deleteScope;
            break;
          case "associate":
            methodScope = document.scope.associateScope;
            break;
          default:
            throw "Invalid method type.";
        }

        if (documentScope && documentScope[0]) {
          documentScope = documentScope.concat(methodScope);
        }
        else if (methodScope){
          documentScope = methodScope;
        }

        var matchingScope = userScope.filter((scopeValue) => documentScope.includes(scopeValue));

        if (!_.isEmpty(documentScope) && _.isEmpty(matchingScope)) {
          authorized = false;
          if (config.enableDocumentScopeFail) {
            throw false;
          }
          else {
            return true;
          }
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    });
  }
  catch (err) {
    if (err === false) {
      return { authorized: authorized, unauthorizedDocs: [] };
    }
    else {
      Log.error("ERROR:", err);
      throw err;
    }
  }

  return { authorized: authorized, unauthorizedDocs: unauthorizedDocs };
};



module.exports = {
  enforceDocumentScopePre : internals.enforceDocumentScopePre,
  enforceDocumentScopePost : internals.enforceDocumentScopePost
};

