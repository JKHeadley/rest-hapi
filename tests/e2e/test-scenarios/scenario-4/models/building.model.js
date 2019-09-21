'use strict'

module.exports = function(mongoose) {
  const modelName = 'building'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
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
