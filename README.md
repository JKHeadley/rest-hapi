<p align="center"><a href="https://jkheadley.github.io/rest-hapi/" target="_blank" rel="noopener noreferrer"><img width="367" height="298" src="https://user-images.githubusercontent.com/12631935/41144156-931d244c-6ac1-11e8-86e5-24fd5fcda8ec.png" alt="rest-hapi logo"></a></p>

<br />

<div align="center">
  <strong>A RESTful API generator</strong>
</div>

<br />

<div align="center">
  <a href="https://travis-ci.org/JKHeadley/rest-hapi">
    <img alt="TravisCI" src="https://img.shields.io/travis/JKHeadley/rest-hapi.svg?style=flat-square">
  </a>
  <a href="https://codecov.io/gh/JKHeadley/rest-hapi">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/JKHeadley/rest-hapi.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/rest-hapi">
    <img alt="npm" src="https://img.shields.io/npm/dt/rest-hapi.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/rest-hapi">
    <img alt="npm" src="https://img.shields.io/npm/v/rest-hapi.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/rest-hapi">
    <img alt="StackShare" src="https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat-square">
  </a>
  <a href="https://gitter.im/rest-hapi/Lobby">
    <img alt="Join the chat at https://gitter.im/rest-hapi/Lobby" src="https://badges.gitter.im/rest-hapi/Lobby.svg?style=flat-square">
  </a>
</div>

<br />

rest-hapi is a hapi plugin intended to abstract the work involved in setting up API routes/validation/handlers/etc. for the purpose of rapid app development.  At the same time it provides a powerful combination of [relational](#associations) structure with [NoSQL](#creating-endpoints) flexibility.  You define your models and the rest is done for you.  Have your own API server up and running in minutes!

## Features

* Automatic generation of [CRUD](#creating-endpoints) endpoints with [middleware](#middleware) support
* Automatic generation of [association](#associations) endpoints
* [joi](https://github.com/hapijs/joi) [validation](#validation)
* Route-level and document-level [authorization](#authorization)
* [Swagger docs](#swagger-documentation) for all generated endpoints via [hapi-swagger](https://github.com/glennjones/hapi-swagger)
* [Query parameter](#querying) support for searching, sorting, filtering, pagination, and embedding of associated models
* Endpoint activity history through [Audit Logs](#audit-logs)
* Support for [policies](#policies) via [mrhorse](https://github.com/mark-bradshaw/mrhorse)
* [Duplicate fields](#duplicate-fields)
* Support for ["soft" delete](#soft-delete)
* Optional [metadata](#metadata)
* Mongoose [wrapper methods](#mongoose-wrapper-methods)

## Live demos

View the swagger docs for the live demos:

appy: https://api.appyapp.io

## Example Projects

[appy](https://github.com/JKHeadley/appy): A ready-to-go user system built on rest-hapi.

[rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo): A simple demo project implementing rest-hapi in a hapi server.


## Requirements

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

[Back to top](#readme-contents)

## Installation

```
$ npm install rest-hapi
```

[Back to top](#readme-contents)

### Getting started
**WARNING**: This will clear all data in the following MongoDB collections (in the db defined in ``restHapi.config``, default ``mongodb://localhost:27017/rest_hapi``) if they exist: ``users``, ``roles``.

If you would like to seed your database with some demo models/data, run:

```
$ ./node_modules/.bin/rest-hapi-cli seed
```

If you need a db different than the default, you can add the URI as an argument to the command:

```
$ ./node_modules/.bin/rest-hapi-cli seed mongodb://localhost:27017/other_db
```

**NOTE**: The password for all seed users is ``1234``.

You can use these models as templates for your models or delete them later if you wish.

[Back to top](#readme-contents)

## Using the plugin

As rest-hapi is a hapi plugin, you'll need to set up a hapi server to generate API endpoints.  You'll also need to set up a [mongoose](https://github.com/Automattic/mongoose) instance and include it in the plugin's options when you register. Below is an example nodejs script ``api.js`` with the minimum requirements to set up an API with rest-hapi:

```javascript
'use strict'

let Hapi = require('hapi')
let mongoose = require('mongoose')
let RestHapi = require('rest-hapi')

async function api(){
  try {
    let server = Hapi.Server({ port: 8080 })

    await server.register({
      plugin: RestHapi,
      options: {
        mongoose: mongoose,
        config: config
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
You can then run ``$ node api.js`` and point your browser to [http://localhost:8080/](http://localhost:8080/) to view the swagger docs (NOTE: API endpoints will only be generated if you have provided models. See [Getting started](#getting-started) or [Creating endpoints](#creating-endpoints).)

## Testing
If you have downloaded the source you can run the tests with:
```
$ npm test
```

## License
MIT

## Questions?
If you have any questions/issues/feature requests, please feel free to open an [issue](https://github.com/JKHeadley/rest-hapi/issues/new).  We'd love to hear from you!

## Support
Like this project? Please star it! 

## Contributing
Please reference the contributing doc: https://github.com/JKHeadley/rest-hapi/blob/master/CONTRIBUTING.md
