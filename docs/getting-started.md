---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

## Installation

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

In your project directory, run:


```sh
$ npm install rest-hapi
```

## Example Data

**WARNING**: This will clear all data in the following MongoDB collections in the db defined in ``restHapi.config`` (default ``mongodb://localhost:27017/rest_hapi``): ``users``, ``roles``.

If you would like to seed your database with some demo models/data, run:

```sh
$ ./node_modules/.bin/rest-hapi-cli seed
```

If you need a db different than the default, you can add the URI as an argument to the command:

```sh
$ ./node_modules/.bin/rest-hapi-cli seed mongodb://localhost:27017/other_db
```

You can use these models as templates for your models or delete them later if you wish.

## Using the plugin

As rest-hapi is a hapi plugin, you'll need to set up a hapi server to generate API endpoints.  You'll also need to set up a [mongoose](https://github.com/Automattic/mongoose) instance and include it in the plugin's options when you register. Create a new file ``api.js`` and add the following code to set up an API with rest-hapi:

```javascript
// api.js
let Hapi = require('hapi')
let mongoose = require('mongoose')
let RestHapi = require('rest-hapi')

async function api(){
  try {
    let server = Hapi.Server({ port: 8080 })

    await server.register({
      plugin: RestHapi,
      options: {
        mongoose,
      }
    })

    await server.start()

    console.log("Server ready", server.info)
    
    return server
  } catch (err) {
    console.log("Error starting server:", err);
  }
}

module.exports = api()
```
You can then run ``$ node api.js`` and point your browser to [http://localhost:8080/](http://localhost:8080/) to view the swagger docs 

> **NOTE**: API endpoints will only be generated if you have provided models. See [Example Data](#example-data) or [Creating endpoints](creating-endpoints.md).

For a ready-to-go demo project see [rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo)
