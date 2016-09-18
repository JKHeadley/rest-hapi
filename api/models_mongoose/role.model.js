var Sequelize = require('sequelize');
var Joi = require('joi');

module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    id: {
      type: Types.ObjectId,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      displayName: "Id"
    },
    //NOTE: base roles = [Account, Admin, SuperAdmin]
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
      //   Model.hasMany(models.user, {as: "users", foreignKey: "roleId"});
      //   Model.routeOptions.associations.users.include = {model: models.user, as: "users"};
      //
      //   Model.belongsToMany(models.permission, {through: 'rolePermission', as: "permissions"});
      //   Model.routeOptions.associations.permissions.include = {model: models.permission, as: "permissions", through: models.rolePermission};
      // },
      nameField:"name",
      collectionDisplayName:"Role",
      collectionName:modelName,
      routeOptions: {
        associations: {
          users: {
            type: "ONE_MANY",
            alias: "user",
            model: "user"
          },
          // permissions: {
          //   type: "MANY",
          //   alias: "permission"
          // }
        }
      },
      extraReadModelAttributes: {
        updatedAt: Joi.date().optional(),
        createdAt: Joi.date().optional(),
      }
    };

  return Schema;
};