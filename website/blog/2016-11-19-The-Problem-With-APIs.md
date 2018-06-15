---
title: The Problem With APIs
author: Justin Headley
authorURL: http://twitter.com/JKHeadley
authorFBID: 27403843
---

> Original post can be found [here on Medium](https://hackernoon.com/the-problem-with-apis-331f08f7a39c)

<p align="center"><img width="525" height="525" src="https://cdn-images-1.medium.com/max/600/1*lAR9Uh_gJ7dp23e0vhy5Hg.png" alt="api image"></a></p>

These days, if you are a developer working on a web or mobile application, its likely you're going to need to communicate with a server for specific services or to access a database. This means implementing an API (usually a RESTful API) will be a critical part of developing your app. Unfortunately, RESTful APIs can take many different shapes and forms, even though most of them accomplish very similar functions. This is especially true in the world of javascript, where developers have free range to structure their code just about however they please. If you've worked on multiple API projects, its likely you've had the experience of writing the same API code a thousand different times and possibly a thousand different ways. There are some awesome tools out there that make this process a lot less painful, such as server frameworks like hapi and express or ODM/ORMs like mongoose and sequelize, however even with these tools there is a substantial amount of code involved with setting up even the most basic CRUD API endpoints specific to a project, especially if you plan on implementing standard features such as API documentation and validation. While all these tools, options, and features allow for great control over your API, they can become burdensome if not overwhelming, especially if you are trying to rapidly develop your API for a proof of concept/minimum viable product, and even more so if you are new to developing APIs.

<!--truncate-->

<p align="center"><img width="512" height="501" src="https://cdn-images-1.medium.com/max/800/1*7hioed9q1P-8TwWnJNVZ9g.jpeg" alt="wolf javascrpt image"></a></p>

> Do any of us really?

With this in mind I decided to create a framework for the purpose of rapid RESTful API development. My aim was to provide a tool that allows developers to quickly set up REST endpoints that mirror the structure of their database schema, even if they have little experience with APIs. The result was [rest-hapi](https://github.com/JKHeadley/rest-hapi), a RESTful API generator built around the [hapi](http://hapijs.com/) framework and [mongoose](http://mongoosejs.com/) ODM. rest-hapi automatically sets up CRUD endpoints based on mongoose models, which means all the developer has to do is set up their mongoose models and configure the server, and they're good to go! On top of this, rest-hapi has built-in validation (using [joi](https://github.com/hapijs/joi)) and documentation (via [hapi-swagger](https://github.com/glennjones/hapi-swagger)). Once the server is up and running, it can quickly and easily be tested and documented by viewing the swagger docs.

<p align="center"><img width="160" height="160" src="https://cdn-images-1.medium.com/max/800/1*n8kPcQ0941SZcSL3W33FFQ.jpeg" alt="hapi image"></a></p>
<p align="center"><img width="296" height="160" src="https://cdn-images-1.medium.com/max/800/1*1jX70x_kpaA1VQSY-rXFvA.png" alt="mongoose image"></a></p>

> hapi and mongoose are core tools used in rest-hapi

The other major hurdle rest-hapi attempts to resolve is the never ending decision of whether to choose SQL vs NoSQL for a database. Generally speaking, developers choose SQL/relational databases for the structural advantages they provide, since most projects naturally contain some sort of relational structure within their data, while NoSQL databases are chosen due to their flexibility and scalability. rest-hapi attempts to combine the best of both worlds by using a NoSQL database ([MongoDB](https://www.mongodb.com/)) as its foundation, while also allowing relational structure to easily be defined within the model definitions. When model associations are defined, rest-hapi automatically generates association endpoints alongside the CRUD endpoints.

<p align="center"><img width="225" height="225" src="https://cdn-images-1.medium.com/max/800/1*QXX0IucM6Ltr1aY3RjuSkw.png" alt="rest image"></a></p>

> Standards, anyone?

While rest-hapi doesn't provide an end-all solution to API development, I do believe it will be a great tool for developers that want to quickly set up an API to test their latest app idea. Right now the project is still in it's infancy, but eventually I hope it will reach a point where it could be used as a foundation for production level projects. Please take some time to check it out! If you have any feedback, feel free to open an issue in [GitHub](https://github.com/JKHeadley/rest-hapi/issues), or if you want to get in touch you can reach me at [Twitter](https://twitter.com/JKHeadley), [Facebook](https://www.facebook.com/justinkheadley), or [LinkedIn](https://www.linkedin.com/in/justinkheadley), or email me at headley.justin@gmail.com. Thanks for reading!

(Props to [Zach Smith](https://github.com/zacharyclaysmith) for developing the API-generator that spawned rest-hapi, and [Scal.io](http://www.scal.io/) for being awesome)