var _ = require('lodash');
var assert = require("assert");

module.exports = {
  createMongooseQuery: function (model, query, mongooseQuery, Log) {

    var modelMethods = model.schema.methods;
    
    var queryableFields = this.getQueryableFields(model, Log);

    mongooseQuery = this.setOffsetIfExists(query, mongooseQuery, Log);

    mongooseQuery = this.setLimitIfExists(query, mongooseQuery, Log);

    //mongooseQuery = this.setSortFields(query, mongooseQuery, modelMethods.routeOptions.associations, Log);

    //var defaultWhere = this.createDefaultWhere(query, queryableFields, Log);

    //mongooseQuery = this.setTermSearch(query, mongooseQuery, queryableFields, defaultWhere, Log);

    if (modelMethods.routeOptions) {
      //mongooseQuery.include = this.createIncludeArray(query, modelMethods.routeOptions.associations, Log);
    }

    var attributesFilter = this.createAttributesFilter(query, model, Log);
    mongooseQuery.select(attributesFilter);

    return mongooseQuery;
  },

  getReadableFields: function (model, Log) {
    assert(model, "requires `model` parameter");

    var readableFields = [];

    var fields = model.schema.paths;

    for (var fieldName in fields) {
      var field = fields[fieldName].options;
      if (!field.exclude) {
        readableFields.push(fieldName);
      }
    }

    readableFields.pop();//EXPL: omit the internal version number
    return readableFields;
  },

  /**
   * Crawls the model's tableAttributes for queryable fields
   * @param {Object} A sequelize model object, specifically uses the tableAttributes property on that object.
   * @returns {string[]} An array of queryable field names
   */
  getQueryableFields: function (model, Log) {
    assert(model, "requires `model` parameter");

    var queryableFields = [];

    var fields = model.schema.paths;
    
    for (var fieldName in fields) {
      var field = fields[fieldName].options;

      if (field.queryable && !field.exclude) {
        queryableFields.push(fieldName);
      }
    }

    return queryableFields;
  },

  setLimitIfExists: function (query, mongooseQuery, Log) {
    //TODO: default limit of 20.
    if (query.limit) {
      mongooseQuery.limit(query.limit);
    }
    return mongooseQuery;
  },

  setOffsetIfExists: function (query, mongooseQuery, Log) {
    if (query.offset) {
      mongooseQuery.skip(query.offset);
    }
    return mongooseQuery;
  },

  setSortFields: function (query, mongooseQuery, modelAssociations, Log) {
    if (query.sort) {
      var fieldSorts = [];

      var sortFields = query.sort.split(",");

      for (var sortFieldIndex in sortFields) {
        var sortField = sortFields[sortFieldIndex];

        var queryAssociations = [];
        var order = sortField[0];
        sortField = sortField.substring(1);
        sortField = sortField.split(".");

        //EXPL: support sorting through nested associations
        if (sortField.length > 1) {
          var association = null;
          while (sortField.length > 1) {
            association = sortField.shift();
            queryAssociations.push(modelAssociations[association].include);
            modelAssociations = modelAssociations[association].include.model.schema.methods.routeOptions.associations;
          }
          sortField = sortField[0];
        } else {
          sortField = sortField[0];
        }

        var sortQuery = null;
        if (order == "-") {
          //EXPL: - means descending.
          if (queryAssociations) {
            sortQuery = queryAssociations;
            sortQuery.push(sortField);
            sortQuery.push('DESC');
            fieldSorts.push(sortQuery);
          } else {
            fieldSorts.push([sortField, "DESC"]);
          }
        } else if (order == "+") {
          //EXPL: + means ascending.
          if (queryAssociations) {
            sortQuery = queryAssociations;
            sortQuery.push(sortField);
            fieldSorts.push(sortQuery);
          } else {
            fieldSorts.push([sortField]);
          }
        } else {
          //EXPL: default to ascending if there is no - or +
          if (queryAssociations) {
            sortQuery = queryAssociations;
            sortQuery.push(sortField);
            fieldSorts.push(sortQuery);
          } else {
            fieldSorts.push([sortField]);
          }
        }
      }

      //EXPL: remove from the query to remove conflicts.
      delete query.sort;

      mongooseQuery.order = fieldSorts;
    }

    return mongooseQuery;
  },

  createDefaultWhere: function (query, defaultSearchFields, Log) {

    //TODO: update this to handle more complex queries
    //EX: query = {"or-like-title":"Boat","or-not-description":"boat"
    //should result in
    //$or: [
    //{
    //  title: {
    //    $like: 'Boat'
    //  }
    //},
    //{
    //  description: {
    //    $notIn: 'boat'
    //  }
    //}
    //]

    var defaultWhere = {};

    function parseSearchFieldValue(searchFieldValue)
    {
      if (_.isString(searchFieldValue)) {
        switch (searchFieldValue.toLowerCase()) {
          case "null":
            return null;
            break;
          case "true":
            return true;
            break;
          case "false":
            return false;
            break;
          default:
            return searchFieldValue;
        }
      } else if (_.isArray(searchFieldValue)) {
        searchFieldValue = _.map(searchFieldValue, function (item) {
          switch (item.toLowerCase()) {
            case "null":
              return null;
              break;
            case "true":
              return true;
              break;
            case "false":
              return false;
              break;
            default:
              return item;
          }
        });
        return {$or: searchFieldValue}; //NOTE: Here searchFieldValue is an array.
      }
    }

    if (defaultSearchFields) {
      for (var queryField in query) {
        var index = defaultSearchFields.indexOf(queryField);
        if (index >= 0) { //EXPL: queryField is for basic search value

          var defaultSearchField = defaultSearchFields[index];

          var searchFieldValue = query[defaultSearchField];

          defaultWhere[defaultSearchField] = parseSearchFieldValue(searchFieldValue);

        } else { //EXPL: queryField includes options

          var defaultSearchField = null;
          var searchFieldValue = query[queryField];
          queryField = queryField.split('-');
          if (queryField.length > 1) {
            defaultSearchField = queryField[1];
          }
          queryField = queryField[0];

          if (defaultSearchField) {
            searchFieldValue = parseSearchFieldValue(searchFieldValue);
            switch (queryField) {
              case "not": //EXPL: allows for omitting objects
                if (!defaultWhere[defaultSearchField]) {
                  defaultWhere[defaultSearchField] = {};
                }
                if (_.isArray(searchFieldValue)) {
                  defaultWhere[defaultSearchField]["$notIn"] = searchFieldValue;
                } else {
                  defaultWhere[defaultSearchField]["$notIn"] = [searchFieldValue];
                }
                break;
              case "max": //EXPL: query for max search value
                if (!defaultWhere[defaultSearchField]) {
                  defaultWhere[defaultSearchField] = {};
                }
                defaultWhere[defaultSearchField]["$gte"] = searchFieldValue;
                break;
              case "min": //EXPL: query for min search value
                if (!defaultWhere[defaultSearchField]) {
                  defaultWhere[defaultSearchField] = {};
                }
                defaultWhere[defaultSearchField]["$lte"] = searchFieldValue;
                break;
              case "or":  //EXPL: allows for different properties to be ORed together
                if (!defaultWhere["$or"]) {
                  defaultWhere["$or"] = {};
                }
                defaultWhere["$or"][defaultSearchField] = searchFieldValue;
                break;
              default:
                break;
            }
          }
        }
      }
    }

    return defaultWhere;
  },

  setTermSearch: function (query, mongooseQuery, defaultSearchFields, defaultWhere, Log) {
    //EXPL: add the term as a regex search
    if (query.term) {
      var searchTerm = query.term;
      //EXPL: remove the "term" from the query
      delete query.term;

      var fieldSearches = undefined;

      if (query.searchFields) {
        var searchFields = query.searchFields.split(",");

        fieldSearches = [];

        //EXPL: add field searches only for those in the query.fields
        for (var fieldIndex in searchFields) {
          var field = searchFields[fieldIndex];
          var fieldSearch = {}
          fieldSearch[field] = {$like: "%" + searchTerm + "%"}
          fieldSearches.push(fieldSearch)
        }

        delete query.searchFields; //EXPL: remove to avoid query conflicts.
      } else {
        var fieldSearches = [];

        //EXPL: add ALL the fields as search fields.
        if (defaultSearchFields) {
          for (var defaultSearchFieldIndex in defaultSearchFields) {
            var defaultSearchField = defaultSearchFields[defaultSearchFieldIndex];

            var searchObject = {};

            searchObject[defaultSearchField] = {$like: "%" + searchTerm + "%"}

            fieldSearches.push(searchObject);
          }
        }
      }

      mongooseQuery.where = {
        $and: [{
          $or: fieldSearches
        },
          defaultWhere
        ]
      };
    } else {
      mongooseQuery.where = defaultWhere;
    }

    return mongooseQuery;
  },

  createIncludeArray: function (query, associations, Log) {
    var includeArray = [];

    if (query.embed && associations) {
      var embedStrings = query.embed.split(",");

      for (var embedStringIndex = 0; embedStringIndex < embedStrings.length; ++embedStringIndex) {
        var embedString = embedStrings[embedStringIndex];

        var embedTokens = embedString.split('.');

        var mainIncludeString = embedTokens[0];
        var subIncludeString = embedTokens[1];

        var association = associations[mainIncludeString];

        if (association) {
          var includeDefinition = {};
          includeDefinition = includeArray.filter(function( include ) {//EXPL: check if the association has already been included
            return include.as == association.include.as;
          });
          includeDefinition = includeDefinition[0];
          if (!includeDefinition) {//EXPL: make a copy of the association include
            includeDefinition = {};
            includeDefinition.model = association.include.model;
            includeDefinition.as = association.include.as;
          }

          if (subIncludeString) {
            if (includeDefinition.model.routeOptions && includeDefinition.model.routeOptions.associations) {
              embedTokens.shift();
              if (includeDefinition.include) {//EXPL: recursively build nested includes
                includeDefinition.include.push(addNestedIncludes(embedTokens, includeDefinition.model.routeOptions.associations, includeDefinition.include, Log));
              } else {
                includeDefinition.include = [addNestedIncludes(embedTokens, includeDefinition.model.routeOptions.associations, [], Log)];
              }
            } else {
              Log.warning("Substring provided but no association exists in model.");
            }
          }
          //EXPL: Add the association if it hasn't already been included
          if (includeArray.indexOf(includeDefinition) < 0) {
            includeArray.push(includeDefinition);
          }
        }
      }
    }
    return includeArray;
  },

  createAttributesFilter: function (query, model, Log) {
    var attributesFilter = [];
    var fields = model.schema.paths;
    var fieldNames = [];
    if (query.fields) {
      fieldNames = query.fields;
    } else {
      fieldNames = Object.keys(fields)
    }

    for (var i = 0; i < fieldNames.length; i++) {
      var fieldName = fieldNames[i];
      var field = fields[fieldName].options;
      if (!field.exclude) {
        attributesFilter.push(fieldName);
      }
    }

    i = attributesFilter.indexOf("__v");//EXPL: omit the internal version number
    if(i != -1) {
      attributesFilter.splice(i, 1);
    }
    return attributesFilter.toString().replace(/,/g,' ');
  }
};


//EXPL: Recursively add nested includes/embeds
function addNestedIncludes(embedTokens, associations, includeArray, Log) {
  var mainIncludeString = embedTokens[0];
  var subIncludeString = embedTokens[1];

  var association = associations[mainIncludeString];

  if (association) {
    var includeDefinition = {};
    includeDefinition = includeArray.filter(function( include ) {//EXPL: check if the association has already been included
      return include.as == association.include.as;
    });
    includeDefinition = includeDefinition[0];
    if (!includeDefinition) {//EXPL: make a copy of the association include
      includeDefinition = {};
      includeDefinition.model = association.include.model;
      includeDefinition.as = association.include.as;
    }

    if (subIncludeString) {
      if (includeDefinition.model.routeOptions && includeDefinition.model.routeOptions.associations) {
        embedTokens.shift();
        if (includeDefinition.include) {//EXPL: recursively build nested includes
          includeDefinition.include.push(addNestedIncludes(embedTokens, includeDefinition.model.routeOptions.associations, includeDefinition.include, Log));
        } else {
          includeDefinition.include = [addNestedIncludes(embedTokens, includeDefinition.model.routeOptions.associations, [], Log)];
        }
      } else {
        Log.warning("Substring provided but no association exists in model.");
        return includeDefinition;
      }
    }
    return includeDefinition;
  }
  Log.error("Association does not exist!");
  return;
}