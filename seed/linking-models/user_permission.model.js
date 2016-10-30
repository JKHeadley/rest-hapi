var mongoose = require("mongoose");

module.exports = function () {

  var Types = mongoose.Schema.Types;

  var Model = {
    Schema: {
      enabled: {
        type: Types.Boolean,
        allowNull: false,
        defaultValue: true
      }
    },
    modelName: "user_permission"
  };

  return Model;
};