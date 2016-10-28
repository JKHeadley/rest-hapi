var Q = require('q');
//TODO: assign a unique text index to email field

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
      // validate: {
      //   len: [5, 64]
      // },
      exclude: true,
      allowOnUpdate: false,
    },
    firstName: {
      type: Types.String,
      allowNull: true
    },
    lastName: {
      type: Types.String,
      allowNull: true
    },
    role: {
      type: Types.ObjectId,
      allowNull: true,
      queryable: true,
      ref: "role"
    },
    token: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    },
    tokenCreatedAt: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    },
    accountActivated: {
      type: Types.Boolean,
      defaultValue: false,
      allowNull: true
    }
  });
  
  Schema.methods = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role"
        },
        groups: {
          type: "MANY_MANY",
          alias: "group",
          model: "group"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission",
          linkingModel: "user_permission"
        }
      },
      extraEndpoints: [],
      create: {
        pre: function (request, Log) {
          var deferred = Q.defer();
          var passwordUtility = require('../../api/utilities/password-helper');
          var hashedPassword = passwordUtility.hash_password(request.payload.password);

          request.payload.password = hashedPassword;
          deferred.resolve(request);
          return deferred.promise;
        }
      }
    }
  };
  
  return Schema;
};
