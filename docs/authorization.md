---
id: authorization
title: Authorization
sidebar_label: Authorization
---

## Route authorization
rest-hapi takes advantage of the ``scope`` property within the ``auth`` route config object of a hapi endpoint. When a request is made, an endpoint's scope (if it is populated) is compared to the user's scope (stored in `request.auth.credentials.scope`) to determine if the requesting user is authorized to access the endpoint. Below is an quote from the hapi docs describing scopes in more detail:

> scope - the application scope required to access the route. Value can be a scope string or an array of scope strings. The authenticated credentials object scope property must contain at least one of the scopes defined to access the route. If a scope string begins with a + character, that scope is required. If a scope string begins with a ! character, that scope is forbidden. For example, the scope ['!a', '+b', 'c', 'd'] means the incoming request credentials' scope must not include 'a', must include 'b', and must include one of 'c' or 'd'. You may also access properties on the request object (query and params) to populate a dynamic scope by using {} characters around the property name, such as 'user-{params.id}'. Defaults to false (no scope requirements).

In rest-hapi, each generated endpoint has its ``scope`` property set based on model properties within the ``routeOptions.routeScope`` object. There are three types of scopes that can be set: a root scope property, action scope properties, and association scope properties. A description of these can be seen below.

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

> **NOTE:** Use of route scope properties requires that an authentication strategy be defined and implemented. If the [`config.authStrategy`](configuration.md#authstrategy) property is set to ``false``, then no route scopes will be applied, even if they are defined in the model.  For an example of route scopes in action, check out [appy](https://github.com/JKHeadley/appy):

## Generating route scopes
If the [`config.generateRouteScopes`](configuration.md#generateroutescopes) property is set to true, then generated endpoints will come pre-defined with scope values.  These values will exist in addition to any route scope values defined in the ``routeOptions.routeScope`` object. For instance, the tables below show two possibilities for the user model scope: the first is with no model route scope defined, and the second is with a model route scope defined as in the example above.


### Without Model Route Scope Defined

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

### With Model Route Scope Defined

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

## Disabling route scopes
Authentication (and as such Authorization) can be disabled for certain routes by adding a property under a model's ``routeOptions`` property with the value set to ``false``.  Below is a list of options and their effects:


Property | Effect
--- | ---
createAuth: false | auth is disabled for any endpoint that creates model documents 
readAuth: false | auth is disabled for any endpoint that retrieves documents and can be queried against
updateAuth: false | auth is disabled for any endpoint that directly updates documents
deleteAuth: false | auth is disabled for any endpoint that deletes documents
associateAuth: false | auth is disabled for any endpoint that modifies an association

## Document authorization
In addition to route-level authorization, rest-hapi supports document-specific authorization. For consistency, document authorization is implemented through the use of scopes similar to the hapi scope system. To enable document scopes, [`config.enableDocumentScopes`](configuration.md#enabledocumentscopes) must be set to `true`. Once set, the `scope` field shown below will be added to the schema of every model:

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

Another option is to set [`config.authorizeDocumentCreator`](configuration.md#authorizedocumentcreator) to `true`. Setting this option will add the \_id of the user who created the document to the document's `rootScope` property (in the form of `user-{_id}`, where `{_id}` is the \_id of the user). Assuming `user-{_id}` is in the user's scope, this will grant the user full access to any document the user creates. Consider the example document below created by a user with an \_id of `59d93c673401e16f0f66a5d4`:

```javascript
name: "Test doc",
scope: {
   rootScope: ['user-59d93c673401e16f0f66a5d4']
}
```

This document scope will allow the user with `user-59d93c673401e16f0f66a5d4` in their scope full access while all other users will be denied.

For more details and alternatives to this option see the [config docs](configuration.md#authorizedocumentcreator).