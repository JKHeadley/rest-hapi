let assert = require('assert')

// TODO: verify routeOptions exist

module.exports = {
  /**
   * Assert that a given model follows the mongoose model format.
   * @param model
   * @param logger
   * @returns {boolean}
   */
  validateModel: function(model, logger) {
    assert(
      model.schema,
      "model not mongoose format. 'schema' property required."
    )
    assert(
      model.schema.paths,
      "model not mongoose format. 'schema.paths' property required."
    )
    assert(
      model.schema.tree,
      "model not mongoose format. 'schema.tree' property required."
    )

    let fields = model.schema.paths
    let fieldNames = Object.keys(fields)

    assert(
      model.routeOptions,
      "model not mongoose format. 'routeOptions' property required."
    )

    for (let i = 0; i < fieldNames.length; i++) {
      let fieldName = fieldNames[i]
      assert(
        fields[fieldName].options,
        "field not mongoose format. 'options' parameter required."
      )
    }

    return true
  }
}
