var Joi = require('joi');

module.exports = function (mongoose) {
  var Schema = mongoose.Schema;
  
  var Model = new Schema({
    // id: {
    //   typeKey: Sequelize.UUID.key,
    //   type: Sequelize.UUID,
    //   defaultValue: Sequelize.UUIDV4,
    //   primaryKey: true,
    //   displayName: "Id"
    // },
    name: {
      type: Schema.Types.String,
      allowNull: false,
      queryable: true,
      // validate: {
      //   len: [1, 36]
      // },
      displayName: "Name"
    },
    description: {
      type: Schema.Types.String,
      allowNull: true,
      // validate: {
      //   len: [1, 255]
      // },
      displayName: "Description"
    }
  });
  
  Model.methods = {
    associate: function (models) {
      Model.methods.routeOptions.associations.users.belongsToMany = {through: 'userGroup', as: "users"};
      Model.methods.routeOptions.associations.users.include = {model: models.user, as: "users"};

      // Model.belongsToMany(models.permission, {through: 'groupPermission', as: "permissions"});
      // Model.routeOptions.associations.permissions.include = {model: models.permission, as: "permissions", through: models.groupPermission};
    },
    nameField:"name",
    collectionDisplayName:"Group",
    routeOptions: {
      associations: {
        users: {
          type: "MANY",
          alias: "user"
        },
        // permissions: {
        //   type: "MANY",
        //   alias: "permission"
        // }
      }
    },
    extraReadModelAttributes: {
      updatedAt: Joi.date().optional(),
      createdAt: Joi.date().optional(),
    }
  };
  
  var model = mongoose.model('group', Model);

  return model;
};