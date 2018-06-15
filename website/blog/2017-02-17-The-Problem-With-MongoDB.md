---
title: The Problem With MongoDB
author: Justin Headley
authorURL: http://twitter.com/JKHeadley
authorFBID: 27403843
---

> Original post can be found [here on Medium](https://hackernoon.com/the-problem-with-mongodb-d255e897b4b)

<p align="center"><img width="325" height="244" src="https://cdn-images-1.medium.com/max/600/1*KHIQHTqhFobGU_q0cL6orw.png" alt="mongodb image"></a></p>

---

When building a web app (or any app) that needs to store data, one of the biggest decisions to make is what database to use. In the world of start-ups, where MVP's and agile development reigns, NoSQL databases have grown in [increasing popularity](http://www.techrepublic.com/article/nosql-databases-eat-into-the-relational-database-market/) due largely to their [flexible](http://www.ibmbigdatahub.com/blog/rise-nosql-databases) nature and ease of use. Among them MongoDB stands out by far as the most [popular](http://db-engines.com/en/ranking). [Mongoose](http://mongoosejs.com/), a fantastic ODM for MongoDB in Nodejs, has also seen a rise in popularity, having almost [doubled](https://npm-stat.com/charts.html?package=mongoose&from=2012-01-01&to=2016-12-31) in number of npm downloads from 2015 to 2016.
For web apps using Nodejs/javascript, MongoDB is particularly nice since data is stored using JSON objects, making reading and writing data fluid and natural. However, despite all these great advantages, MongoDB still lacks one of the most useful features found in relational databases, namely…relationships.

<!--truncate-->

<p align="center"><img width="541" height="709" src="https://cdn-images-1.medium.com/max/800/1*yX49yeWyB5nTg7eLTiroSA.jpeg" alt="comic image"></a></p>

> Not how it works…

For almost any app that stores data, its natural for different data entities to have relationships with each other. User's have roles, shopping carts have items, books have categories…you get the idea. These relationships generally take one of three different forms: one-to-one, one-to-many, and many-many. While MongoDB is not a relational database, there are actually two recommended approaches to representing relationships between entities. Lets take a look at each and see how they pan out.
Note: if you feel like you are already familiar with this topic, or just want a solution, feel free to scroll down to the grumpy cat…(or just check out [rest-hapi](https://github.com/JKHeadley/rest-hapi))


---

## Method 1: [Embedding Documents](https://docs.mongodb.com/v3.0/tutorial/model-embedded-one-to-many-relationships-between-documents/)

The most natural method for relating data (represented as [documents](https://docs.mongodb.com/v3.0/reference/glossary/#term-document) in MongoDB is to embed them in one another. The advantage to this approach is that all the related data can be retrieved with just one query. This is very efficient and seems good at first. Sometimes this can be an appropriate approach, but relying on embedded relationships can come at a high cost down the road. Consider an example with users and roles, where users can belong to one role and roles can have many users. In this case we can either choose to embed user documents inside role documents, or vice versa. If we decide that users are the most important entity and that roles should be embedded within them, then we could end up with data that looks like this:

`Users:`
```javascript
[
   {
      _id: 1234,
      email: 'bob@admin.com',
      role: {
         name: 'Admin',
         description: 'A user with awesome powers.'
      }
   },
   {
      _id: 4321,
      email: 'bill@admin.com',
      role: {
         name: 'Admin',
         description: 'A user with awesome powers.'
      }
   }
]
```

The problem with his approach arises when we want to change the details of a role. If we update say, the description of the role for the first user, the role description for the second user stays the same. This is a problem if we want to stay consistent, which we almost always do. It may not seem like a big issue with only two users, but what about when there are hundreds of users? Finding and updating every embedded role does not sound fun.
Realizing this, we may choose to embed users inside roles instead. This could result in data like so:

`Roles:`
```javascript
[
   {
      _id: 5678,
      name: 'Admin',
      description: 'A user with awesome powers.',
      users: [
         {
            email: 'bob@admin.com'
         },
         {
            email: 'bill@admin.com'
         }
      ]
   }
]
```

Problem solved, right? Sure, if no other entities in our database have relationships with users…which is unlikely. If we have another entity, "teams", that can relate to multiple users, then we're back at square one. Updating a user's email would have to be reflected in any role or team that the users existed in. As the number of entities and relationships grow, the consistency issues grow even faster. This usually results in code that is a nightmare of confusion. The efficiency that we had in the beginning is gone as well. So maybe there's a better way? Lets check out the next approach.

## Method 2: [Document References](https://docs.mongodb.com/v3.0/tutorial/model-referenced-one-to-many-relationships-between-documents/)

Rather than embedding documents inside one another, we can give each document an id and store related document ids rather than the whole document. Lets look at the data from the previous example represented this way:

`Users:`
```javascript
[
   {
      _id: 1234,
      email: 'bob@admin.com',
      role: 5678
   },
   {
      _id: 4321,
      email: 'bill@admin.com',
      role: 5678
   }
]
```

`Roles:`
```javascript
[
   {
      _id: 5678,
      name: 'Admin',
      description: 'A user with awesome powers.',
      users: [
         1234,
         4321
      ]
   }
]
```

Now whenever a document is updated, no other actions are needed because the reference ids don't change. Consistency problem solved! However there is a tradeoff. In Method 1 only one query was needed to grab all the data related to a user (or a role). Now in order to get the data for a role AND its associated users, we must first perform a query for the role and then perform another query to look up the users based on the ids. This may not seem that bad, but it can quickly get out of hand as well. Lets bring in the teams entity and look at our data again:

`Users:`
```javascript
[
   {
      _id: 1234,
      email: 'bob@admin.com',
      role: 5678
   },
   {
      _id: 4321,
      email: 'bill@admin.com',
      role: 5678
   }
]
```

`Roles:`
```javascript
[
   {
      _id: 5678,
      name: 'Admin',
      description: 'A user with awesome powers.',
      users: [
         1234,
         4321
      ]
   }
]
```

`Teams:`
```javascript
[
   {
      _id: 1357,
      name: 'Managers',
      description: 'They manage things.',
      users: [
         1234
      ]
   },
   {
      _id: 9753,
      name: 'Editors',
      description: 'They edit things.',
      users: [
         4321
      ]
   }
]
```

Now if we want to retrieve all the data contained in a role, we have to do the same two queries as before, along with a third more complex query to populate the team data for each user. As a developer you are now left with having to write complex query handlers for EVERY situation in which related data needs to be retrieved.
This becomes even more difficult if you are trying to retrieve this data through a web api. The api would have to accept some sort of "embed" query parameter and each endpoint would need to support logic to populate nested data. On top of this more logic would be needed to support filtering queries based on referenced objects. This issue usually results in many overly-specific endpoints with custom logic for different "types" of queries tuned to individual entity structures. This approach can also quickly lead to hard to scale, hard to maintain code.

<p align="center"><img width="541" height="709" src="https://cdn-images-1.medium.com/max/800/1*f1Tsk-T8fVuXzPr0g1kTtg.jpeg" alt="grumpy cat image"></a></p>
 
 > In this case…yes

So what now?

So which approach should we take? Ideally you would want to use a mixture of embedded and referenced relationships that are optimized for your overall model structure. The problem is this is impossible to do from the start as the model structure is bound to change during development (i.e. agile development), and in general trying to "optimize" things from the start can be a [misguided approach](http://seanhess.github.io/2011/12/15/optimization_is_like_firing_clay.html).
As an attempt to resolve some of these issues, I built a tool called [rest-hapi](https://github.com/JKHeadley/rest-hapi). In my previous post I discussed how rest-hapi works to simplify the development of APIs by encapsulating endpoint logic into [model configuration](https://github.com/JKHeadley/rest-hapi#creating-endpoints). Since then rest-hapi has been upgraded to be an [npm module](https://www.npmjs.com/package/rest-hapi)/[hapi plugin](https://www.npmjs.com/package/rest-hapi) and can also be used as a [wrapper](https://github.com/JKHeadley/rest-hapi/blob/master/README.md#mongoose-wrapper-methods) for the mongoose ODM.
With rest-hapi, [entity relationships](https://github.com/JKHeadley/rest-hapi#associations) are defined as part of a model's configuration, and wrapper methods are provided that support adding, removing, populating, and querying relational data. It even supports an equivalent form of a [junction table](https://github.com/JKHeadley/rest-hapi#many_many-linking-models) for many-to-many relationships that require data for a specific relationship instance. While this may not be an optimized solution, I believe it does support an optimal development environment. rest-hapi allows the developer to focus on developing apps in an agile manner and getting things up and running quickly. It combines the flexibility that MongoDB is famous for with the power of relational structure.


<p align="center"><img width="530" height="403" src="https://cdn-images-1.medium.com/max/800/1*kUWyDV-zOa36gotDryDV_A.jpeg" alt="grumpy cat image"></a></p>

> Fast and Flexible

My latest endeavor has been to develop a boilerplate user system (called [appy](https://github.com/JKHeadley/appy)) that provides common user services while leveraging the power of rest-hapi to give a full-featured app bootstrapper. I just completed the first version and so far I feel that it exemplifies the usefulness of rest-hapi. The [permissions system](https://github.com/JKHeadley/appy/wiki/Authorization#appy-permission-system) implemented in appy even takes advantage of the junction table support to allow for enabling/disabling of specific permission relationships.
I hope you take some time to check out rest-hapi and appy. I feel like they can be a significant contribution to the developer community. If you have any feedback, feel free to leave a comment below or open an issue in [GitHub](https://github.com/JKHeadley/rest-hapi/issues). If you want to get in touch you can reach me at [Twitter](https://twitter.com/JKHeadley), [Facebook](https://www.facebook.com/justinkheadley), or [LinkedIn](https://www.linkedin.com/in/justinkheadley), or email me at headley.justin@gmail.com. I hope you enjoyed this post, thanks for reading!