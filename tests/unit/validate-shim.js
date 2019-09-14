'use strict'

const Joi = require('@hapi/joi')

module.exports = function validate(layout, target) {
  const obj = {}

  for (const key in layout) {
    obj[key] = Joi.any().equal(layout[key])
  }

  return Joi.object(obj).validate(target)
}
