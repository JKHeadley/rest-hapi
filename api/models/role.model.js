var Joi = require('joi');

module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
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
      nameField:"name",
      collectionDisplayName:"Role",
      collectionName:modelName,
      routeOptions: {
        associations: {
          // people: {
          //   type: "ONE_MANY",
          //   alias: "people",
          //   foreignField: "title",
          //   model: "user"
          // },
          // subPeople: {
          //   type: "ONE_MANY",
          //   alias: "sub-people",
          //   foreignField: "subTitle",
          //   model: "user"
          // },
          permissions: {
            type: "MANY_MANY",
            alias: "permission",
            model: "permission"
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