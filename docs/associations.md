---
id: associations
title: Associations
sidebar_label: Assocations
---

The rest-hapi framework supports model associations that mimic associations in a relational database.  This includes [one-one](#one-one), [one-many](#one-many-many-one), [many-one](#one-many-many-one), and [many-many](#many-many) relationships.  Associations are created by adding the relevant schema fields and populating the ``associations`` object within ``routeOptions``.  Associations exists as references to a document's ``_id`` field, and can be populated to return the associated object.  See [Querying](querying.md#populate-nested-associations) for more details on how to populate associations.

## ONE_ONE

Below is an example of a one-one relationship between a ``user`` model and a ``dog`` model. Notice the ``dog`` and ``owner`` fields in the schemas.  A schema field is required for associations of type ``ONE_ONE`` or ``MANY_ONE``.  This field must match the association name, include a type of ``ObjectId``, and include a ``ref`` property with the associated model name.

Each association must be added to an ``associations`` object within the ``routeOptions`` object. The ``type`` and ``model`` fields are required for all associations.

```javascript
// models/user.model.js
module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

```javascript
// models/dog.model.js
module.exports = function (mongoose) {
  let modelName = "dog";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

 > **NOTE**: Unlike `ONE_MANY`, `MANY_ONE`, or `MANY_MANY` relationships which require the association to be declared on both associated models, `ONE_ONE` relationships can be one sided an only exist for one model (similar to a `_MANY` relationship).

## ONE_MANY/MANY_ONE

Below is an example of a one-many/many-one relationship between the ``user`` and ``role`` models.  Notice the ``title`` field in the schema.  A schema field is required for associations of type ``ONE_ONE`` or ``MANY_ONE``. This field must match the association name, include a type of ``ObjectId``, and include a ``ref`` property with the associated model name.

```javascript
// models/user.model.js
module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

```javascript
// models/role.model.js
module.exports = function (mongoose) {
  let modelName = "role";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

In this example, a user can belong to one role and a role can be assigned to many users.  The ``type`` and ``model`` fields are required for all associations, and the ``foreignField`` field is required for ``ONE_MANY`` type associations.  

Along with the normal CRUD endpoints, the following association endpoints will be generated for the ``role`` model:

```javascript
GET /role/{ownerId}/user                Get all of the users for a role
POST /role/{ownerId}/user               Add multiple users to a role
DELETE /role/{ownerId}/user             Remove multiple users from a role's list of users
PUT /role/{ownerId}/user/{childId}      Add a single user object to a role's list of users
DELETE /role/{ownerId}/user/{childId}   Remove a single user object from a role's list of users
```

## MANY_MANY

Below is an example of a many-many relationship between the ``user`` and ``group`` models. In this relationship a single ``user`` instance can belong to multiple ``group`` instances and vice versa.


```javascript
// models/user.model.js
module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

```javascript
// models/group.model.js
module.exports = function (mongoose) {
  let modelName = "group";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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


Along with the normal CRUD endpoints, the following association endpoints will be generated for the ``user`` model:

```javascript
GET /user/{ownerId}/group               Get all of the groups for a user
POST /user/{ownerId}/group              Add multiple groups for a user
DELETE /user/{ownerId}/group            Remove multiple groups from a user's list of groups
PUT /user/{ownerId}/group/{childId}     Add a single group object to a user's list of groups
DELETE /user/{ownerId}/group/{childId}  Remove a single group object from a user's list of groups
```

and for the ``group`` model:

```javascript
GET /group/{ownerId}/user               Get all of the users for a group
POST /group/{ownerId}/user              Add multiple users for a group
DELETE /group/{ownerId}/user            Remove multiple users from a group's list of users
PUT /group/{ownerId}/user/{childId}     Add a single user object to a group's list of users
DELETE /group/{ownerId}/user/{childId}  Remove a single user object from a group's list of users
```

### Linking models

Many-many relationships can include extra fields that contain data specific to each association instance.  This is accomplished through linking models which behave similar to junction tables in a relational database.  Linking model files are stored in the ``/models/linking-models`` directory and follow the same ``{model name}.model.js`` format as normal models.  Below is an example of a many-many relationship between the ``user`` model and itself through the ``friends`` association. The extra field ``friendsSince`` could contain a date representing how long the two associated users have known each other.  This example also displays how models can contain a reference to themselves.  

> **NOTE**: The linking model filename does not have to match the model name, however the ``linkingModel`` association property **must** match the linking model ``modelName`` property.


```javascript
// models/user.model.js
module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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


```javascript
// models/linking-models/user_user.model.js
let mongoose = require("mongoose");

module.exports = function () {

  let Types = mongoose.Schema.Types;

  let Model = {
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

### Data storage

By nature every new instance of a MANY_MANY association adds new data to the database. At minimum this data must contain the `_id`s of the associated documents, but this can be extended to include extra fields through a [linking model](#linking-models). rest-hapi provides two options as to how this data is stored in the db (controlled by the [`config.embedAssociations`](configuration.md#embedassociations) property):

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
        
The [`config.embedAssociations`](configuration.md#embedassociations) can be overwritten for individual associations through the `embedAssociation` property. See the example below:

```javascript
module.exports = function (mongoose) {
    let modelName = "group";
    let Types = mongoose.Schema.Types;
    let Schema = new mongoose.Schema({
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
module.exports = function (mongoose) {
    let modelName = "user";
    let Types = mongoose.Schema.Types;
    let Schema = new mongoose.Schema({
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

> **NOTE:** If the `embedAssociation` property is set, then it must be set to the same value for both association definitions as seen above.

### Migrating data

As of v0.28.0 the rest-hapi cli includes an `update-associations` command that can migrate your db data to match your desired MANY_MANY structure. This command follows the following format:

`$ ./node_modules/.bin/rest-hapi-cli update-associations mongoURI [embedAssociations] [modelPath]`

where:

- `mongoURI`: The URI to you mongodb database
- `embedAssociations`: (optional, defaults to `false`) This must match your current [`config.embedAssociations`](configuration.md#embedassociations) value.
- `modelPath`: (optional, defaults to `models`) This must match your `config.modelPath` value if you have [`config.absoluteModelPath`](configuration.md#absolutemodelpath) set to `true`.

This is useful if you have a db populated with documents and you decide to change the `embedAssociaion` property of one or more associations. 

For instance, consider a MANY_MANY relationship between `user` (groups) and `group`  (users) with [`config.embedAssociations`](configuration.md#embedassociations) set to `true`. Each `user` document will contain the array `groups` and each `group` document will contain the array `users`. Lets say you implement this structure in a project, but several months into the project some of your `group` documents have collected thousands of `users`, resulting in very large document sizes. You decide it would be better to migrate the data out of the parent documents and into a linking collection, `user_group`. You can do this by setting the `embedAssociation` property for `users` and `groups` to `false`, and running the following command:

`$ ./node_modules/.bin/rest-hapi-cli update-associations mongodb://localhost:27017/mydb true`

## \_MANY

A one-sided -many relationship can exists between two models. This allows the parent model to have direct control over the reference Ids. Below is an example of a -many relationship between the ``post`` and ``hashtag`` models. 

``/models/post.model.js``:

```javascript
module.exports = function (mongoose) {
  let modelName = "post";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
    caption: {
      type: Types.String
    },
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

Similar to one-many or many-many relationships the following association endpoints will be generated for the ``post`` model:

```javascript
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
