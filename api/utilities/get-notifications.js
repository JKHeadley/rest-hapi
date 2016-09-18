var _ = require('lodash');
var Q = require('q');
var queryString = require('query-string');
var format = require('string-format');

module.exports = function(request, server, Model, options, Log){
  return function () {
    Log.debug("HERE!");
    var deferred = Q.defer();
    var scope = request.query;
    Log.debug(request.query);

    loadNotifications().then(function(notifications) {
      var promises = [];
      notifications.forEach(function(notification) {
        promises.push(processNotification(notification));
      });

      notifications.sort(function(a, b) {
        return new Date(b.eventLog.createdAt) - new Date(a.eventLog.createdAt);
      });

      Q.all(promises).then(function(result) {
        deferred.resolve(notifications);
      });
    }).catch(function(error) {
      Log.error(error);
    });

    
    return deferred.promise;
  };

  function loadTransaction(notification) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"item,toPublicUser.user,toCustomer,toOrganization,toPartnerCompany.organization,fromOrganization,fromPublicUser.user",
      id:notification.eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/transaction' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var transaction = res.result[0];
      notification.transaction = transaction;
      deferred.resolve();
    });
    return deferred.promise;
  }

  function loadReport(notification) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"reporter,item,organization,publicUser",
      id:notification.eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/missingItemReport' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var report = res.result[0];
      notification.report = report;
      deferred.resolve();
    });
    return deferred.promise;
  }
  
  function processNotification(notification) {
    var deferred = Q.defer();
    if (notification.eventLog.objectType == 'transaction') {
      loadTransaction(notification).then(function(result) {
        deferred.resolve();
      }).catch(function(error) {
        Log.error(error);
        deferred.resolve();
      });
    } else if(notification.eventLog.objectType == 'missingItemReport') {
      loadReport(notification).then(function(result) {
        deferred.resolve();
      }).catch(function(error) {
        Log.error(error);
        deferred.resolve();
      });
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  }

  function loadNotifications(){
    var scope = request.query;
    var deferred = Q.defer();
    var injectOptions = {};
    //EXPL: use "or" to retrieve events related to the userId or the objectIds
    var params = {
      embed:"eventLog.user.profileImage,",
      organizationId: scope.organizationId,
      publicUserProfileId: scope.publicUserId,
      hasBeenRead: scope.hasBeenRead,
      hasBeenCleared: scope.hasBeenCleared,
      limit:scope.limit || 10,
      isValid:true
    };

    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/notification' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    Log.debug(params);

    server.inject(injectOptions, function(res) {
      scope.notifications = res.result;
      deferred.resolve(scope.notifications);
    });
    
    return deferred.promise;
  }
};