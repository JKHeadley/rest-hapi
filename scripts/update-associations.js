'use strict'

let path = require('path')
let mongoose = require('mongoose')
let _ = require('lodash')
let restHapi = require('../rest-hapi')
;(async function updateAssociations() {
  restHapi.config.loglevel = 'DEBUG'
  let Log = restHapi.getLogger('update-associations')
  try {
    const mongoURI = process.argv[3]

    mongoose.Promise = Promise

    mongoose.connect(mongoURI, {
      useMongoClient: true
    })

    let embedAssociations = process.argv[5] === 'true'

    let modelPath = path.join(__dirname, '/../../../models')

    if (process.argv[7]) {
      modelPath = process.argv[7]
    }

    restHapi.config.absoluteModelPath = true
    restHapi.config.modelPath = modelPath
    restHapi.config.embedAssociations = embedAssociations

    let models = await restHapi.generateModels(mongoose)

    Log.debug('mongoURI:', mongoURI)
    Log.debug('embedAssociations:', embedAssociations)
    Log.debug('modelPath:', restHapi.config.modelPath)

    let modelsArray = []

    for (let modelName in models) {
      modelsArray.push(models[modelName])
    }

    await applyActionToModels(addEmbedded, modelsArray, embedAssociations, Log)
    await applyActionToModels(
      removeLinking,
      modelsArray,
      embedAssociations,
      Log
    )
    await applyActionToModels(addLinking, modelsArray, embedAssociations, Log)
    await applyActionToModels(
      removeEmbedded,
      modelsArray,
      embedAssociations,
      Log
    )
    Log.debug('DONE')
    process.exit()
  } catch (err) {
    Log.error(err)
    process.exit()
  }
})()

function getLinkingModel(model, association, logger) {
  let linkingModel = null
  let linkingModelExists = false
  try {
    linkingModel = mongoose.model(association.linkingModel)
    linkingModelExists = true
  } catch (err) {}
  if (!linkingModelExists) {
    try {
      linkingModel = mongoose.model(model.modelName + '_' + association.model)
      linkingModelExists = true
    } catch (err) {}
  }
  if (!linkingModelExists) {
    try {
      linkingModel = mongoose.model(association.model + '_' + model.modelName)
    } catch (err) {}
  }
  if (!linkingModelExists) {
    let schema = {}
    schema[model.modelName] = {
      type: mongoose.Schema.Types.ObjectId
    }
    schema[association.model] = {
      type: mongoose.Schema.Types.ObjectId
    }
    let linkingModelName = model.modelName + '_' + association.model

    let linkingSchema = new mongoose.Schema(schema, {
      collection: linkingModelName
    })
    linkingModel = mongoose.model(linkingModelName, linkingSchema)
  }

  return linkingModel
}

async function applyActionToModels(action, models, embedAssociations, logger) {
  for (let model of models) {
    await action(model, embedAssociations, logger)
  }
}

function addEmbedded(model, embedAssociations, logger) {
  return model.find().then(function(data) {
    let promises = []

    for (let associationName in model.routeOptions.associations) {
      let association = model.routeOptions.associations[associationName]

      if (association.type === 'MANY_MANY') {
        let embedAssociation =
          association.embedAssociation === undefined
            ? embedAssociations
            : association.embedAssociation

        let linkingModel = getLinkingModel(model, association)

        if (linkingModel) {
          let embedded =
            data[0] && data[0][associationName] && data[0][associationName][0]

          if (embedAssociation && !embedded) {
            promises.push(
              addEmbeddedAssociation(
                model,
                associationName,
                linkingModel,
                data,
                logger
              )
            )
          }
        }
      }
    }

    return Promise.all(promises)
  })
}

function addEmbeddedAssociation(
  model,
  associationName,
  linkingModel,
  data,
  logger
) {
  let promises = []

  data.forEach(function(document) {
    let query = {}
    let embedArray = []
    query[model.modelName] = document._id
    let promise = linkingModel.find(query).then(function(result) {
      if (_.isEmpty(result)) {
        // EXPL: need to do this or else the empty association property will be erased
        if (
          !document[associationName] ||
          _.isEmpty(document[associationName])
        ) {
          let payload = {}
          payload[associationName] = []
          return model.findByIdAndUpdate(document._id, payload, { new: true })
        } else {
          return Promise.resolve()
        }
      } else {
        result.forEach(function(linkingDocument) {
          linkingDocument[model.modelName] = undefined
          embedArray.push(linkingDocument)
        })

        let payload = {}
        payload[associationName] = embedArray

        return model.findByIdAndUpdate(document._id, payload, { new: true })
      }
    })
    promises.push(promise)
  })

  return Promise.all(promises)
}

function removeLinking(model, embedAssociations, logger) {
  for (let associationName in model.routeOptions.associations) {
    let association = model.routeOptions.associations[associationName]

    if (association.type === 'MANY_MANY') {
      let embedAssociation =
        association.embedAssociation === undefined
          ? embedAssociations
          : association.embedAssociation

      let linkingModel = getLinkingModel(model, association, logger)

      if (linkingModel) {
        if (embedAssociation) {
          try {
            linkingModel.collection.drop()
          } catch (err) {}
        }
      }
    }
  }

  return Promise.resolve()
}

function addLinking(model, embedAssociations, logger) {
  return model.find().then(function(data) {
    let promises = []

    for (let associationName in model.routeOptions.associations) {
      let association = model.routeOptions.associations[associationName]

      if (association.type === 'MANY_MANY') {
        let embedAssociation =
          association.embedAssociation === undefined
            ? embedAssociations
            : association.embedAssociation

        let linkingModel = getLinkingModel(model, association, logger)

        if (linkingModel) {
          if (!embedAssociation) {
            promises.push(
              addLinkingAssociation(
                model,
                associationName,
                association,
                linkingModel,
                data,
                logger
              )
            )
          }
        }
      }
    }
    return Promise.all(promises)
  })
}

function addLinkingAssociation(
  model,
  associationName,
  association,
  linkingModel,
  data,
  logger
) {
  let promises = []

  data.forEach(function(document) {
    let embedArray = document[associationName]

    if (embedArray) {
      embedArray.forEach(function(embeddedData) {
        let query = {}
        query[model.modelName] = document._id
        query[association.model] = embeddedData[association.model]
        let promise = linkingModel
          .find(query)
          .then(function(linkingDataExists) {
            if (!linkingDataExists[0]) {
              let linkingData = embeddedData
              linkingData[model.modelName] = document._id
              return linkingModel.create(linkingData)
            }
          })
        promises.push(promise)
      })
    }
  })

  return Promise.all(promises)
}

function removeEmbedded(model, embedAssociations, logger) {
  return model.find().then(function(data) {
    let promises = []

    for (let associationName in model.routeOptions.associations) {
      let association = model.routeOptions.associations[associationName]

      if (association.type === 'MANY_MANY') {
        let embedAssociation =
          association.embedAssociation === undefined
            ? embedAssociations
            : association.embedAssociation

        let linkingModel = getLinkingModel(model, association, logger)

        if (linkingModel) {
          if (!embedAssociation) {
            promises.push(
              removeEmbeddedAssociation(model, associationName, data, logger)
            )
          }
        }
      }
    }

    return Promise.all(promises)
  })
}

function removeEmbeddedAssociation(model, associationName, data, logger) {
  let promises = []

  let newField = {}
  newField[associationName] = {
    type: [mongoose.Schema.Types.Object]
  }

  delete mongoose.models[model.modelName]
  delete mongoose.modelSchemas[model.modelName]

  let dummySchema = new mongoose.Schema(newField, {
    collection: model.modelName
  })
  let dummyModel = mongoose.model(model.modelName, dummySchema)

  data.forEach(function(document) {
    const payload = {
      $unset: {}
    }

    payload.$unset[associationName] = undefined

    promises.push(dummyModel.findByIdAndUpdate(document._id, payload))
  })

  return Promise.all(promises)
}
