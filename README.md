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

## Configuration

Edit the config file relevant to your environment (local, development, production).  The default config
file is ```/api/config.local.js```.  Here you can set the server port, mongodb URI, and authentication.

## Creating Endpoints

Restful endpoints are automatically generated based off of any mongoose models that you add to the 
```/api/models``` folder.  These models must adhere to the following format:

```javascript
module.exports = function (mongoose) {
    var Schema = new mongoose.Schema({
        ...
        ...fill in schema fields
    });

    Schema.methods = {
        collectionName: //your model name
    }

    return Schema;
};
```

As a concrete example, here is a User model:

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
  
  Schema.methods = {
    collectionName:modelName
  };
  
  return Schema;
};
```
