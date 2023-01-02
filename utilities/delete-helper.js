'use strict'

/**
 * This file contains helper functions for onDelete referential actions.
 */

// TODO: throw error on startup if onDelete is not one of the allowed values of 'RESTRICT', 'CASCADE', 'SET_NULL' or 'NO_ACTION'

const _ = require('lodash')
const Mongoose = require('mongoose')
const { getAll, deleteOneHandler, removeManyHandler } = require('globals')

const internals = {}

internals.onDelete = async function(model, _id, hardDelete, request, Log) {
  // First check if there are any restrictions, i.e. any associations that have onDelete: 'RESTRICT'
  await verifyNoRestrictions(model, _id, Log)

  // Next handle any associations that have onDelete: 'SET_NULL'
  await setNullReferences(model, _id, Log)

  // Finally handle any associations that have onDelete: 'CASCADE'
  await cascadeDelete(model, _id, hardDelete, request, Log)
}

async function cascadeDelete(model, _id, hardDelete, request, Log) {
  const associations = getAssociations(model)

  const cascades = getCascades(model)

  // For each cascade delete, user the deleteOneHandler to delete the associated document
  const promises = []
  _.forEach(cascades, async function(cascade) {
    const associationModel = Mongoose.model(associations[cascade].model)
    const references = await getAll(
      model,
      _id,
      associationModel,
      cascade,
      { $select: ['_id'] },
      Log
    )
    const referenceIds = references.map(reference => reference._id)
    // If the model is MANY_MANY, then we use removeManyHandler
    if (associations[cascade].type === 'MANY_MANY') {
      // No action taken for soft delete
      if (hardDelete) {
        promises.push(
          removeManyHandler(
            model,
            _id,
            associationModel,
            false,
            { payload: referenceIds },
            Log
          )
        )
      }
    } else {
      // Otherwise, we use deleteOneHandler
      for (const referenceId of referenceIds) {
        promises.push(
          deleteOneHandler(
            associationModel,
            referenceId,
            hardDelete,
            request,
            Log
          )
        )
      }
    }
  })

  await Promise.all(promises)
}

async function setNullReferences(model, _id, Log) {
  const setNulls = getSetNulls(model)

  const associations = getAssociations(model)

  // TODO: handle MANY_MANY vs ONE_MANY

  // For each setNull, use removeManyHandler to remove the reference to the document being deleted (either by setting the foreignField to null or by removing the document from the association collection)
  const promises = []
  _.forEach(setNulls, async function(setNull) {
    const associationModel = Mongoose.model(associations[setNull].model)

    const references = await getAll(
      model,
      _id,
      associationModel,
      setNull,
      { $select: ['_id'] },
      Log
    )
    const referenceIds = references.map(reference => reference._id)

    promises.push(
      removeManyHandler(
        model,
        _id,
        associationModel,
        true,
        { payload: referenceIds },
        Log
      )
    )
  })

  await Promise.all(promises)
}

async function verifyNoRestrictions(model, _id, Log) {
  const restrictions = getRestrictions(model, _id, Log)

  const associations = getAssociations(model)

  // For each restriction, use mongoose to check if there are any documents that reference the document being deleted
  const promises = []
  _.forEach(restrictions, function(restriction) {
    const query = {}
    const associationModel = Mongoose.model(associations[restriction].model)
    query[associations[restriction].foreignField] = _id
    promises.push(associationModel.findOne(query))
  })

  const restrictionResults = await Promise.all(promises)

  // If there are any restrictions, throw an error
  if (_.some(restrictionResults)) {
    const error = new Error('Cannot delete document.')
    error.statusCode = 400
    throw error
  }
}

// TODO: for default check if the foriegnField is required
function getRestrictions(model, _id, Log) {
  const associations = getAssociations(model)
  const associationNames = Object.keys(associations)
  const restrictions = []

  _.forEach(associationNames, function(associationName) {
    const onDelete = getOnDelete(model, associationName)

    // if onDelete is not set or is set to RESTRICT, add to restrictions
    if (!onDelete || onDelete === 'RESTRICT') {
      restrictions.push(associationName)
    }
  })

  return restrictions
}

function getCascades(model, _id, Log) {
  const associations = getAssociations(model)
  const associationNames = Object.keys(associations)
  const cascades = []

  _.forEach(associationNames, function(associationName) {
    const onDelete = getOnDelete(model, associationName)

    if (onDelete === 'CASCADE') {
      cascades.push(associationName)
    }
  })

  return cascades
}

// TODO: for default check if the foriegnField is optional/not required
function getSetNulls(model, _id, Log) {
  const associations = getAssociations(model)
  const associationNames = Object.keys(associations)
  const setNulls = []

  _.forEach(associationNames, function(associationName) {
    const onDelete = getOnDelete(model, associationName)

    if (onDelete === 'SET_NULL') {
      setNulls.push(associationName)
    }
  })

  return setNulls
}

function getAssociations(model) {
  return model.routeOptions.associations
}

function getAssociation(model, associationName) {
  return model.routeOptions.associations[associationName]
}

function getOnDelete(model, associationName) {
  return getAssociation(model, associationName).onDelete
}

module.exports = {
  onDelete: internals.onDelete
}
