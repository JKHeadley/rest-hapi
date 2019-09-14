const mongoose = require('mongoose')

module.exports = function() {
  const Types = mongoose.Schema.Types

  const Model = {
    Schema: {
      enabled: {
        type: Types.Boolean,
        default: true
      }
    },
    modelName: 'user_permission'
  }

  return Model
}
