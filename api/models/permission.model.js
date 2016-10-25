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
    nameField:"name",
    collectionDisplayName:"Permission",
    collectionName:modelName,
    routeOptions: {
      associations: {
        // users: {
        //   type: "MANY_MANY",
        //   alias: "user",
        //   model: "user"
        // },
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