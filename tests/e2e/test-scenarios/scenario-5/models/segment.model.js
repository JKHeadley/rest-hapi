'use strict'

module.exports = function(mongoose) {
  var modelName = 'segment'
  var Types = mongoose.Schema.Types
  var Schema = new mongoose.Schema(
    {
      title: { type: Types.String, required: true },
      video: { type: Types.ObjectId, ref: 'video' }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      associations: {
        video: {
          type: 'MANY_ONE',
          model: 'video'
        },
        tags: {
          type: 'MANY_MANY',
          alias: 'tag',
          model: 'tag',
          linkingModel: 'segment_tag'
        }
      }
    }
  }

  return Schema
}
