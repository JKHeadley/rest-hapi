'use strict'

const path = require('path')

const internals = {}

internals.policyObjects = require('require-all')(
  path.join(__dirname, '/../policies')
)

internals.policies = {}

for (let policyName in internals.policyObjects) {
  if (internals.policyObjects[policyName].applyPoint) {
    internals.policies[policyName] = internals.policyObjects[policyName]
  } else {
    let policyObject = internals.policyObjects[policyName]
    for (let policyName in policyObject) {
      internals.policies[policyName] = policyObject[policyName]
    }
  }
}

module.exports = internals.policies
