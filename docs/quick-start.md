---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

## Requirements

You need [Node.js](https://nodejs.org/en/) ^12.14.1 installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

## Demo

![rest-hapi-demo-alt](https://user-images.githubusercontent.com/12631935/41813206-0d2298a0-76e6-11e8-95d4-9b1e521c179e.gif)

The quickest way to get rest-hapi running on your machine is with the [rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo) project:

(**NOTE:** For an alternative quick start, check out his [awesome yeoman generator](https://github.com/vinaybedre/generator-resthapi) for rest-hapi.)

1) Clone the repo
```sh
$ git clone https://github.com/JKHeadley/rest-hapi-demo.git
$ cd rest-hapi-demo
```

2) Install the dependencies
```sh
$ npm install
```

3) Seed the models
```sh
$ ./node_modules/.bin/rest-hapi-cli seed
```

4) Start the server
```sh
$ npm start
```

5) View the [API docs](swagger-documentation.md) at 

[http://localhost:8080/](http://localhost:8080/)

...have fun!
