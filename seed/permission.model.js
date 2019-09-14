module.exports = function(mongoose) {
  const modelName = 'permission'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  })
  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        users: {
          type: 'MANY_MANY',
          alias: 'user',
          model: 'user',
          linkingModel: 'user_permission'
        },
        roles: {
          type: 'MANY_MANY',
          alias: 'role',
          model: 'role',
          linkingModel: 'role_permission'
        },
        groups: {
          type: 'MANY_MANY',
          alias: 'group',
          model: 'group',
          linkingModel: 'group_permission'
        }
      }
    }
  }

  return Schema
}
