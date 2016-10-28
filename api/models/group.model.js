module.exports = function (mongoose) {
  var modelName = "group";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      allowNull: false,
      queryable: true
    },
    description: {
      type: Types.String,
      allowNull: true
    }
  });
  
  Schema.methods = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "MANY_MANY",
          alias: "user",
          model: "user"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission",
          linkingModel: "group_permission"
        }
      }
    }
  };
  
  return Schema;
};