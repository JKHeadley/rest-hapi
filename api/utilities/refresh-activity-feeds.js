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
        Log.error("XXSKIPPING:", eventLog.index);
        continue;//EXPL: ignore updates where the value didn't change
      } else {
        Log.error("XXPROCESSING EVENT LOG");
        if (eventLog.objectType == "userSetting") {
          eventLog.eraseActivityFeed = true;
        }
        if (eventLog.objectType == 'notification') {
          eventLog.eraseActivityFeed = true;
        }
        if (eventLog.objectType == 'transaction') {
          promises.push(processTransaction(eventLog));
        } else if (eventLog.objectType == 'missingItemReport') {
          promises.push(processReport(eventLog));
        } else if (eventLog.objectType == 'note') {
          promises.push(processNote(eventLog));
        } else if (eventLog.associatedObjectType == 'location') {
          promises.push(processLocation(eventLog));
        } else if (eventLog.associatedObjectType == 'customField') {
          promises.push(processCustomField(eventLog));
        } else {
          var webMessage = formWebMessage(eventLog);
          var androidMessage = formAndroidMessage(eventLog);
          promises.push(updateActivityFeed(eventLog, webMessage, androidMessage));
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

  function updateActivityFeed(eventLog, webMessage, androidMessage) {
    var deferred = Q.defer();
    Log.error("XXupdateActivityFeed", eventLog.index);
    if (eventLog.eraseActivityFeed || !webMessage) {//EXPL: objects related to the activity feed have been erased, therefore remove the activityFeed from the eventLog
      options.models.eventLog.update({
        hasActivityFeed: false
      }, {where: {id: eventLog.id}}).then(function (result)  {
        Log.error("XXactivityFeed removed from eventLog:", result);
        deferred.resolve();
      });
    } else {
      if (eventLog.activityFeedId == null) {//EXPL: create a new activity feed
        options.models.activityFeed.create({
          eventLogId: eventLog.id,
          webMessage: webMessage,
          androidMessage: androidMessage,
        }).then(function (result)  {
          options.models.eventLog.update({
            activityFeedId: result.id,
            hasActivityFeed: true
          }, {where: {id: eventLog.id}}).then(function(result) {
            Log.error("XXactivityFeed created:", result);
            deferred.resolve();
          });
        }).catch(function(error) {
          Log.error(error);
          deferred.resolve();
        });
      } else {
        options.models.activityFeed.update({//EXPL: update an existing activity feed
          webMessage: webMessage,
          androidMessage: androidMessage,
          hasActivityFeed: true
        }, {where: {id: eventLog.activityFeedId}}).then(function (result)  {
          options.models.eventLog.update({
            activityFeedId: result.id,
            hasActivityFeed: true
          }, {where: {id: eventLog.id}}).then(function(result) {
            Log.error("XXactivityFeed updated:", result);
            deferred.resolve();
          });
        });
      }
    }
    return deferred.promise;
  }

  function formatFields(eventLog) {
    if (eventLog.user.email == "dev@tempocases.com") {
      eventLog.user.email = "Tempo Technologies";
    }
    
    if (eventLog.objectType == "imageFile") {
      if (eventLog.objectName) {
        var imageName = eventLog.objectName;
        imageName = imageName.replace('https://music-life.s3.amazonaws.com/', '');
        imageName = imageName.replace(/%20/g, ' ');
        eventLog.objectName = imageName;
      }
    }

    if (eventLog.associatedObjectType == "imageFile") {
      if (eventLog.associatedObjectName) {
        var imageName = eventLog.associatedObjectName;
        imageName = imageName.replace('https://music-life.s3.amazonaws.com/', '');
        imageName = imageName.replace(/%20/g, ' ');
        eventLog.associatedObjectName = imageName;
      }
    }

    if (eventLog.objectProperty == "mainImageId") {
      if (eventLog.objectDisplayNewValue) {
        var imageName = eventLog.objectDisplayNewValue;
        imageName = imageName.replace('https://music-life.s3.amazonaws.com/', '');
        imageName = imageName.replace(/%20/g, ' ');
        eventLog.objectDisplayNewValue = imageName;
      }

      if (eventLog.objectDisplayOldValue) {
        imageName = eventLog.objectDisplayOldValue;
        imageName = imageName.replace('https://music-life.s3.amazonaws.com/', '');
        imageName = imageName.replace(/%20/g, ' ');
        eventLog.objectDisplayOldValue = imageName;
      }
    }
  }
  
  function formWebMessage(eventLog) {
    Log.error("XXMESSAGE:", eventLog.index);
    var message = null;
    var firstHalf = null;
    var secondHalf = null;
    format.extend(String.prototype);
    if (!eventLog.user) {
      Log.error("XXNO USER");
      eventLog.eraseActivityFeed = true;
    } else {
      formatFields(eventLog);
      if (eventLog.objectType == "transaction") {
        if (eventLog.verb == "created") {
          message = "<strong>{user.email}</strong> {transaction.verb} item {transaction.item.description} to the {transaction.entityType} {transaction.displayName}.".format(eventLog);
        } else if (eventLog.verb == "updated") {
          message = "<strong>{user.email}</strong> marked the {transaction.type} for {transaction.item.description} as {objectDisplayNewValue} for the {transaction.entityType} {transaction.displayName}.".format(eventLog);
        }
      } else if (eventLog.objectType == "missingItemReport") {
        if (eventLog.verb == "created") {
          message = "<strong>{user.email}</strong> marked item {report.item.description} as lost.".format(eventLog);
        } else if (eventLog.verb == "updated") {
          message = "<strong>{user.email}</strong> marked item {report.item.description} as found.".format(eventLog);
        }
      } else {
        if (eventLog.verb == "created" || eventLog.verb == "deleted") {
          if (eventLog.objectName == "unknown") {
            message = "<strong>{user.email}</strong> {verb} a {objectDisplayType}.".format(eventLog);
          } else {
            message = "<strong>{user.email}</strong> {verb} the {objectDisplayType} \"{objectName}\".".format(eventLog);
          }
        } else if (eventLog.verb == "updated") {
          if (eventLog.objectDisplayNewValue) {
            if (!eventLog.objectDisplayOldValue) {
              message = "<strong>{user.email}</strong> {verb} the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\" to \"{objectDisplayNewValue}\".".format(eventLog);
            } else {
              message = "<strong>{user.email}</strong> {verb} the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\" from \"{objectDisplayOldValue}\" to \"{objectDisplayNewValue}\".".format(eventLog);
            }
          } else {
            if (eventLog.objectDisplayProperty != 'Notes') {
              message = "<strong>{user.email}</strong> cleared the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\".".format(eventLog);
            } else {
              message = "<strong>{user.email}</strong> updated the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\".".format(eventLog);
            }
          }
        } else if (eventLog.verb == "associated") {
          if (eventLog.associatedObjectName == "unknown") {
            firstHalf = "<strong>{user.email}</strong> added a {associatedObjectDisplayType}".format(eventLog);
          } else {
            firstHalf = "<strong>{user.email}</strong> added the {associatedObjectDisplayType} \"{associatedObjectName}\"".format(eventLog);
          }
          if (eventLog.objectName == "unknown") {
            secondHalf = " to a {objectDisplayType}.".format(eventLog);
          } else {
            secondHalf = " to the {objectDisplayType} \"{objectName}\".".format(eventLog);
          }
          message = firstHalf + secondHalf;
        } else if (eventLog.verb == "unassociated") {
          if (eventLog.associatedObjectName == "unknown") {
            firstHalf = "<strong>{user.email}</strong> removed a {associatedObjectDisplayType}".format(eventLog);
          } else {
            firstHalf = "<strong>{user.email}</strong> removed the {associatedObjectDisplayType} \"{associatedObjectName}\"".format(eventLog);
          }
          if (eventLog.objectName == "unknown") {
            secondHalf = " from a {objectDisplayType}.".format(eventLog);
          } else {
            secondHalf = " from the {objectDisplayType} \"{objectName}\".".format(eventLog);
          }
          message = firstHalf + secondHalf;
        }
      }
    }

    Log.error("XXMESSAGE:", message);
    return message;
  }

  function formAndroidMessage(eventLog) {
    Log.error("XXMESSAGE:", eventLog.index);
    var message = null;
    var firstHalf = null;
    var secondHalf = null;
    format.extend(String.prototype);
    if (!eventLog.user) {
      Log.error("XXNO USER");
      eventLog.eraseActivityFeed = true;
    } else {
      formatFields(eventLog);
      if (eventLog.objectType == "transaction") {
        if (eventLog.verb == "created") {
          message = "{user.email} {transaction.verb} item {transaction.item.description} to the {transaction.entityType} {transaction.displayName}.".format(eventLog);
        } else if (eventLog.verb == "updated") {
          message = "{user.email} marked the {transaction.type} for {transaction.item.description} as {objectDisplayNewValue} for the {transaction.entityType} {transaction.displayName}.".format(eventLog);
        }
      } else if (eventLog.objectType == "missingItemReport") {
        if (eventLog.verb == "created") {
          message = "{user.email} marked item {report.item.description} as lost.".format(eventLog);
        } else if (eventLog.verb == "updated") {
          message = "{user.email} marked item {report.item.description} as found.".format(eventLog);
        }
      } else {
        if (eventLog.verb == "created" || eventLog.verb == "deleted") {
          if (eventLog.objectName == "unknown") {
            message = "{user.email} {verb} a {objectDisplayType}.".format(eventLog);
          } else {
            message = "{user.email} {verb} the {objectDisplayType} \"{objectName}\".".format(eventLog);
          }        } else if (eventLog.verb == "updated") {
          if (eventLog.objectDisplayNewValue) {
            if (!eventLog.objectDisplayOldValue) {
              message = "{user.email} {verb} the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\" to \"{objectDisplayNewValue}\".".format(eventLog);
            } else {
              message = "{user.email} {verb} the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\" from \"{objectDisplayOldValue}\" to \"{objectDisplayNewValue}\".".format(eventLog);
            }
          } else {
            if (eventLog.objectDisplayProperty != 'Notes') {
              message = "{user.email} cleared the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\".".format(eventLog);
            } else {
              message = "{user.email} updated the {objectDisplayProperty} of {objectDisplayType} \"{objectName}\".".format(eventLog);
            }
          }
        } else if (eventLog.verb == "associated") {
          if (eventLog.associatedObjectName == "unknown") {
            firstHalf = "<strong>{user.email}</strong> added a {associatedObjectDisplayType}".format(eventLog);
          } else {
            firstHalf = "<strong>{user.email}</strong> added the {associatedObjectDisplayType} \"{associatedObjectName}\"".format(eventLog);
          }
          if (eventLog.objectName == "unknown") {
            secondHalf = " to a {objectDisplayType}.".format(eventLog);
          } else {
            secondHalf = " to the {objectDisplayType} \"{objectName}\".".format(eventLog);
          }
          message = firstHalf + secondHalf;
        } else if (eventLog.verb == "unassociated") {
          if (eventLog.associatedObjectName == "unknown") {
            firstHalf = "{user.email} removed a {associatedObjectDisplayType}".format(eventLog);
          } else {
            firstHalf = "{user.email} removed the {associatedObjectDisplayType} \"{associatedObjectName}\"".format(eventLog);
          }
          if (eventLog.objectName == "unknown") {
            secondHalf = " from a {objectDisplayType}.".format(eventLog);
          } else {
            secondHalf = " from the {objectDisplayType} \"{objectName}\".".format(eventLog);
          }
          message = firstHalf + secondHalf;
        }
      }
    }

    Log.error("XXMESSAGE:", message);
    return message;
  }

  function loadTransaction(eventLog) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"item,toPublicUser.user,toCustomer,toOrganization,toPartnerCompany.organization",
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
        eventLog.eraseActivityFeed = true;
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
      Log.error("XXPROCESSING Transaction", eventLog.index);
      var transaction = result.transaction;
      if (!eventLog.eraseActivityFeed) {
        eventLog.transaction = transaction;
        formatTransaction(eventLog.transaction);
        Log.error("XXFORMING WEB MESSAGE", eventLog.index);
        webMessage = formWebMessage(eventLog);
        androidMessage = formAndroidMessage(eventLog);
        Log.error("XXUPDATING ACTIVITY FEED", eventLog.index);
      }
      updateActivityFeed(eventLog, webMessage, androidMessage).then(function(result) {
        deferred.resolve();
      });
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
      embed:"item",
      id:eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/missing-item-report' + url;

    Log.error("XXurl", injectOptions.url);
    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var report = res.result[0];
      Log.error("XXreport", report);
      if (!report || !report.item) {
        eventLog.eraseActivityFeed = true;
      }
      deferred.resolve({eventLog:eventLog, report:report});
    });
    return deferred.promise;
  }

  function processReport(eventLog) {
    var deferred = Q.defer();
    loadReport(eventLog).then(function(result) {
      var webMessage = "";
      var androidMessage = "";
      var eventLog = result.eventLog;
      Log.error("XXPROCESSING Report", eventLog.index);
      eventLog.report = result.report;

      if (!eventLog.eraseActivityFeed) {
        Log.error("XXFORMING WEB MESSAGE", eventLog.index);
        webMessage = formWebMessage(eventLog);
        androidMessage = formAndroidMessage(eventLog);
        Log.error("XXUPDATING ACTIVITY FEED", eventLog.index);
      }
      updateActivityFeed(eventLog, webMessage, androidMessage).then(function(result) {
        deferred.resolve();
      });
    }).catch(function(error) {
      Log.error(error);
      deferred.resolve();
    });
    return deferred.promise;
  }

  function loadNote(eventLog) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"item",
      id:eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/note' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var note = res.result[0];
      if (!note || !note.item || eventLog.verb == "updated" || eventLog.verb == "deleted") {
        eventLog.eraseActivityFeed = true;
      }
      deferred.resolve({eventLog:eventLog, note:note});
    });
    return deferred.promise;
  }

  function processNote(eventLog) {
    var deferred = Q.defer();
    loadNote(eventLog).then(function(result) {
      var webMessage = "";
      var androidMessage = "";
      var eventLog = result.eventLog;
      Log.error("XXPROCESSING Note", eventLog.index);
      var note = result.note;

      if (!eventLog.eraseActivityFeed) {
        eventLog.objectDisplayType = "Item";
        eventLog.objectName = note.item.description;
        eventLog.objectDisplayProperty = "Notes";
        eventLog.objectDisplayNewValue = "";

        Log.error("XXFORMING WEB MESSAGE", eventLog.index);
        webMessage = formWebMessage(eventLog);
        androidMessage = formAndroidMessage(eventLog);
        Log.error("XXUPDATING ACTIVITY FEED", eventLog.index);
      }
      updateActivityFeed(eventLog, webMessage, androidMessage).then(function(result) {
        deferred.resolve();
      });
    }).catch(function(error) {
      Log.error(error);
      deferred.resolve();
    });
    return deferred.promise;
  }

  function processLocation(eventLog) {
    var deferred = Q.defer();
    if (eventLog.verb == 'associated') {
      eventLog.verb = 'updated';
      eventLog.objectDisplayProperty = eventLog.associatedObjectDisplayType;
      eventLog.objectDisplayOldValue = "";
      eventLog.objectDisplayNewValue = eventLog.associatedObjectName;
    } else if (eventLog.verb == 'unassociated') {
      eventLog.verb = 'updated';
      eventLog.objectDisplayProperty = eventLog.associatedObjectDisplayType;
      eventLog.objectDisplayOldValue = "oldValue";
      eventLog.objectDisplayNewValue = "";
    }

    var webMessage = formWebMessage(eventLog);
    var androidMessage = formAndroidMessage(eventLog);
    updateActivityFeed(eventLog, webMessage, androidMessage).then(function(result) {
      deferred.resolve();
    });
    return deferred.promise;
  }

  function loadCustomField(eventLog) {
    var deferred = Q.defer();
    var injectOptions = {};
    injectOptions.method = 'GET';
    var params = {
      embed:"customFields",
      id:eventLog.objectId
    };
    var url = '?' + queryString.stringify(params);
    injectOptions.url = '/item' + url;

    injectOptions.headers = {
      Authorization: request.orig.headers.authorization
    };

    server.inject(injectOptions, function(res) {
      var item = res.result[0];
      if (!item || !item.customFields) {
        eventLog.eraseActivityFeed = true;
        deferred.resolve({eventLog:eventLog, customField:null});
      } else {
        item.customFields.forEach(function(customField) {
          if (customField.id == eventLog.associatedObjectId) {
            deferred.resolve({eventLog:eventLog, customField:customField});
          }
        });
      }
    });
    return deferred.promise;
  }

  function processCustomField(eventLog) {
    var deferred = Q.defer();
    loadCustomField(eventLog).then(function(result) {
      var webMessage = "";
      var androidMessage = "";
      var eventLog = result.eventLog;
      Log.error("XXPROCESSING CustomField", eventLog.index);
      var customField = result.customField;

      if (eventLog.verb == 'associated') {
        eventLog.verb = 'updated';
        eventLog.objectDisplayProperty = eventLog.associatedObjectName;
        eventLog.objectDisplayOldValue = "";
        eventLog.objectDisplayNewValue = customField.itemCustomField.value;
      } else if (eventLog.verb == 'unassociated') {
        eventLog.eraseActivityFeed = true;//EXPL: ignore this event for custom fields
      }

      webMessage = formWebMessage(eventLog);
      androidMessage = formAndroidMessage(eventLog);
      updateActivityFeed(eventLog, webMessage, androidMessage).then(function(result) {
        deferred.resolve();
      });
      return deferred.promise;
    })

  }
  
};