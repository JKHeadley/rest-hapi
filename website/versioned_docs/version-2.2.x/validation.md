---
id: version-2.2.x-validation
title: Validation
sidebar_label: Validation
original_id: validation
---

## Route validation
Validation in the rest-hapi framework is implemented with [joi](https://github.com/hapijs/joi). This includes validation of headers, query parameters, payloads, and responses. joi validation models are based primarily off of each model's field properties.  Below is a list of mongoose schema types and their joi equivalent within rest-hapi:

Schema Type | joi Validation
--- | --- 
ObjectId    |      Joi.objectId() (via [joi-objectid](https://www.npmjs.com/package/joi-objectid))
Boolean     |      Joi.bool()
Number      |      Joi.number()
Date        |      Joi.date()
String      |      Joi.string()
Mixed       |      Joi.any()
types       |      Joi.any()

Fields of type ``String`` can include further validation restrictions based on additional field properties as shown below:

Field Property | joi Validation
--- | ---
enum: [items] | Joi.string().valid(...[items])
regex: RegExp | Joi.string().regex(RegExp)
stringType: 'email' | Joi.string().email()
stringType: 'uri' | Joi.string().uri()
stringType: 'token' | Joi.string().token()
stringType: 'base64' | Joi.string().base64()
stringType: 'lowercase' | Joi.string().lowercase()
stringType: 'uppercase' | Joi.string().uppercase()
stringType: 'hostname' | Joi.string().hostname()
stringType: 'hex' | Joi.string().hex()
stringType: 'trim' | Joi.string().trim()
stringType: 'creditCard' | Joi.string().creditCard()

In addition, if a `description: "Description text."` field property is included, then `.description("Description text.")` will be called on the joi validation object.

Furthermore, the regex field can also accept an object that follows the formatting below. See [Joi regex options](https://github.com/hapijs/joi/blob/v13.0.2/API.md#stringregexpattern-name--options).

```javascript
{
 pattern: RegExp,
 options: {
  invert: Boolean
 }
}
```

rest-hapi generates joi validation models for create, read, and update events as well as association events with linking models.  By default these validation models include all the fields of the mongoose models and list them as optional.  However additional field properties can be included to customize the validation models.  Below is a list of currently supported field properties and their effect on the validation models.

Field Property | Validation Model
--- | ---
required: true | field required on create
requireOnRead: true | field required on read/response
requireOnUpdate: true | field required on update
allowOnRead: false | field excluded from read model
allowOnUpdate: false | field excluded from update model
allowOnCreate: false | field excluded from create model
queryable: false | field cannot be included as a query parameter
exclude: true | field cannot be included in a response or as part of a query
allowNull: true | field accepts ``null`` as a valid value

## Hapi Validation Response
By default hapi will not respond with details of validation failures for security reasons. If you would like to see these details you need to sepcify a `failAction` for validation like so:
```javascript
const server = Hapi.Server({
    routes: {
        validate: {
            failAction: async (request, h, err) => {
                RestHapi.logger.error(err)
                throw err
            }
        }
    }
})
```

## Using Joi in custom endpoints
As of rest-hapi v2.0, if you create [standalone](creating-endpoints.md#standalone-endpoints) or
[additional](creating-endpoints.md#additional-endpoints) endpoints, you must either use the rest-hapi joi
object or wrap validate properties in `Joi.object` as described in the [hapi
notes](https://github.com/hapijs/hapi/issues/4017). You can access the rest-hapi joi object as a
global rest-hapi property like so:
```javascript

              validate: {
                payload: {
                  password: RestHapi.joi.string()
                    .required()
                    .description("The user's new password")
                }
              },
```

## Joi helper methods
rest-hapi exposes the helper methods it uses to generate Joi models through the `joiHelper` property. Combined with the exposed [mongoose wrapper methods](mongoose-wrapper-methods.md), this allows you to easily create [custom endpoints](creating-endpoints.md#standalone-endpoints). You can see a description of these methods below:

### generateJoiReadModel
```javascript
/**
 * Generates a Joi object that validates a query result for a specific model
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiReadModel = function (model, Log) {...};
```

### generateJoiUpdateModel
```javascript
/**
 * Generates a Joi object that validates a query request payload for updating a document
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiUpdateModel = function (model, Log) {...};

```

### generateJoiCreateModel
```javascript
/**
 * Generates a Joi object that validates a request payload for creating a document
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiCreateModel = function (model, Log) {...};

```

### generateJoiListQueryModel
```javascript
/**
 * Generates a Joi object that validates a request query for the list function
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiListQueryModel = function (model, Log) {...};

```

### generateJoiFindQueryModel
```javascript
/**
 * Generates a Joi object that validates a request query for the find function
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiFindQueryModel = function (model, Log) {...};

```

### generateJoiFieldModel
```javascript
/**
 * Generates a Joi object for a model field
 * @param model: A mongoose model object
 * @param field: A model field
 * @param fieldName: The name of the field
 * @param modelType: The type of CRUD model being generated
 * @param Log: A logging object
 * @returns {*}: A Joi object
 */
generateJoiFieldModel = function (model, field, fieldName, modelType, Log) {...};

```

### generateJoiModelFromFieldType
```javascript
/**
 * Returns a Joi object based on the mongoose field type.
 * @param field: A field from a mongoose model.
 * @param Log: A logging object.
 * @returns {*}: A Joi object.
 */
generateJoiModelFromFieldType = function (field, Log) {...};

```

### joiObjectId
```javascript
/**
 * Provides easy access to the Joi ObjectId type.
 * @returns {*|{type}}
 */
joiObjectId = function () {...};

```

### isValidField
```javascript
/**
 * Checks to see if a field is a valid model property
 * @param fieldName: The name of the field
 * @param field: The field being checked
 * @param model: A mongoose model object
 * @returns {boolean}
 */
isValidField = function (fieldName, field, model) {...};
```
