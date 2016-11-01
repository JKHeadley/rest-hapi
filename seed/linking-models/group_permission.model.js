var mongoose = require("mongoose");

module.exports = function () {

  var Types = mongoose.Schema.Types;

  var Model = {
    Schema: {
      enabled: {
        type: Types.Boolean,
        default: true
      }
    },
    modelName: "group_permission"
  };

  return Model;
};