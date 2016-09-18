var Joi = require('joi');

module.exports = function (mongoose) {
  var modelName = "permission";
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
    }
  });
  Schema.methods = {
    // associate: function (models) {
    //   Model.belongsToMany(models.user, {through: 'userPermission', as: "users"});
    //   Model.routeOptions.associations.users.include = {model: models.user, as: "users", through: models.userPermission};
    //
    //   Model.belongsToMany(models.role, {through: 'rolePermission', as: "roles"});
    //   Model.routeOptions.associations.roles.include = {model: models.role, as: "roles", through: models.rolePermission};
    //
    //   Model.belongsToMany(models.group, {through: 'groupPermission', as: "groups"});
    //   Model.routeOptions.associations.groups.include = {model: models.group, as: "groups", through: models.groupPermission};
    // },
    nameField:"name",
    collectionDisplayName:"Permission",
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "MANY_MANY",
          alias: "user",
          model: "user"
        },
        roles: {
          type: "MANY_MANY",
          alias: "role",
          model: "role"
        },
        groups: {
          type: "MANY_MANY",
          alias: "group",
          model: "group",
          linkingModel: "group_permission"
        }
      }
    },
    extraReadModelAttributes: {
      updatedAt: Joi.date().optional(),
      createdAt: Joi.date().optional()
    }
  };

  return Schema;
};