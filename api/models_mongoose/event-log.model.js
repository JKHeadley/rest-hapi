var Sequelize = require('sequelize');
var Joi = require('joi');
var Q = require('q');

module.exports = function (sql) {
  var Model = sql.define('eventLog', {
    id: {
      type: Sequelize.UUID,
      typeKey: Sequelize.UUID.key,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      queryable:true
    },
    description: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: true,
      queryable:true
    },
    organizationId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    publicUserProfileId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    userId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    activityFeedId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    hasActivityFeed: {
      type: Sequelize.BOOLEAN,
      typeKey: Sequelize.BOOLEAN.key,
      defaultValue: false,
      allowNull: false,
      queryable: true
    },
    notificationId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    hasNotification: {
      type: Sequelize.BOOLEAN,
      typeKey: Sequelize.BOOLEAN.key,
      defaultValue: false,
      allowNull: false,
      queryable: true
    },
    verb: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      queryable:true
    },
    objectId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    objectName: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: false,
      queryable:true
    },
    objectType: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: false,
      queryable:true
    },
    objectDisplayType: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: false,
      queryable:true
    },
    associatedObjectId: {
      typeKey: Sequelize.UUID.key,
      type: Sequelize.UUID,
      allowNull: true,
      queryable:true
    },
    associatedObjectName: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: true,
      queryable:true
    },
    associatedObjectType: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: true,
      queryable:true
    },
    associatedObjectDisplayType: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: true,
      queryable:true
    },
    objectProperty: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: true,
      queryable:true
    },
    objectDisplayProperty: {
      type: Sequelize.STRING,
      typeKey: Sequelize.STRING.key,
      allowNull: true,
      queryable:true
    },
    objectOldValue: {
      type: Sequelize.TEXT,
      typeKey: Sequelize.TEXT.key,
      allowNull: true,
      queryable:true
    },
    objectDisplayOldValue: {
      type: Sequelize.TEXT,
      typeKey: Sequelize.TEXT.key,
      allowNull: true,
      queryable:true
    },
    objectNewValue: {
      type: Sequelize.TEXT,
      typeKey: Sequelize.TEXT.key,
      allowNull: true,
      queryable:true
    },
    objectDisplayNewValue: {
      type: Sequelize.TEXT,
      typeKey: Sequelize.TEXT.key,
      allowNull: true,
      queryable:true
    },
    createdAt: {
      type: Sequelize.DATE,
      typeKey: Sequelize.DATE.key,
      default: Sequelize.NOW,
      queryable:true
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        Model.belongsTo(models.user, {foreignKey: 'userId', as: "user"});
        Model.routeOptions.associations.user.include = {model: models.user, as: "user"};
        
        Model.belongsTo(models.activityFeed, {as: 'activityFeed', foreignKey: "activityFeedId"});
        Model.routeOptions.associations.activityFeed.include = {model: models.activityFeed, as: "activityFeed"};

        //Model.belongsTo(models.notification, {as: 'notification', foreignKey: "notificationId"});
        Model.routeOptions.associations.notification.include = {model: models.notification, as: "notification"};
      },
      routeOptions: {
        alias:"event-log",
        allowCreate:false,
        allowUpdate:false,
        allowDelete:false,
        associations: {
          organization: {},
          publicUser: {},
          user: {},
          activityFeed: {},
          notification: {}
        }
      },
      extraReadModelAttributes: {
        updatedAt: Joi.date().optional(),
        createdAt: Joi.date().optional(),
        eventLogId: Joi.string().allow(null).optional() //HACK not sure why sequelize adds this.
      }
    }
  });

  return Model;
};