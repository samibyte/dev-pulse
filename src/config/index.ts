const config = {
  port: process.env.PORT,
  db_connection_string: process.env.DB_CONNECTION_STRING,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
};

export default config;
