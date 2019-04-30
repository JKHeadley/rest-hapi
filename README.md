<p align="center"><a href="https://resthapi.com" target="_blank" rel="noopener noreferrer"><img width="367" height="298" src="https://user-images.githubusercontent.com/12631935/41144156-931d244c-6ac1-11e8-86e5-24fd5fcda8ec.png" alt="rest-hapi logo"></a></p>

<br />


<p align="center"><a href="https://jkheadley.github.io/rest-hapi/" target="_blank" rel="noopener noreferrer"><img width="150" height="46" src="https://user-images.githubusercontent.com/12631935/41491054-c208589a-70ab-11e8-9bac-b1ad47123a30.png" alt="rest-hapi title"></a></p>

<div align="center">
  <strong>A RESTful API generator</strong> <a href="https://twitter.com/intent/tweet?text=Generate%20RESTful%20API%20endpoints%20with%20rest-hapi!&url=https://resthapi.com&via=resthapi&hashtags=mongoosejs,hapijs,nodejs,MongoDB">
    <img alt="rest-hapi tweet" src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social">
  </a> 
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
    <img alt="npm" src="https://img.shields.io/npm/dm/rest-hapi.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.com/package/rest-hapi">
    <img alt="npm" src="https://img.shields.io/npm/v/rest-hapi.svg?style=flat-square">
  </a>
  <a href="https://stackshare.io/JKHeadley/rest-hapi">
    <img alt="StackShare" src="https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat-square">
  </a>
  <a href="https://gitter.im/rest-hapi/Lobby">
    <img alt="Join the chat at https://gitter.im/rest-hapi/Lobby" src="https://badges.gitter.im/rest-hapi/Lobby.svg?style=flat-square">
  </a>
</div>


rest-hapi is a [hapi](https://hapijs.com/) plugin that generates RESTful API endpoints based on [mongoose](http://mongoosejs.com/) schemas. It provides a powerful combination of [relational](https://jkheadley.github.io/rest-hapi/docs/associations.html) structure with [NoSQL](https://jkheadley.github.io/rest-hapi/docs/creating-endpoints.html) flexibility.  You define your data models and the rest is done for you.  Have your API up and running in minutes!

## Features

* Automatic generation of [CRUD](https://jkheadley.github.io/rest-hapi/docs/creating-endpoints.html) and [association](https://jkheadley.github.io/rest-hapi/docs/associations.html) endpoints with [middleware](https://jkheadley.github.io/rest-hapi/docs/middleware.html) support
* [joi](https://github.com/hapijs/joi) [validation](https://jkheadley.github.io/rest-hapi/docs/validation.html)
* Route-level and document-level [authorization](https://jkheadley.github.io/rest-hapi/docs/authorization.html)
* [Swagger docs](https://jkheadley.github.io/rest-hapi/docs/swagger-documentation.html) for all generated endpoints
* [Query parameter](https://jkheadley.github.io/rest-hapi/docs/querying.html) support for searching, sorting, filtering, pagination, and embedding of associated models
* Endpoint activity history through [Audit Logs](https://jkheadley.github.io/rest-hapi/docs/audit-logs.html)
* Support for [policies](https://jkheadley.github.io/rest-hapi/docs/policies.html) via [mrhorse](https://github.com/mark-bradshaw/mrhorse)
* [Duplicate fields](https://jkheadley.github.io/rest-hapi/docs/duplicate-fields.html)
* Support for ["soft" delete](https://jkheadley.github.io/rest-hapi/docs/soft-delete.html)
* Optional [metadata](https://jkheadley.github.io/rest-hapi/docs/metadata.html) for documents
* Mongoose [wrapper methods](https://jkheadley.github.io/rest-hapi/docs/mongoose-wrapper-methods.html)
* ...and more!

## Live demo

![rest-hapi-demo-optimized](https://user-images.githubusercontent.com/12631935/41813184-b31cac6a-76e5-11e8-84c3-881d98e6c65d.gif)


View the swagger docs for the live demo:

https://demo.resthapi.com

Or, for a more complete example, check out the [appy](https://appyapp.io) api:

https://api.appyapp.io

## Documentation

Check out the docs on the [official site](https://jkheadley.github.io/rest-hapi)!

## Requirements

You need [Node.js](https://nodejs.org/en/) installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

## Quick Start
![rest-hapi-demo-alt-optimized](https://user-images.githubusercontent.com/12631935/41813206-0d2298a0-76e6-11e8-95d4-9b1e521c179e.gif)

(**NOTE:** For an alternative quick start, check out his [awesome yeoman generator](https://github.com/vinaybedre/generator-resthapi) for rest-hapi.)

1) Clone the demo repo
```
$ git clone https://github.com/JKHeadley/rest-hapi-demo.git
$ cd rest-hapi-demo
```

2) Install the dependencies
```
$ npm install
```

3) Seed the models
```
$ ./node_modules/.bin/rest-hapi-cli seed
```

4) Start the server
```
$ npm start
```

5) View the API docs at 

[http://localhost:8080/](http://localhost:8080/)

...have fun!

## Example Projects

[appy](https://github.com/JKHeadley/appy): A boilerplate web app.

[rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo): A simple demo project implementing rest-hapi in a hapi server.

## Contributing

We welcome contributions to rest-hapi! These are the many ways you can help:

- Submit patches and features
- Improve the [documentation and website](https://jkheadley.github.io/rest-hapi/)
- Report bugs
- Follow us on [Twitter](https://twitter.com/resthapi)
- Participate in the [gitter community](https://gitter.im/rest-hapi/Lobby)
- And [donate financially](https://opencollective.com/rest-hapi)!

Please read our [contribution guide](CONTRIBUTING.md) to get started. Also note
that this project is released with a
[Contributor Code of Conduct](CODE_OF_CONDUCT.md), please make sure to review
and follow it.

## Contributors

Thanks goes to each one of our contributors! 🙏

[Become a contributor](CONTRIBUTING.md).

<a href="https://github.com/JKHeadley/rest-hapi/graphs/contributors"><img src="https://opencollective.com/rest-hapi/contributors.svg?width=890&button=false" /></a>

## Backers

Support us with a monthly donation and help us continue our activities!
[Become a backer](https://opencollective.com/rest-hapi#backers).

<a href="https://opencollective.com/rest-hapi#backers"><img src="https://opencollective.com/rest-hapi/backers.svg?width=890" /></a>

## Questions?
If you have any questions/issues/feature requests, please feel free to open an [issue](https://github.com/JKHeadley/rest-hapi/issues/new).  We'd love to hear from you!

## Support
Like this project? Please star it! 

## License
rest-hapi is licensed under a [MIT License](LICENSE).
