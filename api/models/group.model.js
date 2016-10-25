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
    }
  });
  
  Schema.methods = {
    collectionDisplayName:"Group",
    collectionName:modelName,
    nameField:"name",
    routeOptions: {
      associations: {
        // users: {
        //   type: "MANY_MANY",
        //   alias: "user",
        //   model: "user"
        // },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission",
          linkingModel: "group_permission"
        }
      }
    },
    extraReadSchemaAttributes: {
      updatedAt: Joi.date().optional(),
      createdAt: Joi.date().optional(),
    }
  };
  
  return Schema;
};