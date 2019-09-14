'use strict'

module.exports = function(mongoose) {
  const modelName = 'hashtag'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
    {
      text: {
        type: Types.String,
        required: true
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
