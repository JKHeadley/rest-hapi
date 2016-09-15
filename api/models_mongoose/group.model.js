var Joi = require('joi');

module.exports = function (mongoose) {
  var modelName = "group";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      allowNull: false,
      queryable: true,
      // validate: {
      //   len: [1, 36]
      // },
      displayName: "Name"
    },
    description: {
      type: Types.String,
      allowNull: true,
      // validate: {
      //   len: [1, 255]
      // },
      displayName: "Description"
    },
    // groupId: {
    //   type: Types.ObjectId,
    // },
  });
  
  Schema.methods = {
    // createModel: function() {
    //   return mongoose.model(modelName, Schema);
    // },
    // extend1: function (schemas) {
    //   var extendObject = {};
    //   extendObject[modelName + "Id"] = Types.String;
    //
    //   Schema = Schema.extend(extendObject);
    //   return Schema;
    // },
    // extend2: function (schemas) {
    //   for (var associationKey in Schema.methods.routeOptions.associations) {
    //     var association = Schema.methods.routeOptions.associations[associationKey];
    //     var extendObject = {};
    //     extendObject[associationKey] = [schemas[association.model]];
    //     Schema = Schema.extend(extendObject);
    //   }
    //   return Schema;
    // },
    // associate: function (models) {
    //   //Schema.methods.routeOptions.associations.users.belongsToMany = {through: 'userGroup', as: "users"};
    //   // Schema.methods.routeOptions.associations.users.include = {model: models.user, as: "users"};
    //
    //   // Schema.belongsToMany(models.permission, {through: 'groupPermission', as: "permissions"});
    //   // Schema.routeOptions.associations.permissions.include = {model: models.permission, as: "permissions", through: models.groupPermission};
    //
    //   for (var associationKey in Schema.methods.routeOptions.associations) {
    //     var association = Schema.methods.routeOptions.associations[associationKey];
    //     association.include = {
    //       model: models[association.model],
    //       as: associationKey
    //     };
    //   }
    // },
    collectionDisplayName:"Group",
    collectionName:modelName,
    nameField:"name",
    routeOptions: {
      associations: {
        users: {
          type: "MANY",
          alias: "user",
          model: "user"
        },
        // permissions: {
        //   type: "MANY",
        //   alias: "permission"
        // }
      }
    },
    extraReadSchemaAttributes: {
      updatedAt: Joi.date().optional(),
      createdAt: Joi.date().optional(),
    }
  };
  
  // var model = mongoose.model('group', Schema);

  return Schema;
};