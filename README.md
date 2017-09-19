# ![rest-hapi](https://cloud.githubusercontent.com/assets/12631935/22916311/9661cac6-f232-11e6-96d4-aea680c9042b.png)

A RESTful API generator for the [hapi](https://github.com/hapijs/hapi) framework utilizing the [mongoose](https://github.com/Automattic/mongoose) ODM.

[![Build Status](https://travis-ci.org/JKHeadley/rest-hapi.svg?branch=master)](https://travis-ci.org/JKHeadley/rest-hapi) [![npm](https://img.shields.io/npm/dt/rest-hapi.svg)](https://www.npmjs.com/package/rest-hapi) [![npm](https://img.shields.io/npm/v/rest-hapi.svg)](https://www.npmjs.com/package/rest-hapi)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/JKHeadley/rest-hapi)

rest-hapi is a hapi plugin intended to abstract the work involved in setting up API routes/validation/handlers/etc. for the purpose of rapid app development.  At the same time it provides a powerful combination of [relational](#associations) structure with [NoSQL](#creating-endpoints) flexibility.  You define your models and the rest is done for you.  Have your own API server up and running in minutes!

# NOTE: Breaking changes from v0.19.2 -> v0.20.0. Please refer to the [changelog](https://github.com/JKHeadley/rest-hapi/blob/master/CHANGELOG.md#0200---2017-08-29-breaking) for details.

## Features

* Automatic generation of [CRUD](#creating-endpoints) endpoints with [middleware](#middleware) support
* Automatic generation of [association](#associations) endpoints
* [joi](https://github.com/hapijs/joi) [validation](#validation)
* Built in [authorization](#authorization)
* [Swagger docs](#swagger-documentation) for all generated endpoints via [hapi-swagger](https://github.com/glennjones/hapi-swagger)
* [Query parameter](#querying) support for searching, sorting, filtering, pagination, and embedding of associated models
* Support for ["soft" delete](#soft-delete)
* Built in [metadata](#metadata)
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
- [Associations](#associations)
- [Route customization](#route-customization)
- [Querying](#querying)
- [Validation](#validation)
- [Middleware](#middleware)
- [Authorization](#authorization)
- [Mongoose wrapper methods](#mongoose-wrapper-methods)
- [Soft delete](#soft-delete)
- [Metadata](#metadata)
- [Model generation](#model-generation)
- [Testing](#testing)
- [License](#license)
- [Questions](#questions)
- [Future work](#future-work)
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

Configuration of the generated API is handled through the ``restHapi.config`` object.  Below is a description of the current configuration options/properties.

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
 * @type {boolean}
 */
config.absoluteModelPath = false;

/**
 * Path to the models directory (default 'models')
 * @type {string}
 */
config.modelPath = 'models';

/**
 * Flag signifying whether the absolute path to the api directory is provided
 * @type {boolean}
 */
config.absoluteApiPath = false;

/**
 * Path to the directory for additional endpoints (default 'api')
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
 * Set to false for no authentication (default).
 * @type {boolean/string}
 */
config.authStrategy = false;

/**
 * MetaData options:
 * default: true
 * @type {boolean}
 */
config.enableCreatedAt = true;
config.enableUpdatedAt = true;

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
 * If set to true, (and authStrategy is not false) then endpoints will be generated with pre-defined
 * scopes based on the model definition.
 * default: false
 * @type {boolean}
 */
config.generateScopes = false;

/**
 * Flag specifying whether to text index all string fields for all models to enable text search.
 * WARNING: enabling this adds overhead to add inserts and updates, as well as added storage requirements.
 * Default is false.
 * @type {boolean}
 */
config.enableTextSearch = false;

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
    collectionName: modelName
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

**NOTE** The linking model filename does not have to match the model name, however the ``linkingModel``
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

## Validation
### Route Validation
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
generateJoiReadModel: function (model, Log) {...},

/**
 * Generates a Joi object that validates a query request payload for updating a document
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiUpdateModel: function (model, Log) {...},

/**
 * Generates a Joi object that validates a query request payload for creating a document
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiCreateModel: function (model, Log) {...},

/**
 * Generates a Joi object that validates a query request payload for adding a association
 * @param model: A mongoose model object.
 * @param Log: A logging object.
 * @returns {*}: A Joi object
 */
generateJoiAssociationModel: function (model, Log) {...},

/**
 * Returns a Joi object based on the mongoose field type.
 * @param field: A field from a mongoose model.
 * @param Log: A logging object.
 * @returns {*}: A Joi object.
 */
generateJoiModelFromFieldType: function (field, Log) {...},

/**
 * Provides easy access to the Joi ObjectId type.
 * @returns {*|{type}}
 */
joiObjectId: function() {...}
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
    - pre(\_id, request, Log)
        * returns: `request.payload`
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
rest-hapi takes advantage of the ``scope`` property within the ``auth`` route config object of a hapi endpoint.  Each generated endpoint has its ``scope`` property set based on model properties within the ``routeOptions.scope`` object. There are three types of scopes that can be set: a general scope property, action scope properties, and association scope properties. A description of these can be seen below.

The first type of scope is a ``scope`` property that, when set, is applied to all generated endpoints for that model. 

The second is an action specific scope property that only applies to endpoints corresponding with the action. A list of these action scope properties can be seen below:

* ``createScope``: value is added to the scope of any endpoint that creates model documents 
* ``readScope``: value is added to the scope of any endpoint that retrieves documents and can be queried against
* ``updateScope``: value is added to the scope of any endpoint that directly updates documents
* ``deleteScope``: value is added to the scope of any endpoint that deletes documents
* ``associateScope``: value is added to the scope of any endpoint that modifies an association

The third type of scope is property that relates to a specific association action, with an action prefix of ``add``, ``remove``, or ``get``.  These scope properties are specific to the associations defined in the model and take the form of :

-{action}{modelName}{associationName}Scope

In the example below, users with the ``Admin`` scope in their authentication credentials can access all of the generated endpoints for the user model, users with the ``User`` scope are granted read access for the user model, and users with the ``addUserGroupsScope`` are capable of adding group associations to a user document.

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
      scope: {
        scope: "Admin",
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
};
```

**NOTE** Use of scope properties requires that an authentication strategy be defined and implemented. If the ``config.authStrategy`` property is set to ``false``, then no scopes will be applied, even if they are defined in the model.  For an example of scopes in action, check out [appy](https://github.com/JKHeadley/appy):

### Generating scopes
If the ``config.generateScopes`` property is set to true, then generated endpoints will come pre-defined with scope values.  These values will exist in addition to any scope values defined in the ``routeOptions.scope`` object. For instance, the tables below show two possibilities for the user model scope: the first is with no model scope defined, and the second is with a model scope defined as in the example above.

#### Without Model Scope Defined

Endpoint | Scope
--- | ---
DELETE /user | [ 'root', 'delete', 'deleteUser' ]
POST /user | [ 'root', 'create', 'createUser' ]
GET /user | [ 'root', 'read', 'readUser' ]
DELETE /user/{_id} | [ 'root', 'delete', 'deleteUser' ]
GET /user/{_id} | [ 'root', 'read', 'readUser' ]
PUT /user/{_id} | [ 'root', 'update', 'updateUser' ]
GET /user/{ownerId}/group | [ 'root', 'read', 'readUser', 'getUserGroups' ]
POST /user/{ownerId}/group | [ 'root', 'associate', 'associateUser', 'addUserGroups' ]
DELETE /user/{ownerId}/group | [ 'root', 'associate', 'associateUser', 'removeUserGroups' ]
PUT /user/{ownerId}/group/{childId} | [ 'root', 'associate', 'associateUser', 'addUserGroups' ]
DELETE /user/{ownerId}/group/{childId} | [ 'root', 'associate', 'associateUser', 'removeUserGroups' ]

#### With Model Scope Defined

Endpoint | Scope
--- | ---
DELETE /user | [ 'root', 'Admin', 'delete', 'deleteUser' ]
POST /user | [ 'root', 'Admin', 'create', 'createUser' ]
GET /user | [ 'root', 'Admin', 'read', 'readUser', 'User' ]
DELETE /user/{_id} | [ 'root', 'Admin', 'delete', 'deleteUser' ]
GET /user/{_id} | [ 'root', 'Admin', 'read', 'readUser', 'User' ]
PUT /user/{_id} | [ 'root', 'Admin', 'update', 'updateUser' ]
GET /user/{ownerId}/group | [ 'root', 'Admin', 'read', 'readUser', 'User', 'getUserGroups' ]
POST /user/{ownerId}/group | [ 'root', 'Admin', 'associate', 'associateUser', 'addUserGroups', 'Project Lead' ]
DELETE /user/{ownerId}/group | [ 'root', 'Admin', 'associate', 'associateUser', 'removeUserGroups' ]
PUT /user/{ownerId}/group/{childId} | [ 'root', 'Admin', 'associate', 'associateUser', 'addUserGroups', 'Project Lead' ]
DELETE /user/{ownerId}/group/{childId} | [ 'root', 'Admin', 'associate', 'associateUser', 'removeUserGroups' ]

### Disabling scopes
Authentication (and as such Authorization) can be disabled for certain routes by adding a property under a model's ``routeOptions`` property with the value set to ``false``.  Below is a list of options and their effects:

Property | Effect
--- | ---
createAuth: false | auth is disabled for any endpoint that creates model documents 
readAuth: false | auth is disabled for any endpoint that retrieves documents and can be queried against
updateAuth: false | auth is disabled for any endpoint that directly updates documents
deleteAuth: false | auth is disabled for any endpoint that deletes documents
associateAuth: false | auth is disabled for any endpoint that modifies an association

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
rest-hapi supports soft delete functionality for documents.  When the ``enableSoftDelete`` config property is set to ``true``, documents will gain an ``isDeleted`` property when they are created that will be set to ``false``.  Whenever that document is deleted (via a rest-hapi endpoint or method), the document will remain in the collection, its ``isDeleted`` property will be set to ``true``, and the ``deletedAt`` property will be populated.  

"Hard" deletion is still possible when soft delete is enabled. In order to hard delete a document (i.e. remove a document from it's collection) via the api, a payload must be sent with the ``hardDelete`` property set to ``true``. 

The rest-hapi delete methods include a ``hardDelete`` flag as a parameter. The following is an example of a hard delete using a [rest-hapi method](#mongoose-wrapper-methods): 

``restHapi.deleteOne(model, _id, true, Log);``

[Back to top](#readme-contents)

## Metadata
rest-hapi supports the following optional metadata:
- createdAt (default enabled)
- updatedAt (default enabled)
- deletedAt (default disabled) (see [Soft delete](#soft-delete))

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
    "createdAt": "2017-01-19T08:25:03.577Z",
    "updatedAt": "2017-01-19T08:25:03.577Z"
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

**NOTE**: Metadata properties are only set/updated if the document is created/modified using rest-hapi endpoints/methods.
Ex: 

``mongoose.model('user').findByIdAndUpdate(_id, payload)`` will not modify ``updatedAt`` whereas

``restHapi.update(mongoose.model('user'), _id, payload)`` will. (see [Mongoose wrapper methods](#mongoose-wrapper-methods))

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

[Back to top](#readme-contents)

## Questions?
If you have any questions/issues/feature requests, please feel free to open an [issue](https://github.com/JKHeadley/rest-hapi/issues/new).  We'd love to hear from you!

[Back to top](#readme-contents)

## Future work
This project is still in its infancy, and there are many features we would still like to add.  Below is a list of some possible future updates:

- sorting through populate fields (Ex: sort users through role.name)
- support marking fields as ``duplicate`` i.e. any associated models referencing that model will duplicate those fields along with the reference Id. This could allow for a shallow embed that will return a list of reference ids with their "duplicate" values, and a full embed that will return the fully embedded references
- support automatic logging/auditing of all operations
- (LONG TERM) support mysql as well as mongodb

[Back to top](#readme-contents)

## Contributing
Please reference the contributing doc: https://github.com/JKHeadley/rest-hapi/blob/master/CONTRIBUTING.md

[Back to top](#readme-contents)

#Join the team 
 Do you want to collaborate? Join the project at https://projectgroupie.com/projects/206
