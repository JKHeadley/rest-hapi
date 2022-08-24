---
id: duplicate-fields
title: Duplicate Fields
sidebar_label: Duplicate Fields
---

"Duplicate fields" is a rest-hapi feature that allows fields from an associated document to exist in the parent document while maintaining the original field value. This can be accomplished by setting [`config.enableDuplicateFields`](configuration.md#enableduplicatefields) to `true` and adding the `duplicate` property to an association definition. 

## Basic example
In the code below, the `name` field of the role model will be duplicated in the user model:

```javascript
// models/role.model.js
module.exports = function (mongoose) {
  let modelName = "role";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

```javascript
// models/user.model.js
module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

> **NOTE:** Only associations of type `MANY_ONE` and `ONE_ONE` can have the `duplicate` property.

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

# Tracking duplicated fields
In the above example, we showed how the `roleName` duplicate field could automatically update when the user's `role` property changed. However what if the associated role document's `name` property was updated? By default, the user's `roleName` property will remain the same even if the original field value changes. However, by setting [`config.trackDuplicatedFields`](configuration.md#trackduplicatedfields) to `true`, rest-hapi will track changes from the original field and update **_ALL_** associated duplicate fields. For example, if we have the following user documents:


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

if [`config.trackDuplicatedFields`](configuration.md#trackduplicatedfields) is set to `true`, then the user documents will now look like:

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

## Custom field name
As shown in the example above, duplicate field names have a default form of [association name] + [original field name] (Ex: `roleName`).  If we want to customize the duplicate field name, we can assign an array of objects to the `duplicate` property rather than an array of strings.  For example, given the user model's association definition below:

```javascript
      associations: {
        role: {
          type: "MANY_ONE",
          model: "role",
          duplicate: [{
            field: 'name',
            as: 'title'
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

## Nested duplicate fields
One interesting property of duplicate fields is that they themselves can be duplicating a duplicate field. For an example, consider the `user`, `role`, and `business` models below:


```javascript
// models/business.model.js
module.exports = function (mongoose) {
  let modelName = "business";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

```javascript
// models/role.model.js
module.exports = function (mongoose) {
  let modelName = "role";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

```javascript
// models/user.model.js
module.exports = function (mongoose) {
  let modelName = "user";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
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

As you can see, the value for the user document's duplicate field `company` can be traced back to the `name` field for the business document. If [`config.trackDuplicatedFields`](configuration.md#trackduplicatedfields) is set to `true`, then updating the original `name` field will cause both the role's `businessName` field and the user's `company` fields to update as well.

> **NOTE:** If a duplicate field references another duplicate field, then the referenced field must exist in the model schema.  See the `businessName` field of the `role` model above.

## Advantages
The duplicate fields feature may seem trivial or redundant considering the same information can be included in a GET request using the [$embed](querying.md#populate-nested-associations) query parameter, however duplicate fields come with some powerful advantages. Probably the most clear advantage is the potential for improving the readability of a document. In situations where querying for the association is not ideal or possible (Ex: observing the document within MongoDB), it is much easier to discern information about the document. For example:

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

While this is useful, arguably the biggest advantage duplicate fields provide is the improved querying. For example, in `doc1` above, the document can be filtered by the role \_id (Ex: GET /user?role=59efe15e20905150d340b56b ), but thats as far as it goes when it comes to querying users based on their role information.  However with `doc2`, the user can be filtered by its role name (Ex: GET /user?roleName=Admin ) sorted by its role name (Ex: GET /user?$sort=roleName ), or even be text searchable by its role name (Ex: GET /user?$term=Admin ).
