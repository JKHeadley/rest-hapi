---
id: mongoose-wrapper-methods
title: Mongoose Wrapper Methods
sidebar_label: Mongoose Wrapper Methods
---

rest-hapi provides mongoose wrapper methods for the user to take advantage of in their server code. These methods provide several advantages including:

- [middleware](middleware.md) functionality
- [metadata](metadata.md) support
- [soft delete](soft-delete.md) support
- [association/relational](associations.md) management
- rest-hapi [query](querying.md) support

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

When used with the [model generating](model-generation.md) function, these methods provide a quick and easy way to start adding rich, relational data to your db. Check out the [appy seed file](https://github.com/JKHeadley/appy/blob/master/gulp/seed.js) for an excellent example of these methods in action, or refer to the [Additional endpoints](creating-endpoints.md#additional-endpoints) section example.

A more detailed description of each method can be found below:

## list
```javascript
/**
 * Finds a list of model documents
 * @param model: A mongoose model.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model documents.
 */
function list(model, query, Log) {...},
```

## find
```javascript
/**
 * Finds a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param query: rest-hapi query parameters to be converted to a mongoose query.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 */
function find(model, _id, query, Log) {...},

```

## create
```javascript
/**
 * Creates a model document
 * @param model: A mongoose model.
 * @param payload: Data used to create the model document.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 */
function create(model, payload, Log) {...},

```

## update
```javascript
/**
 * Updates a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param payload: Data used to update the model document.
 * @param Log: A logging object.
 * @returns {object} A promise for the resulting model document.
 */
function update(model, _id, payload, Log) {...},

```

## deleteOne
```javascript
/**
 * Deletes a model document
 * @param model: A mongoose model.
 * @param _id: The document id.
 * @param hardDelete: Flag used to determine a soft or hard delete.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 */
function deleteOne(model, _id, hardDelete, Log) {...},

```

## deleteMany
```javascript
/**
 * Deletes multiple documents
 * @param model: A mongoose model.
 * @param payload: Either an array of ids or an array of objects containing an id and a "hardDelete" flag.
 * @param Log: A logging object.
 * @returns {object} A promise returning true if the delete succeeds.
 */
function deleteMany(model, payload, Log) {...},

```

## addOne
```javascript
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

```

## removeOne
```javascript
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

```

## addMany
```javascript
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

```

## removeMany
```javascript
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

```

## getAll
```javascript
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
