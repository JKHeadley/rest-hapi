'use strict';

var Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
var _ = require('lodash');
var assert = require('assert');
var validationHelper = require("./validation-helper");
var mongoose = require('mongoose');

//TODO: support "allowNull"
//TODO: add ".default()" to paths that have a default value
//TODO: support arrays and objects
//TODO: support "allowUndefined"

module.exports = {

  /**
   * Generates a Joi object that validates a query result for a specific model
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {*}: A Joi object
   */
  generateJoiReadModel: function (model, Log) {
    // validationHelper.validateModel(model, Log);

    var readModelBase = {};

    var fields = model.schema.tree;
    var nested = model.schema.nested;

    var associations = model.routeOptions.associations ? Object.keys(model.routeOptions.associations) : [];

    for (var fieldName in fields) {
      var field = fields[fieldName];

      var isAssociation = associations.indexOf(fieldName);

      if (field.readModel) {
        readModelBase[fieldName] = field.readModel;
      }
      else if (field.allowOnRead !== false && field.exclude !== true && isAssociation < 0 && fieldName !== "__v" && fieldName !== "id") {
        var attributeReadModel = {};
        //EXPL: if this field is nested, we treat it as a nested model and recursively call "generateJoiReadModel"
        if (nested[fieldName]) {

          var nestedModel = {
            modelName: model.modelName + '.' + fieldName,
            routeOptions: {},
            schema: {
              tree: field
            }
          };

          var subNested = {};

          for (var name in nested) {
            if (name !== fieldName) {
              var parts = name.split('.');
              if (parts[0] === fieldName) {
                parts.shift();
                var subNestedName = parts.join(".");
                subNested[subNestedName] = true;
              }
            }
          }

          nestedModel.schema.nested = subNested;

          attributeReadModel = this.generateJoiReadModel(nestedModel, Log);
        }
        else {
          attributeReadModel = this.generateJoiModelFromFieldType(field, Log);
        }

        if (field.requireOnRead === true) {
          attributeReadModel = attributeReadModel.required();
        }

        readModelBase[fieldName] = attributeReadModel;
      }
    }


    if (model.routeOptions && model.routeOptions.associations) {
      for (var associationName in model.routeOptions.associations) {
        var association = model.routeOptions.associations[associationName];

        //TODO: possibly add stricter validation for associations
        if (association.type === "MANY_MANY" || association.type === "ONE_MANY" || association.type === "_MANY") {
          readModelBase[associationName] = Joi.array().items(
              Joi.object().unknown().allow(null).label(model.modelName + "_" + associationName + "Model"))
              .label(model.modelName + "_" + associationName + "ArrayModel");

          if (association.linkingModel) {
            readModelBase[association.linkingModel] = Joi.object().unknown().allow(null);
          }
        } else {
          readModelBase[associationName] = Joi.object().unknown().allow(null);
        }
      }
    }

    var readModel = Joi.object(readModelBase).label(model.modelName + "ReadModel");

    return readModel;
  },

  /**
   * Generates a Joi object that validates a query request payload for updating a document
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {*}: A Joi object
   */
  generateJoiUpdateModel: function (model, Log) {
    // validationHelper.validateModel(model, Log);

    var updateModelBase = {};

    var fields = model.schema.tree;
    var nested = model.schema.nested;

    var associations = model.routeOptions.associations ? model.routeOptions.associations : {};

    for (var fieldName in fields) {
      var field = fields[fieldName];

      var association = associations[fieldName] || null;

      var canUpdateAssociation = association ? (association.type === "ONE_ONE" || association.type === "MANY_ONE" || association.type === "_MANY") : false;

      if (fieldName !== "__t" && fieldName !== "__v" && fieldName !== "id") {
        if (field.updateModel) {
          updateModelBase[fieldName] = field.updateModel;
        }
        else if (field.allowOnUpdate !== false && (canUpdateAssociation || !association)) {
          var attributeUpdateModel = {};
          //EXPL: if this field is nested, we treat it as a nested model and recursively call "generateJoiUpdateModel"
          if (nested[fieldName]) {

            var nestedModel = {
              modelName: model.modelName + '.' + fieldName,
              routeOptions: {},
              schema: {
                tree: field
              }
            };

            var subNested = {};

            for (var name in nested) {
              if (name !== fieldName) {
                var parts = name.split('.');
                if (parts[0] === fieldName) {
                  parts.shift();
                  var subNestedName = parts.join(".");
                  subNested[subNestedName] = true;
                }
              }
            }

            nestedModel.schema.nested = subNested;

            attributeUpdateModel = this.generateJoiUpdateModel(nestedModel, Log);
          }
          else {
            attributeUpdateModel = this.generateJoiModelFromFieldType(field, Log);
          }

          if (field.requireOnUpdate === true) {
            attributeUpdateModel = attributeUpdateModel.required();
          }

          updateModelBase[fieldName] = attributeUpdateModel;
        }
      }
    }

    var updateModel = Joi.object(updateModelBase).label(model.modelName + "UpdateModel");

    return updateModel;
  },

  /**
   * Generates a Joi object that validates a query request payload for creating a document
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {*}: A Joi object
   */
  generateJoiCreateModel: function (model, Log) {
    // validationHelper.validateModel(model, Log);

    var createModelBase = {};

    var fields = model.schema.tree;
    var nested = model.schema.nested;

    var associations = model.routeOptions.associations ? model.routeOptions.associations : {};

    for (var fieldName in fields) {

      var field = fields[fieldName];

      var association = associations[fieldName] || null;

      var canCreateAssociation = association ? (association.type === "ONE_ONE" || association.type === "MANY_ONE" || association.type === "_MANY") : false;

      if (fieldName !== "__t" && fieldName !== "__v" && fieldName !== "id") {
        //EXPL: use the field createModel if one is defined
        if (field.createModel) {
          createModelBase[fieldName] = field.createModel;
        }
        else if (field.allowOnCreate !== false && (canCreateAssociation || !association)) {
          var attributeCreateModel = {};
          //EXPL: if this field is nested, we treat it as a nested model and recursively call "generateJoiCreateModel"
          if (nested[fieldName]) {

            var nestedModel = {
              modelName: model.modelName + '.' + fieldName,
              routeOptions: {},
              schema: {
                tree: field
              }
            };

            var subNested = {};

            for (var name in nested) {
              if (name !== fieldName) {
                var parts = name.split('.');
                if (parts[0] === fieldName) {
                  parts.shift();
                  var subNestedName = parts.join(".");
                  subNested[subNestedName] = true;
                }
              }
            }

            nestedModel.schema.nested = subNested;

            attributeCreateModel = this.generateJoiCreateModel(nestedModel, Log);
          }
          else {
            attributeCreateModel = this.generateJoiModelFromFieldType(field, Log);
          }

          if (field.required === true) {
            attributeCreateModel = attributeCreateModel.required();
          }

          createModelBase[fieldName] = attributeCreateModel;
        }
      }
    }



    var createModel = Joi.object(createModelBase).label(model.modelName + "CreateModel");

    return createModel;
  },

  /**
   * Generates a Joi object that validates a query request payload for adding a association
   * @param model: A mongoose model object.
   * @param Log: A logging object.
   * @returns {*}: A Joi object
   */
  generateJoiAssociationModel: function (model, Log) {
    assert(model.Schema, "incorrect model format");

    var associationModelBase = {};

    for (var fieldName in model.Schema) {

      var field = model.Schema[fieldName];

      if (field.createModel) {
        associationModelBase[fieldName] = field.createModel;
      }
      else {
        var attributeAssociationModel = this.generateJoiModelFromFieldType(field, Log);

        if (field.required) {
          attributeAssociationModel = attributeAssociationModel.required();
        }
        associationModelBase[fieldName] = attributeAssociationModel;
      }
    }

    var associationModel = Joi.object(associationModelBase).label(model.modelName + "AssociationModel");

    return associationModel;
  },

  /**
   * Returns a Joi object based on the mongoose field type.
   * @param field: A field from a mongoose model.
   * @param Log: A logging object.
   * @returns {*}: A Joi object.
   */
  generateJoiModelFromFieldType: function (field, Log) {
    var model;

    // assert(field.type, "incorrect field format");

    let isArray = false;
    let fieldCopy = _.extend({}, field);


    if (_.isArray(fieldCopy.type)) {
      isArray = true;
      fieldCopy.type = fieldCopy.type[0];
    }

    if (!fieldCopy.type) {
      fieldCopy.type = {
        schemaName: "None"
      }
    }

    switch (fieldCopy.type.schemaName) {
      case 'ObjectId':
        model = this.joiObjectId();
        break;
      case 'Boolean':
        model = Joi.bool();
        break;
      case 'Number':
        model = Joi.number();
        break;
      case 'Date':
        model = Joi.date();
        break;
      case 'String':
        if (fieldCopy.enum) {
          model = Joi.any().only(fieldCopy.enum);
        }
        else if (fieldCopy.stringType) {
          switch (fieldCopy.stringType) {
            case 'uri':
              model = Joi.string().uri();
              break;
            case 'email':
              model = Joi.string().email();
              break;
            case 'token':
              model = Joi.string().token();
              break;
            case 'hex':
              model = Joi.string().hex();
              break;
            case 'base64':
              model = Joi.string().base64();
              break;
            case 'hostname':
              model = Joi.string().hostname();
              break;
            case 'lowercase':
              model = Joi.string().lowercase();
              break;
            case 'uppercase':
              model = Joi.string().uppercase();
              break;
            case 'trim':
              model = Joi.string().trim();
              break;
            case 'creditCard':
              model = Joi.string().creditCard();
              break;
            default:
              model = Joi.string().allow('');
          }
        }
        else {
          model = Joi.string().allow('');
        }
        break;
      default:
        model = Joi.any();
        break;
    }


    if (fieldCopy.allowNull) {
      model = model.allow(null);
    }

    if (isArray) {
      model = Joi.array().items(model);
    }

    if (fieldCopy.description) {
      model = model.description(fieldCopy.description);
    }
    else if (fieldCopy.stringType) {
      model = model.description(fieldCopy.stringType);
    }


    return model;
  },

  /**
   * Provides easy access to the Joi ObjectId type.
   * @returns {*|{type}}
   */
  joiObjectId: function() {
    //EXPL: Rather than converting all objectIds to string for response, we allow raw mongoose.Types.ObjectId objects
    let objectIdModel = Joi.object({ "_bsontype": Joi.any(), "id": Joi.any() });
    let model = Joi.alternatives().try(Joi.objectId().description("ObjectId"), objectIdModel);
    return model;
  }

};