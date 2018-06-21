---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

## Requirements

You need [Node.js](https://nodejs.org/en/) ^8.10.0 installed and you'll need [MongoDB](https://docs.mongodb.com/manual/installation/) installed and running.

## Demo

![rest-hapi-demo-alt](https://user-images.githubusercontent.com/12631935/41741346-a6bb6ba6-754f-11e8-8c81-753956674c1a.gif)

The quickest way to get rest-hapi running on your machine is with the [rest-hapi-demo](https://github.com/JKHeadley/rest-hapi-demo) project:

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