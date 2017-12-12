# ![rest-hapi](https://cloud.githubusercontent.com/assets/12631935/22916311/9661cac6-f232-11e6-96d4-aea680c9042b.png)

A RESTful API generator for the [hapi](https://github.com/hapijs/hapi) framework utilizing the [mongoose](https://github.com/Automattic/mongoose) ODM.

[![Build Status](https://travis-ci.org/JKHeadley/rest-hapi.svg?branch=master)](https://travis-ci.org/JKHeadley/rest-hapi) [![npm](https://img.shields.io/npm/dt/rest-hapi.svg)](https://www.npmjs.com/package/rest-hapi) [![npm](https://img.shields.io/npm/v/rest-hapi.svg)](https://www.npmjs.com/package/rest-hapi)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/JKHeadley/rest-hapi)

rest-hapi is a hapi plugin intended to abstract the work involved in setting up API routes/validation/handlers/etc. for the purpose of rapid app development.  At the same time it provides a powerful combination of [relational](#associations) structure with [NoSQL](#creating-endpoints) flexibility.  You define your models and the rest is done for you.  Have your own API server up and running in minutes!

# **NOTE:** The [duplicate fields](#duplicate-fields) feature is now available with v0.37.0. Check it out!

## Features

* Automatic generation of [CRUD](#creating-endpoints) endpoints with [middleware](#middleware) support
* Automatic generation of [association](#associations) endpoints
* [joi](https://github.com/hapijs/joi) [validation](#validation)
* Route-level and document-level [authorization](#authorization)
* [Swagger docs](#swagger-documentation) for all generated endpoints via [hapi-swagger](https://github.com/glennjones/hapi-swagger)
* [Query parameter](#querying) support for searching, sorting, filtering, pagination, and embedding of associated models
* Endpoint activity history through [Audit Logs](#audit-logs)
* Support for [policies](#policies) via [mrhorse](https://github.com/mark-bradshaw/mrhorse)
* [Duplicate fields](#duplicate-fields)
* Support for ["soft" delete](#soft-delete)
* Optional [metadata](#metadata)
* Mongoose [wrapper methods](#mongoose-wrapper-methods)

## Live demos

View the swagger docs for the live demos:

appy: http://ec2-52-25-112-131.us-west-2.compute.amazonaws.com:8125

rest-hapi-demo: http://ec2-52-25-112-131.us-west-2.compute.amazonaws.com:8124

## Example Projects

[appy](https://github.com/JKHeadley/appy): A ready-to-go user system built on rest-hapi.

[rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo): A simple demo project implementing rest-hapi in a hapi server.

## Readme contents
- [Requirements](#requirements)
- [Installation](#installation)
- [First time setup/Demo](#first-time-setupdemo)
- [Using the plugin](#using-the-plugin)
- [Configuration](#configuration)
- [Swagger documentation](#swagger-documentation)
- [Creating endpoints](#creating-endpoints)
    * [Model endpoints](#model-endpoints)
    * [Standalone endpoints](#standalone-endpoints)
    * [Additional endpoints](#additional-endpoints)
    * [Error handling](#error-handling)
- [Associations](#associations)
    * [ONE_ONE](#one_one)
    * [ONE_MANY/MANY_ONE](#one_manymany_one)
    * [MANY_MANY](#many_many)
        - [MANY_MANY linking models](#many_many-linking-models)
        - [MANY_MANY data storage](#many_many-data-storage)
            * [Migrating MANY_MANY data](#migrating-many_many-data)
    * [\_MANY](#_many)
- [Route customization](#route-customization)
    * [Custom path names](#custom-path-names)
    * [Omitting routes](#omitting-routes)
- [Querying](#querying)
    * [Pagination](#pagination)
    * [Populate nested associations](#populate-nested-associations)
- [Duplicate fields](duplicate-fields)
    * [Basic example](#basic-example)
    * [Tracking duplicated fields](#tracking-duplicated-fields)
    * [Nested field name](#duplicate-field-options)
    * [Nested duplicate fields](#nested-duplicate-fields)
    * [Advantages](#advantages)
- [Validation](#validation)
    * [Route validation](#route-validation)
    * [Joi helper methods](#joi-helper-methods)
- [Middleware](#middleware)
    * [CRUD](#crud)
    * [Association](#association)
- [Authorization](#authorization)
    * [Route authorization](#route-authorization)
      - [Generating route scopes](#generating-route-scopes)
      - [Disabling route scopes](#disabling-route-scopes)
    * [Document authorization](#document-authorization)
- [Audit Logs](#audit-logs)
- [Policies](#policies)
    * [Generated endpoints](#generated-endpoints)
    * [Custom endpoints](#custom-endpoints)
    * [Policies vs middleware](#policies-vs-middleware)
    * [Example: custom authorization via policies](#example-custom-authorization-via-policies)
- [Mongoose wrapper methods](#mongoose-wrapper-methods)
- [Soft delete](#soft-delete)
- [Metadata](#metadata)
    * [Timestamps](#timestamps)
    * [User tags](#user-tags)
- [Model generation](#model-generation)
- [Testing](#testing)
- [License](#license)
- [Questions](#questions)
- [Support](#support)
- [Projects](#projects)
- [Contributing](#contributing)



## Requirements

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

[Back to top](#readme-contents)

## Installation

```
$ npm install rest-hapi
```

[Back to top](#readme-contents)

### First time setup/Demo
**WARNING**: This will clear all data in the following MongoDB collections (in the db defined in ``restHapi.config``, default ``mongodb://localhost/rest_hapi``) if they exist: ``users``, ``roles``.

If you would like to seed your database with some demo models/data, run:

```
$ ./node_modules/.bin/rest-hapi-cli seed
```

NOTE: The password for all seed users is ``1234``.

You can use these models as templates for your models or delete them later if you wish.

[Back to top](#readme-contents)

## Using the plugin

As rest-hapi is a hapi plugin, you'll need to set up a hapi server to generate API endpoints.  You'll also need to set up a [mongoose](https://github.com/Automattic/mongoose) instance and include it in the plugin's options when you register. Below is an example nodejs script ``api.js`` with the minimum requirements to set up an API with rest-hapi:

```javascript
'use strict';

let Hapi = require('hapi');
let mongoose = require('mongoose');
let restHapi = require('rest-hapi');

function api(){

    let server = new Hapi.Server();

    server.connection(restHapi.config.server.connection);

    server.register({
            register: restHapi,
            options: {
                mongoose: mongoose
            }
        },
        function() {
            server.start();
        });

    return server;
}

module.exports = api();
```
You can then run ``$ node api.js`` and point your browser to [http://localhost:8124/](http://localhost:8124/) to view the swagger docs (NOTE: API endpoints will only be generated if you have provided models. See [First time setup/Demo](#first-time-setupdemo) or [Creating endpoints](#creating-endpoints).)

[Back to top](#readme-contents)

## Configuration

Configuration of rest-hapi is handled through the ``restHapi.config`` object.  Below is a description of the current configuration options/properties.

```javascript
/**
 * config.js - Configuration settings for the generated API
 */
var config = {};
config.server = {};
config.mongo = {};

/**
 * Your app title goes here.
 * @type {string}
 */
config.appTitle = "rest-hapi API";

/**
 * Your app version goes here.
 * @type {string}
 */
config.version = '1.0.0';

/**
 * Flag signifying whether the absolute path to the models directory is provided
 * default: false
 * @type {boolean}
 */
config.absoluteModelPath = false;

/**
 * Path to the models directory
 * default: 'models'
 * @type {string}
 */
config.modelPath = 'models';

/**
 * Flag signifying whether the absolute path to the api directory is provided
 * @type {boolean}
 */
config.absoluteApiPath = false;

/**
 * Path to the directory for additional endpoints
 * default: 'api'
 * @type {string}
 */
config.apiPath = 'api';

/**
 * Cors settings for generated endpoints. Can be set to false to disable.
 * @type {{additionalHeaders: string[], additionalExposedHeaders: string[]}}
 */
config.cors =  {
    additionalHeaders: [],
    additionalExposedHeaders: []
};

/**
 * Mongo settings
 * - config.mongo.URI = 'mongodb://localhost/rest_hapi'; (local db, default)
 */
config.mongo.URI = 'mongodb://localhost/rest_hapi';

/**
 * Authentication strategy to be used for all generated endpoints.
 * Set to false for no authentication.
 * default: false
 * @type {boolean/string}
 */
config.authStrategy = false;

/**
 * If set to false, MANY_MANY associations (including linking model data) will be saved in their own collection in th db.  This is useful if a single document
 * will be associated with many other documents, which could cause the document size to become very large. For example,
 * a business might be associated with thousands of users.
 *
 * Embedding the associations will be more efficient for population/association queries but less efficient for memory/document size.
 *
 * This setting can be individually overwritten by setting the "embedAssociation" association property.
 * default: false
 * @type {boolean}
 */
config.embedAssociations = false;

/**
 * MetaData options:
 * - createdAt: (default: true) date specifying when the document was created.
 * - updatedAt: (default: true) date specifying when the document was last updated.
 * - deletedAt: (default: true) date specifying when the document was soft deleted.
 * - createdBy: (default: false) _id of user that created the document.
 * - updatedBy: (default: false) _id of user that last updated the document.
 * - updatedBy: (default: false) _id of user that soft deleted the document.
 */
config.enableCreatedAt = true;
config.enableUpdatedAt = true;
config.enableDeletedAt = true;
config.enableCreatedBy = false;
config.enableUpdatedBy = false;
config.enableDeletedBy = false;

/**
 * Enables fields from an associated model to be duplicated. Similar to permanently embedding an associated field within
 * the parent model schema. Useful if a parent model needs to be searchable or sortable by an association's field.
 * default: false
 * @type {boolean}
 */
config.enableDuplicateFields = false;

/**
 * When true, duplicated fields will update whenever the original field is updated.
 * WARNING: This feature can make updates very resource intensive if many documents are duplicating the original field.
 * default: false
 * @type {boolean}
 */
config.trackDuplicatedFields = false;

/**
 * When enabled, all create, update, associate, and delete events are recorded in an auditLog collection.
 * default: true
 * @type {boolean}
 */
config.enableAuditLog = true;

/**
 * Values added here will be applied to the scope of the auditLog endpoint.
 * default: []
 * @type {Array}
 */
config.auditLogScope = [];

/**
 * Specifies the TTL (time to live/lifetime/expiration) of auditLog documents. Accepts values in seconds unless specified
 * (Ex: 60 = 60 seconds, '1m' = 1 minute, or '1d' = 1 day)
 * See: http://nicoll.io/mongottl/
 * default: null (does not expire)
 * @type {string}
 */
config.auditLogTTL = null;

/**
 * Enables policies via mrhorse (https://github.com/mark-bradshaw/mrhorse).
 * default: false
 * @type {boolean}
 */
config.enablePolicies = false;

/**
 * Flag signifying whether the absolute path to the policies directory is provided.
 * default: false
 * @type {boolean}
 */
config.absolutePolicyPath = false;

/**
 * Path to the directory for mrhorse policies (https://github.com/mark-bradshaw/mrhorse).
 * default: 'policies'
 * @type {string}
 */
config.policyPath = 'policies';

/**
 * Enables document level authorization.
 * default: true
 * @type {boolean}
 */
config.enableDocumentScopes = true;

/**
 * If true, modifies the root scope of any document to allow access to the document's creator.
 * The scope value added is in the form: "user-{_id}" where "{_id}" is the _id of the user.
 * NOTE:
 * - This assumes that your authentication credentials (request.auth.credentials) will contain either
 * a "user" object with a "_id" property, or the user's _id stored in a property defined by "config.userIdKey".
 * - This also assumes that the user creating the document will have "user-{_id}" within their scope.
 * - Requires "config.enableDocumentScopes" to be "true".
 * - This setting can be individually overwritten by setting the "authorizeDocumentCreator" routeOptions property.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreator = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "readScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToRead = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "updateScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToUpdate = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "deleteScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToDelete = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "associateScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToAssociate = false;

/**
 * This is the path/key to the user _id stored in your request.auth.credentials object.
 * default: "user._id"
 * @type {string}
 */
config.userIdKey = "user._id";

/**
 * Determines what action takes place when one or more document scope checks fail for requests dealing with multiple
 * documents (Ex: deleteMany or list). Options are:
 * - true: if one or more documents fail, the request responds with a 403.
 * - false: documents that don't pass are simply removed from the request (Ex: not deleted or not retrieved)
 * default: false
 * @type {boolean}
 */
config.enableDocumentScopeFail = false;

/**
 * Flag specifying whether to text index all string fields for all models to enable text search.
 * WARNING: enabling this adds overhead to add inserts and updates, as well as added storage requirements.
 * default: false.
 * @type {boolean}
 */
config.enableTextSearch = false;

/**
 * Soft delete options
 * - enableSoftDelete: adds "isDeleted" property to each model. Delete endpoints set "isDeleted" to true
 * unless the payload contains { hardDelete: true }, in which case the document is actually deleted (default false)
 * - filterDeletedEmbeds: if enabled, associations with "isDeleted" set to true will not populate (default false)
 * NOTE: this option is known to be buggy
 * @type {boolean}
 */
config.enableSoftDelete = false;
config.filterDeletedEmbeds = false;

/**
 * Validation options:
 * default: true
 * @type {boolean}
 */
config.enableQueryValidation = true;
config.enablePayloadValidation = true;
config.enableResponseValidation = true;

/**
 * Determines the hapi failAction of each response. Options are:
 * - true: responses that fail validation will return a 500 error.
 * - false: responses that fail validation will just log the offense and send the response as-is.
 * default: false
 * @type {boolean}
 */
config.enableResponseFail = false;

/**
 * If set to true, (and authStrategy is not false) then endpoints will be generated with pre-defined
 * scopes based on the model definition.
 * default: false
 * @deprecated since v0.29.0, use "config.generateRouteScopes" instead
 * @type {boolean}
 */
config.generateScopes = false;

/**
 * If set to true, (and authStrategy is not false) then endpoints will be generated with pre-defined
 * scopes based on the model definition.
 * default: false
 * @type {boolean}
 */
config.generateRouteScopes = false;

/**
 * If set to true, the scope for each endpoint will be logged when then endpoint is generated.
 * default: false
 * @type {boolean}
 */
config.logScopes = false;

/**
 * If set to true, each route will be logged as it is generated.
 * default: false
 * @type {boolean}
 */
config.logRoutes = false;

/**
 * Log level options:
 * - INTERNAL use it for logging calls and other internal stuff
 * - DEBUG recommended to use it for debugging applications
 * - NOTE development verbose information (default)
 * - INFO minor information
 * - LOG significant messages
 * - WARNING really important stuff
 * - ERROR application business logic error condition
 * - FATAL system error condition
 */
config.loglevel = "DEBUG";

/**
 * Determines the initial expansion state of the swagger docs
 * - options: 'none', 'list', 'full' (default: 'none')
 * default: 'none'
 * @type {string}
 */
config.docExpansion = 'none';

module.exports = config;
```

[Back to top](#rest-hapi)

## Swagger documentation

Swagger documentation is automatically generated for all endpoints and can be viewed by pointing a browser
at the server URL.  By default this will be [http://localhost:8124/](http://localhost:8124/).  The swagger docs provide quick 
access to testing your endpoints along with model schema descriptions and query options.

[Back to top](#readme-contents)

## Creating endpoints

Creating endpoints with rest-hapi can be accomplished three different ways: generating endpoints based off of model definitions, defining standalone endpoints, and adding endpoints to a model.

### Model Endpoints
Restful endpoints are automatically generated based off of any mongoose models that you add to your ``models`` directory
with the file structure of ``{model name}.model.js``.  These models must adhere to the following format:

```javascript
'use strict';

module.exports = function (mongoose) {
    var Schema = new mongoose.Schema({
        /*fill in schema fields*/
    });

    Schema.statics = {
        collectionName: /*your model name*/,
        routeOptions: {}
    };

    return Schema;
};
```

As a concrete example, here is a ``user`` model:

``/models/user.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics = {
    collectionName: modelName,
    routeOptions: {}
  };
  
  return Schema;
};
```

This will generate the following CRUD endpoints:

```
DELETE /user        Delete multiple users
POST /user          Create one or more new users
GET /user           Get a list of users
DELETE /user/{_id}  Delete a user
GET /user/{_id}     Get a specific user
PUT /user/{_id}     Update a user
```

Association endpoints can also be generated based on model definitions, see the [Associations](#associations) section.

**NOTE:** If your ``models`` directory is not in your projects root directory, you will need to specify the path (relative to your projects root directory) by assigning the path to the ``config.modelPath`` property and you will need to set the ``config.absoluteModelPath`` property to ``true``.

[Back to top](#readme-contents)

### Standalone endpoints
Standalone endpoints can be generated by adding files to your ``api`` directory. The content of these files must adhere to the following format:

```javascript
'use strict';

module.exports = function (server, mongoose, logger) {
    /*register hapi endpoint here*/
};
```

As a concrete example, here is a ``hello-world`` endpoint that will show in the generated swagger docs:

``/api/hello.js``:

```javascript
'use strict';

module.exports = function (server, mongoose, logger) {
    server.route({
      method: 'GET',
      path: '/hello-world',
      config: {
        handler: function(request, reply) { reply("Hello World") },
        tags: ['api'],
        plugins: {
          'hapi-swagger': {}
        }
      }
    });
};
```

**NOTE:** If your ``api`` directory is not in your projects root directory, you will need to specify the path (relative to your projects root directory) by assigning the path to the ``config.apiPath`` property and you will need to set the ``config.absoluteApiPath`` property to ``true``.

[Back to top](#readme-contents)

### Additional endpoints
If endpoints beyond the generated CRUD endpoints are needed for a model, they can easily be added as an item in the ``routeOptions.extraEndpoints`` array.  The endpoint logic should be contained within a function using the footprint: ``function (server, model, options, Log)``. For example, if we wanted to add a ``Password Update`` endpoint to the ``user`` model, it could look like this:

```javascript
'use strict';

var Joi = require('joi');
var bcrypt = require('bcrypt');
var restHapi = require('rest-hapi');

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      extraEndpoints: [
        //Password Update Endpoint
        function (server, model, options, Log) {
          Log = Log.bind("Password Update");
          var Boom = require('boom');

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Password Update endpoint for " + collectionName);

          var handler = function (request, reply) {
            var hashedPassword = model.generatePasswordHash(request.payload.password);
            return restHapi.update(model, request.params._id, {password: hashedPassword}, Log).then(function (result) {
              if (result) {
                return reply("Password updated.").code(200);
              }
              else {
                return reply(Boom.notFound("No resource was found with that id."));
              }
            })
            .catch(function (error) {
              Log.error("error: ", error);
              return reply(Boom.badImplementation("An error occurred updating the resource.", error));
            });
          }

          server.route({
            method: 'PUT',
            path: '/user/{_id}/password',
            config: {
              handler: handler,
              auth: null,
              description: 'Update a user\'s password.',
              tags: ['api', 'User', 'Password'],
              validate: {
                params: {
                  _id: Joi.objectId().required()
                },
                payload: {
                  password: Joi.string().required()
                  .description('The user\'s new password')
                }
              },
              plugins: {
                'hapi-swagger': {
                  responseMessages: [
                    {code: 200, message: 'Success'},
                    {code: 400, message: 'Bad Request'},
                    {code: 404, message: 'Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                  ]
                }
              }
            }
          });
        }
      ]
    },
    
    generatePasswordHash: function(password) {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
      return hash;
    }
  };
  
  return Schema;
};

```

### Error handling
rest-hapi exposes an `errorHelper.formatResponse` method that can be helpful when handling errors with additional/standalone endpoints. This function handles [rest-hapi method](#mongoose-wrapper-methods) errors appropriately and always returns a [Boom](https://github.com/hapijs/boom) object. Consider the handler method below for an example:

```javascript
const deactivateAccountHandler = function (request, reply) {

        const _id = request.params._id;

        return RestHapi.update(User, _id, { isActive: false }, Log)
          .then(function (user) {
            return reply(user);
          })
          .catch(function (error) {
            Log.error(error);
            return reply(RestHapi.errorHelper.formatResponse(error));
          });
      };
```

[Back to top](#readme-contents)

## Associations

The rest-hapi framework supports model associations that mimic associations in a relational database.  This includes [one-one](#one_one), [one-many](#one_manymany_one), [many-one](#one_manymany_one), and [many-many](#many_many) relationships.  Associations are created by adding the relevant schema fields and populating the ``associations`` object within ``routeOptions``.  Associations exists as references to a document's ``_id`` field, and can be populated to return the associated object.  See [Querying](#querying) for more details on how to populate associations.

***Update: One sided [-many](#_many) relationships are available as of v0.19.0***

### ONE_ONE

Below is an example of a one-one relationship between a ``user`` model and a
``dog`` model. Notice the ``dog`` and ``owner`` fields in the schemas.  A schema
field is required for associations of type ``ONE_ONE`` or ``MANY_ONE``.  This
field must match the association name, include a type of ``ObjectId``, and
include a ``ref`` property with the associated model name.

Each association must be added to an ``associations`` object within the
``routeOptions`` object. The ``type`` and ``model`` fields are
required for all associations.

``/models/user.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    },
    dog: {
      type: Types.ObjectId,
      ref: "dog"
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        dog: {
          type: "ONE_ONE",
          model: "dog"
        }
      }
    }
  };
  
  return Schema;
};
```

``/models/dog.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "dog";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    breed: {
      type: Types.String
    },
    owner: {
      type: Types.ObjectId,
      ref: "user"
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        owner: {
          type: "ONE_ONE",
          model: "user"
        }
      }
    }
  };

  return Schema;
};
```

### ONE_MANY/MANY_ONE

Below is an example of a one-many/many-one relationship between the ``user``
and ``role`` models.  Notice the ``title`` field in the schema.  A schema
field is required for associations of type ``ONE_ONE`` or ``MANY_ONE``.  This
field must match the association name, include a type of ``ObjectId``, and
include a ``ref`` property with the associated model name.

``/models/user.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    },
    title: {
      type: Types.ObjectId,
      ref: "role"
    }

  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        title: {
          type: "MANY_ONE",
          model: "role"
        }
      }
    }
  };
  
  return Schema;
};
```

``/models/role.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true,
      enum: ["Account", "Admin", "SuperAdmin"]
    },
    description: {
      type: Types.String
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "ONE_MANY",
          foreignField: "title",
          model: "user"
        }
      }
    }
  };

  return Schema;
};
```

In this example, a user can belong to one role and a role can be 
assigned to many users.  The ``type`` and ``model`` fields are
required for all associations, and the ``foreignField`` field is 
required for ``ONE_MANY`` type associations.  

Along with the normal CRUD endpoints, the following association 
endpoints will be generated for the ``role`` model:

```
GET /role/{ownerId}/user                Get all of the users for a role
POST /role/{ownerId}/user               Add multiple users to a role
DELETE /role/{ownerId}/user             Remove multiple users from a role's list of users
PUT /role/{ownerId}/user/{childId}      Add a single user object to a role's list of users
DELETE /role/{ownerId}/user/{childId}   Remove a single user object from a role's list of users
```

### MANY_MANY

Below is an example of a many-many relationship between the ``user`` and
``group`` models. In this relationship a single ``user`` instance can belong
to multiple ``group`` instances and vice versa.

``/models/user.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        groups: {
          type: "MANY_MANY",
          model: "group"
        }
      }
    }
  };
  
  return Schema;
};
```


``/models/group.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "group";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true,
    },
    description: {
      type: Types.String
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "MANY_MANY",
          model: "user"
        }
      }
    }
  };

  return Schema;
};
```


Along with the normal CRUD endpoints, the following association 
endpoints will be generated for the ``user`` model:

```
GET /user/{ownerId}/group               Get all of the groups for a user
POST /user/{ownerId}/group              Add multiple groups for a user
DELETE /user/{ownerId}/group            Remove multiple groups from a user's list of groups
PUT /user/{ownerId}/group/{childId}     Add a single group object to a user's list of groups
DELETE /user/{ownerId}/group/{childId}  Remove a single group object from a user's list of groups
```

and for the ``group`` model:

```
GET /group/{ownerId}/user               Get all of the users for a group
POST /group/{ownerId}/user              Add multiple users for a group
DELETE /group/{ownerId}/user            Remove multiple users from a group's list of users
PUT /group/{ownerId}/user/{childId}     Add a single user object to a group's list of users
DELETE /group/{ownerId}/user/{childId}  Remove a single user object from a group's list of users
```

#### MANY_MANY linking models

Many-many relationships can include extra fields that contain data specific
to each association instance.  This is accomplished through linking models which
behave similar to junction tables in a relational database.  Linking model files are
stored in the ``/models/linking-models`` directory and follow the same 
``{model name}.model.js`` format as normal models.  Below is an example of a many-many
relationship between the ``user`` model and itself through the ``friends`` association.
The extra field ``friendsSince`` could contain a date representing how long the two
associated users have known each other.  This example also displays how models can contain a 
reference to themselves.  

**NOTE:** The linking model filename does not have to match the model name, however the ``linkingModel``
association property **must** match the linking model ``modleName`` property.


``/models/user.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        friends: {
          type: "MANY_MANY",
          model: "user",
          alias: "friend",
          linkingModel: "user_user"
        }
      }
    }
  };
  
  return Schema;
};
```


``/models/linking-models/user_user.model.js``:

```javascript
'use strict';

var mongoose = require("mongoose");

module.exports = function () {

  var Types = mongoose.Schema.Types;

  var Model = {
    Schema: {
      friendsSince: {
        type: Types.Date
      }
    },
    modelName: "user_user"
  };

  return Model;
};
```

#### MANY_MANY data storage

By nature every new instance of a MANY_MANY association adds new data to the database. At minimum this data must contain the `\_id`s of the associated documents, but this can be extended to include extra fields through a [linking model](#many_many-linking-models). rest-hapi provides two options as to how this data is stored in the db (controlled by the `config.embedAssociations` property):

- `config.embedAssociations`: true
    * The data is embeded as an array property within the related documents.
    * Pros:
        - The data is easy to access and quick to read from the db (theoretically, not proven).
        - Fewer collections in the db.
        - The association data is more human readable.
    * Cons:
        - Linking model data is duplicated for each related document.
        - Exists as an array that grows without bound, which is a [MonboDB anti-pattern](https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/)
- `config.embedAssociations`: false (default)
    * The data is stored in an auto-generated linking collection.
    * Pros:
        - Data is offloaded to the linking collections, leaving the associated documents smaller and less cluttered.
        - Prevents unbounded arrays and takes full advantage of [mongoose virtual references](http://thecodebarbarian.com/mongoose-virtual-populate)
        - Linking model data isn't duplicated.
    * Cons:
        - Reading data is slower (theoretically, not proven).
        - Less human readable.
        
The `config.embedAssociations` can be overwritten for individual associations through the `embedAssociation` property. See the example below:

```javascript
'use strict';

module.exports = function (mongoose) {
    var modelName = "group";
    var Types = mongoose.Schema.Types;
    var Schema = new mongoose.Schema({
        name: {
            type: Types.String,
            required: true,
            unique: true
        },
        description: {
            type: Types.String
        }
    }, { collection: modelName });

    Schema.statics = {
        collectionName: modelName,
        routeOptions: {
            associations: {
                users: {
                    type: "MANY_MANY",
                    alias: "user",
                    model: "user",
                    embedAssociation: true              //<-----overrides the config.embedAssociations property
                }
            }
        }
    };

    return Schema;
};
```
```javascript
'use strict';

module.exports = function (mongoose) {
    var modelName = "user";
    var Types = mongoose.Schema.Types;
    var Schema = new mongoose.Schema({
        name: {
            type: Types.String,
            required: true
        }
    }, { collection: modelName });

    Schema.statics = {
        collectionName: modelName,
        routeOptions: {
            associations: {
                groups: {
                    type: "MANY_MANY",
                    alias: "group",
                    model: "group",
                    embedAssociation: true              //<-----overrides the config.embedAssociations property
                }
            }
        }
    };

    return Schema;
};
```

**NOTE:** If the `embedAssociation` property is set, then it must be set to the same value for both association definitions as seen above.

##### Migrating MANY_MANY data

As of v0.28.0 the rest-hapi cli includes an `update-associations` command that can migrate your db data to match your desired MANY_MANY structure. This command follows the following format:

`$ ./node_modules/.bin/rest-hapi-cli update-associations mongoURI [embedAssociations] [modelPath]`

where:

- `mongoURI`: The URI to you mongodb database
- `embedAssociations`: (optional, defaults to `false`) This must match your current `config.embedAssociations` value.
- `modelPath`: (optional, defaults to `models`) This must match your `config.modelPath` value if you have `config.absoluteModelPath` set to `true`.

This is useful if you have a db populated with documents and you decide to change the `embedAssociaion` property of one or more associations. 

For instance, consider a MANY_MANY relationship between `user` (groups) and `group`  (users) with `config.embedAssociations` set to `true`. Each `user` document will contain the array `groups` and each `group` document will contain the array `users`. Lets say you implement this structure in a project, but several months into the project some of your `group` documents have collected thousands of `users`, resulting in very large document sizes. You decide it would be better to migrate the data out of the parent documents and into a linking collection, `user_group`. You can do this by setting the `embedAssociation` property for `users` and `groups` to `false`, and running the following command:

`$ ./node_modules/.bin/rest-hapi-cli update-associations mongodb://localhost:27017/mydb true`

### \_MANY

A one-sided -many relationship can exists between two models. This allows the parent model to have direct control over the reference Ids. Below is an example of a -many relationship between the ``post`` and ``hashtag`` models. 

``/models/post.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "post";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    caption: {
      type: Types.String
    }
    user: {
      type: Types.ObjectId,
      ref: "user",
      required: true
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        hashtags: {
          type: "_MANY",
          model: "hashtag"
        },
        user: {
          type: "MANY_ONE",
          model: "user"
        }
      }
    }
  };
  
  return Schema;
};
```

In this example, a ``post`` contains many hashtags, but the ``hashtag`` model will have no association with the ``post`` model. 

Similar to one-many or many-many relationships the following association 
endpoints will be generated for the ``post`` model:

```
GET /post/{ownerId}/hashtag                Get all of the hashtags for a post
POST /post/{ownerId}/hashtag               Add multiple hashtags to a post
DELETE /post/{ownerId}/hashtag             Remove multiple hashtags from a post's list of hashtags
PUT /post/{ownerId}/hashtag/{childId}      Add a single hashtag object to a post's list of hashtags
DELETE /post/{ownerId}/hashtag/{childId}   Remove a single hashtag object from a post's list of hashtags
```

However, unlike a one-many or many-many relationship, the -many relationship will exist as a mutable model property which is simply an array of objectIds. This means the associations can be directly modified through the parent model ``create`` and         ``update`` endpoints. For example, the following json could be used as a payload for either the ``POST /post`` or ``PUT /post/{_id}`` endpoints:

```javascript
{
  "caption": "Having a great day!",
  "user":"59960dce22a535c8edfa1317",
  "hashtags": [
    "59960dce22a535c8edfa132d",
    "59960dce22a535c8edfa132e"
  ]
}
```

[Back to top](#readme-contents)

## Route customization

### Custom path names
By default route paths are constructed using model names, however aliases can be provided to customize the route paths.
``routeOptions.alias`` can be set to alter the base path name, and an ``alias`` property for an association can be set 
to alter the association path name.  For example:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics = {
    collectionName: modelName
    routeOptions: {
      alias: "person"
      associations: {
        groups: {
          type: "MANY_MANY",
          model: "group",
          alias: "team"
        }
      }
    }
  };
  
  return Schema;
};
```

will result in the following endpoints:

```
DELETE /person 
POST /person 
GET /person 
DELETE /person/{_id} 
GET /person/{_id} 
PUT /person/{_id}
GET /person/{ownerId}/team 
DELETE /person/{ownerId}/team 
POST /person/{ownerId}/team 
DELETE /person/{ownerId}/team/{childId} 
PUT /person/{ownerId}/team/{childId} 
```

### Omitting routes

You can prevent CRUD endpoints from generating by setting the correct property to ``false`` within the ``routeOptions`` object. Below is a list of properties and their effect:

Property | Effect when false
--- | --- 
allowRead    |      omits ``GET /path`` and ``GET /path/{_id}`` endpoints
allowCreate  |      omits ``POST /path`` endpoint
allowUpdate  |      omits ``PUT /path/{_id}`` endpoint
allowDelete  |      omits ``DELETE /path`` and ``DELETE /path/{_id}`` endpoints

Similarly, you can prevent association endpoints from generating through the following properties within each association object:

Property | Effect when false
--- | --- 
allowAdd     |      omits ``POST /owner/{ownerId}/child`` and ``PUT /owner/{ownerId}/child/{childId}`` endpoints
allowRemove  |      omits ``DELETE /owner/{ownerId}/child`` and ``ELETE /owner/{ownerId}/child/{childId}`` endpoints
allowRead    |      omits ``GET /owner/{ownerId}/child`` endpoint

For example, a routeOption object that omits endpoints for creating objects and removing a specific association could look like this:

```javascript
routeOptions: {
    allowCreate: false,
    associations: {
        users: {
            type: "MANY_ONE",
            alias: "user",
            model: "user",
            allowRemove: false
        }
    }
}
```

[Back to top](#readme-contents)

## Querying

Query parameters can be added to GET requests to filter responses.  These parameters
are structured and function similar to mongoose queries.  Below is a list of currently 
supported parameters:

* $skip
    - The number of records to skip in the database. This is typically used in pagination.
    
* $page
    - The number of records to skip based on the $limit parameter. This is typically used in pagination.

* $limit
    - The maximum number of records to return. This is typically used in pagination.
    
* $select
    - A list of basic fields to be included in each resource.

* $sort
    - A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending '-' indicates descending. The default sort direction is 'ascending' (lowest value to highest value). Listing multiple fields prioritizes the sort starting with the first field listed. 

* $text
    - A full text search parameter. Takes advantage of indexes for efficient searching. Also implements stemming with   searches. Prefixing search terms with a "-" will exclude results that match that term.
    
* $term
    - A regex search parameter. Slower than $text search but supports partial matches and doesn't require indexing. This can be refined using the $searchFields parameter.
    
* $searchFields
    - A set of fields to apply the $term search parameter to. If this parameter is not included, the $term search parameter is applied to all searchable fields.

* $embed
    - A set of associations to populate. 
    
* $flatten
    - Set to true to flatten embedded arrays, i.e. remove linking-model data.
    
* $count
    - If set to true, only a count of the query results will be returned.

* $where
    - An optional field for raw mongoose queries.

* (field "where" queries)
    - Ex: ``/user?email=test@user.com``
    
Query parameters can either be passed in as a single string, or an array of strings.

### Pagination
For any GET query that returns multiple documents, pagination data is returned alongside the documents. The response object has the form:

- docs - an array of documents.
- pages - an object where:
    * current - a number indicating the current page.
    * prev - a number indicating the previous page.
    * hasPrev - a boolean indicating if there is a previous page.
    * next - a number indicating the next page.
    * hasNext - a boolean indicating if there is a next page.
    * total - a number indicating the total number of pages.
- items - an object where:
    * limit - a number indicating the how many results should be returned.
    * begin - a number indicating what item number the results begin with.
    * end - a number indicating what item number the results end with.
    * total - a number indicating the total number of matching results.

**NOTE:** Pagination format borrowed from mongo-models [pagedFind](https://github.com/jedireza/mongo-models/blob/master/API.md#pagedfindfilter-fields-sort-limit-page-callback).

### Populate nested associations
Associations can be populated through the ``$embed`` parameter.  To populate nested associations,
simply chain a parameter with ``.``.  For example, consider the MANY_MANY group-user association
from the example above.  If we populate the users of a group with ``/group?$embed=users`` we might get a 
response like so:

```json
{
    "_id": "58155f1a071468d3bda0fc6e",
    "name": "A-team",
    "users": [
      {
        "user": {
          "_id": "580fc1a0e2d3308609470bc6",
          "email": "test@user.com",
          "title": "580fc1e2e2d3308609470bc8"
        },
        "_id": "58155f6a071468d3bda0fc6f"
      },
      {
        "user": {
          "_id": "5813ad3d0d4e5c822d2f05bd",
          "email": "test2@user.com",
          "title": "580fc1eee2d3308609470bc9"
        },
        "_id": "58155f6a071468d3bda0fc71"
      }
    ]
}
```

However we can further populate each user's ``title`` field with a nested ``$embed``
parameter: ``/group?$embed=users.title`` which could result in the following response:

```json
{
    "_id": "58155f1a071468d3bda0fc6e",
    "name": "A-team",
    "users": [
      {
        "user": {
          "_id": "580fc1a0e2d3308609470bc6",
          "email": "test@user.com",
          "title": {
            "_id": "580fc1e2e2d3308609470bc8",
            "name": "Admin"
          }
        },
        "_id": "58155f6a071468d3bda0fc6f"
      },
      {
        "user": {
          "_id": "5813ad3d0d4e5c822d2f05bd",
          "email": "test2@user.com",
          "title": {
            "_id": "580fc1eee2d3308609470bc9",
            "name": "SuperAdmin"
          }
        },
        "_id": "58155f6a071468d3bda0fc71"
      }
    ]
}
```

[Back to top](#readme-contents)

## Duplicate fields
"Duplicate fields" is a rest-hapi feature that allows fields from an associated document to exist in the parent document while maintaining the original field value. This can be accomplished by setting `config.enableDuplicateFields` to `true` and adding the `duplicate` property to an association definition. 

### Basic example
In the code below, the `name` field of the role model will be duplicated in the user model:

`role.model.js`
```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        users: {
          type: "ONE_MANY",
          alias: "user",
          foreignField: "role",
          model: "user"
        }
      }
    }
  };

  return Schema;
};

```

`user.model.js`
```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      unique: true
    },
    role: {
      type: Types.ObjectId,
      ref: "role"
    }
  }, { collection: modelName });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role",
          duplicate: ['name']                <--- list duplicate fields
        }
      }
    }
  };
  
  return Schema;
};

```

**NOTE:** Only associations of type `MANY_ONE` and `ONE_ONE` can have the `duplicate` property.

Given these model definitions, lets say we have the following role documents:

```javascript
    {
      "_id": "59efe15e20905150d340b56a",
      "name": "User",
      "description": "A standard user account."
    },
    {
      "_id": "59efe15e20905150d340b56b",
      "name": "Admin",
      "description": "A user with advanced permissions."
    },
```

Now lets create a user document and assign it to the `User` role with the following payload:

```javascript
   { 
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b56a"
   }
```

Finally, when we retrieve the user document with a GET, we should recieve an object similar to the one below:

```javascript
   { 
      "_id": "59efe15e20905150d340b56c"
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b56a",
      "roleName": "User"
   }
```

Note that we did not have to manually embed the `roleName` property.  It was automatically populated when the user was created due to the `duplicate` property in the user-role association definition.

Lets say we decide to promote the user to the `Admin` role by updating the user document with the following payload:
```javascript
   {
      "role": "59efe15e20905150d340b56b"
   }
```

Now when we retrieve the user document, we will see:

```javascript
   { 
      "_id": "59efe15e20905150d340b56c"
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b56b",
      "roleName": "Admin"
   }
```

The `roleName` duplicate field was automatically updated to reflect the association change!

## Tracking duplicated fields
In the above example, we showed how the `roleName` duplicate field could automatically update when the user's `role` property changed. However what if the associated role document's `name` property was updated? By default, the user's `roleName` property will remain the same even if the original field value changes. However, by setting `config.trackDuplicatedFields` to `true`, rest-hapi will track changes from the original field and update **_ALL_** associated duplicate fields. For example, if we have the following user documents:


```javascript
    {
      "_id": "59efe15e20905150d340b56d",
      "email": "test@admin1.com",
      "role": "59efe15e20905150d340b56b",
      "roleName": "Admin"
    },
    {
      "_id": "59efe15e20905150d340b56e",
      "email": "test@admin2.com",
      "role": "59efe15e20905150d340b56b",
      "roleName": "Admin"
    }
```

and we update the associated role document to be:

```javascript
    {
      "_id": "59efe15e20905150d340b56b",
      "name": "SuperUser",
      "description": "A user with advanced permissions."
    }
```

if `config.trackDuplicatedFields` is set to `true`, then the user documents will now look like:

```javascript
    {
      "_id": "59efe15e20905150d340b56d",
      "email": "test@admin1.com",
      "role": "59efe15e20905150d340b56b",
      "roleName": "SuperUser"
    },
    {
      "_id": "59efe15e20905150d340b56e",
      "email": "test@admin2.com",
      "role": "59efe15e20905150d340b56b",
      "roleName": "SuperUser"
    }
```

This of course can be very useful, as all duplicated fields will stay up-to-date regardless of which end is updated. However this can also be resource intensive if not planned carefully. For instance, if 1 million user docs are associated with the `Admin` role, then 1 million extra documents will be updated whenever the `name` field of the role document is updated.

### Custom field name
As shown in the example above, duplicate field names have a default form of [association name] + [original field name] (Ex: `roleName`).  If we want to customize the duplicate field name, we can assign an array of objects to the `duplicate` property rather than an array of strings.  For example, given the user model's association definition below:

```javascript
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role",
          duplicate: [{
            field: 'name',
            as' title'
          }]
        }
      }
```

the user object from the previous example would have the form:

```javascript
   { 
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b56e",
      "title": "User"
   }
```

### Nested duplicate fields
One interesting property of duplicate fields is that they themselves can be duplicating a duplicate field. For an example, consider the `user`, `role`, and `business` models below:


`business.model.js`
```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "business";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        roles: {
          type: "ONE_MANY",
          alias: "role",
          foreignField: "business",
          model: "role"
        }
      }
    }
  };

  return Schema;
};

```

`role.model.js`
```javascript'use strict';

module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    },
    business: {
      type: Types.ObjectId,
      ref: "business"
    },
    businessName: {
      type: Types.String
    }
  }, { collection: modelName });
    
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        business: {
          type: "MANY_ONE",
          model: "business",
          duplicate: 'name'
        },
        users: {
          type: "ONE_MANY",
          alias: "user",
          foreignField: "role",
          model: "user"
        }
      }
    }
  };

  return Schema;
};

```

`user.model.js`
```javascript'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      unique: true
    },
    role: {
      type: Types.ObjectId,
      ref: "role"
    }
  }, { collection: modelName });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role",
          duplicate: [{
            field: 'name'
          },{
            field: 'businessName',
            as: 'company'
          }]
        }
      }
    }
  };
  
  return Schema;
};
```

Given the relationships between these models, a set of associated documents might look like this:

`business document`:
```javascript
    {
      "_id": "59efe15e20905150d340b57a",
      "name": "Test Business",
      "about": "A business for testing."
    }
```

`role document`:
```javascript
   { 
      "_id": "59efe15e20905150d340b57b"
      "name": "User", 
      "business": "59efe15e20905150d340b57a",
      "businessName": "Test Business",
      "description": "A standard user account.",
   }
```

`user document`:
```javascript
   { 
      "_id": "59efe15e20905150d340b56c"
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b57b",
      "roleName": "User",
      "company": "Test Business"
   }
```

As you can see, the value for the user document's duplicate field `company` can be traced back to the `name` field for the business document. If `config.trackDuplicatedFields` is set to `true`, then updating the original `name` field will cause both the role's `businessName` field and the user's `company` fields to update as well.

**NOTE:** If a duplicate field references another duplicate field, then the referenced field must exist in the model schema.  See the `businessName` field of the `role` model above.

### Advantages
The duplicate fields feature may seem trivial or redundant considering the same information can be included in a GET request using the [$embed](populate-nested-associations) query parameter, however duplicate fields come with some powerful advantages. Probably the most clear advantage is the potential for improving the readability of a document. In situations where querying for the association is not ideal or possible (Ex: observing the document within MongoDB), it is much easier to discern information about the document. For example:

`doc1`:
```javascript
   { 
      "_id": "59efe15e20905150d340b56c"
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b56b"
   }
```
vs

`doc2`:
```javascript
   { 
      "_id": "59efe15e20905150d340b56c"
      "email": "test@user.com", 
      "role": "59efe15e20905150d340b56b",
      "roleName": "Admin"
   }
```
In the second object it is immediately obvious which role the user is associated with.

While this is useful, arguably the biggest advantage duplicate fields provide is the improved querying. For example, in `doc1` above, the document can be filtered by the role \_id (Ex: GET /user?role=59efe15e20905150d340b56b ), but thats as far as it goes when it comes to querying users based on their role information.  However with `doc2`, the user can be filtered by its role name(Ex: GET /user?roleName=Admin ) sorted by its role name (Ex: GET /user?$sort=roleName ), or even be text searchable by its role name (Ex: GET /user?$term=Admin ).

[Back to top](#readme-contents)

## Validation
### Route validation
Validation in the rest-hapi framework is implemented with [joi](https://github.com/hapijs/joi).  
This includes validation of headers, query parameters, payloads, and responses.  joi validation models
are based primarily off of each model's field properties.  Below is a list of mongoose schema types 
and their joi equivalent within rest-hapi:

Schema Type | joi Validation
--- | --- 
ObjectId    |      Joi.objectId() (via [joi-objectid](https://www.npmjs.com/package/joi-objectid))
Boolean     |      Joi.bool()
Number      |      Joi.number()
Date        |      Joi.date()
String      |      Joi.string()
types       |      Joi.any()

Fields of type ``String`` can include further validation restrictions based on additional field properties as shown below:

Field Property | joi Validation
--- | ---
enum: [items] | Joi.any().only([items])
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

### Joi Helper Methods
rest-hapi exposes the helper methods it uses to generate Joi models through the `joiHelper` property. Combined with the exposed [mongoose wrapper methods](#mongoose-wrapper-methods), this allows you to easily create [custom endpoints](#standalone-endpoints). You can see a description of these methods below:

```javascript
/**
 * Generates a Joi object that validates a query result for a specific model
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiReadModel = function (model, Log) {...};

/**
 * Generates a Joi object that validates a query request payload for updating a document
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiUpdateModel = function (model, Log) {...};

/**
 * Generates a Joi object that validates a request payload for creating a document
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiCreateModel = function (model, Log) {...};

/**
 * Generates a Joi object that validates a request query for the list function
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiListQueryModel = function (model, Log) {...};

/**
 * Generates a Joi object that validates a request query for the find function
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiFindQueryModel = function (model, Log) {...};

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

/**
 * Returns a Joi object based on the mongoose field type.
 * @param field: A field from a mongoose model.
 * @param Log: A logging object.
 * @returns {*}: A Joi object.
 */
generateJoiModelFromFieldType = function (field, Log) {...};

/**
 * Provides easy access to the Joi ObjectId type.
 * @returns {*|{type}}
 */
joiObjectId = function () {...};

/**
 * Checks to see if a field is a valid model property
 * @param fieldName: The name of the field
 * @param field: The field being checked
 * @param model: A mongoose model object
 * @returns {boolean}
 */
isValidField = function (fieldName, field, model) {...};
```

[Back to top](#readme-contents)

## Middleware
### CRUD
Models can support middleware functions for CRUD operations. These exist under the ``routeOptions`` object. The following middleware functions are available:

* list:
    - pre(query, request, Log)
        * returns: `query`
    - post(request, result, Log)
        * returns: `result`
* find:
    - pre(\_id, query, request, Log)
        * returns: `query`
    - post(request, result, Log)
        * returns: `result`
* create:
    - pre(payload, request, Log) 
        * **NOTE:** _For payloads with multiple documents, the pre function will be called for each document individually (passed in through the `payload` parameter) i.e. `request.payload` = array of documents, `payload` = single document_
        * returns: `payload`
    - post(document, request, result, Log)
        * returns: `result`
* update:
    - pre(\_id, payload, request, Log)
        * returns: `payload`
    - post(request, result, Log)
        * returns: `result`
* delete:
    - pre(\_id, hardDelete, request, Log)
        * returns: `null`
    - post(hardDelete, deleted, request, Log)
        * returns: `null`

For example, a ``create: pre`` function can be defined to encrypt a users password
using a static method ``generatePasswordHash``.

```javascript
'use strict';

var bcrypt = require('bcrypt');

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      create: {
        pre: function (payload, request, Log) {
          var hashedPassword = mongoose.model('user').generatePasswordHash(payload.password);

          payload.password = hashedPassword;
          
          return payload;
        }
      }
    },

    generatePasswordHash: function(password) {
      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync(password, salt);
      return hash;
    }
  };

  return Schema;
};
```

Custom errors can be returned in middleware functions simply by throwing the error message as a string.  This will result in a 400 error response with your custom message. Ex:

```javascript
      create: {
        pre: function (payload, request, Log) {
          throw "TEST ERROR"
        }
      }
```

will result in a response body of:

```javascript
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "TEST ERROR"
}
```

### Association
Support is being added for association middlware. Currently the following association middleware exist:

* getAll:
    - post(request, result, Log)
        * returns: result
* add:
   - pre(request, payload, Log)
        * returns: payload
    
Association middleware is defined similar to CRUD middleware, with the only difference being the association name must be specified.  See below for an example:

```javascript
        routeOptions: {
          associations: {
            groups: {
              type: "MANY_MANY",
              model: "group"
            }
          }
        },
        getAll: {
          groups: {                                 //<---this must match the association name
            post: function(request, result, Log) {
              /** modify and return result **/
            }
          }
        }
```

[Back to top](#readme-contents)

## Authorization
### Route authorization
rest-hapi takes advantage of the ``scope`` property within the ``auth`` route config object of a hapi endpoint. When a request is made, an endpoint's scope (if it is populated) is compared to the user's scope (stored in `request.auth.credentials.scope`) to determine if the requesting user is authorized to access the endpoint. Below is an quote from the hapi docs describing scopes in more detail:

> scope - the application scope required to access the route. Value can be a scope string or an array of scope strings. The authenticated credentials object scope property must contain at least one of the scopes defined to access the route. If a scope string begins with a + character, that scope is required. If a scope string begins with a ! character, that scope is forbidden. For example, the scope ['!a', '+b', 'c', 'd'] means the incoming request credentials' scope must not include 'a', must include 'b', and must include one of 'c' or 'd'. You may also access properties on the request object (query and params) to populate a dynamic scope by using {} characters around the property name, such as 'user-{params.id}'. Defaults to false (no scope requirements).

In rest-hapi, each generated endpoint has its ``scope`` property set based on model properties within the ``routeOptions.routeScope`` object. There are three types of scopes that can be set: a root scope property, action scope properties, and association scope properties. A description of these can be seen below.

**NOTE:** As of v0.29.0 `routeOptions.scope` and `routeOptions.scope.scope` have been deprecated and replaced with `routeOptions.routeScope` and `routeOptions.routeScope.rootScope`

The first type of scope is a ``rootScope`` property that, when set, is applied to all generated endpoints for that model. 

The second is an action specific scope property that only applies to endpoints corresponding with the action. A list of these action scope properties can be seen below:

* ``createScope``: value is added to the scope of any endpoint that creates model documents 
* ``readScope``: value is added to the scope of any endpoint that retrieves documents and can be queried against
* ``updateScope``: value is added to the scope of any endpoint that directly updates documents
* ``deleteScope``: value is added to the scope of any endpoint that deletes documents
* ``associateScope``: value is added to the scope of any endpoint that modifies an association

The third type of scope is property that relates to a specific association action, with an action prefix of ``add``, ``remove``, or ``get``.  These scope properties are specific to the associations defined in the model and take the form of:

-{action}{modelName}{associationName}Scope

In the example below, users with the ``Admin`` scope in their authentication credentials can access all of the generated endpoints for the user model, users with the ``User`` scope are granted read access for the user model, and users with the ``Project Lead`` scope are capable of adding group associations to a user document.

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      required: true,
      unique: true
    },
    password: {
      type: Types.String,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics = {
    collectionName: modelName
    routeOptions: {
      routeScope: {
        rootScope: "Admin",
        readScope: "User",
        addUserGroupsScope: "Project Lead"
      },
      associations: {
        groups: {
          type: "MANY_MANY",
          model: "group",
          alias: "team"
        }
      }
    }
  };
  
  return Schema;
};r
```

**NOTE:** Use of route scope properties requires that an authentication strategy be defined and implemented. If the ``config.authStrategy`` property is set to ``false``, then no route scopes will be applied, even if they are defined in the model.  For an example of route scopes in action, check out [appy](https://github.com/JKHeadley/appy):

#### Generating route scopes
If the ``config.generateRouteScopes`` property is set to true, then generated endpoints will come pre-defined with scope values.  These values will exist in addition to any route scope values defined in the ``routeOptions.routeScope`` object. For instance, the tables below show two possibilities for the user model scope: the first is with no model route scope defined, and the second is with a model route scope defined as in the example above.

##### Without Model Route Scope Defined

Endpoint | Scope
--- | ---
DELETE /user | [ 'root', '!-root', 'user', '!-user', 'delete', '!-delete', 'deleteUser', '!-deleteUser' ]
POST /user | [ 'root', '!-root', 'user', '!-user', 'create', '!-create', 'createUser', '!-createUser' ]
GET /user | [ 'root', '!-root', 'user', '!-user', 'read', '!-read', 'readUser', !-'readUser' ]
DELETE /user/{\_id} | [ 'root', '!-root', 'user', '!-user', 'delete', '!-delete', 'deleteUser', '!-deleteUser' ]
GET /user/{\_id} | [ 'root', '!-root', 'user', '!-user', 'read', '!-read', 'readUser', '!-readUser' ]
PUT /user/{\_id} | [ 'root', '!-root', 'user', '!-user', 'update' '!-update', 'updateUser', '!-updateUser' ]
GET /user/{ownerId}/group | [ 'root', '!-root', 'user', '!-user', 'read', '!-read', 'readUser', '!-readUser', 'getUserGroups', '!-getUserGroups' ]
POST /user/{ownerId}/group | [ 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'addUserGroups', '!-addUserGroups' ]
DELETE /user/{ownerId}/group | [ 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'removeUserGroups', '!-removeUserGroups' ]
PUT /user/{ownerId}/group/{childId} | [ 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'addUserGroups', '!-addUserGroups' ]
DELETE /user/{ownerId}/group/{childId} | [ 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'removeUserGroups', '!-removeUserGroups' ]

##### With Model Route Scope Defined

Endpoint | Scope
--- | ---
DELETE /user | [ 'Admin', 'root', '!-root', 'user', '!-user', 'delete', '!-delete', 'deleteUser', '!-deleteUser' ]
POST /user | [ 'Admin', 'root', '!-root', 'user', '!-user', 'create', '!-create', 'createUser', '!-createUser' ]
GET /user | [ 'Admin', 'User', 'root', '!-root', 'user', '!-user', 'read', '!-read', 'readUser', !-'readUser' ]
DELETE /user/{\_id} | [ 'Admin', 'root', '!-root', 'user', '!-user', 'delete', '!-delete', 'deleteUser', '!-deleteUser' ]
GET /user/{\_id} | [ 'Admin', 'User', 'root', '!-root', 'user', '!-user', 'read', '!-read', 'readUser', '!-readUser' ]
PUT /user/{\_id} | [ 'Admin', 'root', '!-root', 'user', '!-user', 'update' '!-update', 'updateUser', '!-updateUser' ]
GET /user/{ownerId}/group | [ 'Admin', 'User', 'root', '!-root', 'user', '!-user', 'read', '!-read', 'readUser', '!-readUser', 'getUserGroups', '!-getUserGroups' ]
POST /user/{ownerId}/group | [ 'Admin', 'Project Lead', 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'addUserGroups', '!-addUserGroups' ]
DELETE /user/{ownerId}/group | [ 'Admin', 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'removeUserGroups', '!-removeUserGroups' ]
PUT /user/{ownerId}/group/{childId} | [ 'Admin', 'Project Lead', 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'addUserGroups', '!-addUserGroups' ]
DELETE /user/{ownerId}/group/{childId} | [ 'Admin', 'root', '!-root', 'user', '!-user', 'associate', '!-associate', 'associateUser', '!-associateUser', 'removeUserGroups', '!-removeUserGroups' ]

#### Disabling route scopes
Authentication (and as such Authorization) can be disabled for certain routes by adding a property under a model's ``routeOptions`` property with the value set to ``false``.  Below is a list of options and their effects:


Property | Effect
--- | ---
createAuth: false | auth is disabled for any endpoint that creates model documents 
readAuth: false | auth is disabled for any endpoint that retrieves documents and can be queried against
updateAuth: false | auth is disabled for any endpoint that directly updates documents
deleteAuth: false | auth is disabled for any endpoint that deletes documents
associateAuth: false | auth is disabled for any endpoint that modifies an association

### Document authorization
In addition to route-level authorization, rest-hapi supports document-specific authorization. For consistency, document authorization is implemented through the use of scopes similar to the hapi scope system. To enable document scopes, `config.enableDocumentScopes` must be set to `true`. Once set, the `scope` field shown below will be added to the schema of every model:

```javascript
{
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
};
```
If a document's `scope` property is populated with values, it will be compared to a requesting user's scope to determine whether the user is authorized to perform a certain action on the document. For example, if the document's `scope` property looked like the following:

```javascript
scope: {
   rootScope: ['Admin']
   readScope: ['User']
}
```

Then users with the `Admin` scope value would have full access to the document while users with the `User` scope value would only have read access. Users without either scope value would have no access to the document.

rest-hapi provides several options for populating a document's scope. One option is through the `routeOptions.documentScope` property. Any values added to this property will be copied over to a document's `scope` property upon its creation. 

Another option is to set `config.authorizeDocumentCreator` to `true`. Setting this option will add the \_id of the user who created the document to the document's `rootScope` property (in the form of `user-{_id}`, where `{_id}` is the \_id of the user). Assuming `user-{_id}` is in the user's scope, this will grant the user full access to any document the user creates. Consider the example document below created by a user with an \_id of `59d93c673401e16f0f66a5d4`:

```javascript
name: "Test doc",
scope: {
   rootScope: ['user-59d93c673401e16f0f66a5d4']
}
```

This document scope will allow the user with `user-59d93c673401e16f0f66a5d4` in their scope full access while all other users will be denied.

For more details and alternatives to this option see the config docs below:

```javascript
/**
 * If true, modifies the root scope of any document to allow access to the document's creator.
 * The scope value added is in the form: "user-{_id}" where "{_id}" is the _id of the user.
 * NOTE:
 * - This assumes that your authentication credentials (request.auth.credentials) will contain either
 * a "user" object with a "_id" property, or the user's _id stored in a property defined by "config.userIdKey".
 * - This also assumes that the user creating the document will have "user-{_id}" within their scope.
 * - Requires "config.enableDocumentScopes" to be "true".
 * - This setting can be individually overwritten by setting the "authorizeDocumentCreator" routeOptions property.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreator = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "readScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToRead = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "updateScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToUpdate = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "deleteScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToDelete = false;

/**
 * Same as "authorizeDocumentCreator", but modifies the "associateScope" rather than the root scope.
 * default: false
 * @type {boolean}
 */
config.authorizeDocumentCreatorToAssociate = false;

/**
 * This is the path/key to the user _id stored in your request.auth.credentials object.
 * default: "user._id"
 * @type {string}
 */
config.userIdKey = "user._id";
```

[Back to top](#readme-contents)

## Audit Logs
By default, rest-hapi records all document-modifiying activities that occur within the [generated endpoints](#creating-endpoints). Each event is stored as a document within the `auditLog` collection.  The audit log documents can be set to expire by providing a value for `config.auditLogTTL`.  The value can be specified in integer seconds or as a human-readable time period (Ex: 60 = 60 seconds, '1m' = 1 minute, or '1d' = 1 day). Audit logs can be disabled by setting `config.enableAuditLog` to `false`. Also, a [scope](#authorization) can be added to the `auditLog` endpoints through `config.auditLogScope`, giving you control over who can access/create logs. Below is a list of the properties included in each auditLog document:

- `date`
   * The date the action took place.
   * Used as the index for the expiration.
- `method`
   * The http method used.
   * Must be one of `POST, PUT, DELETE, GET`
   * Can be null.
- `action`
   * The type of action requested.
   * Typically one of `Create, Update, Delete, Add, Remove`.
   * Can be null.
- `endpoint`
   * The relative path of the endpoint that was accessed.
   * Can be null.
- `user`
   * If the endpoint is authenticated, this will be the \_id of the requesting user.
   * You can specify the user \_id path/key through `config.userIdKey`.
   * Can be null.
- `collectionName`
   * The name of the primary/owner collection being modified.
   * Can be null.
- `childCollectionName`
   * The name of the secondary/child collection being modified in the case of an association action.
   * Can be null.
- `associationType`
   * The type of relationship between the two modified documents in an association action.
   * Must be one of `ONE_MANY, MANY_MANY, _MANY`.
   * Can be null.
- `documents`
   * An array of \_ids of the documents being modified.
   * Can be null.
- `payload`
   * The payload included in the request.
   * Can be null.
- `params`
   * The params included in the request.
   * Can be null.
- `result`
   * The response sent by the server.
   * Can be null.
- `statusCode`
   * The status code of the server response.
   * Can be null.
- `responseMessage`
   * The response message from the server. Typically for an error.
   * Can be null.
- `isError`
   * A boolean value specifying whether the server responed with an error.
- `ipAddress`
   * The ip address the request.
   * Can be null.
- `notes`
   * Any additional notes.
   * Can be null.

Below is an example of an `auditLog` document:

```javascript
{
      "_id": "59eebc5f20cbfb49c6eae431",
      "notes": null,
      "ipAddress": "127.0.0.1",
      "method": "POST",
      "action": "Create",
      "endpoint": "/hashtag",
      "collectionName": "hashtag",
      "statusCode": 201,
      "isError": false,
      "responseMessage": null,
      "result": [
        {
          "isDeleted": false,
          "createdAt": "2017-10-24T04:06:55.824Z",
          "text": "#coolhashtag",
          "_id": "59eebc5f20cbfb49c6eae42f"
        },
        {
          "isDeleted": false,
          "createdAt": "2017-10-24T04:06:55.824Z",
          "text": "#notsocool",
          "_id": "59eebc5f20cbfb49c6eae430"
        }
      ],
      "params": null,
      "payload": [
        {
          "text": "#coolhashtag"
        },
        {
          "text": "#notsocool"
        }
      ],
      "documents": [
        "59eebc5f20cbfb49c6eae42f",
        "59eebc5f20cbfb49c6eae430"
      ],
      "associationType": null,
      "childCollectionName": null,
      "user": "597242d4e14a710005d325b1",
      "date": "2017-10-24T01:17:43.177Z"
}
```

Audit logs can be [queried against](#querying) the same as any other generated endpoint. You can also create your own `auditLog` documents.

[Back to top](#readme-contents)

## Policies
rest-hapi comes with built-in support for policies via the [mrhorse](https://github.com/mark-bradshaw/mrhorse) plugin. Policies provide a powerful method of applying the same business logic to multiple routes declaratively. They can be inserted at any point in the [hapi request lifecycle](https://hapijs.com/api#request-lifecycle), allowing you to layer your business logic in a clean, organized, and centralized manner. We highly recommend you learn more about the details and benefits of policies in the [mrhorse readme](https://github.com/mark-bradshaw/mrhorse).

Internally, rest-hapi uses policies to implement features such as [document authorization](#document-authorization), [audit logs](#audit-logs), and certain [metadata](#user-tags).

You can enable your own custom policies in rest-hapi by setting `config.enablePolicies` to `true` and adding your policy files to your `policies` directory. 

**NOTE:** If your ``policies`` directory is not in your projects root directory, you will need to specify the path (relative to your projects root directory) by assigning the path to the ``config.policyPath`` property and you will need to set the ``config.absolutePolicyPath`` property to ``true``.

### Generated endpoints
You can apply policies to your generated routes through the `routeOptions.policies` property, which has the following structure:

```javascript
routeOptions: {
   policies: {
      rootPolicies: [/* policies applied to all routes for this model */],
      createPolicies: [/* policies applied to any endpoint that creates model documents */],
      readPolicies: [/* policies applied to any endpoint that retrieves documents and can be queried against */],
      updatePolicies: [/* policies applied to any endpoint that directly updates documents */],
      deletePolicies: [/* policies applied to any endpoint that deletes documents */],
      associatePolicies: [/* policies applied to any endpoint that modifies an association */],
   }
}
```

**NOTE:** You can access the current model within a generated route policy function through `request.route.settings.plugins.model` (see the [example](#example-custom-authorization-via-policies) below).

### Custom endpoints
You can apply policies to custom endpoints (whether [standalone](#standalone-endpoints) or [additional](#additional-endpoints) endpoints) by adding a `policies` object to your routes `config.plugins` object.  See the example below or refer to the [mrhorse](https://github.com/mark-bradshaw/mrhorse) docs for more info:

```javascript
   server.route({
      method: 'POST',
      path: '/login',
      config: {
        handler: loginHandler,
        auth: null,
        description: 'User login.',
        tags: ['api', 'Login'],
        validate: {
          payload: {
            email: Joi.string().email().lowercase().required(),
            password: Joi.string().required()
          }
        },
        pre: loginPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 200, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: ['test']           <--- add policies here
        }
      },
    });
```

### Policies vs middleware
Since policies and [middleware functions](#middleware) seem to provide similar funcitonality, it's important to understand their differences in order to determine which is best suited for your use case. Listed below are a few of the major differences:

Policies | Middleware
--- | ---
Policies are most useful when applied to multiple routes for multiple models, which is why they are located in a centralized place | Middleware functions are meant to be both model and endpoint specific
Policies are only active when an endpoint is called | Middleware functions are active when either an endpoint is called or when a [wrapper method](#mongoose-wrapper-methods) is used
Policies can run before (`onPreHandler`) or after (`onPostHander`) the handler function | Since middleware functions are run as part of the handler, a `pre` middleware function will run after any `onPreHandler` policy, and a `post` middlware function will run before any `onPostHandler` policy

### Example: custom authorization via policies
To provide an example of the power of policies within rest-hapi, consider the following scenario:

A developer wants to implement document authorization, but wants to maintain control over the implementation and have the option of providing functionality outside of what is available with rest-hapi's built in [document authorization](#document-authorization). They want to only allow the user that creates a document to be able to modify the document. They decide to implement this via the policy below (`docAuth.js`).

```javascript
'use strict';

const Boom = require('boom');

let docAuth = function(request, reply, next) {
    let Log = request.logger;
    try {
        let model = request.route.settings.plugins.model;

        let userId = request.auth.credentials.user._id;

        return model.findById(request.params._id)
            .then(function(document) {
                if (document && document.createdBy.toString() === userId.toString()) {
                    return next(null, true);
                }
                else {
                    return next(Boom.notFound("No resource was found with that id."), false);
                }
            })

    }
    catch (err) {
        Log.error("ERROR", err);
        return next(Boom.badImplementation(err), false);
    }
};

docAuth.applyPoint = 'onPreHandler';

module.exports = docAuth;
```
**NOTE:** This assumes that `config.enableCreatedBy` is set to `true`.

They can then apply this policy to their model routes like so:

``/models/blog.model.js``:

```javascript
'use strict';

module.exports = function (mongoose) {
  var modelName = "blog";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    title: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
         updatePolicies: ['docAuth'],
         deletePolicies: ['docAuth']
      }
    }
  };

  return Schema;
};
```

[Back to top](#readme-contents)

## Mongoose wrapper methods
rest-hapi provides mongoose wrapper methods for the user to take advantage of in their server code. These methods provide several advantages including:

- [middleware](#middleware) functionality
- [metadata](#metadata) support
- [soft delete](#soft-delete) support
- [association/relational](#associations) management
- rest-hapi [query](#querying) support

The available methods are:

- list
- find
- create
- update
- deleteOne
- deleteMany
- addOne
- removeOne
- addMany
- removeMany
- getAll

When used with the [model generating](#model-generation) function, these methods provide a quick and easy way to start adding rich, relational data to your db. Check out the [appy seed file](https://github.com/JKHeadley/appy/blob/master/gulp/seed.js) for an excellent example of these methods in action, or refer to the [Additional endpoints](#additional-endpoints) section example.

A more detailed description of each method can be found below:

```javascript
/**
 * Finds a list of model documents
 * @param model: A mongoose model.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model documents.
 */
function list(model, query, Log) {...},

/**
 * Finds a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 */
function find(model, _id, query, Log) {...},

/**
 * Creates a model document
 * @param model: A mongoose model.
 * @param payload: Data used to create the model document.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 */
function create(model, payload, Log) {...},

/**
 * Updates a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param payload: Data used to update the model document.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 */
function update(model, _id, payload, Log) {...},

/**
 * Deletes a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param hardDelete: Flag used to determine a soft or hard delete.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 */
function deleteOne(model, _id, hardDelete, Log) {...},

/**
 * Deletes multiple documents
 * @param model: A mongoose model.
 * @param payload: Either an array of ids or an array of objects containing an id and a "hardDelete" flag.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 */
function deleteMany(model, payload, Log) {...},

/**
 * Adds an association to a document
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param childId: The id of the child document.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param payload: An object containing an extra linking-model fields.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 */
function addOne(ownerModel, ownerId, childModel, childId, associationName, payload, Log) {...},

/**
 * Removes an association to a document
 * @param ownerModel: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being removed.
 * @param childId: The id of the child document.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the remove succeeds.
 */
function removeOne(ownerModel, ownerId, childModel, childId, associationName, Log) {...},

/**
 * Adds multiple associations to a document
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param payload: Either a list of id's or a list of id's along with extra linking-model fields.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 */
function addMany(ownerModel, ownerId, childModel, associationName, payload, Log) {...},

/**
 * Removes multiple associations from a document
 * @param ownerModel: The model that is being removed from.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being removed.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param payload: A list of ids
 * @param Log: A logging object
 * @returns {object} A promise returning true if the remove succeeds.
 */
function removeMany(ownerModel, ownerId, childModel, associationName, payload, Log) {...},

/**
 * Get all of the associations for a document
 * @param ownerModel: The model that is being added to.
 * @param ownerId: The id of the owner document.
 * @param childModel: The model that is being added.
 * @param associationName: The name of the association from the ownerModel's perspective.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object
 * @returns {object} A promise returning true if the add succeeds.
 */
function getAll(ownerModel, ownerId, childModel, associationName, query, Log) {...}
```

[Back to top](#readme-contents)

## Soft delete
rest-hapi supports soft delete functionality for documents.  When the ``enableSoftDelete`` config property is set to ``true``, documents will gain an ``isDeleted`` property when they are created that will be set to ``false``.  Whenever that document is deleted (via a rest-hapi endpoint or method), the document will remain in the collection, its ``isDeleted`` property will be set to ``true``, and the ``deletedAt`` and ``deletedBy`` properties (if enabled) will be populated.  

"Hard" deletion is still possible when soft delete is enabled. In order to hard delete a document (i.e. remove a document from it's collection) via the api, a payload must be sent with the ``hardDelete`` property set to ``true``. 

The rest-hapi delete methods include a ``hardDelete`` flag as a parameter. The following is an example of a hard delete using a [rest-hapi method](#mongoose-wrapper-methods): 

``restHapi.deleteOne(model, _id, true, Log);``

[Back to top](#readme-contents)

## Metadata
### Timestamps
rest-hapi supports the following optional timestamp metadata:
- createdAt (default enabled, activated via `config.enableCreatedAt`)
- updatedAt (default enabled, activated via `config.enableUpdatedAt`)
- deletedAt (default enabled, activated via `config.enableDeletedAt`) (see [Soft delete](#soft-delete))

When enabled, these properties will automatically be populated during CRUD operations. For example, say I create a user with a payload of:

```json
 {
    "email": "test@email.com",
    "password": "1234"
 }
```

If I then query for this document I might get:

```json
 {
    "_id": "588077dfe8b75a830dc53e8b",
    "email": "test@email.com",
    "createdAt": "2017-01-19T08:25:03.577Z"
 }
```

If I later update that user's email then an additional query might return:

```json
 {
    "_id": "588077dfe8b75a830dc53e8b",
    "email": "test2@email.com",
    "createdAt": "2017-01-19T08:25:03.577Z",
    "updatedAt": "2017-01-19T08:30:46.676Z"
 }
```

The ``deletedAt`` property marks when a document was [soft deleted](#soft-delete).

**NOTE**: Timestamp metadata properties are only set/updated if the document is created/modified using rest-hapi endpoints/methods.
Ex: 

``mongoose.model('user').findByIdAndUpdate(_id, payload)`` will not modify ``updatedAt`` whereas

``restHapi.update(mongoose.model('user'), _id, payload)`` will. (see [Mongoose wrapper methods](#mongoose-wrapper-methods))

### User tags
In addition to timestamps, the following user tag metadata can be added to a document:
- createdBy (default disabled, activated via `config.enableCreatedBy`)
- updatedBy (default disabled, activated via `config.enableUpdatedBy`)
- deletedBy (default disabled, activated via `config.enableDeletedBy`) (see [Soft delete](#soft-delete))

If enabled, these properties will record the `_id` of the user performing the corresponding action. 

This assumes that your authentication credentials (request.auth.credentials) will contain either a `user` object with a `\_id` property, or the user's \_id stored in a property defined by `config.userIdKey`.

**NOTE**: Unlike timestamp metadata, user tag properties are only set/updated if the document is created/modified using rest-hapi endpoints, (not rest-hapi [methods](#mongoose-wrapper-methods)).

[Back to top](#readme-contents)

## Model generation
In some situations models may be required before or without endpoint generation. For example some hapi plugins may require models to exist before the routes are registered. In these cases rest-hapi provides a ``generateModels`` function that can be called independently.  See below for example usage:

```javascript
'use strict';

restHapi.generateModels(mongoose)
        .then(function() {
            server.register(require('hapi-auth-jwt2'), (err) => {
                require('./utilities/auth').applyJwtStrategy(server);  //requires models to exist

                server.register({
                    register: restHapi,
                    options: {
                        mongoose: mongoose
                    }
                }, function(err) {

                    server.start(function (err) {

                        server.log('info', 'Server initialized: ' + server.info);

                        restHapi.logUtil.logActionComplete(restHapi.logger, "Server Initialized", server.info);
                    });
                });
            });
        })
        .catch(function(error) {
            console.log("There was an error generating the models: ", error)
        });
```

NOTE: See the [appy seed file](https://github.com/JKHeadley/appy/blob/master/gulp/seed.js) (or [gulp/seed.js](https://github.com/JKHeadley/rest-hapi/blob/master/gulp/seed.js)) for another example usage of ``generateModels``.

[Back to top](#readme-contents)

## Testing
If you have downloaded the source you can run the tests with:
```
$ gulp test
```

[Back to top](#readme-contents)

## License
MIT

## Questions?
If you have any questions/issues/feature requests, please feel free to open an [issue](https://github.com/JKHeadley/rest-hapi/issues/new).  We'd love to hear from you!

## Support
Like this project? Please star it! 

## Projects
Building a project with rest-hapi? [Open a PR](https://github.com/JKHeadley/rest-hapi/blob/master/README.md) and list it here!

- [appy](https://github.com/JKHeadley/appy)
   * A ready-to-go user system built on rest-hapi.
- [rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo) 
   * A simple demo project implementing rest-hapi in a hapi server.

## Contributing
Please reference the contributing doc: https://github.com/JKHeadley/rest-hapi/blob/master/CONTRIBUTING.md

## Join the team 
 Do you want to collaborate? Join the project at https://projectgroupie.com/projects/206
 
[Back to top](#readme-contents)
