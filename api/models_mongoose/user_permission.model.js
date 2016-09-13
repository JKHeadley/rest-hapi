var Sequelize = require('sequelize');

module.exports = function (sql) {

  var Model = sql.define('userPermission', {
    id: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    enabled: {
      typeKey: Sequelize.BOOLEAN.key,
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      displayName: "Enabled"
    },
    userId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowOnUpdate: false,
      allowNull:false
    },
    permissionId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowOnUpdate: false,
      allowNull:false
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
      }
    }
  });

  return Model;
};