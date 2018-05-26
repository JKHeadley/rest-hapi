'use strict'

module.exports = function(mongoose) {
  let modelName = 'facility'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {}
    }
  }

  return Schema
}
