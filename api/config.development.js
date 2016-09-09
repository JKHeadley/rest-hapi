var config = {};
config.server = {};
config.server.smtp = {};
config.mysql = {};
config.redis = {};
config.aws = {};

config.app = "scalio_frame";

config.apiVersion = "development";
// server

/*
** DANGER: The host is commented out for deployment reasons. 
** Docker MUST set it's own host ip address. (I think :P)
*/

//config.server.host =  '127.0.0.1';
config.server.port = 8124;
// config.server.smtp.service = 'Gmail';
// config.server.smtp.user = 'uglymittens@gmail.com';
// config.server.smtp.pass = '4jbtvz6t';

// mysql

config.mysql.host = process.env.CLEARDB_DATABASE_URL || 'localhost';
config.mysql.port = 3306;
config.mysql.db   = process.env.MYSQL_DB_NAME || 'scalio_frame';
config.mysql.user = process.env.MYSQL_DB_USER || 'dev';
config.mysql.pass = process.env.MYSQL_DB_PASSWORD || 'dev';

// config.mysql.host = process.env.CLEARDB_DATABASE_URL || 'tempo-db-dev.cqqimy3gxq4q.us-west-2.rds.amazonaws.com';
// config.mysql.port = 3306;
// config.mysql.db   = process.env.MYSQL_DB_NAME || 'tempo_db_dev';
// config.mysql.user = process.env.MYSQL_DB_USER || 'scalio';
// config.mysql.pass = process.env.MYSQL_DB_PASSWORD || 'DEV99dev!';

// aws
// config.aws.aws_access_key_id = process.env.AWS_ACCESS_KEY_ID || 'AKIAJB6JT7PXOS2TJTDA';
// config.aws.aws_secret_key = process.env.AWS_SECRET_KEY || '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';
// config.aws.aws_s3_bucket = process.env.AWS_S3_BUCKET || 'music-life';
// config.aws.aws_s3_region = process.env.AWS_S3_REGION || 'us-east-1';
// config.aws.aws_base_url = process.env.AWS_BASE_URL || 'https://s3-us-east-1.amazonaws.com/music-life/';

//change to update.

module.exports = config;