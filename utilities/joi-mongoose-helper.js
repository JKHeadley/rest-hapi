'use strict'

let Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
let _ = require('lodash')
let validationHelper = require('./validation-helper')
let queryHelper = require('./query-helper')
let config = require('../config')
let mongoose = require('mongoose')

// TODO: support "allowNull"
// TODO: add ".default()" to paths that have a default value
// TODO: support arrays and objects
// TODO: support "allowUndefined"

const internals = {}

/**
 * Generates a Joi object that validates a query result for a specific model
 * @param model: A mongoose model object.
 * @param logger: A logging object.
 * @returns {*}: A Joi object
 */
internals.generateJoiReadModel = function(model, logger) {
  const Log = logger.bind()
  validationHelper.validateModel(model, Log)

  let readModelBase = {}

  let fields = model.schema.tree

  let associations = model.routeOptions.associations
    ? Object.keys(model.routeOptions.associations)
    : []

  for (let fieldName in fields) {
    let field = fields[fieldName]

    let isAssociation = associations.indexOf(fieldName)

    if (field.readModel) {
      readModelBase[fieldName] = field.readModel
    } else if (
      field.allowOnRead !== false &&
      field.exclude !== true &&
      isAssociation < 0 &&
      internals.isValidField(fieldName, field, model)
    ) {
      let attributeReadModel = internals.generateJoiFieldModel(
        model,
        field,
        fieldName,
        'read',
        Log
      )

      if (field.requireOnRead === true) {
        attributeReadModel = attributeReadModel.required()
      }

      readModelBase[fieldName] = attributeReadModel
    }
  }

  if (model.routeOptions && model.routeOptions.associations) {
    for (let associationName in model.routeOptions.associations) {
      let association = model.routeOptions.associations[associationName]

      let associationModel = Joi.object()

      if (association.type === 'MANY_MANY') {
        if (association.linkingModel) {
          associationModel = internals.generateJoiReadModel(
            association.include.through,
            Log
          )
        }
        let associationBase = {}
        associationBase[association.model] = Joi.object()
        associationBase._id = internals.joiObjectId()
        // EXPL: remove the key for the current model
        if (associationModel._inner.children) {
          associationModel._inner.children = associationModel._inner.children.filter(
            function(key) {
              return key.key !== model.modelName
            }
          )
        }
        // EXPL: add the keys for the association model and the _id
        associationModel = associationModel.keys(associationBase)
        // EXPL: also accept MANY_MANY flattened embeddings
        associationModel = Joi.alternatives().try(
          associationModel,
          Joi.object()
        )
      } else if (association.type === '_MANY') {
        associationModel = Joi.alternatives().try(
          internals.joiObjectId(),
          Joi.object()
        )
      }

      associationModel = associationModel.label(
        model.modelName + '_' + associationName + 'Model'
      )

      if (
        association.type === 'MANY_MANY' ||
        association.type === 'ONE_MANY' ||
        association.type === '_MANY'
      ) {
        readModelBase[associationName] = Joi.array()
          .items(associationModel)
          .label(model.modelName + '_' + associationName + 'ArrayModel')
      } else {
        readModelBase[associationName] = associationModel
      }
    }
  }

  let readModel = Joi.object(readModelBase).label(model.modelName + 'ReadModel')

  return readModel
}

/**
 * Generates a Joi object that validates a query request payload for updating a document
 * @param model: A mongoose model object.
 * @param logger: A logging object.
 * @returns {*}: A Joi object
 */
internals.generateJoiUpdateModel = function(model, logger) {
  const Log = logger.bind()
  validationHelper.validateModel(model, Log)

  let updateModelBase = {}

  let fields = model.schema.tree

  let associations = model.routeOptions.associations
    ? model.routeOptions.associations
    : {}

  for (let fieldName in fields) {
    let field = fields[fieldName]

    let association = associations[fieldName] || null

    let canUpdateAssociation = association
      ? association.type === 'ONE_ONE' ||
        association.type === 'MANY_ONE' ||
        association.type === '_MANY'
      : false

    if (internals.isValidField(fieldName, field, model)) {
      if (field.updateModel) {
        updateModelBase[fieldName] = field.updateModel
      } else if (
        field.allowOnUpdate !== false &&
        (canUpdateAssociation || !association)
      ) {
        let attributeUpdateModel = internals.generateJoiFieldModel(
          model,
          field,
          fieldName,
          'update',
          Log
        )

        if (field.requireOnUpdate === true) {
          attributeUpdateModel = attributeUpdateModel.required()
        }

        updateModelBase[fieldName] = attributeUpdateModel
      }
    }
  }

  let updateModel = Joi.object(updateModelBase).label(
    model.modelName + 'UpdateModel'
  )

  return updateModel
}

/**
 * Generates a Joi object that validates a request payload for creating a document
 * @param model: A mongoose model object.
 * @param logger: A logging object.
 * @returns {*}: A Joi object
 */
internals.generateJoiCreateModel = function(model, logger) {
  const Log = logger.bind()
  validationHelper.validateModel(model, Log)

  let createModelBase = {}

  let fields = model.schema.tree

  let associations = model.routeOptions.associations
    ? model.routeOptions.associations
    : {}

  for (let fieldName in fields) {
    let field = fields[fieldName]

    let association = associations[fieldName] || null

    let canCreateAssociation = association
      ? association.type === 'ONE_ONE' ||
        association.type === 'MANY_ONE' ||
        association.type === '_MANY'
      : false

    if (internals.isValidField(fieldName, field, model)) {
      // EXPL: use the field createModel if one is defined
      if (field.createModel) {
        createModelBase[fieldName] = field.createModel
      } else if (
        field.allowOnCreate !== false &&
        (canCreateAssociation || !association)
      ) {
        let attributeCreateModel = internals.generateJoiFieldModel(
          model,
          field,
          fieldName,
          'create',
          Log
        )

        if (field.required === true) {
          attributeCreateModel = attributeCreateModel.required()
        }

        createModelBase[fieldName] = attributeCreateModel
      }
    }
  }

  let createModel = Joi.object(createModelBase).label(
    model.modelName + 'CreateModel'
  )

  return createModel
}

/**
 * Generates a Joi object that validates a request query for the list function
 * @param model: A mongoose model object.
 * @param logger: A logging object.
 * @returns {*}: A Joi object
 */
internals.generateJoiListQueryModel = function(model, logger) {
  const Log = logger.bind()
  let queryModel = {
    $skip: Joi.number()
      .integer()
      .min(0)
      .optional()
      .description(
        'The number of records to skip in the database. This is typically used in pagination.'
      ),
    $page: Joi.number()
      .integer()
      .min(0)
      .optional()
      .description(
        'The number of records to skip based on the $limit parameter. This is typically used in pagination.'
      ),
    $limit: Joi.number()
      .integer()
      .min(0)
      .optional()
      .description(
        'The maximum number of records to return. This is typically used in pagination.'
      )
  }

  let queryableFields = queryHelper.getQueryableFields(model, Log)

  let readableFields = queryHelper.getReadableFields(model, Log)

  let sortableFields = queryHelper.getSortableFields(model, Log)

  if (queryableFields && readableFields) {
    queryModel.$select = Joi.alternatives().try(
      Joi.array()
        .items(Joi.string().valid(readableFields))
        .description(
          'A list of basic fields to be included in each resource. Valid values include: ' +
            readableFields.toString().replace(/,/g, ', ')
        ),
      Joi.string().valid(readableFields)
    )
    queryModel.$text = Joi.any().description(
      'A full text search parameter. Takes advantage of indexes for efficient searching. Also implements stemming ' +
        'with searches. Prefixing search terms with a "-" will exclude results that match that term.'
    )
    queryModel.$term = Joi.any().description(
      "A regex search parameter. Slower than `$text` search but supports partial matches and doesn't require " +
        'indexing. This can be refined using the `$searchFields` parameter.'
    )
    queryModel.$searchFields = Joi.alternatives().try(
      Joi.array()
        .items(Joi.string().valid(queryableFields))
        .description(
          'A set of fields to apply the `$term` search parameter to. If this parameter is not included, the `$term` ' +
            'search parameter is applied to all searchable fields. Valid values include: ' +
            queryableFields.toString().replace(/,/g, ', ')
        ),
      Joi.string().valid(queryableFields)
    )
    queryModel.$sort = Joi.alternatives().try(
      Joi.array()
        .items(Joi.string().valid(sortableFields))
        .description(
          'A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending ' +
            "'-' indicates descending. The default sort direction is 'ascending' (lowest value to highest value). Listing multiple" +
            'fields prioritizes the sort starting with the first field listed. Valid values include: ' +
            sortableFields.toString().replace(/,/g, ', ')
        ),
      Joi.string().valid(sortableFields)
    )
    queryModel.$exclude = Joi.alternatives().try(
      Joi.array()
        .items(internals.joiObjectId())
        .description('A list of objectIds to exclude in the result.'),
      internals.joiObjectId()
    )
    queryModel.$count = Joi.boolean().description(
      'If set to true, only a count of the query results will be returned.'
    )
    if (config.enableWhereQueries) {
      queryModel.$where = Joi.any()
        .optional()
        .description('An optional field for raw mongoose queries.')
    }

    _.each(queryableFields, function(fieldName) {
      const joiModel = internals.generateJoiModelFromFieldType(
        model.schema.paths[fieldName].options,
        Log
      )
      queryModel[fieldName] = Joi.alternatives().try(
        Joi.array()
          .items(joiModel)
          .description('Match values for the ' + fieldName + ' property.'),
        joiModel
      )
    })
  }

  let associations = model.routeOptions ? model.routeOptions.associations : null
  if (associations) {
    queryModel.$embed = Joi.alternatives().try(
      Joi.array()
        .items(Joi.string())
        .description(
          'A set of complex object properties to populate. Valid first level values include ' +
            Object.keys(associations)
              .toString()
              .replace(/,/g, ', ')
        ),
      Joi.string()
    )
    queryModel.$flatten = Joi.boolean().description(
      'Set to true to flatten embedded arrays, i.e. remove linking-model data.'
    )
  }

  queryModel = Joi.object(queryModel)

  if (!config.enableQueryValidation) {
    queryModel = queryModel.unknown()
  }

  return queryModel
}

/**
 * Generates a Joi object that validates a request query for the find function
 * @param model: A mongoose model object.
 * @param logger: A logging object.
 * @returns {*}: A Joi object
 */
internals.generateJoiFindQueryModel = function(model, logger) {
  const Log = logger.bind()
  let queryModel = {}

  let readableFields = queryHelper.getReadableFields(model, Log)

  if (readableFields) {
    queryModel.$select = Joi.alternatives().try(
      Joi.array()
        .items(Joi.string().valid(readableFields))
        .description(
          'A list of basic fields to be included in each resource. Valid values include: ' +
            readableFields.toString().replace(/,/g, ', ')
        ),
      Joi.string().valid(readableFields)
    )
  }

  let associations = model.routeOptions ? model.routeOptions.associations : null
  if (associations) {
    queryModel.$embed = Joi.alternatives().try(
      Joi.array()
        .items(Joi.string())
        .description(
          'A set of complex object properties to populate. Valid first level values include ' +
            Object.keys(associations)
              .toString()
              .replace(/,/g, ', ')
        ),
      Joi.string()
    )
    queryModel.$flatten = Joi.boolean().description(
      'Set to true to flatten embedded arrays, i.e. remove linking-model data.'
    )
  }

  queryModel = Joi.object(queryModel)

  if (!config.enableQueryValidation) {
    queryModel = queryModel.unknown()
  }

  return queryModel
}

/**
 * Generates a Joi object for a model field
 * @param model: A mongoose model object
 * @param field: A model field
 * @param fieldName: The name of the field
 * @param modelType: The type of CRUD model being generated
 * @param logger: A logging object
 * @returns {*}: A Joi object
 */
internals.generateJoiFieldModel = function(
  model,
  field,
  fieldName,
  modelType,
  logger
) {
  const Log = logger.bind()
  let fieldModel = {}
  let joiModelFunction = {}

  let nested = model.schema.nested
  let instance = model.schema.paths[fieldName]
    ? model.schema.paths[fieldName].instance
    : null

  let isArray = false

  if (instance === 'Array' || _.isArray(field.type)) {
    isArray = true
    // EXPL: if the array contains objects, then it has nested fields
    if (_.isObject(field[0]) || field.type[0].name === 'Mixed') {
      nested[fieldName] = true
    }
  }

  if (instance === 'Mixed' && !nested[fieldName]) {
    // EXPL: check for any valid nested fields
    for (let key in field) {
      if (internals.isValidField(key, field[key], model)) {
        nested[fieldName] = true
      }
    }
  }

  // EXPL: if this field is nested, we treat it as a nested model and recursively call the appropriate model function
  if (nested[fieldName]) {
    switch (modelType) {
      case 'read':
        joiModelFunction = internals.generateJoiReadModel
        break
      case 'create':
        joiModelFunction = internals.generateJoiCreateModel
        break
      case 'update':
        joiModelFunction = internals.generateJoiUpdateModel
        break
      default:
        throw new Error(
          "modelType must be either 'read', 'create', or 'update'"
        )
    }

    field = _.isObject(field[0]) ? field[0] : field
    // EXPL: make a copy so field properties aren't deleted from the original model
    field = _.extend({}, field)
    // EXPL: remove all fields that aren't objects, since they can cause issues with the schema
    for (let subField in field) {
      if (!_.isObject(field[subField])) {
        delete field[subField]
      }
    }

    let nestedModel = {
      modelName: model.modelName + '.' + fieldName,
      fakeModel: true,
      isArray: isArray,
      routeOptions: {},
      schema: new mongoose.Schema(field)
    }

    fieldModel = joiModelFunction(nestedModel, Log)
    if (isArray) {
      let label = fieldModel._flags.label
      fieldModel = Joi.array()
        .items(fieldModel)
        .label(label + 'Array')
    }
  } else {
    fieldModel = internals.generateJoiModelFromFieldType(field, Log)
  }

  return fieldModel
}

/**
 * Returns a Joi object based on the mongoose field type.
 * @param field: A field from a mongoose model.
 * @param logger: A logging object.
 * @returns {*}: A Joi object.
 */
internals.generateJoiModelFromFieldType = function(field, logger) {
  let model

  // assert(field.type, "incorrect field format");

  let isArray = false
  let fieldCopy = _.extend({}, field)

  if (_.isArray(fieldCopy.type)) {
    isArray = true
    fieldCopy.type.schemaName = fieldCopy.type[0].name
  }

  if (!fieldCopy.type) {
    fieldCopy.type = {
      schemaName: 'None'
    }
  }

  switch (fieldCopy.type.schemaName) {
    case 'ObjectId':
      model = internals.joiObjectId()
      break
    case 'Mixed':
      model = Joi.object()
      break
    case 'Boolean':
      model = Joi.bool()
      break
    case 'Number':
      model = Joi.number()
      break
    case 'Date':
      model = Joi.date()
      break
    case 'String':
      if (fieldCopy.enum) {
        model = Joi.any().only(fieldCopy.enum)
      } else if (fieldCopy.regex) {
        if (!(fieldCopy.regex instanceof RegExp)) {
          if (fieldCopy.regex.options) {
            model = Joi.string().regex(
              fieldCopy.regex.pattern,
              fieldCopy.regex.options
            )
          } else {
            model = Joi.string().regex(fieldCopy.regex.pattern)
          }
        } else {
          model = Joi.string().regex(fieldCopy.regex)
        }
      } else if (fieldCopy.stringType) {
        switch (fieldCopy.stringType) {
          case 'uri':
            model = Joi.string().uri()
            break
          case 'email':
            model = Joi.string().email()
            break
          case 'token':
            model = Joi.string().token()
            break
          case 'hex':
            model = Joi.string().hex()
            break
          case 'base64':
            model = Joi.string().base64()
            break
          case 'hostname':
            model = Joi.string().hostname()
            break
          case 'lowercase':
            model = Joi.string().lowercase()
            break
          case 'uppercase':
            model = Joi.string().uppercase()
            break
          case 'trim':
            model = Joi.string().trim()
            break
          case 'creditCard':
            model = Joi.string().creditCard()
            break
          default:
            model = Joi.string().allow('')
        }
      } else {
        model = Joi.string().allow('')
      }
      break
    default:
      model = Joi.any()
      break
  }

  if (fieldCopy.allowNull) {
    model = model.allow(null)
  }

  if (isArray) {
    model = Joi.array().items(model)
  }

  if (fieldCopy.description) {
    model = model.description(fieldCopy.description)
  } else if (fieldCopy.stringType) {
    model = model.description(fieldCopy.stringType)
  }

  return model
}

/**
 * Provides easy access to the Joi ObjectId type.
 * @returns {*|{type}}
 */
internals.joiObjectId = function() {
  // EXPL: Rather than converting all objectIds to string for response, we allow raw mongoose.Types.ObjectId objects
  let objectIdModel = Joi.object({
    _bsontype: Joi.any().required(),
    id: Joi.any().required()
  })
  let model = Joi.alternatives().try(
    Joi.objectId().description('ObjectId'),
    objectIdModel
  )
  return model
}

/**
 * Returns true if arg is a true ObjectId or ObjectId string, false otherwise.
 * @returns {boolean}
 */
internals.isObjectId = function(arg) {
  let result = Joi.validate(arg, internals.joiObjectId())

  if (result.error) {
    return false
  }

  return true
}

/**
 * Checks to see if a field is a valid model property
 * @param fieldName: The name of the field
 * @param field: The field being checked
 * @param model: A mongoose model object
 * @returns {boolean}
 */
internals.isValidField = function(fieldName, field, model) {
  const invalidFieldNames = ['__t', '__v']

  if (!_.isObject(field)) {
    return false
  }

  // EXPL: avoid adding schema types
  if (
    fieldName === 'type' &&
    (field.schemaName ||
      (field[0] && field[0].schemaName) ||
      field.name === 'Mixed')
  ) {
    return false
  }

  // EXPL: ignore the '_id' field for fake models
  if (model.fakeModel && !model.isArray) {
    invalidFieldNames.push('_id')
  }

  // EXPL: ignore the 'id' field if it is a virtual field (i.e. not included in the user-defined schema)
  if (_.get(model, 'schema.virtuals.id', null)) {
    invalidFieldNames.push('id')
  }

  if (invalidFieldNames.indexOf(fieldName) > -1) {
    return false
  }

  return true
}

module.exports = {
  generateJoiReadModel: internals.generateJoiReadModel,

  generateJoiUpdateModel: internals.generateJoiUpdateModel,

  generateJoiCreateModel: internals.generateJoiCreateModel,

  generateJoiListQueryModel: internals.generateJoiListQueryModel,

  generateJoiFindQueryModel: internals.generateJoiFindQueryModel,

  generateJoiFieldModel: internals.generateJoiFieldModel,

  generateJoiModelFromFieldType: internals.generateJoiModelFromFieldType,

  joiObjectId: internals.joiObjectId,

  isObjectId: internals.isObjectId
}
