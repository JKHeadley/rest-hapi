module.exports = {
  "development": {
    "username": process.env.MYSQL_DB_USER || "scalio",
    "password": process.env.MYSQL_DB_PASSWORD || "DEV99dev!",
    "database": process.env.MYSQL_DB_NAME || "scalio_frame_db",
    "host": process.env.CLEARDB_DATABASE_URL || "scalio-frame-db.cgczfcpb6493.us-west-2.rds.amazonaws.com",
    "dialect": "mysql"
  },
  "local": {
    "username": "dev",
    "password": "dev",
    "database": "scalio_frame",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    // "username": process.env.MYSQL_DB_USER || "scalio",
    // "password": process.env.MYSQL_DB_PASSWORD || "PROD99prod!",
    // "database": process.env.MYSQL_DB_NAME || "tempo_db_prod",
    // "host": process.env.CLEARDB_DATABASE_URL || "tempo-db-prod.cqqimy3gxq4q.us-west-2.rds.amazonaws.com",
    // "dialect": "mysql"
  }
};