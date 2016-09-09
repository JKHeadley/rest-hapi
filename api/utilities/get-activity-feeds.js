var _ = require('lodash');
var Q = require('q');
var queryString = require('query-string');
var format = require('string-format');

module.exports = function(request, server, Model, options, Log){
  return function () {
    Log.debug("HERE!");
    var deferred = Q.defer();
    var scope = request.query;
    scope.objectIds = [];
    scope.transactionIds = [];
    if (scope.objectId) {
      scope.objectIds.push(scope.objectId);
    }
    
    Log.debug(request.query);
    var promises = [];
    if (scope.objectType == "item" ||
        scope.objectType == "user" ||
        scope.objectType == "customer" ||
        scope.objectType == "partnerCompany" ||
        scope.objectType == "organization")
    {
      promises.push(loadTransactions());
    }
    if (scope.objectType == "item") {
      //promises.push(loadItem());
      //promises.push(loadTags());
      promises.push(loadNotes());
      promises.push(loadReports());
    }
    Q.all(promises).then(function() {
      loadActivities().then(function(result) {
        // var activityFeeds = eventLogs.map(function(eventLog) {
        //   eventLog.activityFeed.eventDate = eventLog.createdAt;
        //   return eventLog.activityFeed;
        // });
        deferred.resolve(result);
      }).catch(function(error) {
        Log.error(error);
      });
    }).catch(function(error) {
      Log.error(error);
    });
    
    return deferred.promise;
  };

  function addObjectIds(data) {
    var scope = request.query;
    data.forEach(function (object) {
      if (scope.objectIds.indexOf(object.id) < 0) {
        scope.objectIds.push(object.id);
      }
    });
  }

  function loadTransactions() {
    var scope = request.query;
    var deferred = Q.defer();
    var injectOptions = {};
    var load = false;
    var params = {};
    if (scope.transactionIds.length > 0) {
      params["or-id"] = scope.transactionIds;
      load = true;
    }
    switch (scope.objectType) {
      case "item":
        params["or-itemId"] = scope.objectId;
        load = true;
        break;
      case "customer":
        params["or-toCustomerId"] = scope.objectId;
        load = true;
        break;
      case "partnerCompany":
        params["or-toPartnerCompanyId"] = scope.objectId;
        load = true;
        break;
      case "organization":
        params["or-toOrganizationId"] = scope.organizationId;
        params["or-fromOrganizationId"] = scope.organizationId;
        load = true;
        break;
      case "user":
        load = false;
      default:
        break;
    }
    if (load == false && scope.transactionIds.length == 0) {
      deferred.resolve();
    } else {
      var url = '?' + queryString.stringify(params);
      injectOptions.url = '/transaction' + url;

      injectOptions.headers = {
        Authorization: request.orig.headers.authorization
      };

      server.inject(injectOptions, function(res) {
        scope.transactions = res.result;
        addObjectIds(scope.transactions);
        deferred.resolve();
      });
    }
    return deferred.promise;
  }

  //TODO: handle promises better
  function loadTags() {
    var scope = request.query;
    var injectOptions = {};
    var promises = [];
    var deferred = Q.defer();
    var touchTagDeferred = Q.defer();
    var musiCodeDeferred = Q.defer();
    var barCodeDeferred = Q.defer();
    var airScanDeferred = Q.defer();

    //TouchTags
    injectOptions.url = '/item/' + scope.objectId + '/touch-tag';

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      scope.touchTags = res.result;
      addObjectIds(scope.touchTags);
      touchTagDeferred.resolve();
    });
    promises.push(touchTagDeferred.promise);


    //MusiCodes
    injectOptions.url = '/item/' + scope.objectId + '/musi-code';

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      scope.musiCodes = res.result;
      addObjectIds(scope.musiCodes);
      musiCodeDeferred.resolve();
    });
    promises.push(musiCodeDeferred.promise);


    //BarCodes
    injectOptions.url = '/item/' + scope.objectId + '/bar-code';

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      scope.barCodes = res.result;
      addObjectIds(scope.barCodes);
      barCodeDeferred.resolve();
    });
    promises.push(barCodeDeferred.promise);


    //AirScans
    injectOptions.url = '/item/' + scope.objectId + '/air-scan';

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      scope.airScans = res.result;
      addObjectIds(scope.airScans);
      airScanDeferred.resolve();
    });
    promises.push(airScanDeferred.promise);


    Q.all(promises).then(function() {
      deferred.resolve();
    });
    return deferred.promise;
  }

  function loadNotes() {
    var scope = request.query;
    var injectOptions = {};
    var deferred = Q.defer();

    injectOptions.url = '/item/' + scope.objectId + '/note';
    
    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      scope.notes = res.result;
      addObjectIds(scope.notes);
      deferred.resolve();
    });
    
    return deferred.promise;
  }

  function loadReports() {
    var scope = request.query;
    var injectOptions = {};
    var deferred = Q.defer();

    injectOptions.url = '/item/' + scope.objectId + '/reports';

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      scope.reports = res.result;
      addObjectIds(scope.reports);
      deferred.resolve();
    });

    return deferred.promise;
  }

  function loadActivities(){
    var scope = request.query;
    var deferred = Q.defer();
    var injectOptions = {};
    //EXPL: use "or" to retrieve events related to the userId or the objectIds
    var params = {
      embed:"user.profileImage,organization,publicUser,activityFeed",
      limit:scope.limit || 10,
      offset:scope.offset || 0,
      sort:"-createdAt",
      hasActivityFeed: true //EXPL: only grab events with an activityFeed
    };
    if (scope.userId) {
      params["or-userId"] = scope.userId;
    }
    if (scope.objectIds.length > 0) {
      params["or-objectId"] = scope.objectIds;
    }
    if (scope.maxDate) {
      params["max-createdAt"] = scope.maxDate;
    }
    if (scope.organizationId && scope.objectType === "organization") {
      params["or-organizationId"] = scope.organizationId;
    } else if (scope.organizationId && scope.objectType != "user") {
      params.organizationId = scope.organizationId;
    }
    if (scope.searchForType && scope.objectType) {
      params["or-objectType"] = scope.objectType;
    }

    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/event-log' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    Log.debug(params);

    server.inject(injectOptions, function(res) {
      var result = {
        eventLogs: res.result,
        total: res.headers["x-total-count"]
      };
      deferred.resolve(result);
    });
    
    return deferred.promise;
  }
};