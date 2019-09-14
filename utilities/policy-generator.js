'use strict'

const path = require('path')

const internals = {}

internals.policyObjects = require('require-all')(
  path.join(__dirname, '/../policies')
)

internals.policies = {}

for (const policyName in internals.policyObjects) {
  if (internals.policyObjects[policyName].applyPoint) {
    internals.policies[policyName] = internals.policyObjects[policyName]
  } else {
    const policyObject = internals.policyObjects[policyName]
    for (const policyName in policyObject) {
      internals.policies[policyName] = policyObject[policyName]
    }
  }
}

module.exports = internals.policies
