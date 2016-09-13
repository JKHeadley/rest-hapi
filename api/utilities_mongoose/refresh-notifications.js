var _ = require('lodash');
var Q = require('q');
var queryString = require('query-string');
var format = require('string-format');

module.exports = function(request, server, Model, options, Log){
  return function (eventLogs) {
    var promises = [];
    var deferred = Q.defer();
    for (var index = eventLogs.length-1; index >= 0; index--) {
      var eventLog = eventLogs[index];
      eventLog.index = index;
      if (eventLog.verb == 'updated' && eventLog.objectDisplayNewValue == eventLog.objectDisplayOldValue) {
        Log.debug("SKIPPING:", eventLog.index);
        continue;//EXPL: ignore updates where the value didn't change
      } else {
        Log.debug("PROCESSING EVENT LOG");
        if (eventLog.objectType == 'transaction') {
          promises.push(processTransaction(eventLog));
        } else if (eventLog.objectType == 'missingItemReport') {
          promises.push(processReport(eventLog));
        } else {
          eventLog.clearNotification = true;
          var webMessage = "";
          var androidMessage = "";
          promises.push(updateNotification(eventLog, webMessage, androidMessage));
        }
      }
    }
    Q.all(promises).then(function(result) {
      deferred.resolve(result);
    }).catch(function(error) {
      Log.error(error);
      deferred.reject(error);
    });
    
    return deferred.promise;
  };

  function updateNotification(eventLog, webMessage, androidMessage) {
    var deferred = Q.defer();
    Log.debug("updateNotification", eventLog.index);
    if (eventLog.clearNotification || !webMessage) {//EXPL: objects related to the notification have been erased, therefore remove the notification from the eventLog
      options.models.eventLog.update({
        hasNotification: false
      }, {where: {id: eventLog.id}}).then(function (result)  {
        options.models.notification.findOne({where:{eventLogId:eventLog.id}}).then(function(result) {
          if (result) {
            options.models.notification.update({
              isValid: false
            }, {where:{eventLogId:eventLog.id}}).then(function (result)  {
              Log.debug("notification removed from eventLog:", eventLog.index);
              deferred.resolve();
            }).catch(function(error) {
              Log.error(error);
              deferred.resolve();
            });
          } else {
            Log.debug("notification removed from eventLog:", eventLog.index);
            deferred.resolve();
          }
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        });
        deferred.resolve();
      });
    } else {
      var params = {};
      if (eventLog.objectType == 'transaction') {
        params.organizationId = eventLog.transaction.toOrganizationId;
        params.publicUserProfileId = eventLog.transaction.toPublicUserId;
      } else if (eventLog.objectType == 'missingItemReport') {
        if (eventLog.report.organizationId) {
          params.organizationId = eventLog.report.organizationId;
        } else {
          params.publicUserProfileId = eventLog.report.publicUserId;
        }
      }
      params.eventLogId = eventLog.id;
      params.webMessage = webMessage;
      params.androidMessage = androidMessage;
      params.isValid = true;
      if (eventLog.notificationId == null) {//EXPL: create a new notification or update an existing one
        options.models.notification.findOne({where:{eventLogId:eventLog.id}}).then(function(result) {
          if (result) {
            options.models.notification.update(params,
                {where:{eventLogId:eventLog.id}}).then(function (result)  {
              options.models.eventLog.update({
                notificationId: result.id,
                hasNotification: true
              }, {where: {id: eventLog.id}}).then(function(result) {
                Log.debug("notification updated:", result);
                deferred.resolve();
              }).catch(function(error) {
                Log.error(error);
                deferred.resolve();
              });
            }).catch(function(error) {
              Log.error(error);
              deferred.resolve();
            });
          } else {
            options.models.notification.create(params).then(function (result)  {
              options.models.eventLog.update({
                notificationId: result.id,
                hasNotification: true
              }, {where: {id: eventLog.id}}).then(function(result) {
                Log.debug("notification created:", result);
                deferred.resolve();
              }).catch(function(error) {
                Log.error(error);
                deferred.resolve();
              });
            }).catch(function(error) {
              Log.error(error);
              deferred.resolve();
            });
          }
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        });
      } else {
        options.models.notification.update(params, 
            {where: {id: eventLog.notificationId}}).then(function (result)  {
          options.models.eventLog.update({
            notificationId: result.id,
            hasNotification: true
          }, {where: {id: eventLog.id}}).then(function(result) {
            Log.debug("notification updated:", result);
            deferred.resolve();
          }).catch(function(error) {
            Log.error(error);
            deferred.resolve();
          });
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        });
      }
    }
    return deferred.promise;
  }

  function formWebMessage(eventLog) {
    Log.debug("MESSAGE:", eventLog.index);
    var message = null;
    format.extend(String.prototype);
    if (!eventLog.user) {
      Log.debug("NO USER");
      eventLog.clearNotification = true;
    } else {
      if (eventLog.objectType == "transaction") {
        var name = eventLog.transaction.fromOrganization ? eventLog.transaction.fromOrganization.name :
        eventLog.transaction.fromPublicUser.user.firstName + " " + eventLog.transaction.fromPublicUser.user.lastName;
        var app = eventLog.user.app == "MUSIC_LIFE" ? "MusicLife" : "SmartPart";
        if (eventLog.transaction.type == "Transfer") {
          message = "<span><strong>" + name +
              "</strong> would like to transfer ownership of the " + app + " profile and Track Tags for <strong>" +
              eventLog.transaction.item.description  + "</strong> to you.</span>";
        } else {
          message = "<span><strong>" + name +
              "</strong> would like to give you access to the " + app + " profile and Track Tags for <strong>" +
              eventLog.transaction.item.description  + "</strong>.</span>";
        }
      } else if (eventLog.objectType == 'missingItemReport') {
        message = "<span><strong>" + eventLog.user.firstName + " " + eventLog.user.lastName + " " +
            "</strong> marked item <strong>" +
            eventLog.report.item.description  + "</strong> as found.</span>";
      }
    }

    Log.debug("MESSAGE:", message);
    return message;
  }

  function formAndroidMessage(eventLog) {
    Log.debug("MESSAGE:", eventLog.index);
    var message = null;
    format.extend(String.prototype);
    if (!eventLog.user) {
      Log.debug("NO USER");
      eventLog.clearNotification = true;
    } else {
      if (eventLog.objectType == "transaction") {
        var name = eventLog.transaction.fromOrganization ? eventLog.transaction.fromOrganization.name :
        eventLog.transaction.fromPublicUser.user.firstName + " " + eventLog.transaction.fromPublicUser.user.lastName;
        var app = eventLog.user.app == "MUSIC_LIFE" ? "MusicLife" : "SmartPart";
        if (eventLog.transaction.type == "Transfer") {
          message = name + " would like to transfer ownership of the " + app + " profile and Track Tags for " +
              eventLog.transaction.item.description  + " to you.";
        } else {
          message = name + " would like to give you access to the " + app + " profile and Track Tags for " +
              eventLog.transaction.item.description  + ".";
        }
      } else if (eventLog.objectType == 'missingItemReport') {
        message = eventLog.user.firstName + " " + eventLog.user.lastName + " " +
            " marked item " + eventLog.report.item.description  + " as found.";
      }
    }

    Log.debug("MESSAGE:", message);
    return message;
  }
  
  function loadTransaction(eventLog) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"item,toPublicUser.user,toCustomer,toOrganization,toPartnerCompany.organization,fromOrganization,fromPublicUser.user",
      id:eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/transaction' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var transaction = res.result[0];
      if (!transaction || !transaction.item) {
        eventLog.clearNotification = true;
      }
      else if (transaction.fromOrganizationId) {
        if (!transaction.fromOrganization) {
          eventLog.clearNotification = true;
        }
      } else {
        if (!transaction.fromPublicUser || !transaction.fromPublicUser.user) {
          eventLog.clearNotification = true;
        }
      }
      deferred.resolve({eventLog:eventLog, transaction:transaction});
    });
    return deferred.promise;
  }

  function formatTransaction(transaction) {
    if (transaction.toPartnerCompany) {
      transaction.displayName = getEntityDisplayName(transaction.toPartnerCompany);
      transaction.entityType = getEntityType(transaction.toPartnerCompany);
      transaction.entity = transaction.toPartnerCompany.organization || transaction.toPartnerCompany;
    } else if (transaction.toOrganization) {
      transaction.displayName = getEntityDisplayName(transaction.toOrganization);
      transaction.entityType = getEntityType(transaction.toOrganization);
      transaction.entity = transaction.toOrganization;
    } else if (transaction.toCustomer) {
      transaction.displayName = getEntityDisplayName(transaction.toCustomer);
      transaction.entityType = getEntityType(transaction.toCustomer);
      transaction.entity = transaction.toCustomer.publicUser || transaction.toCustomer;
    } else if (transaction.toPublicUser) {
      transaction.displayName = getEntityDisplayName(transaction.toPublicUser);
      transaction.entityType = getEntityType(transaction.toPublicUser);
      transaction.entity = transaction.toPublicUser;
    } else if (transaction.fromOrganization) {
      transaction.displayName = getEntityDisplayName(transaction.fromOrganization);
      transaction.state = transaction.toOrganizationState;
      transaction.entity = transaction.fromOrganization;
    } else if (transaction.fromPublicUser) {
      transaction.displayName = getEntityDisplayName(transaction.fromPublicUser);
      transaction.state = transaction.toOrganizationState;
      transaction.entity = transaction.fromPublicUser;
    }
    if (!transaction.fromPublicUser && !transaction.fromOrganization) {
      switch (transaction.entityType) {
        case "Organization":
          transaction.state = transaction.toOrganizationState;
          break;
        case "Public User":
          transaction.state = transaction.toPublicUserState;
          break;
        case "Partner Company":
          transaction.state = transaction.toPartnerCompanyState;
          break;
        case "Customer":
          transaction.state = transaction.toCustomerState;
          break;
        case "Organization/Partner Company":
          transaction.state = transaction.toPartnerCompanyState;
          break;
        case "Public User/Customer":
          transaction.state = transaction.toCustomerState;
          break;
        default:
          break;
      }
    }
    switch (transaction.type) {
      case "Loan":
        transaction.verb = "loaned";
        break;
      case "Rental":
        transaction.verb = "rented";
        break;
      case "Transfer":
        transaction.verb = "transferred ownership of";
    }
  }

  function getEntityDisplayName(entity) {
    var displayName = null;
    if (entity.publicUserProfileId !== undefined) {//EXPL: entity is a customer
      displayName = entity.fullName ? entity.fullName : entity.email;
    } else if (entity.userId) {//EXPL: entity is a public user
      displayName = entity.user.firstName ? entity.user.firstName + " " + entity.user.lastName : entity.email;
    } else if (entity.partnerOrganizationId !== undefined) {//EXPL: entity is a partner company
      displayName = entity.name ? entity.name : entity.email;
    } else {//EXPL: entity is an organization
      displayName = entity.name ? entity.name : entity.email;
    }
    return displayName;
  }

  function getEntityType(entity) {
    var type = null;
    if (entity.publicUserProfileId !== undefined) {
      if (entity.publicUser) {
        type = "Public User/Customer";
      } else {
        type = "Customer";
      }
    } else if (entity.userId) {
      type = "Public User";
    } else if (entity.partnerOrganizationId !== undefined) {
      if (entity.organization) {
        type = "Organization/Partner Company";
      } else {
        type = "Partner Company";
      }
    } else {
      type = "Organization";
    }
    return type;
  }

  function processTransaction(eventLog) {
    var deferred = Q.defer();
    loadTransaction(eventLog).then(function(result) {
      var webMessage = "";
      var androidMessage = "";
      var eventLog = result.eventLog;
      Log.debug("PROCESSING Transaction", eventLog.index);
      var transaction = result.transaction;
      if (!eventLog.clearNotification) {
        eventLog.transaction = transaction;
        formatTransaction(eventLog.transaction);

        if (transaction.toOrganizationState == "Pending Approval" || transaction.toPublicUserState == "Pending Approval") {//EXPL: Create a transaction notification
          Log.debug("FORMING WEB MESSAGE", eventLog.index);
          webMessage = formWebMessage(eventLog);
          androidMessage = formAndroidMessage(eventLog);
          Log.debug("UPDATING NOTIFICATION", eventLog.index);
          updateNotification(eventLog, webMessage, androidMessage).then(function(result) {
            deferred.resolve();
          }).catch(function(error) {
            Log.error(error);
            deferred.resolve();
          });
        } else if (transaction.toOrganizationState == "Cancelled" || transaction.toPublicUserState == "Cancelled") {//EXPL: If the transaction was cancelled, mark the transaction notification as read and clear it
          options.models.eventLog.findOne({where: {objectId: transaction.id, verb: "created"}}).then(function (createLog) {
            options.models.notification.findOne({where: {eventLogId: createLog.id}}).then(function (notification) {
              options.models.notification.update({hasBeenCleared: true, hasBeenRead: true}, {where: {id: notification.id}}).then(function(result) {
                deferred.resolve();
              }).catch(function(error) {
                Log.error(error);
                deferred.resolve();
              });
            }).catch(function(error) {
              Log.error(error);
              deferred.resolve();
            });
          }).catch(function(error) {
            Log.error(error);
            deferred.resolve();
          });
        }
      } else {
        updateNotification(eventLog, webMessage, "").then(function(result) {
          deferred.resolve();
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        });
      }
    }).catch(function(error) {
      Log.error(error);
      deferred.resolve();
    });
    return deferred.promise;
  }

  function loadReport(eventLog) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"reporter,item,organization,publicUser",
      id:eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/missing-item-report' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var report = res.result[0];
      if (!report || !report.item || !report.reporter) {
        eventLog.clearNotification = true;
      }
      deferred.resolve({eventLog:eventLog, report:report});
    });
    return deferred.promise;
  }

  function processReport(eventLog) {
    var deferred = Q.defer();
    if (eventLog.objectProperty == 'active' && eventLog.objectNewValue == false) {//EXPL: Create a notification if an item is marked as found
      loadReport(eventLog).then(function (result) {

        var webMessage = "";
        var androidMessage = "";
        var eventLog = result.eventLog;
        Log.debug("PROCESSING report", eventLog.index);
        eventLog.report = result.report;

        if (!eventLog.clearNotification) {
          Log.debug("FORMING WEB MESSAGE", eventLog.index);
          webMessage = formWebMessage(eventLog);
          androidMessage = formAndroidMessage(eventLog);
          Log.debug("UPDATING NOTIFICATION ", eventLog.index);
        }
        updateNotification(eventLog, webMessage, androidMessage).then(function (result) {
          deferred.resolve();
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        });
      }).catch(function (error) {
        Log.error(error);
        deferred.resolve();
      });
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  }
  
};