'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    },
    firstName: {
      type: Types.String
    },
    lastName: {
      type: Types.String
    },
    title: {
      type: Types.ObjectId,
      ref: "role"
    },
    profile: {
      type: Types.ObjectId,
      ref: "userProfile"
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        profile: {
          type: "ONE_ONE",
          model: "userProfile"
        },
        title: {
          type: "MANY_ONE",
          model: "role"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permissions",
          model: "permission",
          linkingModel: "user_permission"
        },
        tags: {
          type: "_MANY",
          model: "hashtag",
        },
      }
    }
  };
  
  return Schema;
};
