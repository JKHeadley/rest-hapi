var Sequelize = require('sequelize');
var Joi = require('joi');

module.exports = function (sql) {
  var Model = sql.define('emailLink', {
    id: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      displayName: "Id"
    },
    userId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      displayName: "User",
      association: "user"
    },
    invalid: {
      type: Sequelize.BOOLEAN,
      typeKey: Sequelize.BOOLEAN.key,
      defaultValue: false,
      allowNull: true,
      queryable: true,
      displayName: "Invalid Flag"
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        Model.belongsTo(models.user, {as: "user", foreignKey: {name: 'userId', allowNull: false}});
        Model.routeOptions.associations.user.include = {model: models.user, as: "user"};
      },
      //NOTE: was using "tableName" for this property, but apparently
      // that is a keyword and was somehow causing cyclic dependencies
      tableDisplayName:"Email Link",
      routeOptions: {
        alias:"email-link",
        associations: {
          user: {}
        }
      },
      extraReadModelAttributes: {
        updatedAt: Joi.date().optional(),
        createdAt: Joi.date().optional(),
        scanId: Joi.string().allow(null).optional() //HACK: not sure where this comes from.
      }
    }
  });

  return Model;
};