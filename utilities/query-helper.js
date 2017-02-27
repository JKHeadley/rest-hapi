'use strict';

var _ = require('lodash');
var assert = require("assert");
var validationHelper = require("./validation-helper");
var qs = require('qs');
var extend = require('util')._extend;
let globals = require('../components/globals');

//TODO-DONE: mulit-level/multi-priority sorting (i.e. sort first by lastName, then by firstName) implemented via comma seperated sort list
//TODO: sorting through populate fields (Ex: sort users through role.name)
//TODO: support selecting populated fields
//TODO: support $embed for quick embedding and "populate" for detailed, mongoose specific population
//TODO-DONE: $term search
//TODO-DONE: support mongoose $text search
//TODO: support searching populated fields
//TODO: support easy AND and OR operations (i.e. search for "foo" AND "bar" or "foo" OR "bar"
//TODO: possibly support both comma separated values and space separated values
//TODO: define field property options (queryable, exclude, etc).
//TODO-DONE: support "$where" field that allows for raw mongoose queries
//TODO: query validation for $where field
//TODO: enable/disable option for $where field
//TODO: populating "implied" associations through $embed property, EX:
/**
 facilitiesPerFloor: [[{
      type: Types.ObjectId,
      ref: "facility"
    }]]
 */
//TODO: support parallel embeds, Ex: { $embed: ['facilitiesPerFloor.categories','facilitiesPerFloor.items'] } //NOTE: this seems to work for some queries
//TODO: support field queries for "null" and "undefined"

module.exports = {
  /**
   * Create a mongoose query based off of the request query
   * @param model: A mongoose model object.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: A modified mongoose query.
   */
  createMongooseQuery: function (model, query, mongooseQuery, Log) {
    validationHelper.validateModel(model, Log);
    //(email == 'test@user.com' && (firstName == 'test2@user.com' || firstName == 'test4@user.com')) && (age < 15 || age > 30)
    //LITERAL
    //{
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
    //{
    // and[email][equal]=test@user.com&and[or][firstName][equal]=test2@user.com&and[or][firstName][equal]=test4@user.com&and[age][gt]=15
    //ABBREVIATED
    //{
    //  email:'test@user.com',
    //  firstName: ['test2@user.com', 'test4@user.com'],
    //  age: {
    //    $or: {
    //      $gt: '15',
    //      $lt: '30'
    //    }
    //  }
    //}
    // [email]=test@user.com&[firstName]=test2@user.com&[firstName]=test4@user.com&[age][gt]=15&[age][lt]=30


    delete query[""]; //EXPL: hack due to bug in hapi-swagger-docs

    delete query.$count;

    mongooseQuery = this.setExclude(query, mongooseQuery, Log);

    var attributesFilter = this.createAttributesFilter(query, model, Log);
    if (attributesFilter === '') {
      attributesFilter = "_id";
    }

    var result = this.populateEmbeddedDocs(query, mongooseQuery, attributesFilter, model.routeOptions.associations, model, Log);
    mongooseQuery = result.mongooseQuery;
    attributesFilter = result.attributesFilter;

    mongooseQuery = this.setSort(query, mongooseQuery, Log);

    mongooseQuery.select(attributesFilter);

    if (typeof query.$where === 'string') {
      query.$where = JSON.parse(query.$where);
    }

    if (query.$where) {
      mongooseQuery.where(query.$where);
      delete query.$where;
    }

    //EXPL: Support single (string) inputs or multiple "or'd" inputs (arrays) for field queries
    for (var fieldQueryKey in query) {
      var fieldQuery = query[fieldQueryKey];
      if (!Array.isArray(fieldQuery)) {
        fieldQuery = tryParseJSON(query[fieldQueryKey]);
      }
      if (fieldQuery && Array.isArray(fieldQuery) && fieldQueryKey !== '$searchFields') {
        query[fieldQueryKey] = { $in: fieldQuery };//EXPL: "or" the inputs
      }
    }

    //EXPL: handle full text search
    if (query.$text) {
      query.$text = {$search: query.$text};
    }

    //EXPL: handle regex search
    this.setTermSearch(query, model, Log);

    var whereQuery = _.extend({}, query);

    //EXPL: delete pagination parameters
    delete whereQuery.$limit;
    delete whereQuery.$skip;
    delete whereQuery.$page;

    mongooseQuery.where(whereQuery);
    return mongooseQuery;
  },

  /**
   * Get a list of fields that can be returned as part of a query result.
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {Array}: A list of fields.
   */
  getReadableFields: function (model, Log) {
    validationHelper.validateModel(model, Log);

    var readableFields = [];

    var fields = model.schema.paths;

    for (var fieldName in fields) {
      var field = fields[fieldName].options;
      if (!field.exclude && fieldName !== "__v") {
        readableFields.push(fieldName);
      }
    }

    return readableFields;
  },

  /**
   * Get a list of valid query sort inputs.
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {Array}: A list of fields.
   */
  getSortableFields: function (model, Log) {
    validationHelper.validateModel(model, Log);

    var sortableFields = this.getReadableFields(model, Log);

    for (var i = sortableFields.length-1; i >= 0; i--) {
      var descendingField = "-" + sortableFields[i];
      sortableFields.splice(i,0,descendingField);
    }

    return sortableFields;
  },

  /**
   * Get a list of fields that can be queried against.
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {Array}: A list of fields.
   */
  getQueryableFields: function (model, Log) {
    validationHelper.validateModel(model, Log);

    var queryableFields = [];

    var fields = model.schema.paths;
    var fieldNames = Object.keys(fields);

    var associations = model.routeOptions ? model.routeOptions.associations : null;

    for (var i = 0; i < fieldNames.length; i++) {
      var fieldName = fieldNames[i];
      if (fields[fieldName] && fieldName !== "__v" && fieldName !== "__t") {
        var field = fields[fieldName].options;
        var association = associations ? (associations[fields[fieldName].path] || {}) : {};

        //EXPL: by default we don't include MANY_MANY array references
        if (field.queryable !== false && !field.exclude && association.type !== "MANY_MANY") {
          queryableFields.push(fieldName);
        }
      }
    }

    return queryableFields;
  },

  getStringFields: function (model, Log) {
    validationHelper.validateModel(model, Log);

    var stringFields = [];

    var fields = model.schema.paths;

    for (var fieldName in fields) {
      var field = fields[fieldName].options;
      if (field.type.schemaName === "String") {
        stringFields.push(fieldName);
      }
    }

    return stringFields;
  },

  /**
   * Handle pagination for the query if needed.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  paginate: function(query, mongooseQuery, Log) {
    if (query.$page) {
      mongooseQuery = this.setPage(query, mongooseQuery, Log);
    }
    else {
      mongooseQuery = this.setSkip(query, mongooseQuery, Log);
    }

    mongooseQuery = this.setLimit(query, mongooseQuery, Log);

    return mongooseQuery;
  },

  /**
   * Set the skip amount for the mongoose query. Typically used for paging.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setSkip: function (query, mongooseQuery, Log) {
    if (query.$skip) {
      mongooseQuery.skip(query.$skip);
    }
    return mongooseQuery;
  },

  /**
   * Set the page for the mongoose query. Typically used for paging.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setPage: function (query, mongooseQuery, Log) {
    if (query.$page) {
      mongooseQuery.skip((query.$page - 1) * query.$limit);
    }
    return mongooseQuery;
  },

  /**
   * Set the limit amount for the mongoose query. Typically used for paging.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setLimit: function (query, mongooseQuery, Log) {
    //TODO: possible default limit of 20?
    if (query.$limit) {
      mongooseQuery.limit(query.$limit);
    }
    return mongooseQuery;
  },

  /**
   * Set the list of objectIds to exclude.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setExclude: function (query, mongooseQuery, Log) {
    if (query.$exclude) {

      if (!Array.isArray(query.$exclude)) {
        query.$exclude = query.$exclude.split(",");
      }

      mongooseQuery.where({'_id': { $nin: query.$exclude}});
      delete query.$exclude;
    }
    return mongooseQuery;
  },

  /**
   * Perform a regex search on the models immediate fields
   * @param query:The incoming request query.
   * @param model: A mongoose model object
   * @param Log: A logging object
   */
  setTermSearch: function(query, model, Log) {
    if (query.$term) {
      query.$or = [];//TODO: allow option to choose ANDing or ORing of searchFields/queryableFields
      var queryableFields = this.getQueryableFields(model, Log);
      var stringFields = this.getStringFields(model, Log);

      //EXPL: we can only search fields that are a string type
      queryableFields = queryableFields.filter(function(field) {
        return stringFields.indexOf(field) > -1;
      });

      //EXPL: search only specified fields if included
      if (query.$searchFields) {
        if (!Array.isArray(query.$searchFields)) {
          query.$searchFields = query.$searchFields.split(",");
        }

        //EXPL: we can only search fields that are a string type
        query.$searchFields = query.$searchFields.filter(function(field) {
          return stringFields.indexOf(field) > -1;
        });

        query.$searchFields.forEach(function(field) {
          var obj = {};
          obj[field] = new RegExp(query.$term, "i");
          query.$or.push(obj);
        });
      }
      else {
        queryableFields.forEach(function(field) {
          var obj = {};
          obj[field] = new RegExp(query.$term, "i");
          query.$or.push(obj);
        });
      }
    }

    delete query.$searchFields;
    delete query.$term;
  },

  /**
   * Converts the query "$embed" parameter into a mongoose populate object.
   * Relies heavily on the recursive "nestPopulate" method.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param attributesFilter: A filter that lists the fields to be returned.
   * Must be updated to include the newly embedded fields.
   * @param associations: The current model associations.
   * @param Log: A logging object.
   * @returns {{mongooseQuery: *, attributesFilter: *}}: The updated mongooseQuery and attributesFilter.
   */
  populateEmbeddedDocs: function (query, mongooseQuery, attributesFilter, associations, model, Log) {
    if (query.$embed) {
      if (!Array.isArray(query.$embed)) {
        query.$embed = query.$embed.split(",");
      }
      query.$embed.forEach(function(embed) {
        var embeds = embed.split(".");
        var populate = {};

        populate = nestPopulate(query, populate, 0, embeds, associations, model, Log);

        mongooseQuery.populate(populate);

        attributesFilter = attributesFilter + ' ' + embeds[0];
      });
      delete query.$embed;
      delete query.populateSelect;
    }
    return { mongooseQuery: mongooseQuery, attributesFilter: attributesFilter };
  },

  /**
   * Set the sort priority for the mongoose query.
   * @param query: The incoming request query.
   * @param mongooseQuery: A mongoose query.
   * @param Log: A logging object.
   * @returns {*}: The updated mongoose query.
   */
  setSort: function (query, mongooseQuery, Log) {
    if (query.$sort) {
      if (Array.isArray(query.$sort)) {
        query.$sort = query.$sort.join(' ');
      }
      mongooseQuery.sort(query.$sort);
      delete query.$sort;
    }
    return mongooseQuery;
  },

  /**
   * Create a list of selected fields to be returned based on the '$select' query property.
   * @param query: The incoming request query.
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {string}
   */
  createAttributesFilter: function (query, model, Log) {
    validationHelper.validateModel(model, Log);
    var attributesFilter = [];
    var fields = model.schema.paths;
    var fieldNames = [];

    if (query.$select) {
      if (!Array.isArray(query.$select)) {
        query.$select = query.$select.split(",");
      }
      fieldNames = query.$select;
    } else {
      fieldNames = Object.keys(fields)
    }

    var associations = model.routeOptions ? model.routeOptions.associations : null;

    for (var i = 0; i < fieldNames.length; i++) {
      var fieldName = fieldNames[i];
      if (fields[fieldName] && fieldName !== "__v") {
        var field = fields[fieldName].options;
        var association = associations ? (associations[fields[fieldName].path] || {}) : {};

        //EXPL: by default we don't include MANY_MANY array references
        if (!field.exclude && (association.type !== "MANY_MANY" || query.$select)) {
          attributesFilter.push(fieldName);
        }
      }
    }

    delete query.$select;
    return attributesFilter.toString().replace(/,/g,' ');
  }
};

/**
 * Takes an embed string and recursively constructs a mongoose populate object.
 * @param query: The incoming request query.
 * @param populate: The populate object to be constructed/extended.
 * @param index: The current index of the "embeds" array.
 * @param embeds: An array of strings representing nested fields to be populated.
 * @param associations: The current model associations.
 * @param Log: A logging object.
 * @returns {*}: The updated populate object.
 */
function nestPopulate(query, populate, index, embeds, associations, model, Log) {
  var embed = embeds[index];
  var association = associations[embed];

  if (!association) {
    association = getReference(model, embed, Log);
    if (!association) {
      throw "Association not found.";
    }
  }

  var populatePath = "";
  var select = "";
  if (query.populateSelect) {
    select = query.populateSelect.replace(/,/g,' ') + " _id";
  }
  else {
    select = module.exports.createAttributesFilter({}, association.include.model, Log);
  }

  if (association.type === "MANY_MANY") {
    populatePath = embed + '.' + association.model;
  }
  else {
    populatePath = embed;
  }

  if (index < embeds.length - 1) {

    associations = association.include.model.routeOptions.associations;
    populate = nestPopulate(query, populate, index + 1, embeds, associations, association.include.model, Log);
    populate.populate = extend({}, populate);//EXPL: prevent circular reference
    populate.path = populatePath;

    if (associations[embeds[index + 1]] && associations[embeds[index + 1]].type === "MANY_MANY") {
      populate.select = select + " " + populate.populate.path + ' ' + embeds[index + 1];//EXPL: have to add the path and the next embed to the select to include nested MANY_MANY embeds
    }
    else {
      populate.select = select + " " + populate.populate.path;//EXPL: have to add the path to the select to include nested ONE_MANY embeds
    }

    populate.model = association.model;

    return populate;
  }
  else {

    populate.path = populatePath;
    populate.select = select;
    populate.model = association.model;

    return populate;
  }
}

/**
 * Creates an association object from a model property if the property is a reference id
 * @param model
 * @param embed
 * @param Log
 * @returns {*} The association object or null if no reference is found
 */
function getReference(model, embed, Log) {
  let property = model.schema.obj[embed];
  while (_.isArray(property)) {
    property = property[0];
  }
  if (property && property.ref) {
    return { model: property.ref, include: { model: globals.mongoose.model(property.ref), as: embed }  }
  }
  else {
    return null;
  }
}

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    if (o && typeof o === "object") {
      return o;
    }
  }
  catch (e) { }

  return false;
}