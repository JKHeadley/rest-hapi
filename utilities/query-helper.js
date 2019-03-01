'use strict'

let _ = require('lodash')
let validationHelper = require('./validation-helper')
let globals = require('../globals')
let config = require('../config')

// TODO-DONE: mulit-level/multi-priority sorting (i.e. sort first by lastName, then by firstName) implemented via comma seperated sort list
// TODO: sorting through populate fields (Ex: sort users through role.name)
// TODO: support selecting populated fields
// TODO: support $embed for quick embedding and "populate" for detailed, mongoose specific population
// TODO-DONE: $term search
// TODO-DONE: support mongoose $text search
// TODO: support searching populated fields
// TODO: support easy AND and OR operations (i.e. search for "foo" AND "bar" or "foo" OR "bar"
// TODO: possibly support both comma separated values and space separated values
// TODO: define field property options (queryable, exclude, etc).
// TODO-DONE: support "$where" field that allows for raw mongoose queries
// TODO: query validation for $where field
// TODO: enable/disable option for $where field
// TODO: populating "implied" associations through $embed property, EX:
/**
 facilitiesPerFloor: [[{
      type: Types.ObjectId,
      ref: "facility"
    }]]
 */
// TODO: support parallel embeds, Ex: { $embed: ['facilitiesPerFloor.categories','facilitiesPerFloor.items'] } //NOTE: this seems to work for some queries
// TODO: support field queries for "null" and "undefined"
// TODO: consider switching to using aggregation pipeline (or support both methods and give the option)

module.exports = {
  /**
   * Create a mongoose query based off of the request query
   * @param model: A mongoose model object.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: A modified mongoose query.
   */
  createMongooseQuery: function(model, query, mongooseQuery, logger) {
    // This line has to come first
    validationHelper.validateModel(model, logger)
    const Log = logger.bind()
    // (email == 'test@user.com' && (firstName == 'test2@user.com' || firstName == 'test4@user.com')) && (age < 15 || age > 30)
    // LITERAL
    // {
    //  and: {
    //    email: {
    //      equal: 'test@user.com',
    //    },
    //    or: {
    //      firstName: {
    //        equal: ['test2@user.com', 'test4@user.com']
    //      }
    //    },
    //    age: {
    //      gt: '15',
    //      lt: '30'
    //    }
    //  }
    // {
    // and[email][equal]=test@user.com&and[or][firstName][equal]=test2@user.com&and[or][firstName][equal]=test4@user.com&and[age][gt]=15
    // ABBREVIATED
    // {
    //  email:'test@user.com',
    //  firstName: ['test2@user.com', 'test4@user.com'],
    //  age: {
    //    $or: {
    //      $gt: '15',
    //      $lt: '30'
    //    }
    //  }
    // }
    // [email]=test@user.com&[firstName]=test2@user.com&[firstName]=test4@user.com&[age][gt]=15&[age][lt]=30

    delete query[''] // EXPL: hack due to bug in hapi-swagger-docs

    delete query.$count

    mongooseQuery = this.setExclude(query, mongooseQuery, Log)

    let attributesFilter = this.createAttributesFilter(query, model, Log)
    if (attributesFilter === '') {
      attributesFilter = '_id'
    }

    let result = this.populateEmbeddedDocs(
      query,
      mongooseQuery,
      attributesFilter,
      model.routeOptions.associations,
      model,
      Log
    )
    mongooseQuery = result.mongooseQuery
    attributesFilter = result.attributesFilter

    mongooseQuery = this.setSort(query, mongooseQuery, Log)

    mongooseQuery.select(attributesFilter)

    if (typeof query.$where === 'string') {
      query.$where = JSON.parse(query.$where)
    }

    if (query.$where) {
      mongooseQuery.where(query.$where)
      delete query.$where
    }

    // EXPL: Support single (string) inputs or multiple "or'd" inputs (arrays) for field queries
    for (let fieldQueryKey in query) {
      let fieldQuery = query[fieldQueryKey]
      if (!Array.isArray(fieldQuery)) {
        fieldQuery = tryParseJSON(query[fieldQueryKey])
      }
      if (
        fieldQuery &&
        Array.isArray(fieldQuery) &&
        fieldQueryKey !== '$searchFields'
      ) {
        query[fieldQueryKey] = { $in: fieldQuery } // EXPL: "or" the inputs
      }
    }

    // EXPL: handle full text search
    if (query.$text) {
      query.$text = { $search: query.$text }
    }

    // EXPL: handle regex search
    this.setTermSearch(query, model, Log)

    let whereQuery = _.extend({}, query)

    // EXPL: delete pagination parameters
    delete whereQuery.$limit
    delete whereQuery.$skip
    delete whereQuery.$page

    mongooseQuery.where(whereQuery)
    return mongooseQuery
  },

  /**
   * Get a list of fields that can be returned as part of a query result.
   * @param model: A mongoose model object.
   * @param logger: A logging object.
   * @returns {Array}: A list of fields.
   */
  getReadableFields: function(model, logger) {
    // This line has to come first
    validationHelper.validateModel(model, logger)

    let readableFields = []

    let fields = model.schema.paths

    for (let fieldName in fields) {
      let field = fields[fieldName].options
      if (!field.exclude && fieldName !== '__v') {
        readableFields.push(fieldName)
      }
    }

    return readableFields
  },

  /**
   * Get a list of valid query sort inputs.
   * @param model: A mongoose model object.
   * @param logger: A logging object.
   * @returns {Array}: A list of fields.
   */
  getSortableFields: function(model, logger) {
    // This line has to come first
    validationHelper.validateModel(model, logger)
    const Log = logger.bind()

    let sortableFields = this.getReadableFields(model, Log)

    for (let i = sortableFields.length - 1; i >= 0; i--) {
      let descendingField = '-' + sortableFields[i]
      sortableFields.splice(i, 0, descendingField)
    }

    return sortableFields
  },

  /**
   * Get a list of fields that can be queried against.
   * @param model: A mongoose model object.
   * @param logger: A logging object.
   * @returns {Array}: A list of fields.
   */
  getQueryableFields: function(model, logger) {
    // This line has to come first
    validationHelper.validateModel(model, logger)

    let queryableFields = []

    let fields = model.schema.paths
    let fieldNames = Object.keys(fields)

    let associations = model.routeOptions
      ? model.routeOptions.associations
      : null

    for (let i = 0; i < fieldNames.length; i++) {
      let fieldName = fieldNames[i]
      if (fields[fieldName] && fieldName !== '__v' && fieldName !== '__t') {
        let field = fields[fieldName].options
        let association = associations
          ? associations[fields[fieldName].path] || {}
          : {}

        // EXPL: by default we don't include MANY_MANY array references
        if (
          field.queryable !== false &&
          !field.exclude &&
          association.type !== 'MANY_MANY'
        ) {
          queryableFields.push(fieldName)
        }
      }
    }

    return queryableFields
  },

  getStringFields: function(model, logger) {
    // This line has to come first
    validationHelper.validateModel(model, logger)

    let stringFields = []

    let fields = model.schema.paths

    for (let fieldName in fields) {
      let field = fields[fieldName].options
      if (field.type.schemaName === 'String') {
        stringFields.push(fieldName)
      }
    }

    return stringFields
  },

  /**
   * Handle pagination for the query if needed.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  paginate: function(query, mongooseQuery, logger) {
    const Log = logger.bind()
    if (query.$page) {
      mongooseQuery = this.setPage(query, mongooseQuery, Log)
    } else {
      mongooseQuery = this.setSkip(query, mongooseQuery, Log)
    }

    mongooseQuery = this.setLimit(query, mongooseQuery, Log)

    return mongooseQuery
  },

  /**
   * Set the skip amount for the mongoose query. Typically used for paging.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setSkip: function(query, mongooseQuery, logger) {
    if (query.$skip) {
      mongooseQuery.skip(query.$skip)
    }
    return mongooseQuery
  },

  /**
   * Set the page for the mongoose query. Typically used for paging.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setPage: function(query, mongooseQuery, logger) {
    if (query.$page) {
      mongooseQuery.skip((query.$page - 1) * query.$limit)
    }
    return mongooseQuery
  },

  /**
   * Set the limit amount for the mongoose query. Typically used for paging.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setLimit: function(query, mongooseQuery, logger) {
    // TODO: possible default limit of 20?
    if (query.$limit) {
      mongooseQuery.limit(query.$limit)
    }
    return mongooseQuery
  },

  /**
   * Set the list of objectIds to exclude.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setExclude: function(query, mongooseQuery, logger) {
    if (query.$exclude) {
      if (!Array.isArray(query.$exclude)) {
        query.$exclude = query.$exclude.split(',')
      }

      mongooseQuery.where({ _id: { $nin: query.$exclude } })
      delete query.$exclude
    }
    return mongooseQuery
  },

  /**
   * Perform a regex search on the models immediate fields
   * @param query:The incoming request query.
   * @param model: A mongoose model object
   * @param logger: A logging object
   */
  setTermSearch: function(query, model, logger) {
    const Log = logger.bind()
    if (query.$term) {
      query.$or = [] // TODO: allow option to choose ANDing or ORing of searchFields/queryableFields
      let queryableFields = this.getQueryableFields(model, Log)
      let stringFields = this.getStringFields(model, Log)

      // EXPL: we can only search fields that are a string type
      queryableFields = queryableFields.filter(function(field) {
        return stringFields.indexOf(field) > -1
      })

      // EXPL: search only specified fields if included
      if (query.$searchFields) {
        if (!Array.isArray(query.$searchFields)) {
          query.$searchFields = query.$searchFields.split(',')
        }

        // EXPL: we can only search fields that are a string type
        query.$searchFields = query.$searchFields.filter(function(field) {
          return stringFields.indexOf(field) > -1
        })

        query.$searchFields.forEach(function(field) {
          let obj = {}
          obj[field] = new RegExp(query.$term, 'i')
          query.$or.push(obj)
        })
      } else {
        queryableFields.forEach(function(field) {
          let obj = {}
          obj[field] = new RegExp(query.$term, 'i')
          query.$or.push(obj)
        })
      }
    }

    delete query.$searchFields
    delete query.$term
  },

  /**
   * Converts the query "$embed" parameter into a mongoose populate object.
   * Relies heavily on the recursive "nestPopulate" method.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param attributesFilter: A filter that lists the fields to be returned.
   * Must be updated to include the newly embedded fields.
   * @param associations: The current model associations.
   * @param model: A mongoose model object
   * @param logger: A logging object.
   * @returns {{mongooseQuery: *, attributesFilter: *}}: The updated mongooseQuery and attributesFilter.
   */
  populateEmbeddedDocs: function(
    query,
    mongooseQuery,
    attributesFilter,
    associations,
    model,
    logger
  ) {
    const Log = logger.bind()
    if (query.$embed) {
      if (!Array.isArray(query.$embed)) {
        query.$embed = query.$embed.split(',')
      }
      query.$embed.forEach(function(embed) {
        let embeds = embed.split('.')
        let populate = {}

        populate = nestPopulate(
          query,
          populate,
          0,
          embeds,
          associations,
          model,
          Log
        )

        mongooseQuery.populate(populate)

        attributesFilter = attributesFilter + ' ' + embeds[0]
      })
      delete query.$embed
      delete query.populateSelect
    }
    return { mongooseQuery: mongooseQuery, attributesFilter: attributesFilter }
  },

  /**
   * Set the sort priority for the mongoose query.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param logger: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setSort: function(query, mongooseQuery, logger) {
    if (query.$sort) {
      if (Array.isArray(query.$sort)) {
        query.$sort = query.$sort.join(' ')
      }
      mongooseQuery.sort(query.$sort)
      delete query.$sort
    }
    return mongooseQuery
  },

  /**
   * Create a list of selected fields to be returned based on the '$select' query property.
   * @param query: The incoming request query.
   * @param model: A mongoose model object.
   * @param logger: A logging object.
   * @returns {string}
   */
  createAttributesFilter: function(query, model, logger) {
    // This line has to come first
    validationHelper.validateModel(model, logger)

    let attributesFilter = []
    let fields = model.schema.paths
    let fieldNames = []

    if (query.$select) {
      if (!Array.isArray(query.$select)) {
        query.$select = query.$select.split(',')
      }
      fieldNames = query.$select
    } else {
      fieldNames = Object.keys(fields)
    }

    let associations = model.routeOptions
      ? model.routeOptions.associations
      : null

    for (let i = 0; i < fieldNames.length; i++) {
      let fieldName = fieldNames[i]
      if (
        fields[fieldName] &&
        fieldName !== '__v' &&
        fieldName.substr(-2) !== '$*'
      ) {
        let field = fields[fieldName].options
        let association = associations
          ? associations[fields[fieldName].path] || {}
          : {}

        // EXPL: by default we don't include MANY_MANY array references
        if (
          !field.exclude &&
          (association.type !== 'MANY_MANY' || query.$select)
        ) {
          attributesFilter.push(fieldName)
        }
      }
    }

    delete query.$select
    return attributesFilter.toString().replace(/,/g, ' ')
  }
}

/**
 * Takes an embed string and recursively constructs a mongoose populate object.
 * @param query: The incoming request query.
 * @param populate: The populate object to be constructed/extended.
 * @param index: The current index of the "embeds" array.
 * @param embeds: An array of strings representing nested fields to be populated.
 * @param associations: The current model associations.
 * @param logger: A logging object.
 * @returns {*}: The updated populate object.
 */
function nestPopulate(
  query,
  populate,
  index,
  embeds,
  associations,
  model,
  logger
) {
  const Log = logger.bind()
  let embed = embeds[index]
  let association = associations[embed]

  if (!association) {
    association = getReference(model, embed, Log)
    if (!association) {
      throw new Error('Association not found.')
    }
  }

  let embedAssociation =
    association.embedAssociation === undefined
      ? config.embedAssociations
      : association.embedAssociation
  // EXPL: MANY_MANY associations where embedAssociation is false require an extra level of populating due to the linking collection,
  // therefore an extra embed is "inserted" into the embeds array
  let inserted = associations[embed] === associations[embeds[index - 1]]

  let populatePath = ''
  let select = ''
  if (query.populateSelect) {
    if (association.type === 'MANY_MANY' && !embedAssociation && !inserted) {
      select = module.exports.createAttributesFilter(
        {},
        association.include.through,
        Log
      )
    } else {
      select = query.populateSelect.replace(/,/g, ' ') + ' _id'
    }
  } else if (
    association.type === 'MANY_MANY' &&
    !embedAssociation &&
    !inserted
  ) {
    select = module.exports.createAttributesFilter(
      {},
      association.include.through,
      Log
    )
  } else {
    select = module.exports.createAttributesFilter(
      {},
      association.include.model,
      Log
    )
  }

  if (association.type === 'MANY_MANY') {
    if (embedAssociation && !inserted) {
      populatePath = embed + '.' + association.model
    } else if (!inserted) {
      // EXPL: "insert" the extra embed level for the linking collection
      embeds.splice(index + 1, 0, association.model)
      populatePath = embed
    } else {
      populatePath = embed
    }
  } else {
    populatePath = embed
  }

  if (index < embeds.length - 1) {
    let nextModel = association.include.model
    // EXPL: if the next embed was inserted, repeat the same association
    if (!embedAssociation && association.type === 'MANY_MANY' && !inserted) {
      nextModel = model
      associations = Object.assign({}, associations)
      associations[association.model] = associations[embed]
    } else {
      associations = association.include.model.routeOptions.associations
    }
    populate = nestPopulate(
      query,
      populate,
      index + 1,
      embeds,
      associations,
      nextModel,
      Log
    )
    populate.populate = Object.assign({}, populate) // EXPL: prevent circular reference
    populate.path = populatePath

    if (
      associations[embeds[index + 1]] &&
      associations[embeds[index + 1]].type === 'MANY_MANY'
    ) {
      populate.select =
        select + ' ' + populate.populate.path + ' ' + embeds[index + 1] // EXPL: have to add the path and the next embed to the select to include nested MANY_MANY embeds
    } else {
      populate.select = select + ' ' + populate.populate.path // EXPL: have to add the path to the select to include nested ONE_MANY embeds
    }

    if (!embedAssociation && association.type === 'MANY_MANY' && !inserted) {
      populate.model = association.include.through.modelName
    } else {
      populate.model = association.model
    }

    return populate
  } else {
    populate.path = populatePath
    populate.select = select
    populate.model = association.model

    return populate
  }
}

/**
 * Creates an association object from a model property if the property is a reference id
 * @param model
 * @param embed
 * @param logger
 * @returns {*} The association object or null if no reference is found
 */
function getReference(model, embed, logger) {
  let property = model.schema.obj[embed]
  while (_.isArray(property)) {
    property = property[0]
  }
  if (property && property.ref) {
    return {
      model: property.ref,
      include: { model: globals.mongoose.model(property.ref), as: embed }
    }
  } else {
    return null
  }
}

function tryParseJSON(jsonString) {
  try {
    let o = JSON.parse(jsonString)

    if (o && typeof o === 'object') {
      return o
    }
  } catch (e) {}

  return false
}
