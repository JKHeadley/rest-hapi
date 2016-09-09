module.exports = function (sql) {
  var models = {
    user: require('./models/user.model')(sql),
    role: require('./models/role.model')(sql),
    imageFile: require('./models/image-file.model')(sql),
    notification: require('./models/notification.model')(sql),
    eventLog: require('./models/event-log.model')(sql),
    emailLink: require('./models/email-link.model')(sql),
    activityFeed: require('./models/activity-feed.model')(sql),
    group: require('./models/group.model')(sql),
    permission: require('./models/permission.model')(sql),
    userPermission: require('./models/user_permission.model')(sql),
    rolePermission: require('./models/role_permission.model')(sql),
    groupPermission: require('./models/group_permission.model')(sql),
  };

  for (var modelKey in models) {

    var model = models[modelKey];

    if (model.associate) {
      model.associate(models);
    }
  }

  return models;
};