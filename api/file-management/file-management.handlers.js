var Boom = require('boom');
var url = require('url');

module.exports = function(modules){
    var Log = modules.logger;
    var config = modules.config;

    var aws = require('aws-sdk');

    aws.config.update({
        accessKeyId: config.aws.aws_access_key_id,
        secretAccessKey: config.aws.aws_secret_key,
        signatureVersion: 'v4',
        region: config.aws.aws_s3_region
    });



    return {
        generate:function(request, reply){
            var s3 = new aws.S3();
            var s3_params = {
                Bucket: config.aws.aws_s3_bucket,
                Key: request.payload.objectName,
                Expires: 1000,
                ACL: 'public-read'
            };

            s3.getSignedUrl('putObject', s3_params, function (err, signedUrl) {
                if(err){
                    Log.error(err);
                    reply(Boom.gatewayTimeout("There was an error contacting the S3 service."));
                }else{
                    var parsedUrl = url.parse(signedUrl);
                    parsedUrl.search = null;
                    var accessUrl = url.format(parsedUrl);

                    reply({
                        uploadUrl: signedUrl,
                        accessUrl: accessUrl
                    }).code(200);
                }
            });

        }
    }
};