var Joi = require('joi');

module.exports = function (mongoose) {
  var modelName = "dog";
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
    owner: {
      type: Types.ObjectId,
      allowNull: true,
      queryable: true,
      displayName: "Owner",
      ref: "user"
    }
  });

  Schema.methods = {
    nameField:"name",
    collectionDisplayName:"Dog",
    collectionName:modelName,
    routeOptions: {
      associations: {
        owner: {
          type: "ONE_ONE",
          model: "user"
        }
      }
    },
    extraReadModelAttributes: {
      updatedAt: Joi.date().optional(),
      createdAt: Joi.date().optional(),
    }
  };

  return Schema;
};