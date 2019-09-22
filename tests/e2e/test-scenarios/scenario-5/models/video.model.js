'use strict'

module.exports = function(mongoose) {
  var modelName = 'video'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      title: {
        type: Types.String,
        description: 'Video title from YouTube'
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        segments: {
          type: 'ONE_MANY',
          alias: 'segment',
          foreignField: 'video',
          model: 'segment'
        }
      }
    }
  }

  return Schema
}
