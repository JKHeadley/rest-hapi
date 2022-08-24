---
id: soft-delete
title: Soft Delete
sidebar_label: Soft Delete
---

rest-hapi supports soft delete functionality for documents.  When the [`config.enableSoftDelete`](configuration.md#enablesoftdelete) property is set to ``true``, documents will gain an ``isDeleted`` property when they are created that will be set to ``false``.  Whenever that document is deleted (via a rest-hapi endpoint or method), the document will remain in the collection, its ``isDeleted`` property will be set to ``true``, and the ``deletedAt`` and ``deletedBy`` properties (if enabled) will be populated.  

"Hard" deletion is still possible when soft delete is enabled. In order to hard delete a document (i.e. remove a document from it's collection) via the api, a payload must be sent with the ``hardDelete`` property set to ``true``. 

The rest-hapi delete methods include a ``hardDelete`` flag as a parameter. The following is an example of a hard delete using a [rest-hapi method](mongoose-wrapper-methods.md): 

``RestHapi.deleteOne(model, _id, true, Log);``