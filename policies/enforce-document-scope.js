const Boom = require('boom');
const _ = require('lodash');

const internals = {};


internals.enforceDocumentScopePre = function(model) {

  const enforceDocumentScopePreForModel = function enforceDocumentScopePreForModel(request, reply, next) {
    const Log = request.logger.bind("enforceDocumentScopePre");

    const userScope = request.auth.credentials.scope;

    let verifyPromise = {};

    //UPDATE AUTHORIZATION
    if (request.params._id && request.method === "put") {
      verifyPromise = internals.verifyScope(model, [request.params._id], "update", userScope, Log);
    }
    //ASSOCIATE AUTHORIZATION
    else if (request.params.ownerId) {
      verifyPromise =  internals.verifyScope(model, [request.params.ownerId], "associate", userScope, Log);
    }
    //DELETE AUTHORIZATION
    else if (request.method === "delete") {
      if (request.params._id) {
        verifyPromise =  internals.verifyScope(model, [request.params._id], "delete", userScope, Log);
      }
      else {
        let ids = request.payload.map(function(item) {
          return item._id;
        });

        verifyPromise =  internals.verifyScope(model, ids, "delete", userScope, Log);
      }
    }
    else {
      return next(null, true);
    }

    return verifyPromise
        .then(function(authorized) {
          if (authorized) {
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


internals.enforceDocumentScopePost = function(model) {

  const enforceDocumentScopePostForModel = function enforceDocumentScopePostForModel(request, reply, next) {
    const Log = request.logger.bind("enforceDocumentScopePost");


  };

  enforceDocumentScopePostForModel.applyPoint = 'onPostHandler';

  return enforceDocumentScopePostForModel;
};

internals.verifyScope = function(model, documentIds, type, userScope, Log) {
  const query = {
    _id: {
      $in: documentIds
    },
  };
  return model.find(query, 'scope')
      .then(function(documents) {
        try {
          documents.forEach(function(document) {
            if (document.scope && !_.isEmpty(document.scope)) {

              let documentScope = document.scope.scope || [];
              let methodScope = [];

              switch (type) {
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
                throw false;
              }
            }
          });
        }
        catch (err) {
          if (err === false) {
            return false;
          }
          else {
            Log.error("ERROR:", err);
            throw err;
          }
        }


        return true;
      })
};


module.exports = {
  enforceDocumentScopePre : internals.enforceDocumentScopePre,
  enforceDocumentScopePost : internals.enforceDocumentScopePost
};

