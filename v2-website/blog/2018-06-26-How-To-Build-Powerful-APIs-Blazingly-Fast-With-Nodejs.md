---
title: How to build powerful REST APIs blazingly fast with Node.js
author: Justin Headley
authorURL: "http://twitter.com/JKHeadley"
authorFBID: 27403843
---

> Original post can be found [here on Medium](https://medium.com/@headley.justin/how-to-build-powerful-rest-apis-blazingly-fast-with-node-js-86d6e55a5b34)

<p align="center"><img width="3888" height="2592" src="https://cdn-images-1.medium.com/max/2000/1*DYKqPVAB617KRYTMK7-34A.jpeg" alt="fast red car"></img></p>

---

Let’s face it, if you’re a web developer, you deal with APIs. Whether you write your own or use someone else’s, it’s just part of the job. REST APIs in particular are very common place. Unfortunately when it comes to the [wild west world](https://twitter.com/nodejs/status/915607972918603776) of Javascript and Node.js, [standards and good practice](https://hackernoon.com/restful-api-designing-guidelines-the-best-practices-60e1d954e7c9) in writing RESTful APIs can sometimes get thrown out the window.

<!--truncate-->

Why?

Because its “easier”
Because “good enough” is sometimes all it takes
Because everyone’s “standard” might be different
…you name it

<p align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/nSKp2StlS6s" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</p>

> don’t be that developer…

Are any of these good reasons to write weak code? Of course not, but they exist nonetheless. Its human nature. It’s all to easy to “take a shortcut”, and sometimes with tight deadlines it seems unavoidable. Trust me I’ve been there. So what can be done about it? Well the good news is there are better ways to develop when you’ve got the right toolset, and with enough luck you might even discover that the “right” way is the easy way. It took me a long time to find my own path of discovery. My hope is by sharing my story I might save you (and your API consumer) some heartache. Here’s what I’ve learned…

> You can skip to The Result section if you want to get directly to business. Or visit https://github.com/JKHeadley/rest-hapi


<p align="center"><img width="700" height="394" src="https://cdn-images-1.medium.com/max/800/1*06tX3horiyy70zu9i4bQ1Q.jpeg" alt="hold on"></img></p>

> you’re in for a wild ride

# The Story

For the past several years I’ve been working as a web developer for the software consultancy [Scal.io](http://scal.io/). During this time I’ve had the pleasure of learning Node.js and working on multiple apps all serving RESTful APIs. At first everything seemed great. I mean, just google [any tutorial](https://www.google.com/search?q=how+to+build+node+api&oq=how+to+build+node+api&aqs=chrome..69i57.5240j0j9&sourceid=chrome&ie=UTF-8) for building a RESTful API with Node.js. You’ll find tons of articles and videos on how to have your own server up and running in minutes.

Wow! This stuff is easy! (I thought) At least at first…

It wasn’t long before I started running into issues.

Oh, you want payload validation? What about query parameters? How can I document these endpoints? Do I really have to copy and paste these route handlers over and over? Wait, you want to use MongoDB, but [still support relationships](https://hackernoon.com/the-problem-with-mongodb-d255e897b4b)? 😳

Programming with Node.js is extremely flexible which means even a simple task can be solved many different ways. Unfortunately that means developers are free to [overcomplicate things](https://medium.com/javascript-scene/the-single-biggest-mistake-programmers-make-every-day-62366b432308) (which we tend to do). It’s no wonder then how API development can get out of hand when feature requests start piling up. This can quickly turn into an ugly mess, especially if you’re trying to coordinate with other developers.


<p align="center"><img width="700" height="459" src="https://cdn-images-1.medium.com/max/800/1*PfYC0YJCZAGjTaJ3kk2toQ.jpeg" alt="madness"></img></p>

> the king of sanity?

After working on several projects together, a [buddy of mine](https://github.com/zacharyclaysmith) who’s an awesome developer came up with (and implemented) the great idea of generating RESTful endpoints based on our data models. I immediately loved it. Now we were spending more time focusing on the structure and business logic of the app rather than writing CRUD endpoints over and over. Not only that, but any time we needed new functionality (like filtering a GET request) we only had to write it once for all endpoints! It felt like a [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) API paradise 😆

I knew we were on to something…

# The Journey

Soon after we completed that project I started looking into how we could take what we had created and make a useful tool out of it. The original solution worked well, but it was [tightly coupled](https://www.agiletestingframework.com/devops-journey/transformation/tightly-coupled-code/) to the project and still lacked a good amount of functionality. I spent days brainstorming and re-writing code. After what seemed like a huge amount of effort, I finally had a [workable solution](https://hackernoon.com/the-problem-with-apis-331f08f7a39c). However (like most beginnings)…it was pretty embarrassing.

The tool worked, but it existed as a framework that you had to clone directly from GitHub (eww). The developer was forced to design their project around the framework and it still lacked a lot of functionality, even compared to our original solution.


<p align="center"><img width="700" height="450" src="https://cdn-images-1.medium.com/max/800/1*mE6kQg2C80tBBP6Ez_ULQQ.png" alt="serious"></img></p>

> I feels it tho!

Luckily things were just getting started. I still had my own hopes and dreams for the project, and now that it was officially public it ever so slowly began to gain some interest. The magic of open source came to life as developers gave their feedback, submitted issues, and some even began to contribute!

Before long major improvements were made such as turning the project into an [npm module](https://www.npmjs.com/package/rest-hapi) and a [hapi](http://hapi.js/) server plugin. I also had the amazing opportunity (thanks to Scal.io) to develop and use the tool within some real world projects.

I always believed in the core concept of the project but it was exciting to have its usefulness validated through my own experience.


<p align="center"><a class="_2XBDTIVigBJDybhZvL-hU3" href="https://giphy.com/gifs/BdAn5S0xigpO?utm_source=iframe&amp;utm_medium=embed&amp;utm_campaign=Embeds&amp;utm_term=https%3A%2F%2Fcdn.embedly.com%2Fwidgets%2Fmedia.html%3Fsrc%3Dhttps%3A%2F%2Fgiphy.com%2Fembed%2FBdAn5S0xigpO%2Ftwitter%2Fiframe&amp;%3Burl=https%3A%2F%2Fgiphy.com%2Fgifs%2FBdAn5S0xigpO&amp;%3Bimage=https%3A%2F%2Fmedia.giphy.com%2Fmedia%2FBdAn5S0xigpO%2Fgiphy.gif&amp;%3Bkey=a19fcc184b9711e1b4764040d3dc5c07&amp;%3Btype=text%2Fhtml&amp;%3Bschema=giphy" target="_blank" onmouseover="trackEvent('Hover', 'Image')" onclick="trackEvent('Click', 'Image')" data-gif="">
                              <img id="gif" class="nlSABoG9CSaJpsufv8WW9 _3vYn8QjoEvrXxHyqdn9ddZ _2XBDTIVigBJDybhZvL-hU3" src="https://media.giphy.com/media/BdAn5S0xigpO/200w.webp" srcset="https://media.giphy.com/media/BdAn5S0xigpO/200w.webp 200w,
                              https://media.giphy.com/media/BdAn5S0xigpO/giphy.webp 480w" sizes="100vw" alt="">
                          </img></a></p>

> yessss

The more it improved the more I felt we had really tapped into a goldmine for RESTful API development. The resulting code was consistent, robust, and easy to follow (standards…yay!). Not only that, but what previously took days or weeks to develop now could be done in just a few hours!

# The Result

<p align="center"><img width="367" height="298" src="https://cdn-images-1.medium.com/max/800/1*fpvgfJJX0LjR74xVMZ3oUQ.png" alt="serious"></img></p>

> rest-hapi

After nearly two years of hard work and development I’m excited to introduce [rest-hapi v1](https://github.com/JKHeadley/rest-hapi) to the web development community. We’ve been able to pack a lot of useful features into the tool so far including:

- Automatic generation of [CRUD](https://jkheadley.github.io/rest-hapi/docs/creating-endpoints.html) and [association](https://jkheadley.github.io/rest-hapi/docs/associations.html) endpoints with [middleware](https://jkheadley.github.io/rest-hapi/docs/middleware.html) support
- [joi](https://github.com/hapijs/joi) [validation](https://jkheadley.github.io/rest-hapi/docs/validation.html)
- Route-level and document-level [authorization](https://jkheadley.github.io/rest-hapi/docs/authorization.html)
- [Swagger docs](https://jkheadley.github.io/rest-hapi/docs/swagger-documentation.html) for all generated endpoints
- [Query parameter](https://jkheadley.github.io/rest-hapi/docs/querying.html) support for searching, sorting, filtering, pagination, and embedding of associated models
- Endpoint activity history through [Audit Logs](https://jkheadley.github.io/rest-hapi/docs/audit-logs.html)
- Support for [policies](https://jkheadley.github.io/rest-hapi/docs/policies.html)
- [Duplicate fields](https://jkheadley.github.io/rest-hapi/docs/duplicate-fields.html)
- Support for [“soft” delete](https://jkheadley.github.io/rest-hapi/docs/soft-delete.html)
- Optional [metadata](https://jkheadley.github.io/rest-hapi/docs/metadata.html) for documents
- Mongoose [wrapper methods](https://jkheadley.github.io/rest-hapi/docs/mongoose-wrapper-methods.html)
- …and more!
With just a few simple data models you can instantly generate hundreds of documented, robust endpoints. Check out these examples:


<p align="center"><img width="700" height="489" src="https://cdn-images-1.medium.com/max/800/1*bJVbMI6QOhtxjGIl7O8MxA.gif" alt="serious"></img></p>

> generating endpoints locally

<p align="center"><img width="700" height="489" src="https://cdn-images-1.medium.com/max/800/1*_2YHCLAmT1HmDYn0IR4qSg.gif" alt="serious"></img></p>

> querying the user collection and populating the user-role relationship

The goal from the start was to develop a tool that would allow developers to build powerful REST APIs with minimal overhead and I believe we have done that! I still have plenty of hopes and dreams for the future of the project, but as of now I’m proud of what we’ve accomplished.

Is it the only tool out there of its kind? Nope.

Does it fit every situation? Of course not!

Is it useful for you? We’re hoping you’ll [check it out](https://github.com/JKHeadley/rest-hapi) and decide for yourself! We’d love to hear your feedback. If you do like it, feel free to give it a star on GitHub 😉

In a future post I’ll go into more details of the design philosophy behind rest-hapi along with some hands-on examples of how you can use it to build your own awesome REST APIs.

If you want to get in touch you can reach me at [Twitter](https://twitter.com/JKHeadley), [Facebook](https://www.facebook.com/justinkheadley), or [LinkedIn](https://www.linkedin.com/in/justinkheadley), or email me at headley.justin@gmail.com. Hope you enjoyed the post. Thanks for reading!