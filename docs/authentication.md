---
id: authentication
title: Authentication
sidebar_label: Authentication
---

## Route authentication
Authentication for generated endpoints is configured through [`config.authStrategy`](configuration.md#authstrategy) property. If this property is set to a registered strategy, then that strategy is applied to all generated endpoints by default. For more details about authentication with hapi, see [the hapi docs](https://hapijs.com/tutorials/auth). For a working example of authentication with rest-hapi, see the [rest-hapi-demo-auth](https://github.com/JKHeadley/rest-hapi-demo/tree/feature/authentication) or [appy](https://github.com/JKHeadley/appy).

You can disable authentication for generated CRUD endpoints by setting the correct property to ``false`` within the ``routeOptions`` object. Below is a list of properties and the endpoints they affect:

Property | Affected endpoints when `false`
--- | --- 
readAuth    |       ``GET /path`` and ``GET /path/{_id}`` endpoints
createAuth  |       ``POST /path`` endpoint
updateAuth  |       ``PUT /path/{_id}`` endpoint
deleteAuth  |       ``DELETE /path`` and ``DELETE /path/{_id}`` endpoints

Similarly, you can disable authentication for generated association endpoints through the following properties within each association object:

Property | Affected endpoints when `false`
--- | --- 
addAuth     |       ``POST /owner/{ownerId}/child`` and ``PUT /owner/{ownerId}/child/{childId}`` endpoints
removeAuth  |       ``DELETE /owner/{ownerId}/child`` and ``DELETE /owner/{ownerId}/child/{childId}`` endpoints
readAuth    |       ``GET /owner/{ownerId}/child`` endpoint

For example, a routeOption object that disables authentication for creating objects and removing a specific association could look like this:

```javascript
routeOptions: {
    createAuth: false,
    associations: {
        users: {
            type: "MANY_ONE",
            alias: "user",
            model: "user",
            removeAuth: false
        }
    }
}
```