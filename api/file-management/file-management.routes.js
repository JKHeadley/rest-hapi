var Joi = require('joi');

module.exports = function(server, modules) {
    var Log = modules.logger.bind('file-management.routes');
    var config = modules.config;

    var handlers = require('./file-management.handlers')(modules);

    server.route({
        method: 'POST',
        path: '/file-management/url',
        config: {
            handler: handlers.generate,
            auth: "token",
            cors:true,
            description: 'Generates an upload URL.',
            tags: ['api', 'config'],
            validate: {
                payload: Joi.object({
                   objectName:Joi.string().required()
                }),
                headers: Joi.object({
                    'authorization': Joi.string().required()
                }).options({ allowUnknown: true })
            },
            plugins: {
                'hapi-swagger': {
                    responseMessages: [
                        { code: 200, message: 'The resource(s) was/were found successfully.' },
                        { code: 400, message: 'The request was malformed.' },
                        { code: 401, message: 'The authentication header was missing/malformed, or the token has expired.' },
                        { code: 500, message: 'There was an unknown error.'},
                        { code: 503, message: 'There was a problem with the database.'}
                    ]
                }
            },
            response: {
                schema: Joi.object({
                    uploadUrl: Joi.string().uri().required(),
                    accessUrl: Joi.string().uri().required()
                })
            }
        }
    });
};
