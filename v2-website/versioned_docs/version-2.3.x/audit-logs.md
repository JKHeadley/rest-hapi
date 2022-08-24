---
id: audit-logs
title: Audit Logs
sidebar_label: Audit Logs
---

 By default, rest-hapi records all document-modifiying activities that occur within the [generated endpoints](creating-endpoints.md). Each event is stored as a document within the `auditLog` collection.  The audit log documents can be set to expire by providing a value for `config.auditLogTTL`.  The value can be specified in integer seconds or as a human-readable time period (Ex: 60 = 60 seconds, '1m' = 1 minute, or '1d' = 1 day). Audit logs can be disabled by setting `config.enableAuditLog` to `false`. Also, a [scope](authorization.md) can be added to the `auditLog` endpoints through `config.auditLogScope`, giving you control over who can access/create logs. Below is a list of the properties included in each auditLog document:
 
 - `date`
    * The date the action took place.
    * Used as the index for the expiration.
 - `method`
    * The http method used.
    * Must be one of `POST, PUT, DELETE, GET`
    * Can be null.
 - `action`
    * The type of action requested.
    * Typically one of `Create, Update, Delete, Add, Remove`.
    * Can be null.
 - `endpoint`
    * The relative path of the endpoint that was accessed.
    * Can be null.
 - `user`
    * If the endpoint is authenticated, this will be the \_id of the requesting user.
    * You can specify the user \_id path/key through [`config.userIdKey`](configuration.md#useridkey).
    * Can be null.
 - `collectionName`
    * The name of the primary/owner collection being modified.
    * Can be null.
 - `childCollectionName`
    * The name of the secondary/child collection being modified in the case of an association action.
    * Can be null.
 - `associationType`
    * The type of relationship between the two modified documents in an association action.
    * Must be one of `ONE_MANY, MANY_MANY, _MANY`.
    * Can be null.
 - `documents`
    * An array of \_ids of the documents being modified.
    * Can be null.
 - `payload`
    * The payload included in the request.
    * Can be null.
 - `params`
    * The params included in the request.
    * Can be null.
 - `result`
    * The response sent by the server.
    * Can be null.
 - `statusCode`
    * The status code of the server response.
    * Can be null.
 - `responseMessage`
    * The response message from the server. Typically for an error.
    * Can be null.
 - `isError`
    * A boolean value specifying whether the server responed with an error.
 - `ipAddress`
    * The ip address the request.
    * Can be null.
 - `notes`
    * Any additional notes.
    * Can be null.
 
 Below is an example of an `auditLog` document:
 
 ```javascript
 {
       "_id": "59eebc5f20cbfb49c6eae431",
       "notes": null,
       "ipAddress": "127.0.0.1",
       "method": "POST",
       "action": "Create",
       "endpoint": "/hashtag",
       "collectionName": "hashtag",
       "statusCode": 201,
       "isError": false,
       "responseMessage": null,
       "result": [
         {
           "isDeleted": false,
           "createdAt": "2017-10-24T04:06:55.824Z",
           "text": "#coolhashtag",
           "_id": "59eebc5f20cbfb49c6eae42f"
         },
         {
           "isDeleted": false,
           "createdAt": "2017-10-24T04:06:55.824Z",
           "text": "#notsocool",
           "_id": "59eebc5f20cbfb49c6eae430"
         }
       ],
       "params": null,
       "payload": [
         {
           "text": "#coolhashtag"
         },
         {
           "text": "#notsocool"
         }
       ],
       "documents": [
         "59eebc5f20cbfb49c6eae42f",
         "59eebc5f20cbfb49c6eae430"
       ],
       "associationType": null,
       "childCollectionName": null,
       "user": "597242d4e14a710005d325b1",
       "date": "2017-10-24T01:17:43.177Z"
 }
 ```
 
 Audit logs can be [queried against](querying.md) the same as any other generated endpoint. You can also create your own `auditLog` documents.
