'use strict'

module.exports = function(mongoose) {
  let modelName = 'hashtag'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
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
