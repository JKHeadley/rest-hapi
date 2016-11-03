# rest-hapi
A RESTful API generator built around the [hapi](https://github.com/hapijs/hapi) framework and [mongoose](https://github.com/Automattic/mongoose) ODM.

[![Build Status](https://travis-ci.org/JKHeadley/rest-hapi.svg?branch=master)](https://travis-ci.org/JKHeadley/rest-hapi)

rest-hapi is a framework intended to abstract the work involved in setting up API routes/validation/handlers/etc. for the purpose of rapid app development.  At the same time it provides a powerful combination of [relational](#associations) structure with [NoSQL](#creating-endpoints) flexibility.  You define your models and the rest is done for you!  Have your own API server up and running in minutes!

## Features

* Automatic generation of CRUD endpoints with middleware support
* Automatic generation of association endpoints
* [joi](https://github.com/hapijs/joi) validation
* User password encryption support
* Optional token authentication for all generated endpoints
* Swagger docs for all generated endpoints via [hapi-swagger](https://github.com/glennjones/hapi-swagger)
* Query parameter support for sorting, filtering, pagination, and embedding of associated models

## Live demo

View the swagger docs for the live demo:

http://ec2-35-162-67-113.us-west-2.compute.amazonaws.com:8124/

## Readme contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [Configuration](#configuration)
- [Testing](#testing)
- [Swagger documentation](#swagger-documentation)
- [Creating endpoints](#creating-endpoints)
- [Associations](#associations)
- [Route customization](#route-customization)
- [Querying](#querying)
- [Validation](#validation)
- [Middleware](#middleware)
- [Additional endpoints](#additional-endpoints)
- [Token authentication](#token-authentication)
- [License](#license)
- [Questions](#questions)
- [Future work](#future-work)
- [Contributing](#contributing)


## Requirements

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.  You will also need the [gulp](https://www.npmjs.com/package/gulp) node package installed.

[Back to top](#readme-contents)

## Installation

```
$ git clone https://github.com/JKHeadley/rest-hapi.git
$ cd rest-hapi
$ npm install
```
### First time setup/Demo
**WARNING**: This will clear all data in the following MongoDB collections (in the db defined in ``config.local.js``) if they exist: ``users``, ``roles``.

If you would like to seed your database with some demo models/data, run:
```
$ gulp seed
```
NOTE: The password for all seed users is ``1234``.

You can use these models as templates for your models or delete them later if you wish.

[Back to top](#readme-contents)

## Running the app
```
$ gulp serve:local
```
or just
```
$ gulp
```
Then point your browser to [http://localhost:8124/](http://localhost:8124/) to view the swagger docs.

[gulp-nodemon](https://www.npmjs.com/package/gulp-nodemon) watches for changes in server code and restarts the app automatically.

[Back to top](#readme-contents)

## Configuration

Edit the config file relevant to your environment (local, development, production).  The default config
file is ```/api/config.local.js```.  Here you can set the server port, mongodb URI, and authentication.

[Back to top](#rest-hapi)

# Testing
To run tests:
```
$ gulp test
```

[Back to top](#readme-contents)

## Swagger documentation

Swagger documentation is automatically generated for all endpoints and can be viewed by pointing a browser
at the server URL.  By default this will be [http://localhost:8124/](http://localhost:8124/).  The swagger docs provide quick 
access to testing your endpoints along with model schema descriptions and query options.

[Back to top](#readme-contents)

## Creating endpoints

Restful endpoints are automatically generated based off of any mongoose models that you add to the 
``/api/models`` folder with the file structure of ``{model name}.model.js``.  These models must adhere to the following format:

```javascript
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

``/api/models/user.model.js``:

```javascript
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
GET /user           Get a list of users
POST /user          Create a new user
GET /user/{_id}     Get a specific user
PUT /user/{_id}     Update a user
DELETE /user/{_id}  Delete a user
```

[Back to top](#readme-contents)

## Associations

The rest-hapi framework supports model associations that mimic associations in 
a relational database.  This includes one-one, one-many, many-one, and many-many
relationships.  Associations are created by adding the relevant schema fields
and populating the ``associations`` object within ``routeOptions``.  Associations
exists as references to a document's ``_id`` field, and can be populated to return 
the associated object.  See [Querying](#querying) for more details on how to populate
associations.

### ONE_ONE

Below is an example of a one-one relationship between a ``user`` model and a
``dog`` model. Notice the ``dog`` and ``owner`` fields in the schemas.  A schema
field is required for associations of type ``ONE_ONE`` or ``MANY_ONE``.  This
field must match the association name, include a type of ``ObjectId``, and
include a ``ref`` property with the associated model name.

Each association must be added to an ``associations`` object within the
``routeOptions`` object. The ``type`` and ``model`` fields are
required for all associations.

``/api/models/user.model.js``:

```javascript
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

``/api/models/dog.model.js``:

```javascript
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

``/api/models/user.model.js``:

```javascript
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

``/api/models/role.model.js``:

```javascript
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
GET /role/{ownerId}/user                Gets all of the users for a role
POST /role/{ownerId}/user               Sets multiple users for a role
PUT /role/{ownerId}/user/{childId}      Add a single user object to a role's list of users
DELETE /role/{ownerId}/user/{childId}   Remove a single user object from a role's list of users
```

### MANY_MANY

Below is an example of a many-many relationship between the ``user`` and
``group`` models. In this relationship a single ``user`` instance can belong
to multiple ``group`` instances and vice versa.

``/api/models/user.model.js``:

```javascript
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


``/api/models/group.model.js``:

```javascript
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
GET /user/{ownerId}/group               Gets all of the groups for a user
POST /user/{ownerId}/group              Sets multiple groups for a user
PUT /user/{ownerId}/group/{childId}     Add a single group object to a user's list of groups
DELETE /user/{ownerId}/group/{childId}  Remove a single group object from a user's list of groups
```

and for the ``group`` model:

```
GET /group/{ownerId}/user               Gets all of the users for a group
POST /group/{ownerId}/user              Sets multiple users for a group
PUT /group/{ownerId}/user/{childId}     Add a single user object to a group's list of users
DELETE /group/{ownerId}/user/{childId}  Remove a single user object from a group's list of users
```

#### MANY_MANY linking models

Many-many relationships can include extra fields that contain data specific
to each association instance.  This is accomplished through linking models which
behave similar to pivot tables in a relational database.  Linking model files are
stored in the ``/api/models/linking-models`` directory and follow the same 
``{name}.model.js`` format as normal models.  Below is an example of a many-many
relationship between the ``user`` model and itself through the ``friends`` association.
The extra field ``friendsSince`` could contain a date representing how long the two
associated users have known each other.  This example also displays how models can contain a 
reference to themselves.  


``/api/models/user.model.js``:

```javascript
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


``/api/models/linking-models/user_user.model.js``:

```javascript
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

[Back to top](#readme-contents)

## Route customization
By default route paths are constructed using model names, however aliases can be provided to customize the route paths.
``routeOptions.alias`` can be set to alter the base path name, and an ``alias`` property for an association can be set 
to alter the association path name.  For example:

```javascript
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
GET /person 
POST /person
DELETE /person/{_id} 
PUT /person/{_id} 
GET /person/{_id} 
POST /person/{ownerId}/team 
GET /person/{ownerId}/team 
PUT /person/{ownerId}/team/{childId} 
DELETE /person/{ownerId}/team/{childId}
```

[Back to top](#readme-contents)

## Querying

Query parameters can be added to GET requests to filter responses.  These parameters
are structured and function similar to mongoose queries.  Below is a list of currently 
supported parameters:

* $skip
    - The number of records to skip in the database. This is typically used in pagination.

* $limit
    - The maximum number of records to return. This is typically used in pagination.
    
* $select
    - A list of basic fields to be included in each resource.

* $sort
    - A set of fields to sort by. Including field name indicates it should be sorted ascending, 
    while prepending '-' indicates descending. The default sort direction is 'ascending' 
    (lowest value to highest value). Listing multiple fields prioritizes the sort starting with the first field listed. 

* $embed
    - A set of associations to populate. 

* $where
    - An optional field for raw mongoose queries.

* (field "where" queries)
    - Ex: ``/user?email=test@user.com``
    
Query parameters can either be passed in as a single string, or an array of strings.

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

Fields of type ``String`` that include an ``enum`` property result in the following joi validation:

Field Property | joi Validation
--- | ---
enum: [items] | Joi.any().only([items])


rest-hapi generates joi validation models for create, read, and update events as well as association events with linking models.  By default these validation models include all the fields of the mongoose models and list them as optional.  However additional field properties can be included to customize the validation models.  Below is a list of currently supported field properties and their effect on the validation models.

Field Property | Validation Model
--- | ---
required: true | field required on create
requireOnRead: true | field required on read/response
requireOnUpdate: true | field required on update
allowOnRead: false | field excluded from read model
allowOnUpdate: false | field excluded from update model
allowOnUpdate: false | field excluded from create model
queryable: false | field cannot be included as a query parameter
exclude: true | field cannot be included in a response or as part of a query
allowNull: true | field accepts ``null`` as a valid value

[Back to top](#readme-contents)

## Middleware
Models can support middleware functions for CRUD operations. These
exist under the ``routeOptions`` object. Middleware functions must return
 a promise.  The following middleware functions
are available:

* list: 
    - post(request, result, Log)
* find: 
    - post(request, result, Log)
* create:
    - pre(request, Log)
    - post(request, result, Log)
* update: 
    - pre(request, Log)
    - post(request, result, Log)
* delete: 
    - pre(request, Log)
    - post(request, result, Log)


For example, a ``create: pre`` function can be defined to encrypt a users password
using the built-in ``password-helper`` utility.  Notice the use of the ``Q`` library
to return a promise.
 
```javascript
var Q = require('q');

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
  
  Schema.statics= {
    collectionName: modelName
    routeOptions: {
      create: {
        pre: function (request, Log) {
          var deferred = Q.defer();
          var passwordUtility = require('../../api/utilities/password-helper');
          var hashedPassword = passwordUtility.hash_password(request.payload.password);

          request.payload.password = hashedPassword;
          deferred.resolve(request);
          return deferred.promise;
        }
      }
    }
  };
  
  return Schema;
};
```

[Back to top](#readme-contents)

## Additional endpoints
If endpoints beyond the generated CRUD endpoints are needed, they can easily be added 
to a model as an item in the ``routeOptions.extraEndpoints`` array.  The endpoint
logic should be contained within a function using the footprint: ``function (server, model, options, Log)``
. For example, if we wanted to add a ``Password Update`` endpoint to the ``user`` model, it could
look like this:

```javascript
var Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
var Boom = require('boom');

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

          var collectionName = model.collectionDisplayName || model.modelName;

          Log.note("Generating Password Update endpoint for " + collectionName);

          var handler = function (request, reply) {
            var passwordUtility = require('../../api/utilities/password-helper');
            var hashedPassword = passwordUtility.hash_password(request.payload.password);
            return model.findByIdAndUpdate(request.params._id, {password: hashedPassword}).then(function (result) {
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
    }
  };
  
  return Schema;
};

```

[Back to top](#readme-contents)

## Token authentication
The rest-hapi framework supports built in token authentication for all generated endpoints given the following requirements are fulfilled:

- A ``user`` model exists with at least the following properties:

```javascript
var Q = require('q');

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
    token: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    },
    tokenCreatedAt: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    }
  });
  
  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      create: {
        pre: function (request, Log) {
          var deferred = Q.defer();
          var passwordUtility = require('../../api/utilities/password-helper');
          var hashedPassword = passwordUtility.hash_password(request.payload.password);

          request.payload.password = hashedPassword;
          deferred.resolve(request);
          return deferred.promise;
        }
      }
    }
  };
  
  return Schema;
};
```
**NOTE:** Token authentication requires that passwords are encrypted using the password helper as above.

- The ``auth`` property in the config file is set to ``"token"``.

Given these conditions, a new endpoint will be generated:

```
POST /token     Create a token for a user.
```

This endpoint takes a user email and password as a payload and returns an authentication token.  When token authentication is enabled, all generated enpoints require an Authentication header:

```
Authorization: Bearer USER_TOKEN
```

[Back to top](#readme-contents)

## License
MIT

[Back to top](#readme-contents)

## Questions?
If you have any questions/issues/feature requests, please feel free to open an issue.

[Back to top](#readme-contents)

## Future work
This project is still in its infancy, and there are many features I would still like to add.  Below is a list of some possible future updates:

- support mongoose ``$text`` search query parameter
- sorting through populate fields (Ex: sort users through role.name)
- have built in ``created_at`` and ``updated_at`` fields for each model
- support marking fields as ``duplicate`` i.e. any associated models referencing that model will duplicate those fields along with the reference Id. This could allow for a shallow embed that will return a list of reference ids with their "duplicate" values, and a full embed that will return the fully embedded references
- support automatic logging of all operations via a ``eventLogs`` collection
- support "soft" delete of mongo documents, i.e. documents are marked as "deleted" but remain in the db.
- (LONG TERM) support mysql as well as mongodb

[Back to top](#readme-contents)

## Contributing
Please reference the contributing doc: https://github.com/JKHeadley/rest-hapi/blob/master/CONTRIBUTING.md

[Back to top](#readme-contents)
