'use strict'

module.exports = function(mongoose) {
  const modelName = 'role'
  const Types = mongoose.Schema.Types
  const Schema = new mongoose.Schema(
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
