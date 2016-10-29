# Rest Hapi
A Restful API generator built around the Hapi framework and mongoose ODM.

## Features

* Automatic generation of CRUD endpoints with middleware support
* Automatic generation of association endpoints
* Joi validation
* User password encryption support
* Optional token authentication for all generated endpoints
* Swagger docs for all generated endpoints
* Query parameter support for sorting, filtering, pagination, and embedding of associated models

## Installation

```
$ git clone https://github.com/JKHeadley/rest-hapi.git
$ cd rest-hapi
$ npm install
```

## Running the app
```
$ gulp serve:local
```
or just
```
$ gulp
```

## Configuration

Edit the config file relevant to your environment (local, development, production).  The default config
file is ```/api/config.local.js```.  Here you can set the server port, mongodb URI, and authentication.

## Creating Endpoints

Restful endpoints are automatically generated based off of any mongoose models that you add to the 
```/api/models``` folder with the file structure of ```{model name}.model.js```.  These models must adhere to the following format:

```javascript
module.exports = function (mongoose) {
    var Schema = new mongoose.Schema({
        ...
        ...fill in schema fields
    });

    Schema.statics= {
        collectionName: /*your model name*/,
        routeOptions: {}
    };

    return Schema;
};
```

As a concrete example, here is a User model (```/api/models/user.model.js```):

```javascript
module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      allowNull: false,
      unique: true
    },
    password: {
      type: Types.String,
      allowNull: false,
      required: true,
      exclude: true,
      allowOnUpdate: false
    }
  });
  
  Schema.statics= {
    collectionName: modelName
    routeOptions: {}
  };
  
  return Schema;
};
```

This will generate the following endpoints:

```
GET /user           Get a list of users
POST /user          Create a new user
GET /user/{_id}     Get a specific user
PUT /user/{_id}     Update a user
DELETE /user/{_id}  Delete a user
```

## Associations

The rest-hapi framework supports model associations that mimic associations in 
a relational database.  This includes one-one, one-many, many-one, and many-many
relationships.  Associations are created by adding the relevant schema fields
and populating the ``associations`` object within ``routeOptions``. 

Below is an example of a one-many/many-one relationship between the ``user``
and ``role`` models.

```/api/models/user.model.js```:

```javascript
module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      allowNull: false,
      unique: true
    },
    password: {
      type: Types.String,
      allowNull: false,
      required: true,
      exclude: true,
      allowOnUpdate: false
    },
    title: {
      type: Types.ObjectId,
      ref: "role"
    }

  });
  
  Schema.statics= {
    collectionName:modelName,
    routeOptions: {
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role"
        }
      }
    }
  };
  
  return Schema;
};
```


```/api/models/role.model.js```:

```javascript
module.exports = function (mongoose) {
  var modelName = "role";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    name: {
      type: Types.String,
      enum: ["Account", "Admin", "SuperAdmin"],
      allowNull: false
    },
    description: {
      type: Types.String
    }
  });

  Schema.statics= {
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
endpoints will be generated for the ``role`` model.

```
GET /role/{ownerId}/user                Gets all of the users for a role
POST /role/{ownerId}/user               Sets multiple users for a role
PUT /role/{ownerId}/user/{childId}      Add a single user object to a role's list of users
DELETE /role/{ownerId}/user/{childId}   Remove a single user object from a role's list of users
```

## Middleware
Models can support middleware functions for CRUD operations. These
exist under the ``routOptions`` object. Middleware functions must return
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


For example, a ``create: pre`` function can be set to encrypt a users password
using the built-in ``password-helper`` utility:
 
```javascript
module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      allowNull: false,
      unique: true
    },
    password: {
      type: Types.String,
      allowNull: false,
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
 