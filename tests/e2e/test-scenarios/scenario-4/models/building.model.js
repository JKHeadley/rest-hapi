'use strict'

module.exports = function(mongoose) {
  let modelName = 'building'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String
      },
      facilitiesPerFloor: [
        {
          type: Types.ObjectId,
          ref: 'facility'
        }
      ]
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
