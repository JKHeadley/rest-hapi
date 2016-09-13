var Sequelize = require('sequelize');
var Joi = require('joi');

module.exports = function (sql) {
  var Model = sql.define('imageFile', {
    id: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      queryable: true
    },
    fileUrl: {
      typeKey: Sequelize.STRING.key,
      type: Sequelize.STRING,
      allowNull: false,
      queryable: true
    }
  }, {
    freezeTableName: true,
    classMethods: {
      routeOptions:{
        alias:"image-file"
      },
      nameField:"fileUrl",
      //NOTE: was using "tableName" for this property, but apparently
      // that is a keyword and was somehow causing cyclic dependencies
      tableDisplayName:"Image File",
      extraReadModelAttributes: {
        updatedAt: Joi.date().optional(),
        createdAt: Joi.date().optional(),
        imageFileId: Joi.string().allow(null).optional() //HACK: not sure where this comes from.
      }
    }
  });

  return Model;
};
