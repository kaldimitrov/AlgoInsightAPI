export default () => ({
  port: process.env.APP_PORT || 3000,
  instance_id: process.env.NODE_APP_INSTANCE || 0,
  jwt: {
    secret: process.env.JWT_SECRET || 'JWT_SECRET',
    expiration: process.env.JWT_EXPIRATION || '12h',
    refresh_secret: process.env.JWT_SECRET || 'JWT_SECRET',
    refresh_expiration: process.env.JWT_EXPIRATION || '1y',
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || '5432',
    user: process.env.DATABASE_USER || 'dev',
    password: process.env.DATABASE_PASSWORD || 'DB_PASSWORD',
    name: process.env.DATABASE_NAME || 'DB_NAME',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  },
});
