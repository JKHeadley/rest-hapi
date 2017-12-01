'use strict';

const Boom = require('boom');
const _ = require('lodash');
const config = require('../config');

const internals = {};

//TODO: enforce scopes for embedded docs
//TODO: update get query to filter based on scopes in pre rather than "commenting out" unauthorized docs
//TODO (cont): in post. This should make authorization "transparent" and work with pagination

internals.enforceDocumentScopePre = function(model, Log) {

  const enforceDocumentScopePreForModel = function enforceDocumentScopePreForModel(request, reply, next) {
    Log = Log.bind("enforceDocumentScopePre");

    try {
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
            else if (action === 'delete' && !config.enableDocumentScopeFail && !request.params._id) {
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
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(Boom.badImplementation(err), false);
    }
  };

  enforceDocumentScopePreForModel.applyPoint = 'onPreHandler';
  return enforceDocumentScopePreForModel;
};
internals.enforceDocumentScopePre.applyPoint = 'onPreHandler';


internals.enforceDocumentScopePost = function(model, Log) {

  const enforceDocumentScopePostForModel = function enforceDocumentScopePostForModel(request, reply, next) {
    Log = Log.bind("enforceDocumentScopePost");

    try {
      if (_.isError(request.response)) {
        return next(null, true);
      }

      const userScope = request.auth.credentials.scope;
      let result = {};

      //READ AUTHORIZATION
      if (request.method === "get") {
        //EXPL: the request is for a "find" endpoint
        if (request.params._id) {
          result = internals.verifyScope([request.response.source], "read", userScope, Log);
        }
        //EXPL: the request is for a "list" endpoint
        else {
          //EXPL: Only verify scope if docs are included in the response, otherwise return as authorized.
          //Ex: If '$count' query parameter is used
          if (request.response.source.docs) {
            result = internals.verifyScope(request.response.source.docs, "read", userScope, Log);
          }
          else {
            result = { authorized: true };
          }
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
              return { "error": "Insufficient document scope." }
            }
          });

          return next(null, true);
        }
      }

      return next(null, true);
    }
    catch (err) {
      Log.error("ERROR:", err);
      return next(Boom.badImplementation(err), false);
    }

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
        return internals.verifyScope(documents, action, userScope, Log);
      })
};

internals.verifyScope = function(documents, action, userScope, Log) {
  let authorized = true;
  let unauthorizedDocs = [];
  try {
    unauthorizedDocs = documents.filter(function(document) {
      if (document.scope && !_.isEmpty(document.scope)) {

        let documentScope = document.scope.rootScope || [];
        let actionScope = [];
        let authorizedForDocument = false;

        switch (action) {
          case "read":
            actionScope = document.scope.readScope;
            break;
          case "update":
            actionScope = document.scope.updateScope;
            break;
          case "delete":
            actionScope = document.scope.deleteScope;
            break;
          case "associate":
            actionScope = document.scope.associateScope;
            break;
          default:
            throw "Invalid action.";
        }

        //EXPL: combine the document root scope with the action specific scope
        if (documentScope && documentScope[0] && actionScope) {
          documentScope = documentScope.concat(actionScope);
        }
        else if (actionScope){
          documentScope = actionScope;
        }
        
        //EXPL: if there is no applicable document scope, the user is authorized for this document
        if (_.isEmpty(documentScope)) {
          return false;
        }

        authorizedForDocument = internals.compareScopes(userScope, documentScope, Log);

        if (authorizedForDocument) {
          return false;
        }
        else {
          authorized = false;
          if (config.enableDocumentScopeFail) {
            throw false;
          }
          else {
            return true;
          }
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

internals.compareScopes = function(userScope, documentScope, Log) {
  userScope = userScope || [];
  let fobiddenScope = [];
  let requiredScope = [];
  let generalScope = [];
  let scopeSatisfied = false;


  //EXPL: if the user scope contains any of the forbidden scope values, the user is unauthorized
  fobiddenScope = documentScope.reduce(function(scope, scopeValue) {
    if (scopeValue[0] === '!') {
      scope.push(scopeValue.substr(1));
    }
    return scope;
  }, []);

  scopeSatisfied = fobiddenScope.reduce(function(satisfied, scopeValue) {
    if (userScope.includes(scopeValue)) {
      return false;
    }
    return satisfied;
  }, true);

  if (!scopeSatisfied) {
    return false;
  }


  //EXPL: if the user scope does not contain all of the required scope values, the user is unauthorized
  requiredScope = documentScope.reduce(function(scope, scopeValue) {
    if (scopeValue[0] === '+') {
      scope.push(scopeValue.substr(1));
    }
    return scope;
  }, []);

  scopeSatisfied = requiredScope.reduce(function(satisfied, scopeValue) {
    if (!userScope.includes(scopeValue)) {
      return false;
    }
    return satisfied;
  }, true);

  if (!scopeSatisfied) {
    return false;
  }


  //EXPL: if the user scope does not contain any of the general scope values, the user is unauthorized
  generalScope = documentScope.filter(function(scopeValue) {
    return scopeValue[0] !== '!' && scopeValue[0] !== '+';
  });

  scopeSatisfied = generalScope.reduce(function(satisfied, scopeValue) {
    if (userScope.includes(scopeValue)) {
      return true;
    }
    return satisfied;
  }, false);

  if (!scopeSatisfied) {
    return false;
  }


  return true;
};


module.exports = {
  enforceDocumentScopePre : internals.enforceDocumentScopePre,
  enforceDocumentScopePost : internals.enforceDocumentScopePost
};

