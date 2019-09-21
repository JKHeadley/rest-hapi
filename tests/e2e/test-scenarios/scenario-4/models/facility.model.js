'use strict'

module.exports = function(mongoose) {
  const modelName = 'facility'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
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
