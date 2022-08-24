---
id: policies
title: Policies
sidebar_label: Policies
---

rest-hapi comes with built-in support for policies via the [mrhorse](https://github.com/mark-bradshaw/mrhorse) plugin. Policies provide a powerful method of applying the same business logic to multiple routes declaratively. They can be inserted at any point in the [hapi request lifecycle](https://hapijs.com/api#request-lifecycle), allowing you to layer your business logic in a clean, organized, and centralized manner. We highly recommend you learn more about the details and benefits of policies in the [mrhorse readme](https://github.com/mark-bradshaw/mrhorse).

Internally, rest-hapi uses policies to implement features such as [document authorization](authorization.md#document-authorization), [audit logs](audit-logs.md), and certain [metadata](metadata.md#user-tags).

You can enable your own custom policies in rest-hapi by setting [`config.enablePolicies`](configuration.md#enablepolicies) to `true` and adding your policy files to your `policies` directory. 

> **NOTE:** If your ``policies`` directory is not in your projects root directory, you will need to specify the path (relative to your projects root directory) by assigning the path to the [`config.policyPath`](configuration.md#policypath) property and you will need to set the [`config.absolutePolicyPath`](configuration.md#absolutepolicypath) property to ``true``.

## Generated endpoints
You can apply policies to your generated routes through the `routeOptions.policies` property, which has the following structure:

```javascript
routeOptions: {
   policies: {
      rootPolicies: [/* policies applied to all routes for this model */],
      createPolicies: [/* policies applied to any endpoint that creates model documents */],
      readPolicies: [/* policies applied to any endpoint that retrieves documents and can be queried against */],
      updatePolicies: [/* policies applied to any endpoint that directly updates documents */],
      deletePolicies: [/* policies applied to any endpoint that deletes documents */],
      associatePolicies: [/* policies applied to any endpoint that modifies an association */],
   }
}
```

> **NOTE:** You can access the current model within a generated route policy function through `request.route.settings.plugins.model` (see the [example](#example-custom-authorization-via-policies) below).

## Custom endpoints
You can apply policies to custom endpoints (whether [standalone](creating-endpoints.md#standalone-endpoints) or [additional](creating-endpoints.md#additional-endpoints) endpoints) by adding a `policies` object to your routes `config.plugins` object.  See the example below or refer to the [mrhorse](https://github.com/mark-bradshaw/mrhorse) docs for more info:

```javascript
   server.route({
      method: 'POST',
      path: '/login',
      config: {
        handler: loginHandler,
        auth: null,
        description: 'User login.',
        tags: ['api', 'Login'],
        validate: {
          payload: {
            email: Joi.string().email().lowercase().required(),
            password: Joi.string().required()
          }
        },
        pre: loginPre,
        plugins: {
          'hapi-swagger': {
            responseMessages: [
              { code: 204, message: 'Success' },
              { code: 400, message: 'Bad Request' },
              { code: 404, message: 'Not Found' },
              { code: 500, message: 'Internal Server Error' }
            ]
          },
          policies: ['test']           <--- add policies here
        }
      },
    });
```

## Policies vs middleware
Since policies and [middleware functions](middleware.md) seem to provide similar funcitonality, it's important to understand their differences in order to determine which is best suited for your use case. Listed below are a few of the major differences:

Policies | Middleware
--- | ---
Policies are most useful when applied to multiple routes for multiple models, which is why they are located in a centralized place | Middleware functions are meant to be both model and endpoint specific
Policies are only active when an endpoint is called | Middleware functions are active when either an endpoint is called or when a [wrapper method](mongoose-wrapper-methods.md) is used (**UPDATE** As of v1.7.x policies can be [accessed programmatically via wrapper methods](mongoose-wrapper-methods.md#simulated-rest-calls))
Policies can run before (`onPreHandler`) or after (`onPostHander`) the handler function | Since middleware functions are run as part of the handler, a `pre` middleware function will run after any `onPreHandler` policy, and a `post` middlware function will run before any `onPostHandler` policy

## Example: custom authorization via policies
To provide an example of the power of policies within rest-hapi, consider the following scenario:

A developer wants to implement document authorization, but wants to maintain control over the implementation and have the option of providing functionality outside of what is available with rest-hapi's built in [document authorization](authorization.md#document-authorization). They want to only allow the user that creates a document to be able to modify the document. They decide to implement this via the policy below (`docAuth.js`).

```javascript
const Boom = require('@hapi/boom')

let docAuth = async function(request, h) {
    let Log = request.logger
    try {
      let model = request.route.settings.plugins.model
    
      let userId = request.auth.credentials.user._id
    
      let document = await model.findById(request.params._id)
        
      if (document && document.createdBy.toString() === userId.toString()) {
        return h.continue
      } else {
        throw Boom.notFound("No resource was found with that id.")
      }
    }
    catch (err) {
      if (!err.isBoom) {
        Log.error(err)
        throw Boom.badImplementation(err)
      } else {
        throw err
      }
    }
};

docAuth.applyPoint = 'onPreHandler';

module.exports = docAuth;
```
> **NOTE:** This assumes that [`config.enableCreatedBy`](configuration.md#enablecreatedby) is set to `true`.

They can then apply this policy to their model routes like so:

```javascript
// models/blog.model.js
module.exports = function (mongoose) {
  let modelName = "blog";
  let Types = mongoose.Schema.Types;
  let Schema = new mongoose.Schema({
    title: {
      type: Types.String,
      required: true
    },
    description: {
      type: Types.String
    }
  });

  Schema.statics = {
    collectionName:modelName,
    routeOptions: {
      policies: {
         updatePolicies: ['docAuth'],
         deletePolicies: ['docAuth']
      }
    }
  };

  return Schema;
};
```