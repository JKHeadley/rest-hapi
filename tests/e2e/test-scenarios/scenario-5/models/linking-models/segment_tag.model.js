var mongoose = require('mongoose')

module.exports = function() {
  var Types = mongoose.Schema.Types

  var Model = {
    Schema: {
      rank: {
        type: Types.Number,
        required: true
      }
    },
    modelName: 'segment_tag'
  }

  return Model
}
