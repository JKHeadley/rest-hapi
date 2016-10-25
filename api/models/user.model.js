var uuid = require('node-uuid');
var Joi = require('joi');
var Log = require('loggin');
var Q = require('q');
var config = require('../config.js');

//TODO: assign a unique text index to email field

module.exports = function (mongoose) {
  var modelName = "user";
  var Types = mongoose.Schema.Types;
  var Schema = new mongoose.Schema({
    email: {
      type: Types.String,
      allowNull: false,
      unique: true,
      // validate: {
      //   isEmail: true
      // },
      queryable: true,
      displayName: "Email"
    },
    firstName: {
      type: Types.String,
      allowNull: true,
      unique: false,
      // validate: {
      //   len: [1, 255]
      // },
      queryable: true,
      displayName: "First Name"
    },
    lastName: {
      type: Types.String,
      allowNull: true,
      unique: false,
      // validate: {
      //   len: [1, 255]
      // },
      queryable: true,
      displayName: "Last Name"
    },
    password: {
      type: Types.String,
      allowNull: false,
      // validate: {
      //   len: [5, 64]
      // },
      exclude: true,
      allowOnUpdate: false,
      displayName: "Password"
    },
    age: {
      type: Types.Number,
      allowNull: true,
      displayName: "Age"
    },
    token: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false,
      displayName: "Token"
    },
    tokenCreatedAt: {
      type: Types.String,
      allowNull: true,
      exclude: true,
      allowOnUpdate: false,
      allowOnCreate: false
    },
    title: {
      type: Types.ObjectId,
      allowNull: true,
      queryable: true,
      displayName: "Title",
      ref: "role"
    },
    pup: {
      type: Types.ObjectId,
      allowNull: true,
      queryable: true,
      displayName: "Pup",
      ref: "dog"
    },
    subTitle: {
      type: Types.ObjectId,
      allowNull: true,
      queryable: true,
      displayName: "Subtitle",
      ref: "role"
    },
    profileImage: {
      type: Types.ObjectId,
      allowNull: true,
      queryable: true,
      displayName: "Profile Image",
      ref: "imageFile"
    },
    accountActivated: {
      type: Types.Boolean,
      defaultValue: false,
      allowNull: true,
      queryable: true,
      displayName: "Account Activated"
    }
  });
  
  Schema.methods = {
    collectionDisplayName:"User",
    collectionName:modelName,
    nameField:"email",
    routeOptions: {
      associations: {
        title: {
          type: "MANY_ONE",
          model: "role"
        },
        subTitle: {
          type: "MANY_ONE",
          model: "role"
        },
        pup: {
          type: "ONE_ONE",
          model: "dog"
        },
        // profileImage: {},
        groups: {
          type: "MANY_MANY",
          alias: "group",
          model: "group"
        },
        permissions: {
          type: "MANY_MANY",
          alias: "permission",
          model: "permission"
        }
      },
      // extraEndpoints: [
      //   //Create No Auth Endpoint
      //   function (server, model, options, Log) {
      //     Log = Log.bind("Create No Auth");
      //     var Boom = require('boom');
      //     var QueryHelper = require('../utilities/query-helper');
      //     var joiSequelizeHelper = require('../utilities/joi-mongoose-helper')();
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //     var createSchema = model.createSchema || joiSequelizeHelper.generateJoiCreateSchema(model);
      //
      //     var readSchema = model.readSchema || joiSequelizeHelper.generateJoiReadSchema(model);
      //
      //     Log.note("Generating Create No Auth endpoint for" + collectionName);
      //
      //     server.route({
      //       method: 'POST',
      //       path: '/user/no-auth',
      //       config: {
      //         handler: function (request, reply) {
      //           Log.log("params(%s), query(%s), payload(%s)", JSON.stringify(request.params), JSON.stringify(request.query), JSON.stringify(request.payload));
      //
      //           var collectionName = model.collectionDisplayName || model.getTableName();
      //           var promise =  {};
      //           if(model.routeOptions.create && model.routeOptions.create.pre){
      //             promise = model.routeOptions.create.pre(request, Log);
      //           } else {
      //             promise = Q.fcall(function () { return request });
      //           }
      //           promise.then(function (request) {
      //             sql.transaction(function (t) {
      //               return model.create(request.payload, {transaction: t}).then(function (data) {
      //                 var idField = model.idField || "id";
      //                 var nameField = model.nameField || "name";
      //
      //                 return options.models.eventLog.create({
      //                   userId: data[idField],
      //                   organizationId: null,
      //                   verb: "created",
      //                   objectId: data[idField] || "unknown",
      //                   objectName: data[nameField] || "unknown",
      //                   objectType: model.getTableName(),
      //                   objectDisplayType: collectionName
      //                 }, {transaction: t}).then(function (eventLog) {
      //                   return options.models.eventLog.updateNotifications(eventLog, options.models, data, t, Log).then(function () {//Create a notification if necessary
      //
      //                     var attributes = QueryHelper.createAttributesFilter(request.query, model, Log);
      //
      //                     return model.findOne({
      //                       attributes: attributes,
      //                       where: {id: data.id},
      //                       transaction: t
      //                     }).then(function (filteredData) {
      //                       return filteredData;
      //                     });
      //                   });
      //                 });
      //               }).catch(function (error) {
      //                 Log.error("error: ", JSON.stringify(error));
      //                 return reply(Boom.badRequest("There was an error creating the resource", error));
      //               });
      //             }).then(function (data) {
      //               var result = data.toJSON();
      //
      //               if (model.routeOptions.create && model.routeOptions.create.post) {
      //                 promise = model.routeOptions.create.post(request, result, Log);
      //               } else {
      //                 promise = Q.fcall(function () { return result });
      //               }
      //               promise.then(function (result) {
      //                 return reply(result).code(201);
      //               }).catch(function (error) {
      //                 Log.error("error: ", JSON.stringify(error));
      //                 return reply(Boom.badRequest("There was a postprocessing error creating the resource", error));
      //               })
      //             }).catch(function (error) {
      //               Log.error("error: ", JSON.stringify(error));
      //               if (error.name == 'SequelizeUniqueConstraintError') {
      //                 return reply(Boom.conflict(error.errors));
      //               } else {
      //                 return reply(Boom.badRequest("An error occurred creating the resource.", error));
      //               }
      //             });
      //           }).catch(function (error) {
      //             Log.error("error: ", JSON.stringify(error));
      //             return reply(Boom.badRequest("There was a preprocessing error creating the resource", error));
      //           });
      //         },
      //         auth: null,
      //         description: 'Create a new ' + collectionName,
      //         tags: ['api', 'User', 'Create'],
      //         validate: {
      //           payload: createSchema
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //           schema: readSchema || Joi.object().unknown().optional()
      //         }
      //       }
      //     });
      //   },
      //
      //   //Me Endpoint
      //   function (server, model, options, Log) {
      //     Log = Log.bind("me");
      //     var QueryHelper = require('../utilities/query-helper');
      //     var joiSequelizeHelper = require('../utilities/joi-mongoose-helper')();
      //     var Boom = require('boom');
      //
      //     Log.note("Generating me endpoint");
      //
      //     var queryValidation = {};
      //
      //     var queryableFields = model.queryableFields || QueryHelper.getQueryableFields(model, Log);
      //
      //     if (queryableFields) {
      //       queryValidation.fields = Joi.string().optional()//TODO: make enumerated array.
      //       .description('A list of basic fields to be included in each resource. Valid values include: ' + queryableFields);
      //     }
      //
      //     if (Schema.routeOptions && Schema.routeOptions.associations) {
      //       queryValidation.embed = Joi.string().optional()//TODO: make enumerated array.
      //       .description('A set of complex object properties to populate. Valid values include ' + Object.keys(Schema.routeOptions.associations));
      //     }
      //
      //     var readSchema = model.readSchema || joiSequelizeHelper.generateJoiReadSchema(model);
      //
      //     server.route({
      //       method: 'GET',
      //       path: '/user/me',
      //       config: {
      //         handler: function (request, reply) {
      //           var includeArray = QueryHelper.createIncludeArray(request.query, Schema.routeOptions.associations, Log);
      //           var attributes = QueryHelper.createAttributesFilter(request.query, Schema, Log);
      //
      //           return Schema.find({attributes: attributes, where: {id: request.auth.credentials.user.id}, include: includeArray}).then(function (user) {
      //             Log.internal("Result: ", user);
      //             user = user.toJSON();
      //             return reply(user);
      //           }, function (error) {
      //             Log.error("ERROR: ", error);
      //             return reply(Boom.badImplementation("An unspecified error occurred.", error));
      //           });
      //         },
      //         auth: 'token',
      //         description: 'Gets the currently authenticated user.',
      //         tags: ['api', 'User', 'Token'],
      //         validate: {
      //           query: queryValidation,
      //           headers: Joi.object({
      //             'authorization': Joi.string().required()
      //           }).options({allowUnknown: true})
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //           schema: readSchema
      //         }
      //       }
      //     });
      //   },
      //
      //   //Password Update Endpoint
      //   function (server, model, options, Log) {
      //     Log = Log.bind("Password Update");
      //     var EventLogSchema = require('./event-log.model')(sql);
      //     var emailLinkSchema = require('./email-link.model')(sql);
      //     var Boom = require('boom');
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Password Update endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'PUT',
      //       path: '/user/{id}/password',
      //       config: {
      //         handler: function (request, reply) {
      //           emailLinkSchema.findOne({
      //             where: {id: request.payload.linkId}
      //           }).then(function (emailLinkData) {
      //             if (emailLinkData && !emailLinkData.valid) {//TODO: expire link by date
      //
      //               var passwordUtility = require('../../api/utilities/password');
      //               var hashedPassword = passwordUtility.hash_password(request.payload.password);
      //
      //               sql.transaction(function (t) {
      //                 return model.update({password: hashedPassword}, {where: {id: request.params.id}}, {transaction: t}).then(function (affectedRows) {
      //                   if (affectedRows.length > 0) {
      //                     return model.findOne({where: {id: request.params.id}}, {transaction: t}).then(function (data) {
      //                       var idField = model.idField || "id";
      //                       var nameField = model.nameField || "name";
      //
      //                       return true;
      //                       // return EventLogSchema.create({
      //                       //   userId: request.auth.credentials.user.id,
      //                       //   organizationId: request.auth.credentials.user.organizationId,
      //                       //   verb: "updated",
      //                       //   objectId: data[idField] || "unknown",
      //                       //   objectName: data[nameField] || "unknown",
      //                       //   objectType: model.getTableName(),
      //                       //   objectDislpayType: collectionName
      //                       // }, {transaction: t}).then(function (eventLog) {
      //                       //   return true;
      //                       // });
      //                     });
      //                   } else {
      //                     return false;
      //                   }
      //                 });
      //               }).then(function (updated) {
      //                 if (updated) {
      //                   reply("Password updated.").code(200);
      //                 } else {
      //                   reply(Boom.notFound("No resource was found with that id."));
      //                 }
      //               }).catch(function (error) {
      //                 Log.error("error(%s)", JSON.stringify(error));
      //                 reply(Boom.badImplementation("An error occurred updating the resource.", error));
      //               });
      //             } else {
      //               reply(Boom.notFound("Reset link is expired"));
      //             }
      //           }).catch(function (error) {
      //             Log.error("error(%s)", JSON.stringify(error));
      //             reply(Boom.badImplementation("An error occurred updating the resource.", error));
      //           });
      //         },
      //         auth: null,
      //         description: 'Update the user\'s password.',
      //         tags: ['api', 'User', 'Password'],
      //         validate: {
      //           params: {
      //             id: Joi.string().guid().required()
      //           },
      //           payload: {
      //             linkId: Joi.string().required()
      //             .description('The reset password link id'),
      //             password: Joi.string().required()
      //             .description('The user\'s new password')
      //           }
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   },
      //
      //   //Check User Email Endpoint
      //   function (server, model, options, Log) {//NOTE: This could be a security risk as it allows anyone to check the existence of a user email/account
      //     Log = Log.bind("Check User Email");
      //     var Boom = require('boom');
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Check User Email endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'GET',
      //       path: '/user/check',
      //       config: {
      //         handler: function (request, reply) {
      //           model.findOne({where:{email:request.query.email}}).then(function(user){
      //             if (user) {
      //               reply(true);
      //             } else {
      //               reply(false);
      //             }
      //           }).catch(function (error) {
      //             Log.error("error(%s)", JSON.stringify(error));
      //             reply(Boom.badImplementation("An error occurred checking the resource.", error));
      //           });
      //         },
      //         auth: null,
      //         description: 'Check for the existence of a user email/account',
      //         tags: ['api', 'User', 'Account'],
      //         validate: {
      //           query: {
      //             email: Joi.string().required()
      //             .description('The user\'s email.').example("dev@scal.io"),
      //           }
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   },
      //
      //   //Check User Activation Endpoint
      //   function (server, model, options, Log) {//NOTE: This could be a security risk as it allows anyone to check the existence of a user email/account
      //     Log = Log.bind("Check User Activation");
      //     var Boom = require('boom');
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Check User Activation endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'GET',
      //       path: '/user/check-activation',
      //       config: {
      //         handler: function (request, reply) {
      //           model.findOne({where:{email:request.query.email}}).then(function(user){
      //             if (user) {
      //               if (user.accountActivated) {
      //                 reply(true);
      //               } else {
      //                 reply(false);
      //               }
      //             } else {
      //               reply(Boom.notFound("No user with that email was found.", request.query.email));
      //             }
      //           }).catch(function (error) {
      //             Log.error("error(%s)", JSON.stringify(error));
      //             reply(Boom.badImplementation("An error occurred checking the resource.", error));
      //           });
      //         },
      //         auth: null,
      //         description: 'Check if a user account has been activated',
      //         tags: ['api', 'User', 'Account'],
      //         validate: {
      //           query: {
      //             email: Joi.string().required()
      //             .description('The user\'s email.').example("dev@scal.io")
      //           }
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   },
      //
      //   //Activate User Account Endpoint
      //   function (server, model, options, Log) {
      //     Log = Log.bind("Activate User Account");
      //     var Boom = require('boom');
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Activate User Account endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'PUT',
      //       path: '/user/activate-account/{id}',
      //       config: {
      //         handler: function (request, reply) {
      //           model.findOne({where:{id:request.params.id}}).then(function(user){
      //             model.update({accountActivated: true}, {where: {id: request.params.id}}).then(function (affectedRows) {
      //               if (affectedRows.length > 0) {
      //                 reply("Account activated").code(200);
      //               } else {
      //                 reply(Boom.notFound("No resource was found with that id."));
      //               }
      //             });
      //           }).catch(function (error) {
      //             Log.error("error(%s)", JSON.stringify(error));
      //             reply(Boom.badImplementation("An error occurred checking the resource.", error));
      //           });
      //         },
      //         auth: null,
      //         description: 'Activate a user account',
      //         tags: ['api', 'User', 'Account'],
      //         validate: {
      //           params: {
      //             id: Joi.string().guid().required()
      //           }
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   },
      //
      //   //Email Link GET Endpoint
      //   function (server, model, options, Log) {
      //     Log = Log.bind("Email Link");
      //     var Boom = require('boom');
      //     var emailLinkSchema = require('./email-link.model')(sql);
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Email Link GET endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'GET',
      //       path: '/user/email-link/{id}',
      //       config: {
      //         handler: function (request, reply) {
      //           emailLinkSchema.findOne({//NOTE: dont include the user here because sequelize says there's no association
      //             where: {id: request.params.id}
      //           }).then(function (emailLinkData) {
      //             if (emailLinkData) {
      //               model.findOne({
      //                 where: {id: emailLinkData.userId}
      //               }).then(function (data) {
      //                 if (data) {
      //                   var result = emailLinkData.toJSON();
      //                   result.user = data.toJSON();
      //                   reply(result).code(200);
      //                 }else {
      //                   reply(Boom.notFound("There was no data found with that id.", request.params.id));
      //                 }
      //               });
      //             } else {
      //               reply(Boom.notFound("There was no data found with that id.", request.params.id));
      //             }
      //           }).catch(function (error) {
      //             Log.error("error(%s)", JSON.stringify(error));
      //             reply(Boom.serverTimeout("There was an error accessing the database."));
      //           });
      //         },
      //         auth: null,
      //         description: 'Get a temporary link and its associated user.',
      //         tags: ['api', 'User', 'Account'],
      //         validate: {
      //           params: {
      //             id: Joi.string().guid().required()
      //           }
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   },
      //
      //   //Email Link POST Endpoint (send email)
      //   function (server, model, options, Log) {
      //     Log = Log.bind("Email Link");
      //     var Boom = require('boom');
      //     var emailLinkSchema = require('./email-link.model')(sql);
      //
      //     //var mandrill = require('node-mandrill')('uGKovpfBBIgJClxKwT-vqQ');
      //     var mandrill = require('mandrill-api/mandrill');
      //     var mandrill_client = new mandrill.Mandrill('uGKovpfBBIgJClxKwT-vqQ');
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Email Link POST endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'POST',
      //       path: '/user/email-link',
      //       config: {
      //         handler: function (request, reply) {
      //           Schema.findOne({where:{email: request.payload.email}}).then(function (user) {
      //             if (user) {
      //               emailLinkSchema.create({
      //                 userId: user.id
      //               }).then(function (result) {
      //
      //                 var link = null;
      //                 var action = null;
      //                 var text = null;
      //                 var subject = null;
      //                 if (request.payload.type == "Password") {
      //                   action = "reset-password/";
      //                   subject = "Password Reset";
      //                 } else if (request.payload.type == "Activation") {
      //                   action = "activate-account/";
      //                   subject = "Account Activation";
      //                 }
      //
      //                 switch (config.apiVersion) {
      //                   case "local":
      //                     link = "http://localhost:3000/#/" + action + result.id;
      //                     user.email = "temp@scal.io";
      //                     break;
      //                   case "development":
      //                     link = "http://" + action + result.id;
      //                     user.email = "temp@scal.io";
      //                     break;
      //                   case "production":
      //                     link = "http://" + action + result.id;
      //                     break;
      //                 }
      //
      //                 if (request.payload.type == "Password") {
      //                   text = "Please click the link below to reset your password.\n\n" + link;
      //                 } else if (request.payload.type == "Activation") {
      //                   text = "Welcome to " + config.app + "!\n\nPlease click the link below to activate your account:\n\n" + link;
      //                 }
      //
      //                 Log.log("API", config.apiVersion);
      //                 Log.log("action", action);
      //                 // mandrill('/messages/send', {
      //                 //   message: {
      //                 //     to: [{email: user.email, name: user.firstName + " " + user.lastName}],
      //                 //     from_email: 'scalio@tempotech.com',
      //                 //     subject: subject,
      //                 //     text: text
      //                 //   }
      //                 // }, function (error, response) {
      //                 //   if (error) {
      //                 //     Log.log(JSON.stringify(error));
      //                 //     reply(Boom.expectationFailed("There was an error sending the email.", request.payload.email));
      //                 //   }
      //                 //   else {
      //                 //     Log.log(response);
      //                 //     reply("link email sent").code(200);
      //                 //   }
      //                 // });
      //
      //
      //                 var message = {
      //                   //"html": "<p>Example HTML content</p>",
      //                   "text": text,
      //                   "subject": subject,
      //                   "from_email": "noreply@scalio.com",
      //                   //"from_name": "Example Name",
      //                   "to": [{
      //                     "email": user.email,
      //                     "name": user.firstName + " " + user.lastName,
      //                     //"type": "to"
      //                   }],
      //                   "headers": {
      //                     "Reply-To": "noreply@scalio.com"
      //                   },
      //                   // "important": false,
      //                   // "track_opens": null,
      //                   // "track_clicks": null,
      //                   // "auto_text": null,
      //                   // "auto_html": null,
      //                   // "inline_css": null,
      //                   // "url_strip_qs": null,
      //                   // "preserve_recipients": null,
      //                   // "view_content_link": null,
      //                   // "bcc_address": "message.bcc_address@example.com",
      //                   // "tracking_domain": null,
      //                   //"signing_domain": "tempotech.com",
      //                   // "return_path_domain": null,
      //                   // "merge": true,
      //                   // "merge_language": "mailchimp",
      //                   // "global_merge_vars": [{
      //                   //   "name": "merge1",
      //                   //   "content": "merge1 content"
      //                   // }],
      //                   // "merge_vars": [{
      //                   //   "rcpt": "recipient.email@example.com",
      //                   //   "vars": [{
      //                   //     "name": "merge2",
      //                   //     "content": "merge2 content"
      //                   //   }]
      //                   // }],
      //                   // "tags": [
      //                   //   "password-resets"
      //                   // ],
      //                   // "subaccount": "customer-123",
      //                   // "google_analytics_domains": [
      //                   //   "example.com"
      //                   // ],
      //                   // "google_analytics_campaign": "message.from_email@example.com",
      //                   // "metadata": {
      //                   //   "website": "www.example.com"
      //                   // },
      //                   // "recipient_metadata": [{
      //                   //   "rcpt": "recipient.email@example.com",
      //                   //   "values": {
      //                   //     "user_id": 123456
      //                   //   }
      //                   // }],
      //                   // "attachments": [{
      //                   //   "type": "text/plain",
      //                   //   "name": "myfile.txt",
      //                   //   "content": "ZXhhbXBsZSBmaWxl"
      //                   // }],
      //                   // "images": [{
      //                   //   "type": "image/png",
      //                   //   "name": "IMAGECID",
      //                   //   "content": "ZXhhbXBsZSBmaWxl"
      //                   // }]
      //                 };
      //                 var async = false;
      //                 var ip_pool = "Main Pool";
      //                 //var send_at = "1999-12-31 23:59:59";//EXPL: party like its 1999
      //                 var send_at = Date.now();
      //                 // mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
      //                 mandrill_client.messages.send({"message": message}, function(result) {
      //                   Log.log(result);
      //                   reply("link email sent").code(200);
      //                 }, function(e) {
      //                   // Mandrill returns the error as an object with name and message keys
      //                   Log.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      //                   reply(Boom.expectationFailed("There was an error sending the email.", request.payload.email));
      //                 });
      //
      //
      //
      //                 // var params = {
      //                 //   "message": {
      //                 //     "from_email":"scalio@tempotech.com",
      //                 //     "to":[{"email":user.email}],
      //                 //     "subject": subject,
      //                 //     "text": text
      //                 //   }
      //                 // };
      //                 //
      //                 //
      //                 // mandrill_client.messages.send(params, function(res) {
      //                 //   Log.log(res);
      //                 //   reply("link email sent").code(200);
      //                 // }, function(err) {
      //                 //   Log.log(err);
      //                 //   reply(Boom.expectationFailed("There was an error sending the email.", request.payload.email));
      //                 // });
      //
      //
      //
      //
      //               });
      //             } else {
      //               reply(Boom.notFound("No user associated with email.", request.payload.email));
      //             }
      //           });
      //         },
      //         auth: null,
      //         description: 'Create a temporary link and send to a user\'s email',
      //         tags: ['api', 'User', 'Account'],
      //         validate: {
      //           payload: {
      //             email: Joi.string().required()
      //             .description('The user\'s email.').example("dev@scal.io"),
      //             type: Joi.string().valid("Password").valid("Activation").required()
      //             .description('The type of email to be sent.').example("Password")
      //           }
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   },
      //
      //   //Email Link PUT Endpoint
      //   function (server, model, options, Log) {
      //     Log = Log.bind("Email Link");
      //     var Boom = require('boom');
      //     var emailLinkSchema = require('./email-link.model')(sql);
      //
      //     var collectionName = model.collectionDisplayName || model.getTableName();
      //
      //     Log.note("Generating Email Link PUT endpoint for " + collectionName);
      //
      //     server.route({
      //       method: 'PUT',
      //       path: '/user/email-link/{id}',
      //       config: {
      //         handler: function (request, reply) {
      //           emailLinkSchema.update({invalid: true}, {where: {id: request.params.id}}).then(function (affectedRows) {
      //             if (affectedRows.length > 0) {
      //               reply().code(204);
      //             } else {
      //               reply(Boom.notFound("No resource was found with that id."));
      //             }
      //           }).catch(function (error) {
      //             Log.error("error(%s)", JSON.stringify(error));
      //             reply(Boom.badImplementation("An error occurred updating the resource.", error));
      //           });
      //         },
      //         auth: null,
      //         description: 'Invalidate an email link',
      //         tags: ['api', 'User', 'Account'],
      //         validate: {
      //         },
      //         plugins: {
      //           'hapi-swagger': {
      //             responseMessages: [
      //               {code: 200, message: 'Success'},
      //               {code: 400, message: 'Bad Request'},
      //               {code: 404, message: 'Not Found'},
      //               {code: 500, message: 'Internal Server Error'}
      //             ]
      //           }
      //         },
      //         response: {
      //         }
      //       }
      //     });
      //   }
      // ],
      create: {
        pre: function (request, Log) {
          var deferred = Q.defer();
          var passwordUtility = require('../../api/utilities/password-helper');
          var hashedPassword = passwordUtility.hash_password(request.payload.password);

          request.payload.password = hashedPassword;
          deferred.resolve(request);
          return deferred.promise;
        }
      }
    }
  };
  
  return Schema;
};
