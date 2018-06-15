---
id: middleware
title: Middleware
sidebar_label: Middleware
---

## CRUD
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
        * > **NOTE:** _For payloads with multiple documents, the pre function will be called for each document individually (passed in through the `payload` parameter) i.e. `request.payload` = array of documents, `payload` = single document_
        
        * returns: `payload`
    - post(document, request, result, Log)
        * returns: `document`
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
// models/user.model.js
let bcrypt = require('bcrypt');

module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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
          let hashedPassword = mongoose.model('user').generatePasswordHash(payload.password);

          payload.password = hashedPassword;
          
          return payload;
        }
      }
    },

    generatePasswordHash: function(password) {
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);
      return hash;
    }
  };

  return Schema;
};
```

If a `Boom` error is thrown within a middleware function, that error will become the server response.  Ex:

```javascript
      create: {
        pre: function (payload, request, Log) {
          throw Boom.badRequest("TEST ERROR")
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

## Association
Support is being added for association middlware. Currently the following association middleware exist:

* getAll:
    - post(request, result, Log)
        * returns: result
* add:
   - pre(payload, request, Log)
        * returns: payload
* remove:
   - pre(payload, request, Log)
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
