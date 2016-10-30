module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      enum: ["Account", "Admin", "SuperAdmin"],
      allowNull: false
    },
    description: {
      type: Types.String,
      allowNull: true
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "ONE_MANY",
          model: "user"
        }
      }
    }
  };

  return Schema;
};
