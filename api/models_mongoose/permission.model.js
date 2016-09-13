var Sequelize = require('sequelize');
var Joi = require('joi');

module.exports = function (sql) {
  var Model = sql.define('permission', {
    id: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      displayName: "Id"
    },
    name: {
      typeKey: Sequelize.STRING.key,
      type: Sequelize.STRING,
      allowNull: false,
      queryable: true,
      validate: {
        len: [1, 36]
      },
      displayName: "Name"
    },
    description: {
      typeKey: Sequelize.STRING.key,
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        len: [1, 255]
      },
      displayName: "Description"
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        Model.belongsToMany(models.user, {through: 'userPermission', as: "users"});
        Model.routeOptions.associations.users.include = {model: models.user, as: "users", through: models.userPermission};

        Model.belongsToMany(models.role, {through: 'rolePermission', as: "roles"});
        Model.routeOptions.associations.roles.include = {model: models.role, as: "roles", through: models.rolePermission};

        Model.belongsToMany(models.group, {through: 'groupPermission', as: "groups"});
        Model.routeOptions.associations.groups.include = {model: models.group, as: "groups", through: models.groupPermission};
      },
      nameField:"name",
      //NOTE: was using "tableName" for this property, but apparently
      // that is a keyword and was somehow causing cyclic dependencies
      tableDisplayName:"Permission",
      routeOptions: {
        associations: {
          users: {
            type: "MANY",
            alias: "user"
          },
          roles: {
            type: "MANY",
            alias: "roles"
          },
          groups: {
            type: "MANY",
            alias: "groups"
          }
        }
      },
      extraReadModelAttributes: {
        updatedAt: Joi.date().optional(),
        createdAt: Joi.date().optional(),
        permissionId: Joi.string().allow(null).optional() //HACK: not sure where this comes from.
      }
    }
  });

  return Model;
};