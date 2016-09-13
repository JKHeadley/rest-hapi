module.exports = function (sql, mongoose) {
  var models = {};
  models.sequelize = {
    // user: require('./models_sequelize/user.model')(sql),
    // role: require('./models_sequelize/role.model')(sql),
    // imageFile: require('./models_sequelize/image-file.model')(sql),
    // notification: require('./models_sequelize/notification.model')(sql),
    // eventLog: require('./models_sequelize/event-log.model')(sql),
    // emailLink: require('./models_sequelize/email-link.model')(sql),
    // activityFeed: require('./models_sequelize/activity-feed.model')(sql),
    // group: require('./models_sequelize/group.model')(sql),
    // permission: require('./models_sequelize/permission.model')(sql),
    // userPermission: require('./models_sequelize/user_permission.model')(sql),
    // rolePermission: require('./models_sequelize/role_permission.model')(sql),
    // groupPermission: require('./models_sequelize/group_permission.model')(sql),
  };

  models.mongoose = {
    user: require('./models_mongoose/user.model')(mongoose),
    // role: require('./models_mongoose/role.model')(mongoose),
    // imageFile: require('./models_mongoose/image-file.model')(mongoose),
    // notification: require('./models_mongoose/notification.model')(mongoose),
    // eventLog: require('./models_mongoose/event-log.model')(mongoose),
    // emailLink: require('./models_mongoose/email-link.model')(mongoose),
    // activityFeed: require('./models_mongoose/activity-feed.model')(mongoose),
    // group: require('./models_mongoose/group.model')(mongoose),
    // permission: require('./models_mongoose/permission.model')(mongoose),
    // userPermission: require('./models_mongoose/user_permission.model')(mongoose),
    // rolePermission: require('./models_mongoose/role_permission.model')(mongoose),
    // groupPermission: require('./models_mongoose/group_permission.model')(mongoose),
  };

  for (var modelKey in models.sequelize) {

    var model = models.sequelize[modelKey];

    if (model.associate) {
      model.associate(models.sequelize);
    }
  }

  for (var modelKey in models.mongoose) {

    var model = models.mongoose[modelKey];

    if (model.schema.methods.associate) {
      model.schema.methods.associate(models.mongoose);
    }
  }

  return models;
};