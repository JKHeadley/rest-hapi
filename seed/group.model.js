module.exports = function(mongoose) {
  let modelName = 'group'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema({
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
