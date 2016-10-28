var Joi = require('joi');

module.exports = function (server, models, Log) {
  var Handlers = require('./token.handlers')(models, Log);

  server.route({
    method: 'POST',
    path: '/token',
    config: {
      handler: Handlers.create,
      auth: null,
      description: 'Create a token for a user.',
      tags: ['api', 'Token'],
      cors: true,
      validate: {
        payload: {
          email: Joi.string().required()
            .description('The user\'s email.').example("dev@scal.io"),
          password: Joi.string().required()
            .description('The user\'s password.').example("devdev")
        }
      },
      plugins: {
        'hapi-swagger': {
          responseMessages: [
            {code: 200, message: 'Success'},
            {code: 400, message: 'Bad Request'},
            {code: 404, message: 'Not Found'},
            {code: 500, message: 'Internal Server Error'}
          ]
        }
      },
      response: {
        schema: Joi.object().keys({
          token: Joi.string().min(1)
        })
      }
    }
  });
};