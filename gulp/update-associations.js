'use strict'

let gulp = require('gulp')
let exit = require('gulp-exit')
let mongoose = require('mongoose')
let _ = require('lodash')
let restHapi = require('../rest-hapi')

gulp.task('update-associations', [], function() {
  const uri = process.argv[6]

  mongoose.Promise = Promise

  mongoose.connect(uri)

  let embedAssociations = process.argv[8] === 'true'

  let modelPath = 'models'

  if (process.argv[10]) {
    modelPath = process.argv[10]
  }

  let modelPathBase = __dirname

  modelPathBase = modelPathBase.split('/')

  modelPathBase = modelPathBase.filter(function(item) {
    return item !== 'node_modules' && item !== 'rest-hapi' && item !== 'gulp'
  })

  modelPathBase = modelPathBase.join('/')

  restHapi.config.absoluteModelPath = true
  restHapi.config.modelPath = modelPathBase + '/' + modelPath
  restHapi.config.embedAssociations = embedAssociations

  return restHapi.generateModels(mongoose).then(function(models) {
    restHapi.config.loglevel = 'DEBUG'
    let Log = restHapi.getLogger('update-associations')

    Log.debug('URI:', uri)
    Log.debug('embedAssociations:', embedAssociations)
    Log.debug('modelPath:', restHapi.config.modelPath)

    let modelsArray = []

    for (let modelName in models) {
      modelsArray.push(models[modelName])
    }

    return applyActionToModels(addEmbedded, modelsArray, embedAssociations, Log)
      .then(function() {
        return applyActionToModels(
          removeLinking,
          modelsArray,
          embedAssociations,
          Log
        )
      })
      .then(function() {
        return applyActionToModels(
          addLinking,
          modelsArray,
          embedAssociations,
          Log
        )
      })
      .then(function() {
        return applyActionToModels(
          removeEmbedded,
          modelsArray,
          embedAssociations,
          Log
        )
      })
      .then(function() {
        Log.debug('DONE')
        return gulp.src('').pipe(exit())
      })
      .catch(function(error) {
        Log.error(error)
        return gulp.src('').pipe(exit())
      })
  })
})

function getLinkingModel(model, association, Log) {
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

async function applyActionToModels(action, models, embedAssociations, Log) {
  for (let model of models) {
    await action(model, embedAssociations, Log)
  }
}

function addEmbedded(model, embedAssociations, Log) {
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
                Log
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
  Log
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

function removeLinking(model, embedAssociations, Log) {
  for (let associationName in model.routeOptions.associations) {
    let association = model.routeOptions.associations[associationName]

    if (association.type === 'MANY_MANY') {
      let embedAssociation =
        association.embedAssociation === undefined
          ? embedAssociations
          : association.embedAssociation

      let linkingModel = getLinkingModel(model, association, Log)

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

function addLinking(model, embedAssociations, Log) {
  return model.find().then(function(data) {
    let promises = []

    for (let associationName in model.routeOptions.associations) {
      let association = model.routeOptions.associations[associationName]

      if (association.type === 'MANY_MANY') {
        let embedAssociation =
          association.embedAssociation === undefined
            ? embedAssociations
            : association.embedAssociation

        let linkingModel = getLinkingModel(model, association, Log)

        if (linkingModel) {
          if (!embedAssociation) {
            promises.push(
              addLinkingAssociation(
                model,
                associationName,
                association,
                linkingModel,
                data,
                Log
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
  Log
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

function removeEmbedded(model, embedAssociations, Log) {
  return model.find().then(function(data) {
    let promises = []

    for (let associationName in model.routeOptions.associations) {
      let association = model.routeOptions.associations[associationName]

      if (association.type === 'MANY_MANY') {
        let embedAssociation =
          association.embedAssociation === undefined
            ? embedAssociations
            : association.embedAssociation

        let linkingModel = getLinkingModel(model, association, Log)

        if (linkingModel) {
          if (!embedAssociation) {
            promises.push(
              removeEmbeddedAssociation(model, associationName, data, Log)
            )
          }
        }
      }
    }

    return Promise.all(promises)
  })
}

function removeEmbeddedAssociation(model, associationName, data, Log) {
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
