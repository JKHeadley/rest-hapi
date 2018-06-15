---
id: route-customization
title: Route Customization
sidebar_label: Route Customization
---

## Custom path names
By default route paths are constructed using model names, however aliases can be provided to customize the route paths. ``routeOptions.alias`` can be set to alter the base path name, and an ``alias`` property for an association can be set to alter the association path name.  For example:

```javascript
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

```javascript
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

## Omitting routes

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
allowRemove  |      omits ``DELETE /owner/{ownerId}/child`` and ``DELETE /owner/{ownerId}/child/{childId}`` endpoints
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