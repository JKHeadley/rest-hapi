module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      allowNull: false,
      unique: true
    },
    password: {
      type: Types.String,
      allowNull: false,
      required: true,
      exclude: true,
      allowOnUpdate: false
    },
    title: {
      type: Types.ObjectId,
      ref: "role"
    }

  });
  
  Schema.methods = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role"
        }
      }
    }
  };
  
  return Schema;
};
