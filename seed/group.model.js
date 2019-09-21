module.exports = function(mongoose) {
  const modelName = 'group'
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
          model: 'user'
        },
        permissions: {
          type: 'MANY_MANY',
          alias: 'permission',
          model: 'permission',
          linkingModel: 'group_permission'
        }
      }
    }
  }

  return Schema
}
