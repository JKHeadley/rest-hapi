'use strict'

module.exports = function(mongoose) {
  let modelName = 'role'
  let Types = mongoose.Schema.Types
  let Schema = new mongoose.Schema(
    {
      name: {
        type: Types.String,
        required: true
      },
      description: {
        type: Types.String
      }
    },
    { collection: modelName }
  )

  Schema.statics = {
    collectionName: modelName,
    routeOptions: {
      documentScope: {
        rootScope: ['root'],
        createScope: ['create'],
        updateScope: ['update'],
        deleteScope: ['delete'],
        associateScope: ['associate']
      },
      authorizeDocumentCreator: true
    }
  }

  return Schema
}
