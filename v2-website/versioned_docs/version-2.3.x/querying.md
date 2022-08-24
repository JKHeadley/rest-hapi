---
id: querying
title: Querying
sidebar_label: Querying
---

Query parameters can be added to GET requests to filter responses.  These parameters
are structured and function similar to mongoose queries.  Below is a list of currently 
supported parameters:

* $skip
    - The number of records to skip in the database. This is typically used in pagination.
    
* $page
    - The number of records to skip based on the $limit parameter. This is typically used in pagination.

* $limit
    - The maximum number of records to return. This is typically used in pagination.
    
* $select
    - A list of basic fields to be included in each resource.

* $sort
    - A set of fields to sort by. Including field name indicates it should be sorted ascending, while prepending '-' indicates descending. The default sort direction is 'ascending' (lowest value to highest value). Listing multiple fields prioritizes the sort starting with the first field listed. 

* $text
    - A full text search parameter. Takes advantage of indexes for efficient searching. Also implements stemming with   searches. Prefixing search terms with a "-" will exclude results that match that term.
    
* $term
    - A regex search parameter. Slower than $text search but supports partial matches and doesn't require indexing. This can be refined using the $searchFields parameter.
    
* $searchFields
    - A set of fields to apply the $term search parameter to. If this parameter is not included, the $term search parameter is applied to all searchable fields.

* $embed
    - A set of associations to populate. 
    
* $flatten
    - Set to true to flatten embedded arrays, i.e. remove linking-model data.
    
* $count
    - If set to true, only a count of the query results will be returned.

* $where
    - An optional field for raw mongoose queries.
    - **!!WARNING!!**: This feature is meant for development ONLY and NOT in production as it
      provides direct query access to your database. See [the config docs](configuration.md#enablewherequeries) to enable.

* (field "where" queries)
    - Ex: ``/user?email=test@user.com``
    
Query parameters can either be passed in as a single string, or an array of strings.

## Pagination
For any GET query that returns multiple documents, pagination data is returned alongside the documents. The response object has the form:

- docs - an array of documents.
- pages - an object where:
    * current - a number indicating the current page.
    * prev - a number indicating the previous page.
    * hasPrev - a boolean indicating if there is a previous page.
    * next - a number indicating the next page.
    * hasNext - a boolean indicating if there is a next page.
    * total - a number indicating the total number of pages.
- items - an object where:
    * limit - a number indicating the how many results should be returned.
    * begin - a number indicating what item number the results begin with.
    * end - a number indicating what item number the results end with.
    * total - a number indicating the total number of matching results.

> **NOTE:** Pagination format borrowed from mongo-models [pagedFind](https://github.com/jedireza/mongo-models/blob/master/API.md#pagedfindfilter-fields-sort-limit-page-callback).

## Populate nested associations
Associations can be populated through the ``$embed`` parameter.  To populate nested associations,
simply chain a parameter with ``.``.  For example, consider the MANY_MANY group-user association
from the example above.  If we populate the users of a group with ``/group?$embed=users`` we might get a 
response like so:

```json
{
    "_id": "58155f1a071468d3bda0fc6e",
    "name": "A-team",
    "users": [
      {
        "user": {
          "_id": "580fc1a0e2d3308609470bc6",
          "email": "test@user.com",
          "title": "580fc1e2e2d3308609470bc8"
        },
        "_id": "58155f6a071468d3bda0fc6f"
      },
      {
        "user": {
          "_id": "5813ad3d0d4e5c822d2f05bd",
          "email": "test2@user.com",
          "title": "580fc1eee2d3308609470bc9"
        },
        "_id": "58155f6a071468d3bda0fc71"
      }
    ]
}
```

However we can further populate each user's ``title`` field with a nested ``$embed``
parameter: ``/group?$embed=users.title`` which could result in the following response:

```json
{
    "_id": "58155f1a071468d3bda0fc6e",
    "name": "A-team",
    "users": [
      {
        "user": {
          "_id": "580fc1a0e2d3308609470bc6",
          "email": "test@user.com",
          "title": {
            "_id": "580fc1e2e2d3308609470bc8",
            "name": "Admin"
          }
        },
        "_id": "58155f6a071468d3bda0fc6f"
      },
      {
        "user": {
          "_id": "5813ad3d0d4e5c822d2f05bd",
          "email": "test2@user.com",
          "title": {
            "_id": "580fc1eee2d3308609470bc9",
            "name": "SuperAdmin"
          }
        },
        "_id": "58155f6a071468d3bda0fc71"
      }
    ]
}
```
