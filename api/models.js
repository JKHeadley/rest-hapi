var modelHelper = require('./utilities_mongoose/model-helper');

module.exports = function (sql, mongoose) {
  var models = {};
  var schemas = {};
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

  //TODO: generate schemas dynamically through list of files
  schemas.mongoose = {
    user: require('./models_mongoose/user.model')(mongoose),
    role: require('./models_mongoose/role.model')(mongoose),
    // imageFile: require('./models_mongoose/image-file.model')(mongoose),
    // notification: require('./models_mongoose/notification.model')(mongoose),
    // eventLog: require('./models_mongoose/event-log.model')(mongoose),
    // emailLink: require('./models_mongoose/email-link.model')(mongoose),
    // activityFeed: require('./models_mongoose/activity-feed.model')(mongoose),
    group: require('./models_mongoose/group.model')(mongoose),
    permission: require('./models_mongoose/permission.model')(mongoose),
  };

  // for (var modelKey in models.sequelize) {
  //
  //   var model = models.sequelize[modelKey];
  //
  //   if (model.associate) {
  //     model.associate(models.sequelize);
  //   }
  // }


  models.mongoose = {};
  var originalSchamas = schemas.mongoose;
  var extendedSchemas = {};
  var finalSchemas = {};

  // for (var schemaKey in originalSchamas) {//EXPL: Extend original schemas to include fields used with associations
  //   var schema = originalSchamas[schemaKey];
  //   console.log(schemaKey);
  //   extendedSchemas[schemaKey] = modelHelper.extendSchemaFields(schema);
  // }

  for (var schemaKey in originalSchamas) {//EXPL: Used extended schemas to add associations to original schemas
    var schema = originalSchamas[schemaKey];
    finalSchemas[schemaKey] = modelHelper.extendSchemaAssociations(schema);
  }

  for (var schemaKey in finalSchemas) {//EXPL: Create models with final schemas
    var schema = finalSchemas[schemaKey];
    models.mongoose[schemaKey] = modelHelper.createModel(schema);
  }

  for (var modelKey in models.mongoose) {//EXPL: Populate internal model associations
    var model = models.mongoose[modelKey];
    modelHelper.associateModels(model.schema, models.mongoose);
  }

  return models;
};