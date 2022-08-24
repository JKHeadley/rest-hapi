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

When used with the [model generating](model-generation.md) function, these methods provide a quick and easy way to start adding rich, relational data to your db. Check out the [seed script](https://github.com/JKHeadley/rest-hapi/blob/master/scripts/seed.js) for an example of these methods in action, or refer to the [Additional endpoints](creating-endpoints.md#additional-endpoints) section example.

## Simulated REST Calls
As of v1.7.x wrapper methods accept a `restCall` (named) parameter that, when `true`, simulates a full http REST call. This can be useful for programmatically testing your endpoints or for taking advantage of additional endpoint features such as [validation](validation.md), [audit logs](audit-logs.md), [duplicate fields](duplicate-fields.md), and [policies](policies.md).

> **NOTE:** Simulated REST calls will only work after registering rest-hapi as a hapi plugin (i.e. endpoints have been generated). They can't be used if only the [models](model-generation.md) have been generated.

A more detailed description of each method can be found below:

> **NOTE:** Each method supports both `positional` and `named` parameters, though it is recommended to use the `named` parameters since this format supports all current options (such as `restCall`) whereas `positional` does not.

## list
```javascript
/**
 * Finds a list of model documents.
 * **Positional:**
 */
function list(model, query, Log) {...}
/**
 * **Named:**
 */
function list({ 
    model, 
    query, 
    Log = RestHapi.getLogger('list'),
    restCall = false, 
    credentials 
}) {...}
/**
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - query: rest-hapi query parameters to be converted to a mongoose query.
 * - Log: A logging object.
 * - restCall: If 'true', then will call GET /model
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model documents or the count of the query results.
 */
```

## find
```javascript
/**
 * Finds a model document.
 * **Positional:**
 */
function find(model, _id, query, Log) {...}
/**
 * **Named:**
 */ 
function find({
    model,
    _id,
    query,
    Log = RestHapi.getLogger('find'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - query: rest-hapi query parameters to be converted to a mongoose query.
 * - Log: A logging object.
 * - restCall: If 'true', then will call GET /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## create
```javascript
/**
 * Creates one or more model documents.
 * **Positional:**
 */ 
function create(model, payload, Log) {...}
/** 
 * **Named:**
 */ 
function create({
    model,
    payload,
    Log = RestHapi.getLogger('create'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - payload: Data used to create the model document/s.
 * - Log: A logging object.
 * - restCall: If 'true', then will call POST /model
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## update
```javascript
/**
 * Updates a model document.
 * **Positional:**
 */ 
function update(model, _id, payload, Log) {...}
/**
 * **Named:**
 */ 
function update({
    model,
    _id,
    payload,
    Log = RestHapi.getLogger('update'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - payload: Data used to update the model document.
 * - Log: A logging object.
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## deleteOne
```javascript
/**
 * Deletes a model document.
 * **Positional:**
 */ 
 function deleteOne(model, _id, hardDelete = false, Log) {...}
/**
 * **Named:**
 */ 
function deleteOne({
    model,
    _id,
    hardDelete = false,
    Log = RestHapi.getLogger('deleteOne'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - hardDelete: Flag used to determine a soft or hard delete.
 * - Log: A logging object.
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## deleteMany
```javascript
/**
 * Deletes multiple documents.
 * **Positional:**
 */ 
 function deleteMany(model, payload, Log) {...}
/**
 * **Named:**
 */
 function deleteMany({
    model,
    payload,
    Log = RestHapi.getLogger('deleteMany'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - model {object | string}: A mongoose model.
 * - _id: The document id.
 * - payload: Either an array of ids or an array of objects containing an id and a "hardDelete" flag.
 * - Log: A logging object.
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## addOne
```javascript
/**
 * Adds an association to a document
 * **Positional:**
 */
function addOne(
    ownerModel,
    ownerId,
    childModel,
    childId,
    associationName,
    payload,
    Log
) {...}
/**
 * **Named:**
 */ 
 function addOne({
    ownerModel,
    ownerId,
    childModel,
    childId,
    associationName,
    payload = {},
    Log = RestHapi.getLogger('addOne'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - ownerModel {object | string}: The model that is being added to.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being added.
 * - childId: The id of the child document.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: An object containing an extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## removeOne
```javascript
/**
 * Removes an association to a document
 * **Positional:**
 */ 
function removeOne(
    ownerModel,
    ownerId,
    childModel,
    childId,
    associationName,
    payload,
    Log
) {...}
/**
 * **Named:**
 */ 
 function removeOne({
    ownerModel,
    ownerId,
    childModel,
    childId,
    associationName,
    payload = {},
    Log = RestHapi.getLogger('removeOne'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - ownerModel {object | string}: The model that is being removed from.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being removed.
 * - childId: The id of the child document.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: An object containing an extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## addMany
```javascript
/**
 * Adds multiple associations to a document.
 * **Positional:**
 */ 
 function addMany(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    payload,
    Log
) {...}
/**
 * **Named:**
 */ 
 function addMany({
    ownerModel,
    ownerId,
    childModel,
    associationName,
    payload = {},
    Log = RestHapi.getLogger('addMany'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - ownerModel {object | string}: The model that is being added to.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being added.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: Either a list of id's or a list of id's along with extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## removeMany
```javascript
/**
 * Removes multiple associations from a document
 * **Positional:**
 */ 
 function removeMany(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    payload,
    Log
) {...}
/**
 * **Named:**
 */ 
 function removeMany({
    ownerModel,
    ownerId,
    childModel,
    associationName,
    payload = {},
    Log = RestHapi.getLogger('removeMany'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - ownerModel {object | string}: The model that is being added from.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being removed.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - payload: Either a list of id's or a list of id's along with extra linking-model fields.
 * - Log: A logging object
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```

## getAll
```javascript
/**
 * Get all of the associations for a document
 * **Positional:**
 */ 
 function getAll(
    ownerModel,
    ownerId,
    childModel,
    associationName,
    query,
    Log
) {...}
/**
 * **Named:**
 */ 
 function getAll({
    ownerModel,
    ownerId,
    childModel,
    associationName,
    query,
    Log = RestHapi.getLogger('getAll'),
    restCall = false,
    credentials
}) {...}
/**
 * **Params:**
 * - ownerModel {object | string}: The model that is being added to.
 * - ownerId: The id of the owner document.
 * - childModel {object | string}: The model that is being added.
 * - associationName: The name of the association from the ownerModel's perspective.
 * - query: rest-hapi query parameters to be converted to a mongoose query.
 * - Log: A logging object
 * - restCall: If 'true', then will call PUT /model/{_id}
 * - credentials: Credentials for accessing the endpoint.
 *
 * @returns {object} A promise for the resulting model document.
 */
```
