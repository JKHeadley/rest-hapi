var modelHelper = require('./utilities/model-helper');

module.exports = function (mongoose) {
  var models = {};

  //TODO: generate schemas dynamically through list of files
  var schemas = {
    user: require('./models/user.model')(mongoose),
    role: require('./models/role.model')(mongoose),
    // imageFile: require('./models/image-file.model')(mongoose),
    // notification: require('./models/notification.model')(mongoose),
    // eventLog: require('./models/event-log.model')(mongoose),
    // emailLink: require('./models/email-link.model')(mongoose),
    // activityFeed: require('./models/activity-feed.model')(mongoose),
    group: require('./models/group.model')(mongoose),
    permission: require('./models/permission.model')(mongoose),
  };
  
  var extendedSchemas = {};

  for (var schemaKey in schemas) {
    var schema = schemas[schemaKey];
    extendedSchemas[schemaKey] = modelHelper.extendSchemaAssociations(schema);
  }

  for (var schemaKey in extendedSchemas) {//EXPL: Create models with final schemas
    var schema = extendedSchemas[schemaKey];
    models[schemaKey] = modelHelper.createModel(schema);
  }

  for (var modelKey in models) {//EXPL: Populate internal model associations
    var model = models[modelKey];
    modelHelper.associateModels(model.schema, models);
  }

  return models;
};