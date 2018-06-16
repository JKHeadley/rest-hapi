---
id: metadata
title: Metadata
sidebar_label: Metadata
---

## Timestamps
rest-hapi supports the following optional timestamp metadata for documents:
- createdAt (default enabled, activated via [`config.enableCreatedAt`](configuration.md#enablecreatedat))
- updatedAt (default enabled, activated via [`config.enableUpdatedAt`](configuration.md#enableupdatedat))
- deletedAt (default enabled, activated via [`config.enableDeletedAt`](configuration.md#enabledeletedat)) (see [Soft delete](soft-delete.md))

When enabled, these properties will automatically be populated during CRUD operations. For example, say I create a user with a payload of:

```json
 {
    "email": "test@email.com",
    "password": "1234"
 }
```

If I then query for this document I might get:

```json
 {
    "_id": "588077dfe8b75a830dc53e8b",
    "email": "test@email.com",
    "createdAt": "2017-01-19T08:25:03.577Z"
 }
```

If I later update that user's email then an additional query might return:

```json
 {
    "_id": "588077dfe8b75a830dc53e8b",
    "email": "test2@email.com",
    "createdAt": "2017-01-19T08:25:03.577Z",
    "updatedAt": "2017-01-19T08:30:46.676Z"
 }
```

The ``deletedAt`` property marks when a document was [soft deleted](soft-delete.md).

> **NOTE**: Timestamp metadata properties are only set/updated if the document is created/modified using rest-hapi endpoints/methods.
Ex: 

``mongoose.model('user').findByIdAndUpdate(_id, payload)`` will not modify ``updatedAt`` whereas

``RestHapi.update(mongoose.model('user'), _id, payload)`` will. (see [Mongoose wrapper methods](mongoose-wrapper-methods.md))

## User tags
In addition to timestamps, the following user tag metadata can be added to a document:
- createdBy (default disabled, activated via [`config.enableCreatedBy`](configuration.md#enablecreatedby))
- updatedBy (default disabled, activated via [`config.enableUpdatedBy`](configuration.md#enableupdatedby))
- deletedBy (default disabled, activated via [`config.enableDeletedBy`](configuration.md#enabledeletedby)) (see [Soft delete](soft-delete.md))

If enabled, these properties will record the `_id` of the user performing the corresponding action. 

This assumes that your authentication credentials (request.auth.credentials) will contain either a `user` object with a `_id` property, or the user's \_id stored in a property defined by [`config.userIdKey`](configuration.md#useridkey).

> **NOTE**: Unlike timestamp metadata, user tag properties are only set/updated if the document is created/modified using rest-hapi endpoints, (not rest-hapi [methods](mongoose-wrapper-methods.md)).
