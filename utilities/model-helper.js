'use strict'

let config = require('../config')
const _ = require('lodash')

// TODO: allow "unique" field to be rest-hapi specific if soft deletes are enabled (i.e. implement a unique constraint based on the required field and the "isDeleted" flag)
// TODO: correctly label "model" and "schema" files and objects throughout project
// TODO: Limiting the populated fields could also be accomplished with the "select" parameter of the "populate" function.

const internals = {}

/**
 * Create a mongoose model with the given Schema and collectionName after adding optional metadata fields
 * @param Schema: A mongoose schema object.
 * @returns {*}: The resulting mongoose model.
 */
internals.createModel = function(Schema, mongoose) {
  const Types = mongoose.Schema.Types
  // TODO: require createdAt and updatedAt
  if (Schema.statics.collectionName !== 'auditLog') {
    if (config.enableCreatedAt) {
      let createdAt = {
        createdAt: {
          type: Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      Schema.add(createdAt)
    }
    if (config.enableUpdatedAt) {
      let updatedAt = {
        updatedAt: {
          type: Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      Schema.add(updatedAt)
    }
    if (config.enableDeletedAt) {
      let deletedAt = {
        deletedAt: {
          type: Types.Date,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      Schema.add(deletedAt)
    }
    if (config.enableCreatedBy) {
      let createdBy = {
        createdBy: {
          type: Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      Schema.add(createdBy)
    }
    if (config.enableUpdatedBy) {
      let updatedBy = {
        updatedBy: {
          type: Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      Schema.add(updatedBy)
    }
    if (config.enableDeletedBy) {
      let deletedBy = {
        deletedBy: {
          type: Types.ObjectId,
          allowOnCreate: false,
          allowOnUpdate: false
        }
      }
      Schema.add(deletedBy)
    }
    if (config.enableSoftDelete) {
      let isDeleted = {
        isDeleted: {
          type: Types.Boolean,
          allowOnCreate: false,
          allowOnUpdate: false,
          default: false
        }
      }
      Schema.add(isDeleted)
    }
    if (config.enableDocumentScopes) {
      let scope = {
        scope: {
          rootScope: {
            type: [Types.String]
          },
          readScope: {
            type: [Types.String]
          },
          updateScope: {
            type: [Types.String]
          },
          deleteScope: {
            type: [Types.String]
          },
          associateScope: {
            type: [Types.String]
          },
          type: Types.Object,
          allowOnUpdate: false,
          allowOnCreate: false
        }
      }
      Schema.add(scope)
    }
  }
  return mongoose.model(Schema.statics.collectionName, Schema)
}

/**
 * Add appropriate data to schemas for fields marked as duplicate.
 * @param schema
 * @param schemas
 * @returns {*}
 */
internals.addDuplicateFields = function(schema, schemas) {
  let associations = schema.statics.routeOptions.associations
  if (associations) {
    for (let key in associations) {
      let association = associations[key]
      if (
        association.duplicate &&
        (association.type === 'MANY_ONE' || association.type === 'ONE_ONE')
      ) {
        let duplicate = association.duplicate
        if (!_.isArray(duplicate)) {
          duplicate = [duplicate]
        }

        const childSchema = schemas[association.model]

        association.duplicate = duplicate = duplicate.map(function(prop) {
          // EXPL: Allow for 'duplicate' to be an array of strings
          if (_.isString(prop)) {
            prop = { field: prop }
          }
          // EXPL: Set a default name for the duplicated field if no name is specified in "as"
          prop.as =
            prop.as || key + prop.field[0].toUpperCase() + prop.field.slice(1)

          return prop
        })

        duplicate.forEach(function(prop) {
          const field = {}
          let fieldName = prop.as
          field[fieldName] = {
            type: childSchema.obj[prop.field].type,
            allowOnCreate: false,
            allowOnUpdate: false
          }
          schema.add(field)

          // EXPL: In the schema of the field being duplicated, keep track of which models/associations are duplicating the field
          childSchema.obj[prop.field].duplicated =
            childSchema.obj[prop.field].duplicated || []
          childSchema.obj[prop.field].duplicated.push({
            association: key,
            model: schema.statics.collectionName,
            as: fieldName
          })
        })
      }
    }
  }

  return schema
}

/**
 * Takes a mongoose schema and extends the fields to include the model associations.
 * @param Schema: A mongoose schema.
 * @returns {*}: The updated schema.
 */
internals.extendSchemaAssociations = function(Schema, mongoose, modelPath) {
  if (Schema.statics.routeOptions) {
    for (let associationKey in Schema.statics.routeOptions.associations) {
      let association = Schema.statics.routeOptions.associations[associationKey]
      if (association.type === 'MANY_MANY') {
        let extendObject = {}
        let dataObject = {}
        dataObject[association.model] = {
          type: mongoose.Schema.Types.ObjectId,
          ref: association.model
        }
        let embedAssociation =
          association.embedAssociation === undefined
            ? config.embedAssociations
            : association.embedAssociation
        // EXPL: if a linking model is defined, add it to the association definition
        if (association.linkingModel) {
          let linkingModel
          let linkingModelFiles = require('require-all')(
            modelPath + '/linking-models'
          )
          for (let fileName in linkingModelFiles) {
            if (
              linkingModelFiles[fileName]().modelName ===
              association.linkingModel
            ) {
              linkingModel = linkingModelFiles[fileName]()
              break
            }
          }
          if (!linkingModel) {
            throw new Error(
              'unknown linking model: ' + association.linkingModel
            )
          }

          association.include = {}

          let modelExists = true
          try {
            association.include.through = mongoose.model(linkingModel.modelName)
          } catch (error) {
            modelExists = false
          }

          // EXPL: if the association isn't embedded, create separate collection for linking model
          if (!embedAssociation) {
            const modelName = Schema.statics.collectionName
            if (!modelExists) {
              const Types = mongoose.Schema.Types
              linkingModel.Schema[modelName] = {
                type: Types.ObjectId,
                ref: modelName
              }
              linkingModel.Schema[association.model] = {
                type: Types.ObjectId,
                ref: association.model
              }

              let linkingModelSchema = new mongoose.Schema(
                linkingModel.Schema,
                { collection: linkingModel.modelName }
              )
              association.include.through = mongoose.model(
                linkingModel.modelName,
                linkingModelSchema
              )
            }

            // EXPL: we use virtual relationships for linking model collections
            Schema.virtual(associationKey, {
              ref: linkingModel.modelName,
              localField: '_id',
              foreignField: modelName
            })
          }
          // EXPL: if the association is embedded, extend original schema with linking model schema
          else {
            if (!modelExists) {
              let linkingModelSchema = new mongoose.Schema(
                linkingModel.Schema,
                { collection: linkingModel.modelName }
              )
              association.include.through = mongoose.model(
                linkingModel.modelName,
                linkingModelSchema
              )
            }

            for (let objectKey in linkingModel.Schema) {
              let object = linkingModel.Schema[objectKey]
              dataObject[objectKey] = object
            }

            extendObject[associationKey] = [dataObject]
            Schema.add(extendObject)
          }

          association.include.through.routeOptions = {}
        } else {
          // EXPL: if the association isn't embedded and a linking model isn't defined, then we need to create a basic linking collection
          if (!embedAssociation) {
            const linkingModelName1 =
              Schema.statics.collectionName + '_' + association.model
            const linkingModelName2 =
              association.model + '_' + Schema.statics.collectionName
            let linkingModelName = linkingModelName1

            association.include = {}

            let modelExists = [true, true]
            try {
              association.include.through = mongoose.model(linkingModelName1)
              linkingModelName = linkingModelName1
            } catch (error) {
              modelExists[0] = false
            }
            try {
              association.include.through = mongoose.model(linkingModelName2)
              linkingModelName = linkingModelName2
            } catch (error) {
              modelExists[1] = false
            }
            const modelName = Schema.statics.collectionName
            if (!modelExists[0] && !modelExists[1]) {
              const Types = mongoose.Schema.Types

              let linkingModel = { Schema: {} }

              linkingModel.Schema[modelName] = {
                type: Types.ObjectId,
                ref: modelName
              }
              linkingModel.Schema[association.model] = {
                type: Types.ObjectId,
                ref: association.model
              }
              let linkingModelSchema = new mongoose.Schema(
                linkingModel.Schema,
                { collection: linkingModelName }
              )

              association.include.through = mongoose.model(
                linkingModelName,
                linkingModelSchema
              )
            }
            association.include.through.routeOptions = {}
            // EXPL: we use virtual relationships for linking model collections
            Schema.virtual(associationKey, {
              ref: linkingModelName,
              localField: '_id',
              foreignField: modelName
            })
          }
          // EXPL: if the association is embedded, extend the original schema to support the association data
          else {
            extendObject[associationKey] = [dataObject]
            Schema.add(extendObject)
          }
        }
      } else if (association.type === 'ONE_MANY') {
        // EXPL: for one-many relationships, create a virtual relationship
        if (association.foreignField) {
          Schema.virtual(associationKey, {
            ref: association.model,
            localField: '_id',
            foreignField: association.foreignField
          })
        }
      } else if (association.type === '_MANY') {
        // EXPL: for one sided _many relationships, the association exists as a simple array of objectIds
        let extendObject = {}
        extendObject[associationKey] = {
          type: [mongoose.Schema.Types.ObjectId],
          ref: association.model
        }
        Schema.add(extendObject)
      } else {
        // TODO: define ONE_ONE and MANY_ONE associations if needed
      }
    }
  }
  return Schema
}

/**
 * Takes a mongoose schema and adds a complete mongoose model to each association in the schema.
 * @param Schema: A mongoose schema.
 * @param models: The complete list of existing mongoose models.
 */
// TODO: can probably simplify this to a model string/name reference since mongoose models can be accessed globally
internals.associateModels = function(Schema, models) {
  if (Schema.statics.routeOptions) {
    for (let associationKey in Schema.statics.routeOptions.associations) {
      let association = Schema.statics.routeOptions.associations[associationKey]
      if (!association.include) {
        association.include = {}
      }
      association.include.model = models[association.model]
      association.include.as = associationKey
    }
  }
}

module.exports = {
  createModel: internals.createModel,

  extendSchemaAssociations: internals.extendSchemaAssociations,

  associateModels: internals.associateModels,

  addDuplicateFields: internals.addDuplicateFields
}
